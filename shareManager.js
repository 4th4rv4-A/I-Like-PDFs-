const crypto = require('crypto');
const config = require('./share/shareConfig');
const LocalDiskStorage = require('./share/localDiskStorage');
const NetworkResolver = require('./share/networkResolver');
const ShareValidator = require('./share/shareValidator');
const QrGenerator = require('./share/qrGenerator');
const ShareCleaner = require('./share/shareCleaner');

class ShareManager {
    constructor(storage = new LocalDiskStorage()) {
        this.storage = storage;
        this.cleaner = new ShareCleaner(this.storage);
        this.cleaner.start();
    }

    /**
     * Creates a new temporary share for a document buffer
     * @param {Buffer} buffer
     * @param {string} originalFilename
     * @param {string} [contentType]
     * @returns {Promise<object>}
     */
    async createShare(buffer, originalFilename, contentType = 'application/pdf') {
        const displayFilename = ShareValidator.sanitizeFilename(originalFilename);
        const ext = displayFilename.split('.').pop() || 'pdf';

        // Validate format magic bytes
        const validation = ShareValidator.validateMagicBytes(buffer, ext);
        if (!validation.valid) {
            const err = new Error(validation.error || 'Invalid file format.');
            err.code = 'INVALID_FILE_SIGNATURE';
            throw err;
        }

        // Generate cryptographically secure random tokens
        const shareId = crypto.randomBytes(16).toString('hex');
        const revokeToken = crypto.randomBytes(24).toString('hex');
        const revokeTokenHash = crypto.createHash('sha256').update(revokeToken).digest('hex');

        const now = Date.now();
        const expiresAt = new Date(now + config.ttlMinutes * 60 * 1000).toISOString();

        const metadata = {
            id: shareId,
            displayFilename,
            fileSize: buffer.length,
            contentType,
            detectedType: validation.detectedType,
            createdAt: new Date(now).toISOString(),
            expiresAt,
            revokeTokenHash,
            downloadsCount: 0,
            previewsCount: 0
        };

        // Network & URL Resolution
        const network = NetworkResolver.resolve();
        let pageUrl = null;
        let downloadUrl = null;
        let previewUrl = null;
        let qrData = null;

        if (network.available) {
            pageUrl = `${network.baseUrl}/d/${shareId}`;
            downloadUrl = `${network.baseUrl}/api/share/${shareId}/download`;
            previewUrl = `${network.baseUrl}/api/share/${shareId}/preview`;

            try {
                qrData = await QrGenerator.generate(pageUrl);
            } catch (qrErr) {
                console.warn('[ShareManager] QR Generation error:', qrErr.message);
            }
        }

        // Store into persistence layer
        await this.storage.store(shareId, buffer, metadata);

        return {
            available: network.available,
            shareId,
            revokeToken, // returned only once to desktop creator
            filename: displayFilename,
            fileSize: buffer.length,
            contentType,
            isPdf: validation.detectedType === 'pdf',
            pageUrl,
            downloadUrl,
            previewUrl,
            qrCode: qrData ? qrData.dataUrl : null,
            qrSvg: qrData ? qrData.svg : null,
            expiresAt,
            ttlSeconds: config.ttlMinutes * 60,
            isHttps: network.isHttps,
            reason: network.reason,
            message: network.message
        };
    }

    /**
     * Resolves share status and metadata
     * @param {string} shareId
     * @returns {Promise<{ status: 'active'|'tombstone'|'not_found', metadata?: object, reason?: string }>}
     */
    async getShare(shareId) {
        if (!shareId || typeof shareId !== 'string' || !/^[a-f0-9]{32}$/i.test(shareId)) {
            return { status: 'not_found' };
        }

        const metadata = await this.storage.getMetadata(shareId);
        if (!metadata) {
            const tombstoneReason = await this.storage.getTombstone(shareId);
            if (tombstoneReason) {
                return { status: 'tombstone', reason: tombstoneReason };
            }
            return { status: 'not_found' };
        }

        // Server-authoritative expiration check
        const expiresTime = new Date(metadata.expiresAt).getTime();
        if (Date.now() >= expiresTime) {
            await this.storage.delete(shareId, 'expired');
            return { status: 'tombstone', reason: 'expired' };
        }

        return { status: 'active', metadata };
    }

    /**
     * Gets read stream for share with byte range support
     * @param {string} shareId
     * @param {{ start?: number, end?: number }} [range]
     */
    async getStream(shareId, range) {
        const share = await this.getShare(shareId);
        if (share.status !== 'active') {
            return null;
        }
        return await this.storage.getStream(shareId, range);
    }

    /**
     * Authenticated revocation of a share
     * @param {string} shareId
     * @param {string} suppliedRevokeToken
     * @returns {Promise<{ success: boolean, code: number, error?: string }>}
     */
    async revokeShare(shareId, suppliedRevokeToken) {
        const share = await this.getShare(shareId);
        if (share.status !== 'active' || !share.metadata) {
            return { success: false, code: 404, error: 'Share not found or already expired.' };
        }

        if (!suppliedRevokeToken || typeof suppliedRevokeToken !== 'string') {
            return { success: false, code: 401, error: 'Revocation token required.' };
        }

        const suppliedHash = crypto.createHash('sha256').update(suppliedRevokeToken.trim()).digest('hex');
        const storedHash = share.metadata.revokeTokenHash;

        const suppliedBuf = Buffer.from(suppliedHash, 'hex');
        const storedBuf = Buffer.from(storedHash, 'hex');

        if (suppliedBuf.length !== storedBuf.length || !crypto.timingSafeEqual(suppliedBuf, storedBuf)) {
            return { success: false, code: 403, error: 'Invalid revocation token.' };
        }

        await this.storage.delete(shareId, 'revoked');
        return { success: true, code: 200 };
    }
}

module.exports = new ShareManager();
