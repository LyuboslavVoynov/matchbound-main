import type { Metadata, Viewport } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "Matchbound", description: "A European football fixture draw for your trip." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4f1e7" }, { media: "(prefers-color-scheme: dark)", color: "#10221d" }] };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
