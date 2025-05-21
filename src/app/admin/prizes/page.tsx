'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

import { getAllPrizes, deletePrize } from '@/lib/api';

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  probability: number;
  remainingQuantity: number;
  originalQuantity: number;
  active: boolean;
  isRealPrize: boolean;
  createdAt: string;
}

export default function PrizesPage() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchPrizes();
  }, []);
  
  const fetchPrizes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllPrizes();
      if (response.data.success) {
        setPrizes(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phần thưởng');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phần thưởng này?')) {
      try {
        setIsDeleting(true);
        const response = await deletePrize(id);
        if (response.data.success) {
          toast.success('Xóa phần thưởng thành công');
          fetchPrizes();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa phần thưởng');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý phần thưởng</h1>
        <div className="flex">
          <Link
            href="/admin/prizes/probability"
            className="px-4 py-2 mr-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-md flex items-center justify-center transition-colors"
          >
            <FiEdit className="mr-1" /> Quản lý tỷ lệ
          </Link>
          <Link 
            href="/admin/prizes/add"
            className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md flex items-center justify-center transition-colors"
          >
            <FiPlus className="mr-1" /> Thêm phần thưởng
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phần thưởng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỉ lệ (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Còn lại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại thưởng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prizes.length > 0 ? (
                  prizes.map((prize) => (
                    <tr key={prize._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {prize.imageUrl ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={prize.imageUrl} 
                                alt={prize.name} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xl">🎁</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {prize.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prize.description?.substring(0, 30) || '-'}
                              {prize.description && prize.description.length > 30 ? '...' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prize.probability}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prize.originalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prize.remainingQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prize.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {prize.active ? 'Đang hoạt động' : 'Đã tắt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prize.isRealPrize 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prize.isRealPrize ? 'Phần thưởng thật' : 'Không trúng thưởng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/prizes/edit/${prize._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prize._id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Không có phần thưởng nào. Hãy thêm phần thưởng mới!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 