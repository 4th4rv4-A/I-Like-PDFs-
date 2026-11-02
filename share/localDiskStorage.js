const fs = require('fs');
const path = require('path');
const ShareStorage = require('./shareStorage');
const config = require('./shareConfig');

class LocalDiskStorage extends ShareStorage {
    constructor(baseDir = config.storageDir) {
        super();
        this.baseDir = baseDir;
        this.stagingDir = path.join(this.baseDir, '.staging');
        this.tombstonesFile = path.join(this.baseDir, 'tombstones.json');
        
        this.allocatedBytes = 0;
        this.activeStreams = new Map(); // shareId -> count
        this.pendingDeletions = new Set(); // shareIds deferred until activeStreams == 0

        this._ensureDirectories();
        this._recalculateUsage();
    }

    _ensureDirectories() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
        if (!fs.existsSync(this.stagingDir)) {
            fs.mkdirSync(this.stagingDir, { recursive: true });
        }
        if (!fs.existsSync(this.tombstonesFile)) {
            try {
                fs.writeFileSync(this.tombstonesFile, JSON.stringify({}), 'utf-8');
            } catch (err) {
                console.error('[Storage] Error creating tombstones.json:', err.message);
            }
        }
    }

    _recalculateUsage() {
        let total = 0;
        try {
            const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== '.staging') {
                    const itemDir = path.join(this.baseDir, entry.name);
                    const files = fs.readdirSync(itemDir);
                    for (const f of files) {
                        const stat = fs.statSync(path.join(itemDir, f));
                        total += stat.size;
                    }
                }
            }
        } catch (err) {
            console.error('[Storage] Error calculating storage usage:', err.message);
        }
        this.allocatedBytes = total;
    }

    _readTombstones() {
        try {
            if (fs.existsSync(this.tombstonesFile)) {
                const raw = fs.readFileSync(this.tombstonesFile, 'utf-8');
                return JSON.parse(raw);
            }
        } catch (err) {
            console.warn('[Storage] Could not parse tombstones.json:', err.message);
        }
        return {};
    }

    _writeTombstones(tombstones) {
        try {
            const tmpPath = `${this.tombstonesFile}.tmp_${Date.now()}`;
            fs.writeFileSync(tmpPath, JSON.stringify(tombstones, null, 2), 'utf-8');
            fs.renameSync(tmpPath, this.tombstonesFile);
        } catch (err) {
            console.error('[Storage] Error writing tombstones.json:', err.message);
        }
    }

    _recordTombstone(shareId, reason) {
        const tombstones = this._readTombstones();
        tombstones[shareId] = {
            reason,
            timestamp: Date.now()
        };
        this._writeTombstones(tombstones);
    }

    async getTombstone(shareId) {
        const tombstones = this._readTombstones();
        const entry = tombstones[shareId];
        if (!entry) return null;
        
        // Check if tombstone has expired beyond 24 hours
        if (Date.now() - entry.timestamp > config.tombstoneRetentionMs) {
            delete tombstones[shareId];
            this._writeTombstones(tombstones);
            return null;
        }
        return entry.reason; // 'expired' or 'revoked'
    }

    async getTotalStorageUsage() {
        return this.allocatedBytes;
    }

    async store(shareId, buffer, metadata) {
        // Enforce per-file size
        if (buffer.length > config.maxFileSize) {
            const err = new Error(`File size (${buffer.length} bytes) exceeds maximum allowed ${config.maxFileSize} bytes.`);
            err.code = 'LIMIT_FILE_SIZE';
            throw err;
        }

        // Check storage ceiling
        if (this.allocatedBytes + buffer.length > config.storageCeiling) {
            // Attempt an emergency purge of expired shares
            await this.purgeExpired();
            if (this.allocatedBytes + buffer.length > config.storageCeiling) {
                const err = new Error('Temporary storage ceiling reached. Please try again shortly.');
                err.code = 'STORAGE_QUOTA_EXCEEDED';
                throw err;
            }
        }

        const tempDir = path.join(this.stagingDir, `${shareId}_${Date.now()}`);
        const targetDir = path.join(this.baseDir, shareId);

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            const docPath = path.join(tempDir, 'document.bin');
            const metaPath = path.join(tempDir, 'metadata.json');

            fs.writeFileSync(docPath, buffer);
            fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

            // Atomic rename into main storage
            fs.renameSync(tempDir, targetDir);

            this.allocatedBytes += buffer.length;
            return {
                filePath: path.join(targetDir, 'document.bin'),
                metadata
            };
        } catch (err) {
            // Cleanup staging on error
            try {
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            } catch (_) {}
            throw err;
        }
    }

    async getMetadata(shareId) {
        const targetDir = path.join(this.baseDir, shareId);
        const metaPath = path.join(targetDir, 'metadata.json');

        if (!fs.existsSync(metaPath)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(metaPath, 'utf-8');
            return JSON.parse(raw);
        } catch (err) {
            console.error(`[Storage] Failed to read metadata for ${shareId}:`, err.message);
            return null;
        }
    }

    async getStream(shareId, range) {
        const targetDir = path.join(this.baseDir, shareId);
        const docPath = path.join(targetDir, 'document.bin');
        const metaPath = path.join(targetDir, 'metadata.json');

        if (!fs.existsSync(docPath) || !fs.existsSync(metaPath)) {
            return null;
        }

        const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const stat = fs.statSync(docPath);
        const fileSize = stat.size;

        // Track active stream
        const current = this.activeStreams.get(shareId) || 0;
        this.activeStreams.set(shareId, current + 1);

        const readOptions = {};
        if (range && typeof range.start === 'number' && typeof range.end === 'number') {
            readOptions.start = range.start;
            readOptions.end = range.end;
        }

        const stream = fs.createReadStream(docPath, readOptions);

        let released = false;
        const releaseLock = () => {
            if (released) return;
            released = true;
            const count = (this.activeStreams.get(shareId) || 1) - 1;
            if (count <= 0) {
                this.activeStreams.delete(shareId);
                // Check if a deferred deletion is pending
                if (this.pendingDeletions.has(shareId)) {
                    this.pendingDeletions.delete(shareId);
                    this._executeDiskDeletion(shareId).catch(err => {
                        console.error(`[Storage] Error during deferred deletion of ${shareId}:`, err.message);
                    });
                }
            } else {
                this.activeStreams.set(shareId, count);
            }
        };

        stream.on('close', releaseLock);
        stream.on('end', releaseLock);
        stream.on('error', releaseLock);

        return {
            stream,
            fileSize,
            contentType: metadata.contentType || 'application/pdf',
            filename: metadata.displayFilename || metadata.filename || 'document.pdf',
            releaseLock
        };
    }

    async delete(shareId, reason = 'revoked') {
        this._recordTombstone(shareId, reason);

        // Check if stream active; defer actual disk deletion to prevent file lock crashes on Windows
        const active = this.activeStreams.get(shareId) || 0;
        if (active > 0) {
            this.pendingDeletions.add(shareId);
            return true;
        }

        return await this._executeDiskDeletion(shareId);
    }

    async _executeDiskDeletion(shareId) {
        const targetDir = path.join(this.baseDir, shareId);
        if (!fs.existsSync(targetDir)) {
            return false;
        }

        try {
            let freed = 0;
            const files = fs.readdirSync(targetDir);
            for (const f of files) {
                try {
                    const s = fs.statSync(path.join(targetDir, f));
                    freed += s.size;
                } catch (_) {}
            }
            fs.rmSync(targetDir, { recursive: true, force: true });
            this.allocatedBytes = Math.max(0, this.allocatedBytes - freed);
            return true;
        } catch (err) {
            console.error(`[Storage] Could not delete directory for ${shareId}:`, err.message);
            return false;
        }
    }

    async purgeExpired() {
        const now = Date.now();
        let purgedCount = 0;
        let freedBytes = 0;

        try {
            const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== '.staging') {
                    const shareId = entry.name;
                    const metaPath = path.join(this.baseDir, shareId, 'metadata.json');

                    if (fs.existsSync(metaPath)) {
                        try {
                            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                            const expiresAt = new Date(meta.expiresAt).getTime();
                            if (now >= expiresAt) {
                                await this.delete(shareId, 'expired');
                                purgedCount++;
                            }
                        } catch (_) {
                            // Malformed metadata - schedule for cleanup
                            await this.delete(shareId, 'expired');
                            purgedCount++;
                        }
                    }
                }
            }

            // Also clean up abandoned staging entries older than 15 minutes
            const stagingEntries = fs.readdirSync(this.stagingDir);
            for (const s of stagingEntries) {
                const sPath = path.join(this.stagingDir, s);
                try {
                    const stat = fs.statSync(sPath);
                    if (now - stat.mtimeMs > 15 * 60 * 1000) {
                        fs.rmSync(sPath, { recursive: true, force: true });
                    }
                } catch (_) {}
            }

            // Clean expired tombstones
            const tombstones = this._readTombstones();
            let tombstonesChanged = false;
            for (const [id, val] of Object.entries(tombstones)) {
                if (now - val.timestamp > config.tombstoneRetentionMs) {
                    delete tombstones[id];
                    tombstonesChanged = true;
                }
            }
            if (tombstonesChanged) {
                this._writeTombstones(tombstones);
            }
        } catch (err) {
            console.error('[Storage] Error during purgeExpired:', err.message);
        }

        return { purgedCount, freedBytes };
    }
}

module.exports = LocalDiskStorage;
