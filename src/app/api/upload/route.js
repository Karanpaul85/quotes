import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration (env vars must be set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { imageData, quote } = await request.json();
    console.log(quote, "quote");

    if (!imageData) {
      return new Response("No image data provided", { status: 400 });
    }

    // Get month and year
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const folder = `${month}${year}`;
    const fileName = `img_${now.getTime()}`;

    // Remove the base64 header if present
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");

    // Upload directly to Cloudinary using a data URI
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        folder,
        public_id: fileName,
        overwrite: true,
        context: {
          alt: quote,
          caption: quote,
          website: "Karan Paul",
        },
      }
    );

    // Respond with the public Cloudinary URL
    return new Response(
      JSON.stringify({
        url: uploadResponse.secure_url,
        bucketName: folder,
        imageName: fileName,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
