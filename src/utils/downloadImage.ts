/** @format */

import toast from 'react-hot-toast';

export const downloadImage = async (
  imageUrl: string,
  fileName: string = 'image.jpg'
) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    toast.error('Failed to download image:', error as any);
  }
};
