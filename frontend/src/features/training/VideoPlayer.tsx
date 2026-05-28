import { useEffect, useRef } from 'react';
import { buildEmbedUrl } from '@/features/training/training.logic';
import type { CatalogModule } from '@/features/training/training.types';

export const PROGRESS_TICK_SECONDS = 15;

interface VideoPlayerProps {
  module: CatalogModule;
  onProgress: (watchedSeconds: number) => void;
}

export function VideoPlayer({ module, onProgress }: VideoPlayerProps) {
  const watchedRef = useRef(module.watchedSeconds);
  const embedUrl = buildEmbedUrl(
    module.videoProvider,
    module.videoExternalId,
    module.watchedSeconds,
  );

  useEffect(() => {
    watchedRef.current = module.watchedSeconds;
  }, [module.id, module.watchedSeconds]);

  useEffect(() => {
    if (!embedUrl || module.completed) return;

    const intervalId = window.setInterval(() => {
      const next = Math.min(
        module.durationSeconds,
        watchedRef.current + PROGRESS_TICK_SECONDS,
      );
      if (next <= watchedRef.current) return;
      watchedRef.current = next;
      onProgress(next);
    }, PROGRESS_TICK_SECONDS * 1000);

    return () => window.clearInterval(intervalId);
  }, [embedUrl, module.completed, module.durationSeconds, module.id, onProgress]);

  if (!embedUrl) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
        Video unavailable for this module.
      </p>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-black">
      <iframe
        title={`Training video: ${module.title}`}
        src={embedUrl}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
