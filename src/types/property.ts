export interface Inspection {
  date: string;
  start: string;
  end: string;
}

export interface School {
  schoolName: string;
  address: string;
  schoolType: string;
  sector: string;
  distance: string;
  independent: boolean;
}

export type RescueReason =
  | "stale_no_campaign"
  | "open_home_no_campaign"
  | "auction_no_campaign";

export interface Property {
  propertyId: string;
  remoteId: string;
  slug: string;
  title: string;
  propertyUrl: string;
  displayAddress: string;
  addressSuburb: string;
  addressPostcode: string;
  addressState: string;
  listingStatus: string;
  propertyStatus: string;
  listingType: string;
  underContract: boolean;
  saleType: string;
  propertyType: string;
  isNewBuild: boolean;
  bedrooms: number;
  bathrooms: number;
  allCarSpaces: number;
  garages: number;
  carports: number;
  ensuites: number;
  landArea: string;
  floorArea: string;
  features: string[];
  heading: string;
  descriptionPlain: string;
  displayPrice: string;
  searchPrice: number;
  priceRangeMin: string;
  priceRangeMax: string;
  rent: string;
  rentPeriod: string;
  bond: string;
  soldDate: string;
  soldMethod: string;
  soldPrice: string;
  soldPriceDisplay: boolean;
  rentedDate: string;
  rentedPrice: string;
  rentedPeriod: string;
  rentedPriceDisplay: boolean;
  imageCount: number;
  images1600: string[];
  floorplans: string[];
  videoUrl: string;
  soiFile: string;
  marketingLiveDate: Date | null;
  publishDate: string;
  modifyDate: string;
  auctionDatetime: Date | null;
  hasAuction: boolean;
  earliestInspection: Date | null;
  inspections: Inspection[];
  agentCount: number;
  agent1Name: string;
  agent1Email: string;
  agent1Mobile: string;
  agent1Phone: string;
  agent1Position: string;
  agent2Name: string;
  agent2Email: string;
  agent2Mobile: string;
  agent2Phone: string;
  agent2Position: string;
  agent2Photo: string;
  agent3Name: string;
  agent3Email: string;
  agent3Mobile: string;
  agent3Phone: string;
  agent3Position: string;
  agent3Photo: string;
  agent1Photo: string;
  nbnAvailable: boolean;
  nbnType: string;
  nbnTech: string;
  schools: School[];
  portalIdRea: string;
  portalIdDomain: string;
  daysOnMarket: number;
  office: string;
  displayStatus: string;
  hasActiveCampaign: boolean;
  hasEverHadCampaign: boolean;
  isRescue: boolean;
  rescueReasons: RescueReason[];
}
