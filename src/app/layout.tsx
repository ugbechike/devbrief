import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "~/providers";
import { Nav } from "~/components/layout";
import { Box } from "~/components/ui";
import { QueryClientWrapperProvider } from "~/providers/query-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devbrief",
  description: "Devbrief",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientWrapperProvider>
          <ThemeProvider>
            <Nav />
            <Box variant="container-xl" className="py-12">
              {children}
            </Box>
          </ThemeProvider>
        </QueryClientWrapperProvider>
      </body>
    </html>
  );
}
