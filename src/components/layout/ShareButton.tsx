import { useMemo, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/common/CopyButton";
import { SecurityWarning } from "@/components/common/SecurityWarning";
import { buildShareUrl } from "@/lib/url-state";
import { DEFAULT_SERVER, type CallConfig } from "@/lib/interactly-types";

export function ShareButton({ config }: { config: CallConfig }) {
  const [open, setOpen] = useState(false);
  const [includeToken, setIncludeToken] = useState(false);

  const hasToken = !!config.apiToken;
  const willEmbedToken = includeToken && hasToken;

  const url = useMemo(
    () => buildShareUrl(config, willEmbedToken),
    [config, willEmbedToken],
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Always reset the dangerous opt-in when the dialog closes/opens.
    if (!next) setIncludeToken(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Share this setup
          </DialogTitle>
          <DialogDescription>
            Creates a link that reproduces this configuration. Open it anywhere
            to load the same server, assistant, and reconnect settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Included:</span>
            <Badge variant="muted">
              server{config.server === DEFAULT_SERVER ? " (default)" : ""}
            </Badge>
            {config.assistantId ? (
              <Badge variant="muted">assistant id</Badge>
            ) : null}
            <Badge variant="muted">reconnect</Badge>
            {willEmbedToken ? (
              <Badge variant="destructive">api token</Badge>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Input readOnly value={url} className="font-mono text-xs" />
            <CopyButton value={url} toastMessage="Share link copied" />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="include-token" className="text-sm">
                Include API token in link
              </Label>
              <p className="text-xs text-muted-foreground">
                {hasToken
                  ? "Off by default. Anyone with the link could place calls on your key."
                  : "No API token entered yet."}
              </p>
            </div>
            <Switch
              id="include-token"
              checked={includeToken}
              onCheckedChange={setIncludeToken}
              disabled={!hasToken}
            />
          </div>

          {willEmbedToken ? (
            <SecurityWarning
              tone="destructive"
              title="This link contains your secret API token"
              description="Treat it like a password — don't post it in public channels or tickets. It will also persist in the recipient's browser history."
            />
          ) : null}
        </div>

        <DialogFooter>
          <CopyButton
            value={url}
            label="Copy link"
            variant="default"
            size="default"
            toastMessage="Share link copied"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
