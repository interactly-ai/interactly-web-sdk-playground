import { useState } from "react";
import { Bot, KeyRound, PhoneCall, Plug, Settings2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ConnectionDialog } from "@/components/config/ConnectionDialog";
import { CallControl } from "@/components/call/CallControl";
import { CallStatusPill } from "@/components/call/CallStatusPill";
import { AudioOrb } from "@/components/visualizer/AudioOrb";
import { MicMeter } from "@/components/visualizer/MicMeter";
import { TranscriptPanel } from "@/components/transcript/TranscriptPanel";
import { EventLogPanel } from "@/components/events/EventLogPanel";
import { AssistantConfigCard } from "@/components/artifacts/AssistantConfigCard";
import { SecurityWarning } from "@/components/common/SecurityWarning";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUrlState } from "@/hooks/useUrlState";
import { useInteractly } from "@/hooks/useInteractly";
import { useMicAnalyser } from "@/hooks/useMicAnalyser";
import { validateConfig } from "@/lib/validation";
import { ACTIVE_STATUSES } from "@/lib/interactly-types";
import { cn } from "@/lib/utils";

const PANEL_HEIGHT =
  "h-[62vh] min-h-[380px] lg:h-[calc(100vh-7.5rem)] lg:min-h-[460px]";

function serverHost(server: string): string {
  try {
    return new URL(server).host;
  } catch {
    return server || "not set";
  }
}

export function App() {
  const {
    config,
    updateConfig,
    resetConfig,
    tokenInUrl,
    dismissTokenInUrl,
    removeToken,
    rememberToken,
    setRememberToken,
  } = useUrlState();

  const call = useInteractly(config);
  const levelRef = useMicAnalyser(call.mediaStream);
  const validation = validateConfig(config);

  // "Configured" = enough to place a meaningful call (token + valid server +
  // an assistant). First-time users have none of this.
  const needsSetup = validation.hasErrors || !config.assistantId.trim();
  const isConfigured = !needsSetup;

  // Auto-open the setup dialog on first load when nothing is configured.
  const [connectionOpen, setConnectionOpen] = useState(() => needsSetup);
  const openConnection = () => setConnectionOpen(true);

  const isLive = call.status === "live";
  const isConnecting =
    call.status === "connecting" || call.status === "requesting-mic";
  const configLocked =
    ACTIVE_STATUSES.includes(call.status) || call.status === "ending";

  return (
    <div className="app-backdrop min-h-screen">
      <AppHeader
        status={call.status}
        callStartedAt={call.callStartedAt}
        callEndedAt={call.callEndedAt}
        userNumber={call.userNumber}
        config={config}
        configured={isConfigured}
        onOpenConnection={openConnection}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {tokenInUrl ? (
          <SecurityWarning
            tone="warning"
            icon={KeyRound}
            className="mb-5"
            title="This link contains an API token"
            description="A secret token was loaded from the URL. Remove it from the address bar so it isn't shared or saved in history. Your entered token stays in the form."
            onDismiss={dismissTokenInUrl}
            action={
              <Button variant="outline" size="sm" onClick={removeToken}>
                Remove token from URL
              </Button>
            }
          />
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(330px,370px)_minmax(0,1fr)]">
          {/* Left column — call console */}
          <div className="space-y-5 lg:sticky lg:top-[5.5rem]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PhoneCall className="h-4 w-4 text-primary" />
                  Live call
                </CardTitle>
                <CallStatusPill
                  status={call.status}
                  callStartedAt={call.callStartedAt}
                  callEndedAt={call.callEndedAt}
                />
              </CardHeader>
              <CardContent className="space-y-5">
                <AudioOrb
                  levelRef={levelRef}
                  active={isLive}
                  connecting={isConnecting}
                  assistantSpeaking={call.assistantSpeaking}
                />
                <MicMeter levelRef={levelRef} active={isLive} />
                <CallControl
                  status={call.status}
                  needsSetup={needsSetup}
                  error={call.error}
                  onStart={call.start}
                  onStop={call.stop}
                  onConfigure={openConnection}
                  onDismissError={call.dismissError}
                />
                {/* Connection summary — click to open the setup dialog. */}
                <button
                  type="button"
                  onClick={openConnection}
                  disabled={configLocked}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Plug className="h-3.5 w-3.5 text-muted-foreground" />
                      Connection
                      {isConfigured ? (
                        <Badge variant="success" className="ml-0.5">
                          ready
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="ml-0.5">
                          setup needed
                        </Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {isConfigured
                        ? `${config.assistantId || "default assistant"} · ${serverHost(config.server)}`
                        : "Add your API token and assistant to begin"}
                    </span>
                  </div>
                  <Settings2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right column — conversation, inspector, assistant config */}
          <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className={cn(PANEL_HEIGHT)}>
                <TranscriptPanel
                  messages={call.messages}
                  onClear={call.clearTranscript}
                />
              </div>
              <div className={cn(PANEL_HEIGHT)}>
                <EventLogPanel log={call.log} onClear={call.clearLog} />
              </div>
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-primary" />
                  Assistant config
                </CardTitle>
                {call.assistantConfig ? (
                  <Badge variant="success">received</Badge>
                ) : null}
              </CardHeader>
              <CardContent>
                <AssistantConfigCard config={call.assistantConfig} />
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            Integrating{" "}
            <code className="font-mono text-foreground">@interactly-ai/web</code>{" "}
            v1.1.0 · runs entirely in your browser
          </p>
          <p>
            Credentials are sent only to the server URL you configure — nothing
            is stored on any backend.
          </p>
        </footer>
      </main>

      <ConnectionDialog
        open={connectionOpen}
        onOpenChange={setConnectionOpen}
        config={config}
        validation={validation}
        disabled={configLocked}
        rememberToken={rememberToken}
        onUpdate={updateConfig}
        onRememberToken={setRememberToken}
        onReset={resetConfig}
      />
    </div>
  );
}
