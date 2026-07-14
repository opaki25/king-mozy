import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "King Mozy Tours & Travel | Untamed Uganda, Beautifully Yours",
  description: "Private Uganda safaris, gorilla trekking, Nile adventures and tailor-made journeys designed by local travel experts in Kampala.",
  icons: { icon: "/assets/king-mozy-logo-transparent.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
