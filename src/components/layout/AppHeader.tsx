import { ExternalLink } from "lucide-react";
import { InteractlyLogo } from "@/components/branding/InteractlyLogo";
import { CallStatusPill } from "@/components/call/CallStatusPill";
import { StatusDot } from "@/components/common/StatusDot";
import { ThemeToggle } from "./ThemeToggle";
import { ShareButton } from "./ShareButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CallConfig, CallStatus } from "@/lib/interactly-types";

interface AppHeaderProps {
  status: CallStatus;
  callStartedAt: number | null;
  callEndedAt: number | null;
  userNumber: string | null;
  config: CallConfig;
  configured: boolean;
  onOpenConnection: () => void;
}

export function AppHeader({
  status,
  callStartedAt,
  callEndedAt,
  userNumber,
  config,
  configured,
  onOpenConnection,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <InteractlyLogo height={26} />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <span className="hidden whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:inline">
            Web SDK Playground
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <CallStatusPill
            status={status}
            callStartedAt={callStartedAt}
            callEndedAt={callEndedAt}
            userNumber={userNumber}
            className="hidden md:inline-flex"
          />
          <Separator orientation="vertical" className="hidden h-6 lg:block" />
          <nav className="hidden items-center gap-1 lg:flex">
            <a
              href="https://www.npmjs.com/package/@interactly-ai/web"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              npm
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/Interactly/client-sdk-web"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnection}
            className="gap-2"
            title="Connection settings"
          >
            <StatusDot
              colorClass={configured ? "bg-success" : "bg-warning"}
              pulse={!configured}
            />
            <span className="hidden sm:inline">Connection</span>
          </Button>
          <ShareButton config={config} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
