import { v2 as cloudinary } from "cloudinary";

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

// Raw upload: correct for non-image files like PDF/DOC/DOCX
const uploadBuffer = (buffer, publicId) =>
  new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { resource_type: "raw", public_id: publicId },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

export { getCloudinary, uploadBuffer };
