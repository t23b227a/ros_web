"use client";

import { useEffect } from "react";
import { ROSProvider } from './ROSContext';
import AppNavbar from './components/menubar';

import '@/app/styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const disableContextMenu = (event: Event) => event.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    // document.addEventListener("touchstart", disableContextMenu, { passive: false });

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("touchstart", disableContextMenu);
    };
  }, []);
  return (
    <html lang="ja">
      <head>
        <title>Ros GUI Controller</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></meta>
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