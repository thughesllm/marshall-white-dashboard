import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  "For Sale": "bg-[#3b82f6] text-white hover:bg-[#3b82f6]",
  "Under Offer": "bg-[#f59e0b] text-gray-900 hover:bg-[#f59e0b]",
  "Sold": "bg-[#22c55e] text-white hover:bg-[#22c55e]",
  "For Lease": "bg-[#8b5cf6] text-white hover:bg-[#8b5cf6]",
  "Leased": "bg-slate-400 text-white hover:bg-slate-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={STATUS_STYLES[status] || "bg-gray-400 text-white"}>
      {status}
    </Badge>
  );
}
