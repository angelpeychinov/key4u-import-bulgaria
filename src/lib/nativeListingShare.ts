type ShareNavigator = Pick<Navigator, 'share' | 'canShare'>;
const cancelled = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

// Return false only when the caller should open its fallback menu.
export async function nativeListingShare(
  nav: ShareNavigator,
  data: { title: string; text: string; url: string },
  file?: File,
): Promise<boolean> {
  if (!nav.share) return false;
  if (file && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: data.title, text: data.text });
      return true;
    } catch (error) { if (cancelled(error)) return true; }
  }
  try {
    await nav.share(data);
    return true;
  } catch (error) { return cancelled(error); }
}

export async function listingPhotoFile(photo: string, slug: string, proxyOrigin: string, signal: AbortSignal): Promise<File> {
  let response: Response;
  try {
    response = await fetch(photo, { signal });
    if (!response.ok) throw new Error('Photo unavailable');
  } catch (error) {
    if (signal.aborted) throw error;
    response = await fetch(`${proxyOrigin}/functions/v1/photo-proxy?url=${encodeURIComponent(photo)}`, { signal });
  }
  if (!response.ok) throw new Error('Photo unavailable');
  let blob = await response.blob();
  if (!blob.size || blob.size > 10 * 1024 * 1024 || !blob.type.startsWith('image/')) throw new Error('Invalid photo');
  if (blob.type !== 'image/jpeg') {
    const bitmap = await createImageBitmap(blob);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Photo conversion unavailable');
      context.drawImage(bitmap, 0, 0);
      blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Photo conversion failed')), 'image/jpeg', 0.9));
    } finally { bitmap.close(); }
  }
  return new File([blob], `${slug}.jpg`, { type: 'image/jpeg' });
}