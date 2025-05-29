import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fashion-rental", 
    allowed_formats: ["jpg", "jpeg", "png", "gif"], 
    transformation: [{ width: 1000, height: 1000, crop: "limit" }], 
  } as any,
});

// Create multer upload instance
export const upload = multer({ storage: storage });

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to get image URL
export const getImageUrl = (publicId: string) => {
  return cloudinary.url(publicId);
};
