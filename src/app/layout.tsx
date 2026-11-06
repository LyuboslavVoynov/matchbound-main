import type { Metadata, Viewport } from "next";
import "./styles.css";
import { ResultHandoffProvider } from "@/components/result-handoff";

export const metadata: Metadata = { title: "Matchbound", description: "A European football fixture draw for your trip." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content", themeColor: "#f1f3ed" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ResultHandoffProvider>{children}</ResultHandoffProvider></body></html>;
}
