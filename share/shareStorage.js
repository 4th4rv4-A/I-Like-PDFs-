/**
 * Storage Abstraction Base Interface
 * Enables interchangeable backends (LocalDiskStorage, S3 ObjectStorage, etc.)
 */
class ShareStorage {
    /**
     * Stores file buffer atomically with metadata
     * @param {string} shareId
     * @param {Buffer} buffer
     * @param {object} metadata
     * @returns {Promise<{ filePath: string, metadata: object }>}
     */
    async store(shareId, buffer, metadata) {
        throw new Error("Method 'store()' must be implemented.");
    }

    /**
     * Retrieves stored metadata
     * @param {string} shareId
     * @returns {Promise<object|null>}
     */
    async getMetadata(shareId) {
        throw new Error("Method 'getMetadata()' must be implemented.");
    }

    /**
     * Retrieves read stream for file with optional byte range
     * @param {string} shareId
     * @param {{ start?: number, end?: number }} [range]
     * @returns {Promise<{ stream: import('stream').Readable, fileSize: number, contentType: string, filename: string, releaseLock: () => void }>}
     */
    async getStream(shareId, range) {
        throw new Error("Method 'getStream()' must be implemented.");
    }

    /**
     * Deletes a share
     * @param {string} shareId
     * @param {'expired'|'revoked'} reason
     * @returns {Promise<boolean>}
     */
    async delete(shareId, reason) {
        throw new Error("Method 'delete()' must be implemented.");
    }

    /**
     * Checks tombstone status for an ID
     * @param {string} shareId
     * @returns {Promise<'expired'|'revoked'|null>}
     */
    async getTombstone(shareId) {
        throw new Error("Method 'getTombstone()' must be implemented.");
    }

    /**
     * Scans and purges expired shares
     * @returns {Promise<{ purgedCount: number, freedBytes: number }>}
     */
    async purgeExpired() {
        throw new Error("Method 'purgeExpired()' must be implemented.");
    }

    /**
     * Gets current total storage usage in bytes
     * @returns {Promise<number>}
     */
    async getTotalStorageUsage() {
        throw new Error("Method 'getTotalStorageUsage()' must be implemented.");
    }
}

module.exports = ShareStorage;
