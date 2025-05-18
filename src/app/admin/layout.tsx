'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Inter } from 'next/font/google';

import { useAuth } from '@/lib/authContext';
import AdminSidebar from '@/components/AdminSidebar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    setIsLoginPage(pathname === '/admin');
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      
      // Tự động thu gọn sidebar khi màn hình nhỏ
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname]);

  useEffect(() => {
    // Chỉ chuyển hướng nếu không phải trang login và người dùng chưa xác thực
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router, isLoginPage]);

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-screen bg-gray-50 ${inter.className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Nếu là trang login, hiển thị nội dung trang login
  if (isLoginPage) {
    return (
      <div className={inter.className}>
        {children}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    );
  }

  // Hiển thị layout admin với sidebar nếu đã xác thực
  if (isAuthenticated) {
    return (
      <div className={`min-h-screen flex flex-col md:flex-row bg-gray-50 ${inter.className}`}>
        <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
            isMobileView 
              ? 'w-full pt-16' 
              : sidebarCollapsed 
                ? 'admin-main-expanded' 
                : 'admin-main'
          }`}
        >
          <div className="h-full">
            {children}
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </main>
      </div>
    );
  }

  // Hiển thị trang loading trong trường hợp khác
  return (
    <div className={`flex justify-center items-center min-h-screen bg-gray-50 ${inter.className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
} 