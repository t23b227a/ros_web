import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Ros GUI Controller",
  description: "GUI Controller for ROS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>Ros GUI Controller</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <meta name="description" content="GUI Controller for ROS"></meta>
      </head>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
