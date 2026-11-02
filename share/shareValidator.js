class ShareValidator {
    /**
     * Validates buffer magic bytes against expected file format
     * @param {Buffer} buffer
     * @param {string} [suggestedExtOrType]
     * @returns {{ valid: boolean, detectedType: string, error?: string }}
     */
    static validateMagicBytes(buffer, suggestedExtOrType = 'pdf') {
        if (!buffer || buffer.length < 4) {
            return { valid: false, detectedType: 'unknown', error: 'File buffer is empty or corrupted.' };
        }

        const ext = (suggestedExtOrType || 'pdf').toLowerCase().replace(/^\./, '');

        // 1. PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D) anywhere in first 1024 bytes
        const headerRegion = buffer.subarray(0, Math.min(1024, buffer.length));
        if (headerRegion.includes(Buffer.from('%PDF-'))) {
            return { valid: true, detectedType: 'pdf' };
        }

        // 2. JPEG: FF D8 FF
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return { valid: true, detectedType: 'jpg' };
        }

        // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
        if (buffer.length >= 8 &&
            buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
            buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
            return { valid: true, detectedType: 'png' };
        }

        // 4. PK Zip Containers (DOCX, ZIP)
        if (buffer[0] === 0x50 && buffer[1] === 0x4B &&
            (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
            (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)) {
            if (ext === 'docx') {
                return { valid: true, detectedType: 'docx' };
            }
            return { valid: true, detectedType: 'zip' };
        }

        // If specific format was expected and not matched
        if (ext === 'pdf') {
            return { valid: false, detectedType: 'unknown', error: 'Invalid document: Missing valid PDF header signature.' };
        }

        // Default pass if generic binary
        return { valid: true, detectedType: ext || 'bin' };
    }

    /**
     * Sanitizes display filename for UI and HTTP headers
     * @param {string} rawFilename
     * @returns {string}
     */
    static sanitizeFilename(rawFilename) {
        if (!rawFilename || typeof rawFilename !== 'string') {
            return 'document.pdf';
        }

        // Strip path separators and null bytes
        let clean = rawFilename.replace(/[\/\\]/g, '_').replace(/\0/g, '');

        // Remove dangerous control characters and newlines (CRLF header injection prevention)
        clean = clean.replace(/[\r\n\t\x00-\x1F\x7F]/g, '');

        // Remove filesystem reserved characters: < > : " / \ | ? *
        clean = clean.replace(/[<>:"/\\|?*]/g, '_');

        // Prevent hidden files or relative traversal
        clean = clean.replace(/^\.+/, '');

        // Collapse multiple dots or spaces
        clean = clean.replace(/\.{2,}/g, '.').trim();

        if (!clean || clean === '.') {
            return 'document.pdf';
        }

        // Max 150 chars
        if (clean.length > 150) {
            const extIdx = clean.lastIndexOf('.');
            const ext = extIdx !== -1 ? clean.slice(extIdx) : '';
            clean = clean.slice(0, 150 - ext.length) + ext;
        }

        return clean;
    }

    /**
     * Builds RFC 5987 / RFC 6266 Content-Disposition header
     * @param {string} filename
     * @param {'attachment'|'inline'} mode
     * @returns {string}
     */
    static buildContentDisposition(filename, mode = 'attachment') {
        const safeName = this.sanitizeFilename(filename);
        // ASCII-only fallback (replace non-ASCII with underscore)
        const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
        // UTF-8 encoded per RFC 5987
        const utf8Encoded = encodeURIComponent(safeName);

        return `${mode}; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
    }
}

module.exports = ShareValidator;
