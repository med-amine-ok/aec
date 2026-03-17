import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import OceanBackground from "./components/OceanBackground";
import ErrorBoundary from "./components/error";
import GlobalSplashScreen from "./components/GlobalSplashScreen";

// Secondary font — Raleway (loaded from Google Fonts)
const raleway = Raleway({
  variable: "--font-secondary",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

// Metadata with favicon
export const metadata: Metadata = {
  title: "Algerian Engineering Competition",
  description: "Algeria's #1 Engineering Competition",
  icons: {
    icon: "/aec.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <GlobalSplashScreen />
          <OceanBackground />
        </ErrorBoundary>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
