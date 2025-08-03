import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return new Response("No image data provided", { status: 400 });
    }

    // Strip the base64 header
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Get current date in DDMMYYYY format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const bucket = `${day}${month}${year}`;

    // Define the upload directory
    const uploadDir = join(process.cwd(), "public", "uploaded", bucket);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Generate a filename
    const filename = `upload_${Date.now()}.jpeg`;
    const filePath = join(uploadDir, filename);

    // Write the image file
    await writeFile(filePath, buffer);

    // Return the public URL
    const responseBody = JSON.stringify({
      url: `/uploaded/${bucket}/${filename}`,
    });

    return new Response(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
