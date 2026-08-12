// app/robots.js
// Next.js 14 App Router auto-generates https://www.knollside.com/robots.txt from this file.
// Allows all search engines and tells them where the sitemap lives.

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.knollside.com/sitemap.xml",
  };
}
