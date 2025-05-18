'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { FiHome, FiGift, FiUsers, FiPieChart, FiLogOut, FiUserPlus } from 'react-icons/fi';

const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { logout, admin } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <div className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between py-3">
          <div className="flex items-center mb-3 md:mb-0">
            <Link href="/admin/dashboard" className="text-2xl font-bold">
              Vòng Quay May Mắn - Admin
            </Link>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end space-x-1 md:space-x-4">
            <Link href="/admin/dashboard" 
              className={`px-3 py-2 rounded-md flex items-center ${
                isActive('/admin/dashboard') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FiHome className="mr-1" /> Dashboard
            </Link>
            
            <Link href="/admin/prizes" 
              className={`px-3 py-2 rounded-md flex items-center ${
                isActive('/admin/prizes') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FiGift className="mr-1" /> Phần thưởng
            </Link>
            
            <Link href="/admin/users" 
              className={`px-3 py-2 rounded-md flex items-center ${
                isActive('/admin/users') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FiUsers className="mr-1" /> Người dùng
            </Link>
            
            <Link href="/admin/spins" 
              className={`px-3 py-2 rounded-md flex items-center ${
                isActive('/admin/spins') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FiPieChart className="mr-1" /> Lượt quay
            </Link>
            
            <Link href="/admin/register" 
              className={`px-3 py-2 rounded-md flex items-center ${
                isActive('/admin/register') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FiUserPlus className="mr-1" /> Thêm admin
            </Link>
            
            <button 
              onClick={logout}
              className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FiLogOut className="mr-1" /> Đăng xuất
            </button>
          </nav>
        </div>
        
        {admin && (
          <div className="pb-2 text-sm text-gray-400 text-right">
            Xin chào, {admin.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar; 