import { StellarProvider } from "@/contexts/stellar-context";
import { geistMono, inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@freelii/utils";
import { type Metadata } from "next";
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Freelii",
  description: "Payments layer for AI Agents",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Freelii",
    description: "Payments layer for AI Agents",
    url: "https://freelii.app",
    siteName: "Freelii",
    images: [
      { url: "https://b4slusdeu7.ufs.sh/f/WtrbKSQbxOe7SGy2N5MRNZKja2pwYey3b5cUGO4J8HxgstCB" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        satoshi.variable,
        inter.variable,
        geistMono.variable,
      )}
    >
      <body>
        <StellarProvider>
          <TRPCReactProvider>
            <Toaster />
            {children}
          </TRPCReactProvider>
        </StellarProvider>

        {/* Crisp Live Chat */}
        <Script
          id="crisp-chat-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="0a29b1cf-48ba-4d63-99b3-614b4cb47cc6";
              (function(){
                d=document;
                s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `
          }}
        />

        {/* Tawk.to Live Chat - Commented Out */}
        {/* 
        <Script
          id="tawk-to-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/688521a2bc445419286aab27/1j140mp78';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
        */}
      </body>
    </html>
  );
}
