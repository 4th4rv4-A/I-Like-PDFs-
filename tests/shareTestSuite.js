const assert = require('assert');
const fs = require('fs');
const path = require('path');
const shareManager = require('../shareManager');
const NetworkResolver = require('../share/networkResolver');
const ShareValidator = require('../share/shareValidator');

async function runTestSuite() {
    console.log('\n========================================');
    console.log('SCAN-TO-MOBILE BACKEND VERIFICATION SUITE');
    console.log('========================================\n');

    // Test 1: Network Resolver
    console.log('1. Testing NetworkResolver...');
    const net = NetworkResolver.resolve();
    console.log('   Result:', net);
    assert.strictEqual(typeof net.available, 'boolean', 'available must be boolean');
    if (net.available) {
        assert.ok(net.baseUrl.startsWith('http'), 'baseUrl must start with http');
    }
    console.log('   ✅ NetworkResolver passed.');

    // Test 2: ShareValidator Magic Bytes & Filenames
    console.log('\n2. Testing ShareValidator...');
    const pdfBuffer = Buffer.from('%PDF-1.4\n%test content\n');
    const validPdf = ShareValidator.validateMagicBytes(pdfBuffer, 'pdf');
    assert.strictEqual(validPdf.valid, true, 'Valid PDF header should pass');

    const fakePdf = Buffer.from('NOT A PDF FILE');
    const invalidPdf = ShareValidator.validateMagicBytes(fakePdf, 'pdf');
    assert.strictEqual(invalidPdf.valid, false, 'Fake PDF header should fail');

    const sanitized = ShareValidator.sanitizeFilename('../../../evil<script>alert(1)</script>file.pdf\r\n');
    assert.strictEqual(sanitized.includes('..'), false, 'Path traversal must be stripped');
    assert.strictEqual(sanitized.includes('<'), false, 'HTML tags must be stripped');
    assert.strictEqual(sanitized.includes('\r'), false, 'CRLF must be stripped');
    console.log('   Sanitized name:', sanitized);
    console.log('   ✅ ShareValidator passed.');

    // Test 3: ShareManager Lifecycle
    console.log('\n3. Testing ShareManager.createShare()...');
    const share = await shareManager.createShare(pdfBuffer, 'my_test_document.pdf', 'application/pdf');
    console.log('   Created share ID:', share.shareId);
    console.log('   Page URL:', share.pageUrl);
    console.log('   QR Code generated:', !!share.qrCode);
    assert.ok(share.shareId, 'shareId must exist');
    assert.ok(share.revokeToken, 'revokeToken must be returned');
    assert.ok(share.qrCode, 'qrCode DataURL must exist');
    console.log('   ✅ Share creation passed.');

    // Test 4: Retrieve Share Metadata
    console.log('\n4. Testing ShareManager.getShare()...');
    const retrieved = await shareManager.getShare(share.shareId);
    assert.strictEqual(retrieved.status, 'active');
    assert.strictEqual(retrieved.metadata.displayFilename, 'my_test_document.pdf');
    assert.strictEqual(retrieved.metadata.fileSize, pdfBuffer.length);
    console.log('   ✅ Metadata retrieval passed.');

    // Test 5: Byte Range Stream
    console.log('\n5. Testing getStream with byte range...');
    const streamRes = await shareManager.getStream(share.shareId, { start: 0, end: 4 });
    assert.ok(streamRes, 'Stream result must exist');
    const chunks = [];
    for await (const chunk of streamRes.stream) {
        chunks.push(chunk);
    }
    const rangeContent = Buffer.concat(chunks).toString('utf-8');
    assert.strictEqual(rangeContent, '%PDF-');
    streamRes.releaseLock();
    console.log('   Range content (0-4):', rangeContent);
    console.log('   ✅ Byte range streaming passed.');

    // Test 6: Revoke Share (Unauthorized vs Authorized)
    console.log('\n6. Testing ShareManager.revokeShare()...');
    // Wrong token
    const unauth = await shareManager.revokeShare(share.shareId, 'invalid-token-123');
    assert.strictEqual(unauth.code, 403, 'Wrong revoke token must return 403');

    // Correct token
    const auth = await shareManager.revokeShare(share.shareId, share.revokeToken);
    assert.strictEqual(auth.code, 200, 'Correct revoke token must succeed');

    // Test 7: Tombstone verification
    console.log('\n7. Testing Tombstone status after revocation...');
    const afterRevoke = await shareManager.getShare(share.shareId);
    assert.strictEqual(afterRevoke.status, 'tombstone');
    assert.strictEqual(afterRevoke.reason, 'revoked');
    console.log('   ✅ Tombstone verification passed.');

    console.log('\n========================================');
    console.log('ALL BACKEND SHARE TESTS PASSED CLEANLY! ✅');
    console.log('========================================\n');
}

runTestSuite().catch(err => {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
});
