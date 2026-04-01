import { Property, RescueReason } from "@/types/property";

const ACTIVE_STATUSES = ["sale", "now-selling", "lease"];

export function classifyRescue(property: Property): {
  isRescue: boolean;
  reasons: RescueReason[];
} {
  if (!ACTIVE_STATUSES.includes(property.listingStatus)) {
    return { isRescue: false, reasons: [] };
  }

  const reasons: RescueReason[] = [];
  const now = new Date();
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  if (property.daysOnMarket > 60 && !property.hasEverHadCampaign) {
    reasons.push("stale_no_campaign");
  }

  if (
    property.earliestInspection &&
    property.earliestInspection >= now &&
    property.earliestInspection <= fourteenDaysFromNow &&
    !property.hasActiveCampaign
  ) {
    reasons.push("open_home_no_campaign");
  }

  if (
    property.auctionDatetime &&
    property.auctionDatetime >= now &&
    property.auctionDatetime <= fourteenDaysFromNow &&
    !property.hasActiveCampaign
  ) {
    reasons.push("auction_no_campaign");
  }

  return { isRescue: reasons.length > 0, reasons };
}
