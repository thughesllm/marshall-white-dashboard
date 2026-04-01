"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { Property } from "@/types/property";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 25;

const ACTIVE_STATUSES = new Set(["sale", "now-selling", "lease"]);

type SortKey =
  | "displayAddress"
  | "displayStatus"
  | "agent1Name"
  | "marketingLiveDate"
  | "daysOnMarket";

type SortDir = "asc" | "desc";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function daysColour(days: number): string {
  if (days < 30) return "text-green-600";
  if (days <= 60) return "text-amber-600";
  return "text-red-600";
}

function splitAddress(displayAddress: string): { street: string; rest: string } {
  const commaIdx = displayAddress.indexOf(",");
  if (commaIdx === -1) return { street: displayAddress, rest: "" };
  return {
    street: displayAddress.slice(0, commaIdx),
    rest: displayAddress.slice(commaIdx + 1).trim(),
  };
}

export function PropertiesTable({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("marketingLiveDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return properties.filter((p) => {
      const matchesSearch =
        !q ||
        p.displayAddress.toLowerCase().includes(q) ||
        p.agent1Name.toLowerCase().includes(q) ||
        p.addressSuburb.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || p.displayStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "marketingLiveDate") {
        const aTime = a.marketingLiveDate?.getTime() ?? 0;
        const bTime = b.marketingLiveDate?.getTime() ?? 0;
        cmp = aTime - bTime;
      } else if (sortKey === "daysOnMarket") {
        cmp = a.daysOnMarket - b.daysOnMarket;
      } else {
        cmp = (a[sortKey] ?? "")
          .toString()
          .localeCompare((b[sortKey] ?? "").toString());
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function SortHeader({
    label,
    col,
  }: {
    label: string;
    col: SortKey;
  }) {
    return (
      <button
        className="flex items-center gap-1 font-medium hover:text-foreground"
        onClick={() => handleSort(col)}
        type="button"
      >
        {label}
        <ArrowUpDown className="size-3 opacity-60" />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search address, agent or suburb…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as string);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["All", "For Sale", "Under Offer", "Sold", "For Lease", "Leased"].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          Showing {filtered.length} of {properties.length} properties
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortHeader label="Address" col="displayAddress" />
            </TableHead>
            <TableHead>
              <SortHeader label="Status" col="displayStatus" />
            </TableHead>
            <TableHead className="hidden md:table-cell">Office</TableHead>
            <TableHead>
              <SortHeader label="Lead Agent" col="agent1Name" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <SortHeader label="Listed" col="marketingLiveDate" />
            </TableHead>
            <TableHead>
              <SortHeader label="Days on Market" col="daysOnMarket" />
            </TableHead>
            <TableHead>Campaign</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No properties found.
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((p) => {
              const { street, rest } = splitAddress(p.displayAddress);
              const isActive = ACTIVE_STATUSES.has(p.listingStatus);
              return (
                <TableRow
                  key={p.propertyId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/properties/${p.propertyId}`)}
                >
                  <TableCell>
                    <Link
                      href={`/properties/${p.propertyId}`}
                      className="block hover:underline"
                    >
                      <span className="font-semibold">{street}</span>
                      {rest && (
                        <span className="block text-xs text-muted-foreground">
                          {rest}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.displayStatus} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.office}</TableCell>
                  <TableCell>{p.agent1Name}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(p.marketingLiveDate)}</TableCell>
                  <TableCell>
                    <span className={daysColour(p.daysOnMarket)}>
                      {p.daysOnMarket}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isActive && (
                      <Button
                        size="sm"
                        className="bg-[#002a52] text-white hover:bg-[#003a72]"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast("Campaign ordering coming soon");
                        }}
                      >
                        Order Campaign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
