import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Tv, AlertCircle, Play } from "lucide-react";

export type LiveTvChannel = {
  id: string;
  name: string;
  country?: string;
  channelGroup?: string;
  iptvUrl: string;
};

export function LiveTvModal({
  channel,
  onClose,
}: {
  channel: LiveTvChannel;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isPlayingNow, setIsPlayingNow] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto flex items-start justify-center px-4 backdrop-blur-md animate-in fade-in duration-300"
      style={{
        backgroundColor: "rgba(8,4,4,0.98)",
        paddingTop: 10,
        paddingBottom: 20,
      }}
      data-testid="modal-live-tv"
    >
      <div className="w-full max-w-[1000px] animate-in zoom-in-95 duration-500">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors"
            data-testid="button-close-live-tv"
          >
            <X size={14} strokeWidth={2.5} />
            Close
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 shadow-lg">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              Live TV
            </span>
          </div>
        </div>

        <div
          className="relative w-full bg-black"
          style={{
            paddingBottom: "56.25%",
            border: "1px solid rgba(239,68,68,0.65)",
            boxShadow: "0 0 50px rgba(239,68,68,0.3)",
          }}
        >
          {streamError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid gap-3 text-center max-w-sm px-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="text-sm text-white/80" data-testid="text-live-tv-error">
                  This channel is currently unavailable
                </div>
                <div className="text-xs text-white/45">
                  {channel.name} may be offline or blocked by your network
                </div>
                <button
                  onClick={() => setStreamError(null)}
                  className="mt-2 mx-auto px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/20"
                  data-testid="button-live-tv-retry"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                key={channel.id + "-" + (streamError ?? "ok")}
                className="absolute inset-0 h-full w-full"
                controls
                autoPlay
                muted
                playsInline
                data-testid="video-live-tv"
                onPlaying={() => setIsPlayingNow(true)}
                onPause={() => setIsPlayingNow(false)}
                onWaiting={() => setIsPlayingNow(false)}
                onError={() => setStreamError("Stream failed to load")}
              >
                <source src={channel.iptvUrl} />
              </video>
              {!isPlayingNow && (
                <button
                  onClick={() => {
                    const v = videoRef.current;
                    if (v) {
                      v.muted = false;
                      v.play().catch(() => {
                        v.muted = true;
                        v.play().catch(() => {});
                      });
                    }
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm transition-opacity hover:bg-black/40"
                  data-testid="button-live-tv-tap-to-play"
                >
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.95)",
                      boxShadow: "0 0 40px rgba(239,68,68,0.6)",
                    }}
                  >
                    <Play size={32} fill="#fff" style={{ color: "#fff", marginLeft: 3 }} />
                  </div>
                  <div className="text-xs text-white/80 font-bold tracking-widest uppercase">
                    Tap to start {channel.name}
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Tv className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <h2
                className="text-xl font-black text-white leading-tight"
                data-testid="text-live-tv-title"
              >
                {channel.name}
              </h2>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                On Air now
                {channel.country ? <span className="text-zinc-600"> · {channel.country}</span> : null}
                {channel.channelGroup ? (
                  <span className="text-zinc-600"> · {channel.channelGroup}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
