const QRCode = require('qrcode');

class QrGenerator {
    /**
     * Generates both high-res PNG Data URL and sharp SVG string for the target URL
     * @param {string} url
     * @returns {Promise<{ dataUrl: string, svg: string }>}
     */
    static async generate(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL is required for QR code generation');
        }

        const options = {
            errorCorrectionLevel: 'M',
            margin: 4,
            width: 512,
            color: {
                dark: '#0f172a', // Deep slate for crisp scanning contrast
                light: '#ffffff'
            }
        };

        const [dataUrl, svg] = await Promise.all([
            QRCode.toDataURL(url, options),
            QRCode.toString(url, { ...options, type: 'svg' })
        ]);

        return { dataUrl, svg };
    }
}

module.exports = QrGenerator;
