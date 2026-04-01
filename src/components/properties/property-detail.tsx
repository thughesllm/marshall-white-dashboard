"use client";

import { useState } from "react";
import Link from "next/link";
import { Property } from "@/types/property";
import { ImageGallery } from "./image-gallery";
import { StatusBadge } from "./status-badge";
import { RescueBadge } from "./rescue-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Maximize,
  Home,
  User,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

// ── helpers ────────────────────────────────────────────────────────────────

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
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatAuctionDatetime(dt: Date): string {
  return dt.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntilDate(dt: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((dt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
  photo,
}: {
  name: string;
  position?: string;
  mobile?: string;
  email?: string;
  photo?: string;
}) {
  if (!name) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={name}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <User className="h-5 w-5 text-gray-500" />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-semibold leading-tight">{name}</p>
        {position && (
          <p className="text-xs text-muted-foreground">{position}</p>
        )}
        {mobile && (
          <a
            href={`tel:${mobile}`}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <Phone className="h-3 w-3" />
            {mobile}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <Mail className="h-3 w-3" />
            {email}
          </a>
        )}
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function PropertyDetail({ property }: { property: Property }) {
  const [showListingDetails, setShowListingDetails] = useState(false);

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

  // Upcoming inspections (within 30 days)
  const upcomingInspections = property.inspections.filter(
    (insp) => daysUntil(insp.date) >= 0 && daysUntil(insp.date) <= 30
  );

  // Upcoming auction
  const upcomingAuction =
    property.hasAuction && property.auctionDatetime && daysUntilDate(property.auctionDatetime) >= 0
      ? property.auctionDatetime
      : null;

  const hasUpcomingEvents = upcomingInspections.length > 0 || upcomingAuction !== null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      {/* 1. Back navigation */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Properties
      </Link>

      {/* 2. Property identifier bar */}
      <div className="mb-4">
        <h1 className="text-xl font-bold">{property.displayAddress}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>{property.office}</span>
          <span className="text-border">·</span>
          {property.bedrooms > 0 && (
            <>
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          {property.bathrooms > 0 && (
            <>
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          {property.allCarSpaces > 0 && (
            <>
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5" /> {property.allCarSpaces}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5" /> {property.propertyType}
          </span>
          {priceDisplay && (
            <>
              <span className="text-border">·</span>
              <span className="font-medium text-foreground">{priceDisplay}</span>
            </>
          )}
          {property.publishDate && (
            <>
              <span className="text-border">·</span>
              <span>Listed {formatDate(property.publishDate)}</span>
            </>
          )}
        </div>
      </div>

      {/* 3. Rescue alert + Order Campaign */}
      {property.isRescue && (
        <Card className="mb-4 border-2 border-red-400 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="font-bold text-red-600">Rescue Property</span>
              <div className="flex flex-wrap gap-1.5">
                {property.rescueReasons.map((reason) => (
                  <RescueBadge key={reason} reason={reason} />
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-[#002a52] text-white hover:bg-[#002a52]/90 py-5 text-base font-semibold"
              onClick={() => toast("Campaign ordering coming soon")}
            >
              Order Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {!property.isRescue && (
        <div className="mb-4">
          <Button
            className="w-full bg-[#002a52] text-white hover:bg-[#002a52]/90 py-5 text-base font-semibold"
            onClick={() => toast("Campaign ordering coming soon")}
          >
            Order Campaign
          </Button>
        </div>
      )}

      {/* 4. Key metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
            <StatusBadge status={property.displayStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Days on Market</p>
            <p className={`text-2xl font-bold ${domColour}`}>{property.daysOnMarket}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Campaign</p>
            <p className={`text-sm font-semibold ${property.hasActiveCampaign ? "text-green-600" : "text-red-600"}`}>
              {property.hasActiveCampaign ? "Active" : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. Upcoming events */}
      {hasUpcomingEvents && (
        <Card className="mb-4 border-amber-300 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-amber-700" />
              <span className="font-semibold text-amber-800 text-sm">Upcoming Events</span>
            </div>
            <div className="space-y-1.5 text-sm">
              {upcomingInspections.map((insp, i) => {
                const days = daysUntil(insp.date);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span>
                      Open Home: {formatInspectionDate(insp.date)}, {formatTime(insp.start)}–{formatTime(insp.end)}
                    </span>
                    <span className={`font-medium ${days <= 14 ? "text-red-600" : "text-amber-700"}`}>
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                    </span>
                  </div>
                );
              })}
              {upcomingAuction && (
                <div className="flex items-center justify-between">
                  <span>Auction: {formatAuctionDatetime(upcomingAuction)}</span>
                  <span className={`font-medium ${daysUntilDate(upcomingAuction) <= 14 ? "text-red-600" : "text-amber-700"}`}>
                    {daysUntilDate(upcomingAuction)} days
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Agent info */}
      <div className="space-y-2 mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agents</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {property.agent1Name && (
            <AgentCard
              name={property.agent1Name}
              position={property.agent1Position}
              mobile={property.agent1Mobile}
              email={property.agent1Email}
              photo={property.agent1Photo}
            />
          )}
          {property.agent2Name && (
            <AgentCard
              name={property.agent2Name}
              position={property.agent2Position}
              mobile={property.agent2Mobile}
              email={property.agent2Email}
              photo={property.agent2Photo}
            />
          )}
          {property.agent3Name && (
            <AgentCard
              name={property.agent3Name}
              position={property.agent3Position}
              mobile={property.agent3Mobile}
              email={property.agent3Email}
              photo={property.agent3Photo}
            />
          )}
        </div>
      </div>

      {/* 7. Sold details (only for sold properties) */}
      {property.listingStatus === "sold" && (property.soldDate || (property.soldPriceDisplay && property.soldPrice)) && (
        <Card className="mb-4">
          <CardContent className="pt-4 space-y-2 text-sm">
            {property.soldDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sold Date</span>
                <span>{formatDate(property.soldDate)}</span>
              </div>
            )}
            {property.soldPriceDisplay && property.soldPrice && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sold Price</span>
                <span className="font-medium">{formatAUD(parseFloat(property.soldPrice) || 0)}</span>
              </div>
            )}
            {property.soldMethod && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sold Method</span>
                <span>{property.soldMethod}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8. Collapsible Listing Details */}
      <Card className="mb-4">
        <button
          className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          onClick={() => setShowListingDetails((v) => !v)}
          type="button"
        >
          <div>
            <span className="font-semibold">Listing Details</span>
            <span className="ml-2 text-xs text-muted-foreground">
              images · description · floorplans
            </span>
          </div>
          {showListingDetails ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {showListingDetails && (
          <CardContent className="pt-0 space-y-6">
            <Separator />

            {/* Images */}
            {property.images1600.length > 0 && (
              <ImageGallery images={property.images1600} />
            )}

            {/* Headline */}
            {property.heading && (
              <h2 className="text-lg font-bold leading-snug">{property.heading}</h2>
            )}

            {/* Key Stats */}
            {(property.bedrooms > 0 || property.bathrooms > 0 || property.allCarSpaces > 0) && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {property.bedrooms > 0 && (
                  <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" /> {property.bedrooms} bed</span>
                )}
                {property.bathrooms > 0 && (
                  <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {property.bathrooms} bath</span>
                )}
                {property.allCarSpaces > 0 && (
                  <span className="flex items-center gap-1.5"><Car className="h-4 w-4" /> {property.allCarSpaces} car</span>
                )}
                {property.landArea && (
                  <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" /> {property.landArea}</span>
                )}
              </div>
            )}

            {/* Description */}
            {property.descriptionPlain && (
              <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground overflow-hidden">
                {property.descriptionPlain}
              </p>
            )}

            {/* Features */}
            {property.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((f, i) => {
                    const label =
                      typeof f === "string"
                        ? f
                        : (f as { node?: { feature?: string } })?.node?.feature ?? String(f);
                    return (
                      <Badge key={i} variant="secondary">{label}</Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inspections */}
            {property.inspections.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Open for Inspection</h3>
                <ul className="space-y-1 text-sm">
                  {property.inspections.map((insp, i) => (
                    <li key={i}>
                      {formatInspectionDate(insp.date)} &mdash; {formatTime(insp.start)} to {formatTime(insp.end)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Auction */}
            {property.hasAuction && property.auctionDatetime && (
              <div className="space-y-1">
                <h3 className="font-semibold">Auction</h3>
                <p className="text-sm">{formatAuctionDatetime(property.auctionDatetime)}</p>
              </div>
            )}

            {/* Video */}
            {videoEmbedUrl && (
              <div className="space-y-2">
                <h3 className="font-semibold">Video</h3>
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

            {/* Floorplans — constrained width */}
            {property.floorplans.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Floorplans</h3>
                <div className="space-y-4">
                  {property.floorplans.map((fp, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={fp}
                      alt={`Floorplan ${i + 1}`}
                      className="max-w-lg mx-auto rounded-xl"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {property.soiFile && (
              <div className="space-y-2">
                <h3 className="font-semibold">Documents</h3>
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

            {/* NBN */}
            {property.nbnAvailable && (
              <p className="text-xs text-muted-foreground">
                NBN available &mdash; {property.nbnType} ({property.nbnTech})
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* 9. External links */}
      {property.propertyUrl && (
        <div className="mb-4">
          <a
            href={property.propertyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on marshallwhite.com.au
          </a>
        </div>
      )}
    </div>
  );
}
