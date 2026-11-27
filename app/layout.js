export const metadata = {
  title: "Penerimaan Mahasiswa Baru — Universitas Cakrawala Nusantara",
  description: "Portal resmi Penerimaan Mahasiswa Baru Universitas Cakrawala Nusantara."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/password.css" />
        <link rel="stylesheet" href="/flow.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
