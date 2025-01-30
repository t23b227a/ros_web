"use client";

import { ROSProvider } from './ROSContext';
import AppNavbar from './components/menubar';

import '@/app/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>Ros GUI Controller</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <meta name="description" content="GUI Controller for ROS2"></meta>
      </head>
      <body>
        <ROSProvider>
          <AppNavbar />
            {children}
        </ROSProvider>
      </body>
    </html>
  );
}