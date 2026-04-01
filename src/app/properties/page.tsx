import { loadProperties } from "@/lib/properties";
import { PropertiesDashboard } from "@/components/properties/properties-dashboard";

export default function PropertiesPage() {
  const properties = loadProperties();
  return <PropertiesDashboard properties={properties} />;
}
