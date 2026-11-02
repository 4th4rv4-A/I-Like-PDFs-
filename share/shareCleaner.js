const config = require('./shareConfig');

class ShareCleaner {
    /**
     * @param {import('./shareStorage')} storage
     * @param {number} intervalMs
     */
    constructor(storage, intervalMs = config.cleanupIntervalMs) {
        this.storage = storage;
        this.intervalMs = intervalMs;
        this.timer = null;
    }

    start() {
        if (this.timer) return;
        // Run initial purge on startup
        this.runSweep();
        this.timer = setInterval(() => this.runSweep(), this.intervalMs);
        if (this.timer.unref) this.timer.unref(); // Don't block event loop on process exit
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async runSweep() {
        try {
            const { purgedCount } = await this.storage.purgeExpired();
            if (purgedCount > 0) {
                console.log(`[ShareCleaner] Purged ${purgedCount} expired document share(s).`);
            }
        } catch (err) {
            console.error('[ShareCleaner] Cleanup sweep error:', err.message);
        }
    }
}

module.exports = ShareCleaner;
