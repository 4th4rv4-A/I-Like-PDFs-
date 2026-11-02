const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const shareManager = require('../shareManager');
const ShareValidator = require('../share/shareValidator');
const config = require('../share/shareConfig');

const router = express.Router();

// Memory/buffer storage for share uploads with 50MB limit
const upload = multer({
    limits: {
        fileSize: config.maxFileSize
    }
});

// Cache mobile template in memory
let mobileTemplate = '';
try {
    const templatePath = path.resolve(__dirname, '..', 'views', 'mobile-share.html');
    mobileTemplate = fs.readFileSync(templatePath, 'utf-8');
} catch (err) {
    console.error('[ShareRoutes] Could not read mobile-share.html:', err.message);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFormatIcon(type) {
    switch (type) {
        case 'docx': return '📝';
        case 'zip': return '🗜️';
        case 'jpg':
        case 'png': return '🖼️';
        default: return '📑';
    }
}

// -------------------------------------------------------------
// 1. GET /d/:shareId - Mobile Landing View
// -------------------------------------------------------------
router.get('/d/:shareId', async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, noarchive');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:; frame-ancestors 'none';");

    const { shareId } = req.params;
    const share = await shareManager.getShare(shareId);

    // 404 Not Found
    if (share.status === 'not_found') {
        const notFoundHtml = `
            <div class="expired-card">
                <div class="expired-icon">🔍</div>
                <h2 class="expired-title" style="color: #cbd5e1;">Document Not Found</h2>
                <p class="expired-desc">The requested share link does not exist or may have been typed incorrectly.</p>
            </div>
        `;
        const rendered = mobileTemplate
            .replace('{{TITLE}}', 'Document Not Found')
            .replace('{{CONTENT}}', notFoundHtml)
            .replace('{{EXPIRES_AT}}', 'null');
        return res.status(404).send(rendered);
    }

    // 410 Gone (Known Expired or Revoked)
    if (share.status === 'tombstone') {
        const isRevoked = share.reason === 'revoked';
        const expiredHtml = `
            <div class="expired-card">
                <div class="expired-icon">${isRevoked ? '🔒' : '⌛'}</div>
                <h2 class="expired-title">${isRevoked ? 'Link Revoked' : 'Transfer Link Expired'}</h2>
                <p class="expired-desc">
                    ${isRevoked 
                        ? 'This document share was manually revoked by its creator.' 
                        : 'Temporary sharing links automatically expire after 30 minutes for security and privacy. Please process or share your document again on your computer.'}
                </p>
            </div>
        `;
        const rendered = mobileTemplate
            .replace('{{TITLE}}', isRevoked ? 'Link Revoked' : 'Link Expired')
            .replace('{{CONTENT}}', expiredHtml)
            .replace('{{EXPIRES_AT}}', 'null');
        return res.status(410).send(rendered);
    }

    // 200 OK (Active Share)
    const meta = share.metadata;
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const securityBadgeHtml = isHttps
        ? `<div class="security-badge badge-https"><span>🔒</span> <span>HTTPS Encrypted Transfer</span></div>`
        : `<div class="security-badge badge-lan"><span>📶</span> <span>Local Wi-Fi Direct Transfer</span></div>`;

    const isPdf = meta.detectedType === 'pdf';
    const previewBtnHtml = isPdf
        ? `<a href="/api/share/${encodeURIComponent(meta.id)}/preview" target="_blank" class="btn-preview">
               <span>👁️</span> <span>Preview in Browser</span>
           </a>`
        : '';

    const icon = getFormatIcon(meta.detectedType);
    const activeHtml = `
        <div class="share-card">
            ${securityBadgeHtml}
            <div class="file-icon-wrapper">${icon}</div>
            <h1 class="file-title">${escapeHtml(meta.displayFilename)}</h1>
            <div class="file-meta-bar">
                <span class="file-meta-pill">${meta.detectedType.toUpperCase()} Document</span>
                <span class="file-meta-pill">${formatBytes(meta.fileSize)}</span>
            </div>
            <div>
                <span class="timer-badge">
                    <span>⏱️</span> <span id="countdown-text">Calculating...</span>
                </span>
            </div>
            <div class="action-buttons">
                <a href="/api/share/${encodeURIComponent(meta.id)}/download" class="btn-download">
                    <span>💾</span> <span>Download to Device</span>
                </a>
                ${previewBtnHtml}
            </div>
        </div>
    `;

    const rendered = mobileTemplate
        .replace('{{TITLE}}', escapeHtml(meta.displayFilename))
        .replace('{{CONTENT}}', activeHtml)
        .replace('{{EXPIRES_AT}}', meta.expiresAt);

    res.send(rendered);
});

