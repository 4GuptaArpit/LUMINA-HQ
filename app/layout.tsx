import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/common/header";
import SiteFooter from "@/components/common/site-footer";
import { Toaster } from "sonner";
import { syncUserToDatabase } from "@/lib/sync-user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina-HQ | Multi-Tenant Document Intelligence Platform",
  description: "Turn your organization's documents into a searchable, actionable knowledge base with multi-tenant AI analysis.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncUserToDatabase();
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster position="top-right" richColors />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
