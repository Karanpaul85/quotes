import axios from "axios";

export async function uploadToCloudinary(file, quote, onProgress) {
  const context = `alt=${quote}|caption=${quote}|website=https://websitefreelancing.co.in|profile_id=KP|device_model=mototola`;
  const customFileName = `img_${Date.now()}`;
  const url = `/api/sign-upload?context=${encodeURIComponent(
    context
  )}&public_id=${encodeURIComponent(
    customFileName
  )}&exif=true&image_metadata=true`;

  const res = await fetch(url);
  const {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    public_id,
    exif,
    image_metadata,
  } = await res.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("context", context);
  formData.append("public_id", public_id);
  formData.append("exif", "true");
  formData.append("image_metadata", "true");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      onUploadProgress: (event) => {
        if (onProgress) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data; // includes secure_url
}
