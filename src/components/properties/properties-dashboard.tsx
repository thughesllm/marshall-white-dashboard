"use client";

import { useMemo } from "react";
import { Property } from "@/types/property";
import { PropertiesTable } from "./properties-table";
import { RescueTable } from "./rescue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PropertiesDashboard({ properties }: { properties: Property[] }) {
  const rescueProperties = useMemo(
    () => properties.filter((p) => p.isRescue),
    [properties]
  );

  const justListed = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return properties.filter(
      (p) =>
        ["sale", "now-selling"].includes(p.listingStatus) &&
        p.marketingLiveDate &&
        p.marketingLiveDate >= cutoff
    );
  }, [properties]);

  const justSold = useMemo(
    () =>
      properties
        .filter((p) => p.listingStatus === "sold")
        .sort((a, b) => {
          const aDate = a.soldDate ? new Date(a.soldDate).getTime() : 0;
          const bDate = b.soldDate ? new Date(b.soldDate).getTime() : 0;
          return bDate - aDate;
        }),
    [properties]
  );

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All Properties</TabsTrigger>
        <TabsTrigger value="rescue">
          Rescue ({rescueProperties.length})
        </TabsTrigger>
        <TabsTrigger value="just-listed">
          Just Listed ({justListed.length})
        </TabsTrigger>
        <TabsTrigger value="just-sold">
          Just Sold ({justSold.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <PropertiesTable properties={properties} />
      </TabsContent>
      <TabsContent value="rescue">
        <RescueTable properties={rescueProperties} />
      </TabsContent>
      <TabsContent value="just-listed">
        <PropertiesTable properties={justListed} />
      </TabsContent>
      <TabsContent value="just-sold">
        <PropertiesTable properties={justSold} />
      </TabsContent>
    </Tabs>
  );
}
