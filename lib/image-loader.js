// Custom next/image loader. The Vercel Image Optimization quota for this
// project is exhausted, so any transform it has not already cached comes back
// as 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED and renders as a broken
// image. Unsplash (every hotel photo) resizes on its own CDN, so we ask it for
// the width next/image wants instead of going through /_next/image. Anything
// else (local files, avatars, placeholders) is served as-is.

const RESIZABLE_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);

export default function imageLoader({ src, width, quality }) {
  let url;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (!RESIZABLE_HOSTS.has(url.hostname)) return src;

  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality || 75));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
  return url.toString();
}
