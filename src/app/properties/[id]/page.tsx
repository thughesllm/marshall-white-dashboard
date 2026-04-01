import { loadProperty, loadProperties } from "@/lib/properties";
import { PropertyDetail } from "@/components/properties/property-detail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  const properties = loadProperties();
  return properties
    .filter(
      (p) => p.listingStatus !== "lease" && p.listingStatus !== "leased"
    )
    .map((p) => ({ id: p.propertyId }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = loadProperty(id);
  if (!property) return notFound();
  return <PropertyDetail property={property} />;
}
