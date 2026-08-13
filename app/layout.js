import "./globals.css";

export const metadata = {
  title: "Knollside — Instant Quote Widgets for Service Businesses",
  description:
    "Give customers an instant price the moment they ask. Knollside quotes them on your site and captures the lead — for countertops, cleaning, roofing, repairs and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
