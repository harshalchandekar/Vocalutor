import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { NavBar } from "@/components/Navbar";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://vocalutor.vercel.app"
  ),
  title: {
    default: "Vocalutor — Talk to an AI tutor out loud",
    template: "%s | Vocalutor",
  },
  description:
    "Talk to an AI tutor out loud. Pick a subject, start a voice session, and learn by conversation instead of reading.",
  keywords: [
    "AI tutor",
    "voice learning",
    "conversational AI",
    "interactive education",
    "Vocalutor",
    "Vapi AI",
  ],
  icons: {
    icon: "/favicon-vocalutor1.svg"
  },
  authors: [{ name: "Harshal Chandekar" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Vocalutor",
    title: "Vocalutor — Talk to an AI tutor out loud",
    description:
      "Pick a subject, start a real-time voice session, and learn with an AI tutor through natural spoken conversation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocalutor — Talk to an AI tutor out loud",
    description:
      "Pick a subject, start a real-time voice session, and learn with an AI tutor through natural spoken conversation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} antialiased`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#FE5933",
              colorText: "#0F0F10",
              borderRadius: "0.75rem",
              fontFamily: "var(--font-bricolage), sans-serif",
            },
            elements: {
              card: "shadow-xl border border-neutral-200/80 rounded-3xl",
              socialButtonsBlockButton:
                "border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-semibold rounded-xl transition-all shadow-xs py-2.5",
              formButtonPrimary:
                "bg-[#0F0F10] hover:bg-[#E03E1A] text-white rounded-xl shadow-xs transition-colors",
              footerActionLink: "text-[#FE5933] hover:text-[#E03E1A] font-semibold",
              dividerRow: "!hidden",
              form: "!hidden",
            },
          }}
        >
          <NavBar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
