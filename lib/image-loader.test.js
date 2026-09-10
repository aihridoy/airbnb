import { describe, it, expect } from "vitest";
import imageLoader from "./image-loader";

const params = (url) => new URL(url).searchParams;

describe("imageLoader", () => {
  it("resizes Unsplash images on Unsplash's own CDN at the requested width", () => {
    const src =
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80";
    const url = imageLoader({ src, width: 384, quality: 75 });
    expect(new URL(url).host).toBe("images.unsplash.com");
    expect(params(url).get("w")).toBe("384");
    expect(params(url).get("q")).toBe("75");
    expect(params(url).get("auto")).toBe("format");
    expect(params(url).get("fit")).toBe("crop");
  });

  it("gives each width its own URL so the srcset is responsive", () => {
    const src = "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    const small = imageLoader({ src, width: 640 });
    const large = imageLoader({ src, width: 1920 });
    expect(small).not.toBe(large);
    expect(params(small).get("w")).toBe("640");
    expect(params(large).get("w")).toBe("1920");
  });

  it("defaults quality to 75 when none is passed", () => {
    const src = "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    expect(params(imageLoader({ src, width: 256 })).get("q")).toBe("75");
  });

  it("keeps Unsplash's tracking params on plus.unsplash.com URLs", () => {
    const src =
      "https://plus.unsplash.com/premium_photo-1661964402307-02267d1423f5?q=80&w=2073&ixlib=rb-4.0.3";
    const url = imageLoader({ src, width: 828, quality: 75 });
    expect(new URL(url).host).toBe("plus.unsplash.com");
    expect(params(url).get("w")).toBe("828");
    expect(params(url).get("ixlib")).toBe("rb-4.0.3");
  });

  it("never routes through the Vercel optimizer", () => {
    const src = "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    expect(imageLoader({ src, width: 384 })).not.toContain("/_next/image");
  });

  it("serves other hosts and local files untouched", () => {
    for (const src of [
      "/logo.svg",
      "https://placehold.co/600x400",
      "https://lh3.googleusercontent.com/a/abc=s96-c",
    ]) {
      expect(imageLoader({ src, width: 384, quality: 75 })).toBe(src);
    }
  });
});
