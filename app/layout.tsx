import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Face Shape Detector | Instant Face Shape Analysis",
  description:
    "Instantly analyze your face shape with on-device AI. Upload a photo to see your shape, confidence scores, and styling tips - fast, private, and accurate.",
  metadataBase: new URL("https://faceshapedetector.top/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Face Shape Detector | Instant Face Shape Analysis",
    description:
      "Instantly analyze your face shape with on-device AI. Upload a photo to see your shape, confidence scores, and styling tips - fast, private, and accurate.",
    url: "https://faceshapedetector.top/",
    siteName: "Face Shape Detector",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Face Shape Detector logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Face Shape Detector | Instant Face Shape Analysis",
    description:
      "Instantly analyze your face shape with on-device AI. Upload a photo to see your shape, confidence scores, and styling tips - fast, private, and accurate.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7MGHFJQ6WQ"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-7MGHFJQ6WQ');`}
        </Script>
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "v4b9dbp6j3");`}
        </Script>
        {children}
      </body>
    </html>
  );
}
