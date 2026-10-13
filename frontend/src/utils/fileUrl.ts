import { apiClient } from '@/api/axios';

/**
 * In-memory cache for resolved signed URLs to minimize roundtrips.
 * Stores { url: string, expiresAt: number }
 */
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Synchronous URL resolver:
 * - Direct external links (http, https, blob, data) returned as-is
 * - Public uploads (/uploads/public/*) served statically and publicly
 * - Relative paths prepended with server origin
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

/**
 * Checks if a file path is located in the public unauthenticated uploads folder.
 */
export function isPublicUpload(url?: string): boolean {
  if (!url) return false;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return cleanPath.startsWith('/uploads/public/');
}

/**
 * Asynchronously resolves a file URL to an accessible URL:
 * - Public files or external links are returned directly.
 * - Private files under /uploads request a time-limited signed URL token from /api/uploads/signed-url.
 */
export async function resolveFileUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  // Truly public uploads (/uploads/public/*) are served without signed tokens
  if (isPublicUpload(url)) {
    return getFileUrl(url);
  }

  // Check cache (refresh 60 seconds before actual token expiry)
  const cached = signedUrlCache.get(url);
  const now = Date.now();
  if (cached && cached.expiresAt > now + 60000) {
    return cached.url;
  }

  try {
    const filename = url.replace(/^\/?uploads\/?/, '');
    const response = await apiClient.get<{
      success: boolean;
      data: { file: string; token: string; signedUrl: string; expiresIn: number };
    }>(`/uploads/signed-url`, {
      params: { file: filename },
    });

    if (response.data?.success && response.data?.data?.signedUrl) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const serverOrigin = apiBase.replace(/\/api\/?$/, '');
      const fullSignedUrl = `${serverOrigin}${response.data.data.signedUrl}`;
      const ttl = (response.data.data.expiresIn || 3600) * 1000;

      signedUrlCache.set(url, {
        url: fullSignedUrl,
        expiresAt: now + ttl,
      });

      return fullSignedUrl;
    }
  } catch (error) {
    console.error('Failed to resolve signed URL for file:', url, error);
  }

  // Graceful fallback to static server origin URL
  return getFileUrl(url);
}

/**
 * Helper to trigger an authenticated, signed download or browser tab navigation.
 */
export async function openSecureFile(url: string, target = '_blank') {
  if (!url) return;
  const resolved = await resolveFileUrl(url);
  if (typeof window !== 'undefined') {
    window.open(resolved, target);
  }
}
