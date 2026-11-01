const dns = require("node:dns");
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const express = require("express");
const multer = require("multer");
const path = require("path");
const ilovepdfService = require("./ilovepdfService");

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for in-memory file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file limit
});

// Cache for processed files ready for download
// Maps downloadId -> { buffer, filename, contentType, timestamp }
const downloadCache = new Map();

// Periodic cleanup of downloads older than 15 minutes
setInterval(() => {
    const cutoff = Date.now() - 15 * 60 * 1000;
    for (const [id, item] of downloadCache.entries()) {
        if (item.timestamp < cutoff) {
            downloadCache.delete(id);
        }
    }
}, 5 * 60 * 1000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Tool definitions for UI metadata
const TOOLS = [
    {
        id: "compress",
        name: "Compress PDF",
        tagline: "Reduce PDF file size while preserving optimum quality",
        category: "optimize",
        icon: "🗜️",
        color: "#059669",
        bgLight: "#ecfdf5",
        badge: "Most Popular",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        options: []
    },
    {
        id: "merge",
        name: "Merge PDF",
        tagline: "Combine multiple PDF files in any order you choose",
        category: "organize",
        icon: "📑",
        color: "#dc2626",
        bgLight: "#fef2f2",
        badge: "Essential",
        minFiles: 2,
        maxFiles: 20,
        accept: ".pdf",
        options: []
    },
    {
        id: "split",
        name: "Split PDF",
        tagline: "Extract pages or separate a PDF into individual files",
        category: "organize",
        icon: "✂️",
        color: "#ea580c",
        bgLight: "#fff7ed",
        badge: "Precise",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "organize",
        name: "Organize PDF",
        tagline: "Sort, reorder, rotate, or delete specific pages interactively",
        category: "organize",
        icon: "🗂️",
        color: "#0284c7",
        bgLight: "#f0f9ff",
        badge: "Interactive",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "rotate",
        name: "Rotate PDF",
        tagline: "Rotate pages 90°, 180° or 270° clockwise",
        category: "organize",
        icon: "🔄",
        color: "#2563eb",
        bgLight: "#eff6ff",
        badge: "Instant",
        minFiles: 1,
        maxFiles: 10,
        accept: ".pdf",
        options: []
    },
    {
        id: "pdfoffice",
        name: "PDF to Word",
        tagline: "Convert PDF documents into editable DOCX format",
        category: "convert",
        icon: "📝",
        color: "#2563eb",
        bgLight: "#eff6ff",
        badge: "Editable DOCX",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        options: []
    },
    {
        id: "officepdf",
        name: "Word to PDF",
        tagline: "Convert Word DOC/DOCX files into clean, professional PDFs",
        category: "convert",
        icon: "📄",
        color: "#1d4ed8",
        bgLight: "#dbeafe",
        badge: "Office Engine",
        minFiles: 1,
        maxFiles: 10,
        accept: ".doc,.docx,.ppt,.pptx,.xls,.xlsx",
        options: []
    },
    {
        id: "pdfjpg",
        name: "PDF to JPG",
        tagline: "Convert PDF pages into high-definition JPG images",
        category: "convert",
        icon: "🖼️",
        color: "#7c3aed",
        bgLight: "#f5f3ff",
        badge: "High Res",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "imagepdf",
        name: "JPG to PDF",
        tagline: "Convert and compile JPG, PNG, or WebP images into a PDF",
        category: "convert",
        icon: "🌅",
        color: "#d97706",
        bgLight: "#fffbeb",
        badge: "Fast Convert",
        minFiles: 1,
        maxFiles: 20,
        accept: ".jpg,.jpeg,.png,.webp",
        options: []
    },
    {
        id: "watermark",
        name: "Watermark PDF",
        tagline: "Stamp custom text or confidential watermark across pages",
        category: "security",
        icon: "💧",
        color: "#0891b2",
        bgLight: "#ecfeff",
        badge: "Brand & Secure",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        options: []
    },
    {
        id: "pagenumber",
        name: "Page Numbers",
        tagline: "Add customizable numbering to headers or footers",
        category: "organize",
        icon: "🔢",
        color: "#4f46e5",
        bgLight: "#eef2ff",
        badge: "Pagination",
        minFiles: 1,
        maxFiles: 5,
        accept: ".pdf",
        options: []
    },
    {
        id: "repair",
        name: "Repair PDF",
        tagline: "Analyze and restore damaged, corrupt, or unreadable PDFs",
        category: "optimize",
        icon: "🩹",
        color: "#16a34a",
        bgLight: "#f0fdf4",
        badge: "Restoration",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "pdfocr",
        name: "OCR PDF",
        tagline: "Convert scanned PDFs into searchable, selectable text",
        category: "optimize",
        icon: "👁️",
        color: "#9333ea",
        bgLight: "#faf5ff",
        badge: "AI Searchable",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "pdfa",
        name: "PDF to PDF/A",
        tagline: "Transform documents into ISO-compliant long-term archives",
        category: "convert",
        icon: "🏛️",
        color: "#475569",
        bgLight: "#f8fafc",
        badge: "ISO Standard",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "protect",
        name: "Protect PDF",
        tagline: "Encrypt and secure your PDF with an uncrackable password",
        category: "security",
        icon: "🔒",
        color: "#0d9488",
        bgLight: "#f0fdfa",
        badge: "Security",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "unlock",
        name: "Unlock PDF",
        tagline: "Remove password protection from secured PDFs",
        category: "security",
        icon: "🔓",
        color: "#6366f1",
        bgLight: "#e0e7ff",
        badge: "Decryption",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "sign",
        name: "Sign PDF",
        tagline: "Sign documents with drawn signature, type name, add date & text stamps",
        category: "security",
        icon: "✍️",
        color: "#059669",
        bgLight: "#ecfdf5",
        badge: "E-Signature",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    },
    {
        id: "viewpdf",
        name: "PDF Reader & Viewer",
        tagline: "Open, view, inspect, search, and print PDFs with in-browser reader",
        category: "organize",
        icon: "📖",
        color: "#0284c7",
        bgLight: "#f0f9ff",
        badge: "Reader Studio",
        minFiles: 1,
        maxFiles: 1,
        accept: ".pdf",
        options: []
    }
];

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const token = await ilovepdfService.getAuthToken();
        res.json({
            status: "online",
            brand: "I Like PDFs",
            cluster: "Connected to iLovePDF Edge Grid",
            tokenValid: !!token,
            toolsCount: TOOLS.length
        });
    } catch (err) {
        res.status(500).json({
            status: "degraded",
            error: err.message
        });
    }
});

