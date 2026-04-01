"use client";

import { Property } from "@/types/property";
import { PropertiesTable } from "./properties-table";
import { RescueTable } from "./rescue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PropertiesDashboard({ properties }: { properties: Property[] }) {
  const rescueProperties = properties.filter((p) => p.isRescue);
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All Properties</TabsTrigger>
        <TabsTrigger value="rescue">
          Rescue Properties ({rescueProperties.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <PropertiesTable properties={properties} />
      </TabsContent>
      <TabsContent value="rescue">
        <RescueTable properties={rescueProperties} />
      </TabsContent>
    </Tabs>
  );
}
