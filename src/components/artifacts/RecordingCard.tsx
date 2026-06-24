import { useEffect, useState } from "react";
import { Disc3, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/CopyButton";
import { EmptyState } from "@/components/common/EmptyState";

export function RecordingCard({ url }: { url: string | null }) {
  const [audioError, setAudioError] = useState(false);

  // Reset the inline-player error when a new recording arrives.
  useEffect(() => {
    setAudioError(false);
  }, [url]);

  if (!url) {
    return (
      <EmptyState
        icon={Disc3}
        title="No recording yet"
        description="If the call produces a recording, its link and an inline player will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <CopyButton value={url} toastMessage="Recording link copied" />
        <Button asChild variant="outline" size="icon-sm" aria-label="Open recording">
          <a href={url} target="_blank" rel="noreferrer noopener">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
      {audioError ? (
        <p className="rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
          Couldn't load the audio inline — the link may require authentication,
          be blocked by CORS, or have expired. Use the open/copy actions above.
        </p>
      ) : (
        <audio
          controls
          src={url}
          onError={() => setAudioError(true)}
          className="w-full"
        >
          Your browser doesn't support inline audio playback.
        </audio>
      )}
    </div>
  );
}
