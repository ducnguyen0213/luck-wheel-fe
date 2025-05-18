'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { FiHome, FiGift, FiUsers, FiPieChart, FiLogOut, FiUserPlus, FiMenu, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';
import Image from 'next/image';

const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { logout, admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const NavLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
    <Link href={href} 
      className={`px-3 py-2 rounded-lg flex items-center transition-colors ${
        isActive(href) 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-300 hover:bg-navy-light hover:text-white'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {icon} <span className="ml-2 text-sm font-medium">{text}</span>
    </Link>
  );

  return (
    <div className="admin-header text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="text-xl sm:text-2xl font-bold truncate flex items-center">
              <svg className="w-8 h-8 mr-2 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Zm0-18a8,8,0,1,0,8,8A8,8,0,0,0,12,4Z" opacity="0.4" />
                <path d="M15.09,12.79l-2.09.85V9.21a1,1,0,0,0-1.29-.96L7.79,9.71a1,1,0,0,0-.71.95v4.38a1,1,0,0,0,.62.92l4.17,1.74a1,1,0,0,0,1.38-.92V14.5l2.09-.85a1,1,0,0,0,0-1.86Z" />
              </svg>
              <span className="hidden sm:inline">Vòng Quay May Mắn</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:bg-navy-light focus:outline-none"
              aria-label="Mở menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-6">
            <nav className="flex space-x-3">
              <NavLink href="/admin/dashboard" icon={<FiHome className="text-lg" />} text="Dashboard" />
              <NavLink href="/admin/prizes" icon={<FiGift className="text-lg" />} text="Phần thưởng" />
              <NavLink href="/admin/users" icon={<FiUsers className="text-lg" />} text="Người dùng" />
              <NavLink href="/admin/spins" icon={<FiPieChart className="text-lg" />} text="Lượt quay" />
              <NavLink href="/admin/register" icon={<FiUserPlus className="text-lg" />} text="Thêm admin" />
            </nav>
            
            {/* User profile */}
            <div className="relative">
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-2 text-sm rounded-full p-1 px-2 hover:bg-navy-light transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="hidden lg:inline-block font-medium">{admin?.name || 'Admin'}</span>
                <FiChevronDown className="text-gray-400" />
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{admin?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{admin?.email || 'admin@example.com'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FiLogOut className="mr-2" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-2">
            <NavLink href="/admin/dashboard" icon={<FiHome />} text="Dashboard" />
            <NavLink href="/admin/prizes" icon={<FiGift />} text="Phần thưởng" />
            <NavLink href="/admin/users" icon={<FiUsers />} text="Người dùng" />
            <NavLink href="/admin/spins" icon={<FiPieChart />} text="Lượt quay" />
            <NavLink href="/admin/register" icon={<FiUserPlus />} text="Thêm admin" />
            
            <div className="border-t border-gray-700 my-2 pt-2">
              <div className="px-3 py-2 text-sm text-gray-400">
                Đăng nhập với tài khoản: <span className="text-white font-medium">{admin?.name || 'Admin'}</span>
              </div>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-navy-light hover:text-white flex items-center transition-colors"
              >
                <FiLogOut className="mr-2" /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar; 