import type { Metadata } from "next";
import { Poppins, Luckiest_Guy } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

const luckiestGuy = Luckiest_Guy({
  weight: ['400'],
  subsets: ["latin"],
  variable: '--font-luckiest-guy',
});

export const metadata: Metadata = {
  title: "Vòng Quay May Mắn",
  description: "Quay vòng quay, trúng ngay quà khủng!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${poppins.variable} ${luckiestGuy.variable}`}>
      <body className={poppins.className}>
        <AuthProvider>
          {children}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
