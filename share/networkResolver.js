const os = require('os');
const config = require('./shareConfig');

class NetworkResolver {
    /**
     * Resolves the authoritative public or local network URL for sharing
     * @returns {{ available: boolean, baseUrl?: string, isHttps?: boolean, reason?: string, message?: string }}
     */
    static resolve() {
        // Priority 1: Explicit production/public domain
        if (config.shareBaseUrl) {
            const isHttps = config.shareBaseUrl.startsWith('https://');
            return {
                available: true,
                baseUrl: config.shareBaseUrl,
                isHttps,
                source: 'SHARE_BASE_URL'
            };
        }

        // Priority 2: Explicit manual LAN IP
        if (config.lanIp) {
            const baseUrl = `http://${config.lanIp}:${config.port}`;
            return {
                available: true,
                baseUrl,
                isHttps: false,
                ip: config.lanIp,
                source: 'LAN_IP'
            };
        }

        // Priority 3: Smart IPv4 detection with virtual interface filtering
        const detected = this._detectBestInterface();
        if (detected) {
            const baseUrl = `http://${detected.address}:${config.port}`;
            return {
                available: true,
                baseUrl,
                isHttps: false,
                ip: detected.address,
                adapterName: detected.name,
                source: 'AUTO_DETECT'
            };
        }

        // Priority 4: No reachable network interface found
        return {
            available: false,
            reason: 'LAN_UNREACHABLE',
            message: 'Mobile sharing is unavailable on localhost. Connect to Wi-Fi or configure LAN_IP or SHARE_BASE_URL.'
        };
    }

    static _detectBestInterface() {
        const interfaces = os.networkInterfaces();
        const candidates = [];

        const virtualRegex = /vethernet|docker|wsl|virtualbox|vmnet|hyper-v|bluetooth|dummy/i;
        const wifiRegex = /wi-fi|wlan|wireless/i;
        const ethRegex = /ethernet|eth|en\d/i;

        for (const [name, addrs] of Object.entries(interfaces)) {
            if (virtualRegex.test(name)) continue;

            for (const addr of addrs) {
                if (addr.family !== 'IPv4' || addr.internal) continue;

                // Validate not loopback or link-local
                const parts = addr.address.split('.');
                const first = parseInt(parts[0], 10);
                const second = parseInt(parts[1], 10);
                if (first === 127 || (first === 169 && second === 254) || first === 0) {
                    continue;
                }

                let rank = 3;
                if (wifiRegex.test(name)) rank = 1;
                else if (ethRegex.test(name)) rank = 2;

                candidates.push({
                    name,
                    address: addr.address,
                    rank
                });
            }
        }

        if (candidates.length === 0) return null;

        // Sort by priority rank (1 = Wi-Fi, 2 = Ethernet, 3 = other)
        candidates.sort((a, b) => a.rank - b.rank);
        return candidates[0];
    }
}

module.exports = NetworkResolver;
