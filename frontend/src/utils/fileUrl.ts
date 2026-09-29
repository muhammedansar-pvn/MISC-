/**
 * Resolves a file URL (e.g. /uploads/syllabuses/file.pdf) to an accessible URL
 */
export function getFileUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  const serverOrigin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverOrigin}${cleanPath}`;
}
