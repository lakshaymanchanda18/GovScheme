"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Document management routes — upload, download, delete, list.
 * Uses the Document model for proper tracking.
 */
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const prisma_1 = require("../config/prisma");
const audit_1 = require("../services/audit");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
        }
        cb(null, true);
    },
});
// All document routes require authentication
router.use(auth_1.authenticateToken);
/**
 * POST /api/documents/upload
 * Upload a document, optionally linked to an application.
 */
router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'File size exceeds 5MB limit'
                : err.message || 'Upload failed';
            return res.status(400).json({ error: message, code: 'UPLOAD_ERROR' });
        }
        next();
    });
}, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Authentication required' });
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided', code: 'VALIDATION_ERROR' });
        }
        const { applicationId } = req.body || {};
        // Verify application belongs to user if provided
        if (applicationId) {
            const app = await prisma_1.prisma.application.findUnique({ where: { id: applicationId } });
            if (!app || app.userId !== userId) {
                // Clean up uploaded file
                fs_1.default.unlinkSync(req.file.path);
                return res.status(404).json({ error: 'Application not found' });
            }
        }
        const document = await prisma_1.prisma.document.create({
            data: {
                userId,
                applicationId: applicationId || null,
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                storagePath: req.file.path,
            },
        });
        await (0, audit_1.auditLog)({
            actorId: userId,
            action: 'DOCUMENT_UPLOAD',
            entityType: 'Document',
            entityId: document.id,
            metadata: { originalName: document.originalName, size: document.fileSize },
        });
        res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                id: document.id,
                originalName: document.originalName,
                mimeType: document.mimeType,
                fileSize: document.fileSize,
                uploadedAt: document.uploadedAt,
                verified: document.verified,
            },
        });
    }
    catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Document upload failed' });
    }
});
/**
 * GET /api/documents/:id
 * Download a document (only owner can access).
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Authentication required' });
        const document = await prisma_1.prisma.document.findUnique({ where: { id: req.params.id } });
        if (!document || document.userId !== userId) {
            return res.status(404).json({ error: 'Document not found' });
        }
        if (!fs_1.default.existsSync(document.storagePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
        res.sendFile(path_1.default.resolve(document.storagePath));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve document' });
    }
});
/**
 * DELETE /api/documents/:id
 * Delete a document (only owner can delete).
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Authentication required' });
        const document = await prisma_1.prisma.document.findUnique({ where: { id: req.params.id } });
        if (!document || document.userId !== userId) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Delete file from disk
        if (fs_1.default.existsSync(document.storagePath)) {
            fs_1.default.unlinkSync(document.storagePath);
        }
        await prisma_1.prisma.document.delete({ where: { id: req.params.id } });
        await (0, audit_1.auditLog)({
            actorId: userId,
            action: 'DOCUMENT_DELETE',
            entityType: 'Document',
            entityId: document.id,
        });
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
});
/**
 * GET /api/documents/application/:appId
 * List all documents for a specific application.
 */
router.get('/application/:appId', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Authentication required' });
        const app = await prisma_1.prisma.application.findUnique({ where: { id: req.params.appId } });
        if (!app || app.userId !== userId) {
            return res.status(404).json({ error: 'Application not found' });
        }
        const documents = await prisma_1.prisma.document.findMany({
            where: { applicationId: req.params.appId },
            select: {
                id: true,
                originalName: true,
                mimeType: true,
                fileSize: true,
                uploadedAt: true,
                verified: true,
            },
            orderBy: { uploadedAt: 'desc' },
        });
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
/**
 * GET /api/documents
 * List all documents for the authenticated user.
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Authentication required' });
        const documents = await prisma_1.prisma.document.findMany({
            where: { userId },
            select: {
                id: true,
                originalName: true,
                mimeType: true,
                fileSize: true,
                uploadedAt: true,
                verified: true,
                applicationId: true,
            },
            orderBy: { uploadedAt: 'desc' },
        });
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
exports.default = router;
