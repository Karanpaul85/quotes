import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const url = new URL(request.url);
  const context = url.searchParams.get("context");
  const public_id = url.searchParams.get("public_id");
  const exif = url.searchParams.get("exif");
  const image_metadata = url.searchParams.get("image_metadata");
  const timestamp = Math.floor(Date.now() / 1000);
  // Get month and year
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const folder = `${month}${year}`;
  const fileName = public_id || `img_${now.getTime()}`;

  // Build the params object with these included:
  const paramsToSign = {
    timestamp,
    folder,
    context,
    public_id,
  };

  // Only include them if present (avoid null entries)
  if (exif) paramsToSign.exif = exif;
  if (image_metadata) paramsToSign.image_metadata = image_metadata;

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return new Response(
    JSON.stringify({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      context,
      public_id: fileName,
      exif,
      image_metadata,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
