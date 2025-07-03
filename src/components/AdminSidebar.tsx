'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useEffect, useState } from 'react';
import { 
  FiHome, FiGift, FiUsers, FiPieChart, FiLogOut, 
  FiUserPlus, FiMenu, FiChevronLeft, FiSettings, FiX
} from 'react-icons/fi';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { logout, admin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto collapse sidebar on medium screens
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
      
      // Close mobile menu when resizing to desktop
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [setCollapsed, mobileMenuOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobile && mobileMenuOpen && !target.closest('.admin-sidebar')) {
        setMobileMenuOpen(false);
      }
    };

    if (isMobile && mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileMenuOpen]);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavItem = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
    <Link href={href} 
      className={`sidebar-item ${isActive(href) ? 'sidebar-item-active' : ''}`}
      onClick={() => isMobile && setMobileMenuOpen(false)}
    >
      <div className="text-xl">{icon}</div>
      {(!collapsed || isMobile) && (
        <span className={`text-sm font-medium transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          {text}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`admin-sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          className="admin-mobile-menu"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${collapsed && !isMobile ? 'admin-sidebar-collapsed' : ''} ${isMobile ? (mobileMenuOpen ? 'mobile-active' : '') : ''}`}
        style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Logo và Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className={`transition-opacity duration-200 ${(collapsed && !isMobile) ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <Link href="/admin/dashboard" className="text-xl font-bold text-white">
              Vòng Quay Admin
            </Link>
          </div>

          {(collapsed && !isMobile) && (
            <div className="mx-auto">
              <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Zm0-18a8,8,0,1,0,8,8A8,8,0,0,0,12,4Z" opacity="0.4" />
                <path d="M15.09,12.79l-2.09.85V9.21a1,1,0,0,0-1.29-.96L7.79,9.71a1,1,0,0,0-.71.95v4.38a1,1,0,0,0,.62.92l4.17,1.74a1,1,0,0,0,1.38-.92V14.5l2.09-.85a1,1,0,0,0,0-1.86Z" />
              </svg>
            </div>
          )}
          
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-200 text-gray-400"
              aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? <FiMenu /> : <FiChevronLeft />}
            </button>
          )}
          
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-gray-800 transition-colors duration-200 text-gray-400"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Thông tin người dùng */}
        <div className={`mt-4 px-4 pb-4 border-b border-gray-800 ${collapsed && !isMobile ? 'text-center' : ''}`}>
          <div className={`w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium ${collapsed && !isMobile ? 'mx-auto' : ''}`}>
            {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="mt-2 transition-all duration-200">
              <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{admin?.email || ''}</p>
            </div>
          )}
        </div>

        {/* Menu chính */}
        <div className="flex-1 py-4 overflow-y-auto">
          <NavItem href="/admin/dashboard" icon={<FiHome />} text="Dashboard" />
          <NavItem href="/admin/prizes" icon={<FiGift />} text="Phần thưởng" />
          <NavItem href="/admin/users" icon={<FiUsers />} text="Người dùng" />
          <NavItem href="/admin/employees" icon={<FiUsers />} text="Nhân viên" />
          <NavItem href="/admin/spins" icon={<FiPieChart />} text="Lượt quay" />
          <NavItem href="/admin/register" icon={<FiUserPlus />} text="Thêm admin" />
        </div>

        {/* Phần đăng xuất */}
        <div className="mt-auto px-2 pb-6">
          <button
            onClick={logout}
            className="sidebar-item text-left w-full"
          >
            <div className="text-xl"><FiLogOut /></div>
            {(!collapsed || isMobile) && (
              <span className={`text-sm font-medium transition-opacity duration-200 ${collapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
                Đăng xuất
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 