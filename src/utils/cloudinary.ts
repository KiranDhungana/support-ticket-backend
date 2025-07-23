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
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });
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