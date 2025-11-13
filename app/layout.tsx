import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CreditProvider } from "@/contexts/CreditContext";
import "./globals.css";

// Load fonts (matching Expo app)
const roboto = localFont({
  src: "../public/assets/fonts/Roboto-VariableFont_wdth,wght.ttf",
  variable: "--font-roboto",
  weight: "100 900",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const poppins = localFont({
  src: "../public/assets/fonts/Poppins-Bold.ttf",
  variable: "--font-poppins",
  weight: "700",
});

const titillium = localFont({
  src: [
    {
      path: "../public/assets/fonts/Titillium-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Titillium-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-titillium",
});

export const metadata: Metadata = {
  title: "DreamAI - See Yourself Living Your Dream Life",
  description: "Transform your images with AI-powered generation. Create stunning, personalized visuals that showcase your dream life.",
  keywords: ["AI", "image generation", "dream life", "photo transformation", "artificial intelligence"],
  authors: [{ name: "DreamAI Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FF5069",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${poppins.variable} ${titillium.variable} ${montserrat.variable}`}>
      <body className="font-roboto bg-black text-white antialiased">
        <CreditProvider>
          {children}
        </CreditProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1F1F1F",
              color: "#FFFFFF",
              border: "1px solid #404040",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#34C759",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#FF453A",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
