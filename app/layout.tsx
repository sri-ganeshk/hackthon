import { type Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import React from 'react';
import Appbar from './components/navbar';
import ChatPanel from '@/components/ai-assistant/ChatPanel';

export const metadata: Metadata = {
  title: 'LearnSphere',
  description: "The best notebook experience you'll ever have.",
  icons: {
    icon: {
      url: '/favicon.svg',
      type: 'image/svg+xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-black text-white font-sans">
          <Appbar />
          {children}
          <ChatPanel />
        </body>
      </html>
    </ClerkProvider>
  );
}
