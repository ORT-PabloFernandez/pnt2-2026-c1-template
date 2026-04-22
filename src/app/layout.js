import "./globals.css";
import HeaderNew from "./components/HeaderNew";
import FooterNew from "./components/FooterNew";

export const metadata = {
  title: "Rick & Morty App",
  description: "Listado y detalle de personajes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Íconos usados por HeaderNew/FooterNew */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <HeaderNew />
        <main style={{ flex: 1 }}>{children}</main>
        <FooterNew />
      </body>
    </html>
  );
}