'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEye, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import * as XLSX from 'xlsx';

import { getAllUsers, exportUsers } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  codeShop: string;
  spinsToday: number;
  lastSpinDate: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await exportUsers();
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Chuyển đổi dữ liệu cho Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(userData.map((user: any) => ({
          'ID': user.id,
          'Họ tên': user.name,
          'Email': user.email,
          'Số điện thoại': user.phone,
          'Mã cửa hàng': user.codeShop || 'Không có',
          'Lượt quay hôm nay': user.spinsToday,
          'Quay lần cuối': new Date(user.lastSpinDate).toLocaleString('vi-VN'),
          'Ngày tạo': new Date(user.createdAt).toLocaleString('vi-VN')
        })));
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Người dùng');
        XLSX.writeFile(workbook, 'danh-sach-nguoi-dung.xlsx');
        
        toast.success('Xuất dữ liệu thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi xuất dữ liệu người dùng');
    } finally {
      setIsExporting(false);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    (user.codeShop && user.codeShop.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <button
          onClick={handleExport}
          disabled={isExporting || users.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
        >
          <FiDownload className="mr-2" /> Xuất Excel
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại hoặc mã cửa hàng..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã cửa hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt quay hôm nay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lần quay cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.codeShop || 'Không có'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.spinsToday} / 5
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastSpinDate).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEye className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm 
                        ? 'Không tìm thấy người dùng phù hợp'
                        : 'Chưa có người dùng nào'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 