import { Badge } from "@/components/ui/badge";
import { RescueReason } from "@/types/property";

const RESCUE_LABELS: Record<RescueReason, string> = {
  stale_no_campaign: "60+ days — no campaign",
  open_home_no_campaign: "Open home soon — no campaign",
  auction_no_campaign: "Auction soon — no campaign",
};

export function RescueBadge({ reason }: { reason: RescueReason }) {
  return (
    <Badge variant="outline" className="border-red-500 text-red-600 text-xs">
      {RESCUE_LABELS[reason]}
    </Badge>
  );
}
