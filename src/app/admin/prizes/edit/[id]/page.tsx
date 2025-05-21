'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

import { getPrizeById, updatePrize } from '@/lib/api';

export default function EditPrizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    probability: 10,
    originalQuantity: 1,
    active: true,
    isRealPrize: true
  });
  
  useEffect(() => {
    const fetchPrize = async () => {
      try {
        setIsLoading(true);
        const response = await getPrizeById(params.id);
        
        if (response.data.success) {
          const prize = response.data.data;
          setFormData({
            name: prize.name,
            description: prize.description || '',
            imageUrl: prize.imageUrl || '',
            probability: prize.probability,
            originalQuantity: prize.originalQuantity,
            active: prize.active,
            isRealPrize: prize.isRealPrize !== undefined ? prize.isRealPrize : true
          });
        } else {
          toast.error('Không tìm thấy phần thưởng');
          router.push('/admin/prizes');
        }
      } catch (error) {
        toast.error('Lỗi khi tải thông tin phần thưởng');
        router.push('/admin/prizes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrize();
  }, [params.id, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'probability' || name === 'originalQuantity') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Vui lòng nhập tên phần thưởng');
      return;
    }
    
    if (formData.probability < 0 || formData.probability > 100) {
      toast.error('Tỉ lệ phải nằm trong khoảng 0-100%');
      return;
    }
    
    if (formData.originalQuantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await updatePrize(params.id, formData);
      
      if (response.data.success) {
        toast.success('Cập nhật phần thưởng thành công');
        router.push('/admin/prizes');
      } else {
        toast.error('Lỗi khi cập nhật phần thưởng');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật phần thưởng');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/admin/prizes" className="mr-4 text-blue-600 hover:text-blue-800">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa phần thưởng</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phần thưởng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tên phần thưởng"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đường dẫn hình ảnh
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả chi tiết về phần thưởng"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉ lệ trúng (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">Tỉ lệ từ 0-100%</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="originalQuantity"
                value={formData.originalQuantity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Kích hoạt phần thưởng
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRealPrize"
                id="isRealPrize"
                checked={formData.isRealPrize}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRealPrize" className="ml-2 block text-sm text-gray-900">
                Phần thưởng thật <span className="text-sm text-gray-500">(Nếu không chọn, người dùng sẽ nhận được thông báo "Không trúng thưởng")</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Link
              href="/admin/prizes"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 