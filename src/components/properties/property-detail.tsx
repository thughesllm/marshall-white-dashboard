"use client";

import { Property } from "@/types/property";
import { ImageGallery } from "./image-gallery";
import { StatusBadge } from "./status-badge";
import { RescueBadge } from "./rescue-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bed,
  Bath,
  Car,
  Maximize,
  Home,
  User,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────

const ACTIVE_LISTING_STATUSES = ["sale", "now-selling", "lease"];

function formatAUD(num: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatTime(hhmmss: string): string {
  const [hStr, mStr] = hhmmss.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${mStr}${suffix}`;
}

function formatInspectionDate(dateStr: string): string {
  // dateStr is like "2025-04-09"
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function formatAuctionDatetime(dt: Date): string {
  return dt.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return m[1];
  }
  return null;
}

function parseVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── sub-components ─────────────────────────────────────────────────────────

function AgentCard({
  name,
  position,
  mobile,
  email,
  compact,
}: {
  name: string;
  position?: string;
  mobile?: string;
  email?: string;
  compact?: boolean;
}) {
  if (!name) return null;
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold leading-tight">{name}</p>
          {position && (
            <p className="text-xs text-muted-foreground">{position}</p>
          )}
          {!compact && mobile && (
            <a
              href={`tel:${mobile}`}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <Phone className="h-3 w-3" />
              {mobile}
            </a>
          )}
          {!compact && email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <Mail className="h-3 w-3" />
              {email}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function PropertyDetail({ property }: { property: Property }) {
  const isActive = ACTIVE_LISTING_STATUSES.includes(property.listingStatus);

  // Price logic
  const soldAndDisplayable =
    property.listingStatus === "sold" && property.soldPriceDisplay;
  const priceDisplay = soldAndDisplayable
    ? formatAUD(parseFloat(property.soldPrice) || 0)
    : property.displayPrice;

  // Video embed
  let videoEmbedUrl: string | null = null;
  if (property.videoUrl) {
    const ytId = parseYouTubeId(property.videoUrl);
    if (ytId) {
      videoEmbedUrl = `https://www.youtube.com/embed/${ytId}`;
    } else {
      const vimeoId = parseVimeoId(property.videoUrl);
      if (vimeoId) {
        videoEmbedUrl = `https://player.vimeo.com/video/${vimeoId}`;
      }
    }
  }

  // Days on market colour
  const domColour =
    property.daysOnMarket < 30
      ? "text-green-600"
      : property.daysOnMarket <= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">
          {/* 1. Images */}
          <ImageGallery images={property.images1600} />

          {/* 2. Headline */}
          <h1 className="text-2xl font-bold leading-snug">{property.heading}</h1>

          {/* 3. Key Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                {property.bedrooms} bed
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {property.bathrooms} bath
              </span>
            )}
            {property.allCarSpaces > 0 && (
              <span className="flex items-center gap-1.5">
                <Car className="h-4 w-4" />
                {property.allCarSpaces} car
              </span>
            )}
            {property.landArea && (
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                {property.landArea}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              {property.propertyType}
            </span>
          </div>

          {/* 4. Price */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold">{priceDisplay}</span>
            {property.underContract && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                Under Offer
              </Badge>
            )}
            {property.listingStatus === "sold" && (
              <Badge className="bg-green-500 text-white hover:bg-green-500">
                Sold
              </Badge>
            )}
            {property.listingStatus === "leased" && (
              <Badge className="bg-slate-400 text-white hover:bg-slate-400">
                Leased
              </Badge>
            )}
          </div>

          {/* 5. Separator */}
          <Separator />

          {/* 6. Description */}
          {property.descriptionPlain && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {property.descriptionPlain}
            </p>
          )}

          {/* 7. Features */}
          {property.features.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold">Features</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => {
                  // The CSV contains DatoCMS GraphQL objects: { node: { feature: "..." }, ... }
                  // Fall back gracefully if it's a plain string
                  const label =
                    typeof f === "string"
                      ? f
                      : (f as { node?: { feature?: string } })?.node?.feature ??
                        String(f);
                  return (
                    <Badge key={i} variant="secondary">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. Inspections */}
          {property.inspections.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold">Open for Inspection</h2>
              <ul className="space-y-1 text-sm">
                {property.inspections.map((insp, i) => (
                  <li key={i}>
                    {formatInspectionDate(insp.date)} &mdash;{" "}
                    {formatTime(insp.start)} to {formatTime(insp.end)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 9. Auction */}
          {property.hasAuction && property.auctionDatetime && (
            <div className="space-y-1">
              <h2 className="font-semibold">Auction</h2>
              <p className="text-sm">
                {formatAuctionDatetime(property.auctionDatetime)}
              </p>
            </div>
          )}

          {/* 10. Video */}
          {videoEmbedUrl && (
            <div className="space-y-2">
              <h2 className="font-semibold">Video</h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  src={videoEmbedUrl}
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Property video"
                />
              </div>
            </div>
          )}

          {/* 11. Floorplans */}
          {property.floorplans.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold">Floorplans</h2>
              <div className="space-y-4">
                {property.floorplans.map((fp, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={fp}
                    alt={`Floorplan ${i + 1}`}
                    className="w-full rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

          {/* 12. Documents */}
          {property.soiFile && (
            <div className="space-y-2">
              <h2 className="font-semibold">Documents</h2>
              <a
                href={property.soiFile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Statement of Information (PDF)
              </a>
            </div>
          )}

          {/* 13. NBN */}
          {property.nbnAvailable && (
            <p className="text-xs text-muted-foreground">
              NBN available &mdash; {property.nbnType} ({property.nbnTech})
            </p>
          )}
        </div>

        {/* ── RIGHT COLUMN (sidebar) ── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* 1. Order Campaign Button */}
          {isActive && (
            <Button
              className="w-full bg-[#002a52] text-lg text-white hover:bg-[#002a52]/90 py-6"
              onClick={() => toast("Campaign ordering coming soon")}
            >
              Order Campaign
            </Button>
          )}

          {/* 2. Agent Cards */}
          {property.agent1Name && (
            <AgentCard
              name={property.agent1Name}
              position={property.agent1Position}
              mobile={property.agent1Mobile}
              email={property.agent1Email}
            />
          )}
          {property.agent2Name && (
            <AgentCard
              name={property.agent2Name}
              position={property.agent2Position}
              mobile={property.agent2Mobile}
              email={property.agent2Email}
            />
          )}
          {property.agent3Name && (
            <AgentCard name={property.agent3Name} compact />
          )}

          {/* 3. Property Summary Card */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Property Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={property.displayStatus} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Days on Market</span>
                <span className={`font-medium ${domColour}`}>
                  {property.daysOnMarket}
                </span>
              </div>

              {property.publishDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span>{formatDate(property.publishDate)}</span>
                </div>
              )}

              {property.saleType && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sale Method</span>
                  <span>{property.saleType}</span>
                </div>
              )}

              {property.listingStatus === "sold" && (
                <>
                  {property.soldDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sold Date</span>
                      <span>{formatDate(property.soldDate)}</span>
                    </div>
                  )}
                  {property.soldPriceDisplay && property.soldPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sold Price</span>
                      <span className="font-medium">
                        {formatAUD(parseFloat(property.soldPrice) || 0)}
                      </span>
                    </div>
                  )}
                  {property.soldMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sold Method</span>
                      <span>{property.soldMethod}</span>
                    </div>
                  )}
                </>
              )}

              {property.listingStatus === "leased" && (
                <>
                  {property.rentedDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leased Date</span>
                      <span>{formatDate(property.rentedDate)}</span>
                    </div>
                  )}
                  {property.rentedPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rent</span>
                      <span>
                        {property.rentedPrice}
                        {property.rentedPeriod && ` / ${property.rentedPeriod}`}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Rescue Alert */}
          {property.isRescue && (
            <Card size="sm" className="border border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">Rescue Property</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {property.rescueReasons.map((reason) => (
                  <RescueBadge key={reason} reason={reason} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* 5. External Links */}
          <Card size="sm">
            <CardHeader>
              <CardTitle>External Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {property.propertyUrl && (
                <a
                  href={property.propertyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on marshallwhite.com.au
                </a>
              )}
              {property.portalIdRea && (
                <a
                  href={`https://www.realestate.com.au/${property.portalIdRea}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on realestate.com.au
                </a>
              )}
              {property.portalIdDomain && (
                <a
                  href={`https://www.domain.com.au/${property.portalIdDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on domain.com.au
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
