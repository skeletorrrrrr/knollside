import "./globals.css";

export const metadata = {
  title: "Knollside",
  description: "Instant online quotes for service businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
