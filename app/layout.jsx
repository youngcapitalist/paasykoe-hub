import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Poppins, Open_Sans } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata = {
  title: "Pääsykoe.fi — yliopistojen valintakokeet yhdessä paikassa",
  description:
    "Kaikki Suomen yliopistojen kansalliset valintakokeet (pääsykokeet) yhdessä paikassa. Todistusvalinta, valintakokeet ja hakeminen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fi" className={`${poppins.variable} ${openSans.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