// -------------------------------------------------------------
// 2. GET /api/share/:shareId/preview - Stream with HTTP Range
// -------------------------------------------------------------
router.get('/api/share/:shareId/preview', async (req, res) => {
    const { shareId } = req.params;
    const share = await shareManager.getShare(shareId);

    if (share.status === 'not_found') {
        return res.status(404).send('Document not found.');
    }
    if (share.status === 'tombstone') {
        return res.status(410).send('Document link has expired or was revoked.');
    }

    const meta = share.metadata;
    const fileSize = meta.fileSize;
    const rangeHeader = req.headers.range;

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', meta.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Handle HTTP Range Requests (HTTP 206 Partial Content)
    if (rangeHeader && typeof rangeHeader === 'string' && rangeHeader.startsWith('bytes=')) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        let start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Suffix range: bytes=-500 (last 500 bytes)
        if (isNaN(start)) {
            start = fileSize - end;
            end = fileSize - 1;
        }

        // Validate bounds
        if (isNaN(start) || isNaN(end) || start > end || start < 0 || end >= fileSize) {
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            return res.status(416).send('Requested range not satisfiable');
        }

        const chunksize = (end - start) + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunksize);

        const streamResult = await shareManager.getStream(shareId, { start, end });
        if (!streamResult) {
            return res.status(500).send('Could not open document stream');
        }

        req.on('close', () => streamResult.releaseLock());
        return streamResult.stream.pipe(res);
    }

    // Normal non-range response
    res.status(200);
    res.setHeader('Content-Length', fileSize);

    const streamResult = await shareManager.getStream(shareId);
    if (!streamResult) {
        return res.status(500).send('Could not open document stream');
    }

    req.on('close', () => streamResult.releaseLock());
    streamResult.stream.pipe(res);
});

// -------------------------------------------------------------
// 3. GET /api/share/:shareId/download - Stream Attachment
// -------------------------------------------------------------
router.get('/api/share/:shareId/download', async (req, res) => {
    const { shareId } = req.params;
    const share = await shareManager.getShare(shareId);

    if (share.status === 'not_found') {
        return res.status(404).send('Document not found.');
    }
    if (share.status === 'tombstone') {
        return res.status(410).send('Document link has expired or was revoked.');
    }

    const meta = share.metadata;
    res.setHeader('Content-Type', meta.contentType || 'application/pdf');
    res.setHeader('Content-Length', meta.fileSize);
    res.setHeader('Content-Disposition', ShareValidator.buildContentDisposition(meta.displayFilename, 'attachment'));
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const streamResult = await shareManager.getStream(shareId);
    if (!streamResult) {
        return res.status(500).send('Could not open document stream');
    }

    req.on('close', () => streamResult.releaseLock());
    streamResult.stream.pipe(res);
});

// -------------------------------------------------------------
// 4. POST /api/share-cache - Upload Client-Side Rendered Document
// -------------------------------------------------------------
router.post('/api/share-cache', upload.single('file'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, error: 'No document file uploaded.' });
        }

        const originalName = req.file.originalname || 'signed_document.pdf';
        const contentType = req.file.mimetype || 'application/pdf';

        const shareResult = await shareManager.createShare(req.file.buffer, originalName, contentType);

        res.json({
            success: true,
            filename: shareResult.filename,
            filesize: shareResult.fileSize,
            mobile: shareResult
        });
    } catch (err) {
        console.error('[ShareRoutes] share-cache error:', err);
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 
            : (err.code === 'STORAGE_QUOTA_EXCEEDED' ? 507 
            : (err.code === 'INVALID_FILE_SIGNATURE' || err.code === 'INVALID_ARGUMENT' ? 400 : 500));
        res.status(status).json({
            success: false,
            error: err.message || 'Could not create document share.'
        });
    }
});

// -------------------------------------------------------------
// 5. DELETE /api/share/:shareId - Authenticated Revocation
// -------------------------------------------------------------
router.delete('/api/share/:shareId', express.json(), async (req, res) => {
    const { shareId } = req.params;
    
    // Extract token from Bearer header or X-Revoke-Token or body
    let token = req.headers['x-revoke-token'];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.slice(7).trim();
    }
    if (!token && req.body && req.body.revokeToken) {
        token = req.body.revokeToken;
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Authorization revocation token required.' });
    }

    const result = await shareManager.revokeShare(shareId, token);
    return res.status(result.code).json(result);
});

module.exports = router;
