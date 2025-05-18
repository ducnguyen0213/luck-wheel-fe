'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '@/lib/authContext';
import AdminNavbar from '@/components/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    setIsLoginPage(pathname === '/admin');
  }, [pathname]);

  useEffect(() => {
    // Chỉ chuyển hướng nếu không phải trang login và người dùng chưa xác thực
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router, isLoginPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Nếu là trang login, hiển thị nội dung trang login
  if (isLoginPage) {
    return (
      <>
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
        />
      </>
    );
  }

  // Hiển thị layout admin với navbar nếu đã xác thực
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
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
        />
      </div>
    );
  }

  // Hiển thị trang loading trong trường hợp khác
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 