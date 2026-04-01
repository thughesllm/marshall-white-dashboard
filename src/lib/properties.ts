import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { Property, Inspection, School } from "@/types/property";
import { classifyRescue } from "@/lib/rescue";

function parseJsonArray<T>(value: string): T[] {
  if (!value || value === "None" || value === "") return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function parseBool(value: string): boolean {
  return value === "True";
}

function parseIntSafe(value: string): number {
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
}

function parseDate(value: string): Date | null {
  if (!value || value === "None" || value === "") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function cleanString(value: string): string {
  if (!value || value === "None") return "";
  return value;
}

function getDisplayStatus(listingStatus: string, underContract: boolean): string {
  if (underContract) return "Under Offer";
  switch (listingStatus) {
    case "sale":
    case "now-selling":
      return "For Sale";
    case "sold":
      return "Sold";
    case "lease":
      return "For Lease";
    case "leased":
      return "Leased";
    default:
      return listingStatus;
  }
}

function daysOnMarket(
  marketingLiveDate: Date | null,
  listingStatus: string,
  soldDate: string,
  rentedDate: string
): number {
  if (!marketingLiveDate) return 0;
  let endDate = new Date();
  if (listingStatus === "sold" && soldDate) {
    endDate = new Date(soldDate);
  } else if (listingStatus === "leased" && rentedDate) {
    endDate = new Date(rentedDate);
  }
  return Math.floor(
    (endDate.getTime() - marketingLiveDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function transformRow(row: Record<string, string>): Property {
  const listingStatus = cleanString(row.listing_status);
  const underContract = parseBool(row.under_contract);
  const marketingLiveDate = parseDate(row.marketing_live_date);
  const soldDate = cleanString(row.sold_date);
  const rentedDate = cleanString(row.rented_date);
  const earliestInspection = parseDate(row.earliest_inspection);
  const auctionDatetime = parseDate(row.auction_datetime);

  const property: Property = {
    propertyId: cleanString(row.property_id),
    remoteId: cleanString(row.remote_id),
    slug: cleanString(row.slug),
    title: cleanString(row.title),
    propertyUrl: cleanString(row.property_url),
    displayAddress: cleanString(row.display_address),
    addressSuburb: cleanString(row.address_suburb),
    addressPostcode: cleanString(row.address_postcode),
    addressState: cleanString(row.address_state),
    listingStatus,
    propertyStatus: cleanString(row.property_status),
    listingType: cleanString(row.listing_type),
    underContract,
    saleType: cleanString(row.sale_type),
    propertyType: cleanString(row.property_type),
    isNewBuild: parseBool(row.is_new_build),
    bedrooms: parseIntSafe(row.bedrooms),
    bathrooms: parseIntSafe(row.bathrooms),
    allCarSpaces: parseIntSafe(row.all_car_spaces),
    garages: parseIntSafe(row.garages),
    carports: parseIntSafe(row.carports),
    ensuites: parseIntSafe(row.ensuites),
    landArea: cleanString(row.land_area),
    floorArea: cleanString(row.floor_area),
    features: parseJsonArray<string>(row.features),
    heading: cleanString(row.heading),
    descriptionPlain: cleanString(row.description_plain),
    displayPrice: cleanString(row.display_price),
    searchPrice: parseIntSafe(row.search_price),
    priceRangeMin: cleanString(row.price_range_min),
    priceRangeMax: cleanString(row.price_range_max),
    rent: cleanString(row.rent),
    rentPeriod: cleanString(row.rent_period),
    bond: cleanString(row.bond),
    soldDate,
    soldMethod: cleanString(row.sold_method),
    soldPrice: cleanString(row.sold_price),
    soldPriceDisplay: parseBool(row.sold_price_display),
    rentedDate,
    rentedPrice: cleanString(row.rented_price),
    rentedPeriod: cleanString(row.rented_period),
    rentedPriceDisplay: parseBool(row.rented_price_display),
    imageCount: parseIntSafe(row.image_count),
    images1600: parseJsonArray<string>(row.images_1600),
    floorplans: parseJsonArray<string>(row.floorplans),
    videoUrl: cleanString(row.video_url),
    soiFile: cleanString(row.soi_file),
    marketingLiveDate,
    publishDate: cleanString(row.publish_date),
    modifyDate: cleanString(row.modify_date),
    auctionDatetime,
    hasAuction: parseBool(row.has_auction),
    earliestInspection,
    inspections: parseJsonArray<Inspection>(row.inspections_json),
    agentCount: parseIntSafe(row.agent_count),
    agent1Name: cleanString(row.agent_1_name),
    agent1Email: cleanString(row.agent_1_email),
    agent1Mobile: cleanString(row.agent_1_mobile),
    agent1Phone: cleanString(row.agent_1_phone),
    agent1Position: cleanString(row.agent_1_position),
    agent2Name: cleanString(row.agent_2_name),
    agent2Email: cleanString(row.agent_2_email),
    agent2Mobile: cleanString(row.agent_2_mobile),
    agent2Phone: cleanString(row.agent_2_phone),
    agent2Position: cleanString(row.agent_2_position),
    agent3Name: cleanString(row.agent_3_name),
    nbnAvailable: parseBool(row.nbn_available),
    nbnType: cleanString(row.nbn_type),
    nbnTech: cleanString(row.nbn_tech),
    schools: parseJsonArray<School>(row.schools_json),
    portalIdRea: cleanString(row.portal_id_rea),
    portalIdDomain: cleanString(row.portal_id_domain),
    daysOnMarket: daysOnMarket(marketingLiveDate, listingStatus, soldDate, rentedDate),
    office: "Stonnington",
    displayStatus: getDisplayStatus(listingStatus, underContract),
    hasActiveCampaign: false,
    hasEverHadCampaign: false,
    isRescue: false,
    rescueReasons: [],
  };

  const { isRescue, reasons } = classifyRescue(property);
  property.isRescue = isRescue;
  property.rescueReasons = reasons;

  return property;
}

export function loadProperties(): Property[] {
  const csvPath = path.join(process.cwd(), "data", "properties.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const { data } = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  return data.map(transformRow);
}

export function loadProperty(id: string): Property | null {
  const properties = loadProperties();
  return properties.find((p) => p.propertyId === id) || null;
}
