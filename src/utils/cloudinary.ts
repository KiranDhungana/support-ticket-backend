import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

// Validate Cloudinary environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing:');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
  console.error('Please check your .env file in the backend directory');
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('✅ Cloudinary configured with cloud_name:', cloudName);

export default cloudinary;

// Upload function for images
export const uploadImage = async (file: any, folder: string = 'notices') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload function for PDFs
export const uploadPDF = async (file: any, folder: string = 'documents') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'raw',
      format: 'pdf'
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: 'pdf',
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw new Error('Failed to upload PDF');
  }
};

// Delete function
export const deleteFile = async (public_id: string, resource_type: 'image' | 'raw' = 'image') => {
  try {
    console.log(`Cloudinary delete: public_id=${public_id}, resource_type=${resource_type}`);
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });
    console.log(`Cloudinary delete result:`, result);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw new Error('Failed to delete file');
  }
};

// Get file size in readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 

// List images from a Cloudinary folder
export const listImagesInFolder = async (folder: string) => {
  try {
    const results = await cloudinary.search
      .expression(`folder:${folder} AND resource_type:image`)
      .sort_by('public_id', 'asc')
      .max_results(100)
      .execute();

    return (results.resources || []).map((r: any) => ({
      url: r.secure_url,
      public_id: r.public_id,
      format: r.format,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
    }));
  } catch (error) {
    console.error('Error listing images from Cloudinary:', error);
    throw new Error('Failed to list images');
  }
};

// List PDFs from a Cloudinary folder
export const listPDFsInFolder = async (folder: string) => {
  try {
    const results = await cloudinary.search
      .expression(`folder:${folder} AND resource_type:raw`)
      .sort_by('public_id', 'asc')
      .max_results(100)
      .execute();

    return (results.resources || []).map((r: any) => ({
      url: r.secure_url,
      public_id: r.public_id,
      format: r.format,
      bytes: r.bytes,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error('Error listing PDFs from Cloudinary:', error);
    throw new Error('Failed to list PDFs');
  }
};

// Generate signed URL for PDF access
export const getSignedPDFUrl = async (public_id: string) => {
  try {
    const signedUrl = cloudinary.url(public_id, {
      resource_type: 'raw',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
};