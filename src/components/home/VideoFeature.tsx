"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 视频区域：
 * - 默认渲染封面缩略图 + 播放按钮（点击手动播放，后备方案）
 * - 进入视口后由 IntersectionObserver 自动加载 iframe 并自动播放
 *   （autoplay=1&mute=1&loop=1，符合无打扰的静音循环自动播放）
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const [activated, setActivated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // maxresdefault 缺失时回退 hqdefault
  const thumbUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbFallbackUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // loop 需要 playlist=<videoId> 才能在 YouTube embed 生效
  const embedUrl =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;

  useEffect(() => {
    if (activated) return;
    const node = containerRef.current;
    if (!node) return;

    // 不支持 IntersectionObserver 时直接激活（保守降级）
    if (typeof IntersectionObserver === "undefined") {
      setActivated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActivated(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 h-full w-full"
          >
            <img
              src={thumbUrl}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== thumbFallbackUrl) img.src = thumbFallbackUrl;
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg shadow-[hsl(var(--nav-theme)/0.4)] transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-white text-white" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
