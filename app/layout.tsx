import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://floorwise-calculators.sites.openai.com"),
  title: { default: "Floorwise Calculators", template: "%s | Floorwise Calculators" },
  description: "Free, transparent flooring material calculators for tile, plank, laminate, hardwood, and carpet projects.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Floorwise Calculators", description: "Plan flooring materials with clear formulas and practical guidance.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
