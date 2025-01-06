
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased bg-gradient-to-b from-indigo-600 to-slate-900 max-h-screen mt-0`}
      >
          {children}        
      </body>
    </html>
  );
}