// List tools metadata
app.get("/api/tools", (req, res) => {
    res.json({ tools: TOOLS });
});

// Core processing endpoint
app.post("/api/process", upload.array("files", 25), async (req, res) => {
    try {
        const tool = req.body.tool;
        const toolDef = TOOLS.find(t => t.id === tool);
        if (!toolDef) {
            return res.status(400).json({ error: `Unsupported tool: ${tool}` });
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        if (files.length < toolDef.minFiles) {
            return res.status(400).json({
                error: `${toolDef.name} requires at least ${toolDef.minFiles} file(s).`
            });
        }

        console.log(`[Process] Starting ${tool} with ${files.length} file(s)...`);

        // Step 1: Start task on dispatch API
        const startData = await ilovepdfService.startTask(tool);
        const server = startData.server;
        const taskId = startData.task;
        console.log(`[Process] Assigned worker: ${server}, task: ${taskId}`);

        // Step 2: Upload all files to assigned worker
        const uploadedFiles = [];
        for (const file of files) {
            const rotate = req.body.rotate_angle ? parseInt(req.body.rotate_angle, 10) : undefined;
            const password = req.body.password || undefined;

            const serverFilename = await ilovepdfService.uploadFile(
                server,
                taskId,
                file.buffer,
                file.originalname
            );

            uploadedFiles.push({
                server_filename: serverFilename,
                originalFilename: file.originalname,
                rotate,
                password
            });
        }
        console.log(`[Process] Uploaded ${uploadedFiles.length} file(s) to ${server}`);

        // Step 3: Parse options and process
        const options = {
            output_filename: req.body.output_filename,
            compression_level: req.body.compression_level,
            split_mode: req.body.split_mode,
            ranges: req.body.ranges,
            password: req.body.password,
            pdfjpg_mode: req.body.pdfjpg_mode,
            orientation: req.body.orientation,
            margin: req.body.margin,
            pagesize: req.body.pagesize,
            text: req.body.text,
            mode: req.body.mode,
            vertical_position: req.body.vertical_position,
            horizontal_position: req.body.horizontal_position,
            opacity: req.body.opacity,
            font_size: req.body.font_size,
            font_color: req.body.font_color,
            pages: req.body.pages,
            ocr_language: req.body.ocr_language,
            conformance: req.body.conformance,
            remove_pages: req.body.remove_pages,
            reorder: req.body.reorder
        };

        const processResult = await ilovepdfService.processTask(
            server,
            taskId,
            tool,
            uploadedFiles,
            options
        );

        console.log(`[Process] Task completed successfully:`, processResult);

        // Step 4: Download processed output into cache for instant client download
        const { buffer, contentType } = await ilovepdfService.downloadResult(server, taskId);
        
        // Infer appropriate default extension
        let defaultExt = "pdf";
        if (tool === "pdfoffice") defaultExt = "docx";
        else if (tool === "pdfjpg") defaultExt = "zip";
        
        const downloadFilename = processResult.download_filename || `ilikepdfs_${tool}.${defaultExt}`;

        const downloadId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        downloadCache.set(downloadId, {
            buffer,
            filename: downloadFilename,
            contentType,
            timestamp: Date.now()
        });

        // Calculate original total size
        const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

        res.json({
            success: true,
            status: "TaskSuccess",
            downloadId,
            downloadUrl: `/api/download/${downloadId}/${encodeURIComponent(downloadFilename)}`,
            filename: downloadFilename,
            filesize: buffer.length,
            originalSize: originalTotalSize,
            savedBytes: Math.max(0, originalTotalSize - buffer.length),
            savedPercent: originalTotalSize > 0 && buffer.length < originalTotalSize
                ? Math.round(((originalTotalSize - buffer.length) / originalTotalSize) * 100)
                : 0,
            timer: processResult.timer || "0.5s"
        });
    } catch (err) {
        console.error("[Process Error]", err);
        res.status(500).json({
            success: false,
            error: err.message || "An unexpected error occurred during PDF processing."
        });
    }
});

// Download endpoint
app.get("/api/download/:downloadId/:filename", (req, res) => {
    const { downloadId, filename } = req.params;
    const item = downloadCache.get(downloadId);

    if (!item) {
        return res.status(404).send("Download link expired or not found. Please re-process your document.");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${item.filename || filename}"`);
    res.setHeader("Content-Type", item.contentType);
    res.setHeader("Content-Length", item.buffer.length);
    res.send(item.buffer);
});

app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  "I Like PDFs" server running on http://localhost:${port}`);
    console.log(`======================================================\n`);
});
