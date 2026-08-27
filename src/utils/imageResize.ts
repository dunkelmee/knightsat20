// Resizes a photo in the browser before it's uploaded, producing a "full"
// (~1600px) and "thumb" (~400px) JPEG pair. This stands in for the
// server-side Pillow thumbnailing the original spec called for — there's no
// image-processing dependency on the backend, so the resize happens here.
// Re-drawing onto a canvas also strips all EXIF metadata (GPS included) and,
// via `imageOrientation: 'from-image'`, applies the correct orientation —
// both side effects of the redraw, not extra work.

const FULL_MAX_DIMENSION = 1600;
const THUMB_MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.85;

const drawResized = (bitmap: ImageBitmap, maxDimension: number): Promise<Blob> => {
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
};

export interface ResizedPhoto {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

export const resizePhotoForUpload = async (file: File): Promise<ResizedPhoto> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const [full, thumb] = await Promise.all([
      drawResized(bitmap, FULL_MAX_DIMENSION),
      drawResized(bitmap, THUMB_MAX_DIMENSION),
    ]);
    return { full, thumb, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
};
