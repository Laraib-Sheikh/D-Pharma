import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { PlatformProvider } from "@/lib/store";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D-Pharma Employee Platform",
  description:
    "Internal web platform for digital batch records, SOP control, and attendance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PlatformProvider>{children}</PlatformProvider>
      </body>
    </html>
  );
}
