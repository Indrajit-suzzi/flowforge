import Media from '../models/media.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const upload = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = req.files.file;
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const filePath = path.join(uploadsDir, fileName);
        
        await file.mv(filePath);

        let type = 'other';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';
        else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) type = 'document';

        const media = await Media.create({
            tenantId: req.tenant,
            name: fileName,
            originalName: file.name,
            mimeType: file.mimetype,
            size: file.size,
            url: `/api/v1/media/${fileName}`,
            type,
            alt: req.body.alt || ''
        });

        res.status(201).json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAll = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = { tenantId: req.tenant };
        if (type) filter.type = type;

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;
        
        const [media, total] = await Promise.all([
            Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Media.countDocuments(filter)
        ]);
        res.json({ data: media, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const remove = async (req, res) => {
    try {
        const media = await Media.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
        if (media) {
            const filePath = path.join(uploadsDir, media.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.json({ message: "File deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const serveFile = async (req, res) => {
    try {
        const filePath = path.join(uploadsDir, req.params.fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found" });
        }
        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};