import "/src/styles/globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Mood",
  description: "Mood est une application de musique",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable}`}>{children}</body>
    </html>
  );
}
