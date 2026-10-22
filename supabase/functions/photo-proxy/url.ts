export function allowedPhotoUrl(input: string): URL | null {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && url.hostname === 'ci.encar.com' && !url.username && !url.password && (!url.port || url.port === '443') ? url : null;
  } catch { return null; }
}