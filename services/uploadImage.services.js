const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config(); 

const randomImageName = () => {
    return crypto.randomBytes(16).toString("hex");
};

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    }
});

/**
 * Uploads images to the S3 bucket.
 * 
 * @param {Array<{ fileName: string, contentType: string, data: Buffer }>} images - An array of objects containing the file name, content type, and data of each image to upload.
 * @param {string[]} folderStructure - An array of folder names to create a folder structure in the S3 bucket.
 * @returns {Promise<string[]>} - A promise that resolves with an array of URLs for the uploaded images.
 * @throws {Error} - An error is thrown if the upload fails.
 * 
 */
async function uploadImages(images, ...folderStructure) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_S3_REGION;


    const uploadedImageUrls = [];
    
    const folderName = folderStructure.join("/");
    for (const image of images) {
        const randomFileName = `${folderName}/${randomImageName()}`;
        
        // Step 1: Initiate a multipart upload for each image with a random file name
        const createParams = {
            Bucket: bucketName, 
            Key: randomFileName,  
            ContentType: image.contentType
        };
        const createCommand = new CreateMultipartUploadCommand(createParams);
        const createResponse = await s3Client.send(createCommand);
        const uploadId = createResponse.UploadId;

        // Step 2: Upload parts of the image
        const parts = [];
        const partSize = 5 * 1024 * 1024; // 5MB per part
        let partNumber = 1;
        for (let start = 0; start < image.data.length; start += partSize) {
            const end = Math.min(start + partSize, image.data.length);
            const partParams = {
                Bucket: bucketName,
                Key: randomFileName,  
                PartNumber: partNumber,
                UploadId: uploadId,
                Body: image.data.slice(start, end),
            };
            const uploadPartCommand = new UploadPartCommand(partParams);
            const uploadPartResponse = await s3Client.send(uploadPartCommand);
            parts.push({ ETag: uploadPartResponse.ETag, PartNumber: partNumber });
            partNumber++;
        }

        // Step 3: Complete the multipart upload
        const completeParams = {
            Bucket: bucketName,
            Key: randomFileName, 
            UploadId: uploadId,
            MultipartUpload: { Parts: parts },
        };
        const completeCommand = new CompleteMultipartUploadCommand(completeParams);
        await s3Client.send(completeCommand);

        const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${randomFileName}`;
        uploadedImageUrls.push(imageUrl);

        console.log(`Upload complete for ${randomFileName}`);
    }

    return uploadedImageUrls;
}

/**
 * Deletes an image from the S3 bucket.
 * 
 * @param {string} fileName - The name of the file to delete, including its folder path.
 * @returns {Promise<void>} - A promise that resolves when the delete operation is complete.
 */
async function deleteImage(fileName) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    try {
        // Step 1: Define the parameters for the delete operation
        const deleteParams = {
            Bucket: bucketName,
            Key: fileName 
        };

        // Step 2: Create the DeleteObjectCommand
        const deleteCommand = new DeleteObjectCommand(deleteParams);

        await s3Client.send(deleteCommand);

        console.log(`Successfully deleted ${fileName} from ${bucketName}`);
    } catch (error) {
        console.error(`Error deleting ${fileName} from ${bucketName}:`, error);
        throw error;
    }
}
const validateImageAspectRatio = async (imageBuffer) => {
    try {
        // Load the image with sharp
        const image = sharp(imageBuffer);
        
        // Get image metadata
        const { width, height } = await image.metadata();

        // Calculate the aspect ratio
        const aspectRatio = width / height;

        // Define the expected aspect ratio
        const expectedAspectRatio = 3.2;

        // Define a tolerance for comparing aspect ratios
        const aspectRatioTolerance = 0.1;

        // Check if the aspect ratio is within the allowed tolerance
        if (Math.abs(aspectRatio - expectedAspectRatio) > aspectRatioTolerance) {
            return {
                statusCode: 400,
                message: `Invalid aspect ratio. The image must have an aspect ratio close to 3.2. Example: 1920 x 600`,
            };
        }

        // If the aspect ratio is valid
        return { statusCode: 200, message: 'Aspect ratio is valid.' };

    } catch (error) {
        return {
            statusCode: 500,
            message: `Error processing image: ${error.message}`,
        };
    }
};

module.exports = { uploadImages, deleteImage, validateImageAspectRatio };
