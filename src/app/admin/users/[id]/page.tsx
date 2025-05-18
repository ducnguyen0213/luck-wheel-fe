'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiGift, FiHome, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

import { getUserById } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  codeShop: string;
  spinsToday: number;
  lastSpinDate: string;
  createdAt: string;
}

interface Spin {
  _id: string;
  user: string;
  prize: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  isWin: boolean;
  createdAt: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getUserById(params.id);
        
        if (response.data.success) {
          setUser(response.data.data.user);
          setSpins(response.data.data.spins || []);
        } else {
          toast.error('Không tìm thấy thông tin người dùng');
          router.push('/admin/users');
        }
      } catch (error) {
        toast.error('Lỗi khi tải thông tin người dùng');
        router.push('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [params.id, router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Không tìm thấy thông tin người dùng</p>
        <Link href="/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/admin/users" className="mr-4 text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin người dùng */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-1">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-6">{user.name}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FiMail className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiPhone className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <FiMapPin className="text-gray-500 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Địa chỉ</p>
                <p className="font-medium">{user.address || 'Chưa cung cấp'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiHome className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Mã cửa hàng</p>
                <p className="font-medium">{user.codeShop || 'Không có'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiClock className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Lượt quay hôm nay</p>
                <p className="font-medium">{user.spinsToday} / 5</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiCalendar className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Quay lần cuối</p>
                <p className="font-medium">
                  {new Date(user.lastSpinDate).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Ngày tham gia</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lịch sử quay */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Lịch sử quay</h2>
          
          {spins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phần thưởng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kết quả
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {spins.map((spin) => (
                    <tr key={spin._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(spin.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {spin.prize?.imageUrl ? (
                              <img 
                                className="h-8 w-8 rounded-full object-cover" 
                                src={spin.prize.imageUrl} 
                                alt={spin.prize.name} 
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <FiGift className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {spin.prize?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          spin.isWin 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {spin.isWin ? 'Trúng thưởng' : 'Không trúng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Người dùng chưa có lượt quay nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 