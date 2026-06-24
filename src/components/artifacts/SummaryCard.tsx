import { FileText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { JsonViewer } from "@/components/common/JsonViewer";
import { Separator } from "@/components/ui/separator";
import { KeyValueList } from "./KeyValueList";

export function SummaryCard({
  summary,
}: {
  summary: Record<string, unknown> | null;
}) {
  if (!summary) {
    return (
      <EmptyState
        icon={FileText}
        title="No summary yet"
        description="A call summary, if the assistant emits one, is rendered here after the call."
      />
    );
  }

  return (
    <div className="space-y-3">
      <KeyValueList data={summary} />
      <Separator />
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Raw payload</p>
        <JsonViewer value={summary} maxHeightClass="max-h-72" />
      </div>
    </div>
  );
}
