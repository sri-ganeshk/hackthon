import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import React from 'react'
import Appbar from './components/navbar'
import ChatPanel from '@/components/ai-assistant/ChatPanel'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LearnSphere',
  description: 'The best notebook experience you\'ll ever have.',
  icons: {
    icon: {
      url: '/favicon.svg',
      type: 'image/svg+xml',
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className= {`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
          
           <Appbar/>
          
          {children} 
          <ChatPanel />
        </body>
      </html>
    </ClerkProvider>
  )
}