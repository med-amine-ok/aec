import type { Metadata } from "next";
import { Lato, Montserrat, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import OceanBackground from "./components/OceanBackground";
import ErrorBoundary from "./components/error";

// Global typography system
const lato = Lato({
  variable: "--font-body",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-tech",
  weight: ["400"],
  subsets: ["latin"],
});

// Metadata with favicon
export const metadata: Metadata = {
  title: "Algerian Engineering Competition",
  description: "Algeria's #1 Engineering Competition",
  icons: {
    icon: "/aec.png", // place this image in the public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${montserrat.variable} ${shareTechMono.variable} antialiased`}>
        <ErrorBoundary>
          <OceanBackground />
        </ErrorBoundary>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
