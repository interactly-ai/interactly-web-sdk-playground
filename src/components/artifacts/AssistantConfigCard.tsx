import { Bot } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { JsonViewer } from "@/components/common/JsonViewer";
import { Separator } from "@/components/ui/separator";
import { KeyValueList } from "./KeyValueList";

export function AssistantConfigCard({
  config,
}: {
  config: Record<string, unknown> | null;
}) {
  if (!config) {
    return (
      <EmptyState
        icon={Bot}
        title="No assistant config yet"
        description="When the server sends the assistant configuration, its details appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <KeyValueList data={config} />
      <Separator />
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Raw payload</p>
        <JsonViewer value={config} maxHeightClass="max-h-72" />
      </div>
    </div>
  );
}
