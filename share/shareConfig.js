const path = require('path');

function isValidIPv4(ip) {
    if (typeof ip !== 'string') return false;
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    for (const part of parts) {
        if (!/^\d+$/.test(part)) return false;
        const num = parseInt(part, 10);
        if (num < 0 || num > 255) return false;
        if (part.length > 1 && part.startsWith('0')) return false;
    }
    // Disallow loopback (127.*) and link-local (169.254.*)
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);
    if (first === 127 || (first === 169 && second === 254) || first === 0) {
        return false;
    }
    return true;
}

function normalizeBaseUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return null;
    let trimmed = urlStr.trim().replace(/\/+$/, '');
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
            console.warn('[ShareConfig] Warning: SHARE_BASE_URL should use HTTPS in production.');
        }
        return parsed.origin;
    } catch {
        return null;
    }
}

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    
    // Explicit network configurations
    lanIp: isValidIPv4(process.env.LAN_IP) ? process.env.LAN_IP.trim() : null,
    shareBaseUrl: normalizeBaseUrl(process.env.SHARE_BASE_URL),
    
    // Storage & Lifetimes
    storageDir: path.resolve(__dirname, '..', 'storage', 'shares'),
    ttlMinutes: parseInt(process.env.SHARE_TTL_MINUTES || '30', 10),
    maxFileSize: parseInt(process.env.MAX_SHARE_FILE_SIZE_BYTES || String(50 * 1024 * 1024), 10), // 50MB
    storageCeiling: parseInt(process.env.STORAGE_CEILING_BYTES || String(500 * 1024 * 1024), 10), // 500MB
    tombstoneRetentionMs: 24 * 60 * 60 * 1000, // 24 hours
    cleanupIntervalMs: 5 * 60 * 1000 // 5 minutes
};

module.exports = Object.freeze(config);
