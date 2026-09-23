import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "SiddhaWellness.in — Ancient Siddha Medicine | Holistic Healing",
  description: "Experience the power of 5000-year-old Siddha medicine. Book appointments with expert Siddha doctors for natural, holistic healing. Varmam therapy, herbal medicine, and more.",
  keywords: "siddha medicine, siddha doctor, varmam therapy, herbal medicine, holistic healing, ayurveda, tamil medicine, panchakarma, natural healing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0f0d] text-[#f0fdf4]">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
