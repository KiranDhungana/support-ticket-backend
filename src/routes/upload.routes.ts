import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadImage, uploadPDF, deleteFile, formatFileSize } from '../utils/cloudinary';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow PDFs
  else if (file.mimetype === 'application/pdf') {
    cb(null, true);
  }
  // Reject other files
  else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Clean up uploaded files
const cleanupUploadedFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Upload single image
router.post('/image', authenticate, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const folder = req.body.folder || 'notices';
      const result = await uploadImage(req.file, folder);
      
      // Clean up the uploaded file
      cleanupUploadedFile(req.file.path);
      
      res.json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id,
          format: result.format,
          size: formatFileSize(result.size),
          originalName: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Clean up the uploaded file on error
      cleanupUploadedFile(req.file.path);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });
});

// Upload single PDF
router.post('/pdf', authenticate, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const folder = req.body.folder || 'documents';
      const result = await uploadPDF(req.file, folder);
      
      // Clean up the uploaded file
      cleanupUploadedFile(req.file.path);
      
      res.json({
        success: true,
        data: {
          url: result.url,
          public_id: result.public_id,
          format: result.format,
          size: formatFileSize(result.size),
          originalName: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Clean up the uploaded file on error
      cleanupUploadedFile(req.file.path);
      res.status(500).json({ error: 'Failed to upload PDF' });
    }
  });
});

// Upload multiple files
router.post('/multiple', authenticate, (req, res) => {
  upload.array('files', 5)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      const folder = req.body.folder || 'notices';
      const results = [];

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const file of files) {
        try {
          let result;
          if (file.mimetype === 'application/pdf') {
            result = await uploadPDF(file, folder);
          } else {
            result = await uploadImage(file, folder);
          }
          
          results.push({
            url: result.url,
            public_id: result.public_id,
            format: result.format,
            size: formatFileSize(result.size),
            originalName: file.originalname
          });
          
          // Clean up the uploaded file
          cleanupUploadedFile(file.path);
        } catch (error) {
          console.error(`Error uploading file ${file.originalname}:`, error);
          cleanupUploadedFile(file.path);
        }
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      // Clean up all uploaded files on error
      if (Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          cleanupUploadedFile(file.path);
        });
      }
      res.status(500).json({ error: 'Failed to upload files' });
    }
  });
});

// Delete file from Cloudinary
router.delete('/:public_id', authenticate, async (req, res) => {
  try {
    const { public_id } = req.params;
    const resource_type = req.query.resource_type as 'image' | 'raw' || 'image';
    
    const result = await deleteFile(public_id, resource_type);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router; 