import { loadProperties } from "@/lib/properties";
import { PropertiesDashboard } from "@/components/properties/properties-dashboard";

export default function PropertiesPage() {
  const allProperties = loadProperties();
  const properties = allProperties.filter(
    (p) => p.listingStatus !== "lease" && p.listingStatus !== "leased"
  );
  return <PropertiesDashboard properties={properties} />;
}
