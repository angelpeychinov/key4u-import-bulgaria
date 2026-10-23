type ShareNavigator = Pick<Navigator, 'share' | 'canShare'>;
const cancelled = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

// Text-only native share: the text already contains the link, so no url field
// (avoids duplicates) and no photo file (Viber would send it as a separate
// message). Returns false only when the caller should open its fallback menu.
export async function nativeListingShare(
  nav: ShareNavigator,
  data: { text: string },
): Promise<boolean> {
  if (!nav.share) return false;
  try {
    await nav.share({ text: data.text });
    return true;
  } catch (error) {
    return cancelled(error);
  }
}
