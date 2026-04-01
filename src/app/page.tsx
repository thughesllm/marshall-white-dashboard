import { loadProperties } from "@/lib/properties";
import { redirect } from "next/navigation";

export default function Home() {
  const properties = loadProperties();
  console.log(`Loaded ${properties.length} properties`);
  console.log(`Rescue: ${properties.filter(p => p.isRescue).length}`);
  redirect("/properties");
}
