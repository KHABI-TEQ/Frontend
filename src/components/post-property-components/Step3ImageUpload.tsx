"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { usePostPropertyContext } from "@/context/post-property-context";
import {
  Plus as PlusIcon,
  X as XIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { POST_REQUEST, DELETE_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";

interface PropertyImage {
  file: File | null;
  preview: string | null;
  id: string;
  url?: string | null; // For uploaded images
  isUploading?: boolean;
}

interface PropertyVideo {
  file: File | null;
  preview: string | null;
  id: string;
  url?: string | null;
  isUploading?: boolean;
}

interface StepProps {
  errors?: any;
  touched?: any;
}

const Step3ImageUpload: React.FC<StepProps> = ({ errors, touched }) => {
  const {
    images,
    setImages,
    getMinimumRequiredImages,
    areImagesValid,
    propertyData,
    updatePropertyData,
  } = usePostPropertyContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = React.useState(0);
  const [videoInputKey, setVideoInputKey] = React.useState(1000);

  // Get videos from propertyData or initialize empty array
  const videos: PropertyVideo[] = propertyData.videos || [];

  const setVideos = (newVideos: PropertyVideo[]) => {
    updatePropertyData("videos", newVideos);
  };

  const generateImageId = () => Math.random().toString(36).substr(2, 9);

  const uploadFile = async (file: File, type: "image" | "video" = "image") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "for",
      type === "image" ? "property-image" : "property-video",
    );

    try {
      const response = await POST_REQUEST_FILE_UPLOAD(
        `${URLS.BASE + URLS.uploadSingleImg}`,
        formData,
        Cookies.get("token"),
      );

      if (response?.success) {
        return response.data.url;
      }

      return null;

    } catch (error) {
      return null;
    }
  };

  const removeFile = async (url: string) => {
    try {
      const response = await DELETE_REQUEST(
        `${URLS.BASE + URLS.deleteUploadedSingleImg}`,
        { url },
        Cookies.get("token"),
      );

      if (!response?.success) {
        toast.error(response?.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Failed to remove file from server");
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    // Force re-render of file input to allow re-selection of same files
    setFileInputKey(prev => prev + 1);

    const maxImages = 12;
    const currentValidImages = images.filter(
      (img) => img.file !== null || img.url,
    ).length;
    const remainingSlots = maxImages - currentValidImages;

    if (files.length > remainingSlots) {
      toast.error(
        `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
      );
      return;
    }

    const newImages: PropertyImage[] = [];
    const filesToProcess = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    for (const file of filesToProcess) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const imageData: PropertyImage = {
        file,
        preview,
        id: generateImageId(),
        isUploading: true,
      };

      newImages.push(imageData);
    }

    if (newImages.length === 0) return;

    // Add images to state first (optimistic update)
    const updatedImages = [...images];
    let newImageIndex = 0;

    for (
      let i = 0;
      i < updatedImages.length && newImageIndex < newImages.length;
      i++
    ) {
      if (updatedImages[i].file === null && !updatedImages[i].url) {
        updatedImages[i] = newImages[newImageIndex];
        newImageIndex++;
      }
    }

    while (
      newImageIndex < newImages.length &&
      updatedImages.length < maxImages
    ) {
      updatedImages.push(newImages[newImageIndex]);
      newImageIndex++;
    }

    while (updatedImages.length < Math.max(getMinimumRequiredImages(), 4)) {
      updatedImages.push({
        file: null,
        preview: null,
        id: generateImageId(),
      });
    }

    setImages(updatedImages);

    // Upload images with improved state management
    const uploadPromises = newImages.map(async (imageData, index) => {
      if (imageData.file) {
        const url = await uploadFile(imageData.file, "image");
        if (url) {
          // Update the specific image with the URL immediately using functional update
          setImages((prevImages: PropertyImage[]) => prevImages.map((img: PropertyImage) =>
            img.id === imageData.id
              ? { ...img, url, isUploading: false }
              : img,
          ));
          return { success: true, fileName: imageData.file.name };
        } else {
          // Clear failed upload immediately and show error using functional update
          setImages((prevImages: PropertyImage[]) => prevImages.map((img: PropertyImage) =>
            img.id === imageData.id
              ? { file: null, preview: null, id: generateImageId(), isUploading: false }
              : img,
          ));
          return { success: false, fileName: imageData.file.name };
        }
      }
      return { success: false, fileName: "Unknown file" };
    });

    const results = await Promise.all(uploadPromises);

    // Show single toast notification after all uploads complete
    const successfulUploads = results.filter(result => result.success).length;
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads > 0) {
      if (successfulUploads === 1) {
        toast.success("Image uploaded successfully!");
      } else {
        toast.success(`${successfulUploads} images uploaded successfully!`);
      }
    }

    // Show individual error messages for failed uploads
    failedUploads.forEach(result => {
      toast.error(`Failed to upload ${result.fileName}. Please try again.`);
    });
  };

  const handleImageRemove = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];

    // If image has URL, remove from server
    if (imageToRemove.url) {
      await removeFile(imageToRemove.url);
    }

    const updatedImages = images.map((img, index) =>
      index === indexToRemove
        ? { file: null, preview: null, id: generateImageId() }
        : img,
    );
    setImages(updatedImages);
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handleVideoSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Force re-render of video input to allow re-selection of same files
    setVideoInputKey(prev => prev + 1);

    const file = files[0]; // Only allow one video
    const maxVideoSize = 50 * 1024 * 1024; // Updated to 50MB limit as per guidelines

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    if (file.size > maxVideoSize) {
      toast.error("Video file is too large. Maximum size is 50MB.");
      return;
    }

    const reader = new FileReader();
    const preview = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const videoData: PropertyVideo = {
      file,
      preview,
      id: generateImageId(),
      isUploading: true,
    };

    // Immediately show the video with upload state
    setVideos([videoData]);

    // Upload video
    try {
      const url = await uploadFile(file, "video");
      if (url) {
        // Update with successful upload - keep preview for immediate display
        const uploadedVideoData = {
          ...videoData,
          url,
          isUploading: false
        };
        setVideos([uploadedVideoData]);
        toast.success("Video uploaded successfully!");
      } else {
        // Clear failed upload and allow retry
        setVideos([]);
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
    } catch (error) {
      setVideos([]);
      toast.error(`Error uploading ${file.name}. Please check your connection and try again.`);
    }
  };

  const handleVideoRemove = async () => {
    const currentVideo = videos[0];
    if (currentVideo?.url) {
      await removeFile(currentVideo.url);
    }
    setVideos([]);
  };

  const handleAddVideo = () => {
    videoInputRef.current?.click();
  };

  // Initialize with minimum required empty slots if no images exist
  React.useEffect(() => {
    if (images.length === 0) {
      const minRequired = getMinimumRequiredImages();
      const initialImages: PropertyImage[] = [];
      for (let i = 0; i < Math.max(minRequired, 4); i++) { // Start with at least 4 slots for better UX
        initialImages.push({
          file: null,
          preview: null,
          id: generateImageId(),
        });
      }
      setImages(initialImages);
    }
  }, []);

  const validImagesCount = images.filter(
    (img) => img.file !== null || img.url,
  ).length;
  const minRequired = getMinimumRequiredImages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-[24px] leading-[38.4px] font-semibold font-display text-[#09391C] mb-2">
          Upload Picture
        </h2>
        <p className="text-[16px] text-[#5A5D63] mb-4">
          Add high-quality images to showcase your property
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span
            className={`font-medium ${areImagesValid() ? "text-green-600" : "text-red-600"}`}
          >
            {validImagesCount} of {minRequired} minimum images uploaded
          </span>
          {!areImagesValid() && (
            <span className="text-red-600 text-xs">
              (At least {minRequired} images required)
            </span>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        key={`file-input-${fileInputKey}`}
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        key={`video-input-${videoInputKey}`}
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleVideoSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative aspect-square bg-[#F7F7F8] rounded-md border-2 border-dashed border-[#C7CAD0] hover:border-[#8DDB90] transition-colors group"
          >
            {(image.file && image.preview) || image.url ? (
              <>
                <img
                  src={image.url || image.preview || ""}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onLoad={() => {
                    // Ensure image renders properly after upload
                  }}
                  onError={(e) => {
                    // Fallback to preview if URL fails
                    if (image.url && image.preview) {
                      (e.target as HTMLImageElement).src = image.preview;
                    }
                  }}
                />
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                <button
                  onClick={() => handleImageRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  disabled={image.isUploading}
                >
                  <XIcon size={16} />
                </button>
                {index < minRequired && (
                  <div className="absolute bottom-2 left-2 bg-[#8DDB90] text-white text-xs px-2 py-1 rounded">
                    Required
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleAddMoreImages}
                className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-[#8DDB90] transition-colors"
              >
                <PlusIcon size={24} className="mb-2" />
                <span className="text-sm">
                  {index < minRequired ? "Required" : "Add Image"}
                </span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Video Upload Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <VideoIcon size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Property Video Tour
            </h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Add a video to showcase your property (Optional)
            </p>
          </div>

          {videos.length > 0 && videos[0] ? (
            <div className="max-w-xl mx-auto">
              <div className="relative bg-white rounded-lg shadow-sm overflow-hidden">
                <video
                  src={videos[0].url || videos[0].preview || ""}
                  className="w-full h-48 object-cover"
                  controls
                  preload="metadata"
                  onLoadedData={() => {
                    // Video loaded successfully
                  }}
                  onError={(e) => {
                    if (videos[0].url && videos[0].preview) {
                      // Fallback to preview if URL fails
                      (e.target as HTMLVideoElement).src = videos[0].preview || "";
                    }
                  }}
                />

                {videos[0].isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <VideoIcon size={24} className="text-white" />
                      </div>
                    </div>
                    <p className="text-white mt-4 font-medium">
                      Uploading your amazing video...
                    </p>
                    <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full animate-pulse"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleVideoRemove}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:transform-none"
                  disabled={videos[0].isUploading}
                  title="Remove video"
                >
                  <XIcon size={20} />
                </button>

                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                  ✅ Video Added
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <button
                  onClick={handleAddVideo}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                  disabled={videos[0].isUploading}
                >
                  <VideoIcon size={16} />
                  Replace Video
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="border border-dashed border-purple-300 rounded-lg p-6 mb-4 hover:border-purple-400 transition-colors bg-white bg-opacity-50">
                <div className="mb-3">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <VideoIcon size={24} className="text-purple-500" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-700 mb-1">
                    No video yet
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Click below to add your property video
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddVideo}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <VideoIcon size={16} />
                Upload Property Video
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  Optional
                </span>
              </button>
            </div>
          )}

          {/* Video Guidelines */}
          <div className="mt-4 bg-white bg-opacity-70 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <span className="text-purple-500">📋</span>
              Video Guidelines
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Maximum file size: 50MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Supported formats: MP4, MOV, AVI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>Duration: 1-3 minutes</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Show exterior and interior</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Good lighting and stable footage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Highlight key selling points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <ImageIcon size={18} />
          Image Guidelines
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload at least {minRequired} high-quality images</li>
          <li>• Maximum file size: 5MB per image, 50MB per video</li>
          <li>
            • Recommended formats: JPG, PNG, WebP for images; MP4, MOV for video
          </li>
          <li>• Include exterior, interior, and key features</li>
          <li>• Maximum {12} images and 1 video allowed</li>
          <li>
            • Images are automatically uploaded and can be removed anytime
          </li>
        </ul>
      </div>

      {/* Validation Message */}
      {!areImagesValid() && validImagesCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center"
        >
          <p className="text-red-700 font-medium">
            Please upload at least {minRequired - validImagesCount} more
            image(s) to continue
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step3ImageUpload;
