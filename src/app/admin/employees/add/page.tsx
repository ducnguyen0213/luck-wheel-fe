'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

import { createEmployee } from '@/lib/api';

interface EmployeeFormData {
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  codeShop: string;
  address: string;
  machinesSold: number;
}

export default function AddEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<EmployeeFormData>();
  
  const onSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await createEmployee({ ...data, machinesSold: Number(data.machinesSold) });
      
      // If API call is successful (doesn't throw), it will return employee data.
      if (response.data && response.data._id) {
        console.log(response);
        
        toast.success('Thêm nhân viên mới thành công!');
        
        // Redirect after a short delay to allow the user to see the toast.
        // Use window.location.href to force a full page reload, ensuring the list is refreshed.
        setTimeout(() => {
          window.location.href = '/admin/employees';
        }, 1500);

      } else {
        toast.error('Phản hồi từ server không hợp lệ.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm nhân viên');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Thêm Nhân viên mới</h1>
        <Link
          href="/admin/employees"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Quay lại
        </Link>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Code */}
          <div>
            <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">Mã nhân viên</label>
            <input
              type="text"
              id="employeeCode"
              {...register('employeeCode', { required: 'Mã nhân viên là bắt buộc' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.employeeCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.employeeCode && <p className="mt-1 text-sm text-red-600">{errors.employeeCode.message}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Tên là bắt buộc' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Địa chỉ email không hợp lệ'
                }
              })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Code Shop */}
          <div>
            <label htmlFor="codeShop" className="block text-sm font-medium text-gray-700">Mã cửa hàng</label>
            <input
              type="text"
              id="codeShop"
              {...register('codeShop')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Machines Sold */}
          <div>
            <label htmlFor="machinesSold" className="block text-sm font-medium text-gray-700">Số máy đã bán</label>
            <input
              type="number"
              id="machinesSold"
              defaultValue={0}
              {...register('machinesSold', { 
                required: 'Số máy đã bán là bắt buộc',
                valueAsNumber: true,
                min: { value: 0, message: 'Số máy không thể âm' }
              })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.machinesSold ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.machinesSold && <p className="mt-1 text-sm text-red-600">{errors.machinesSold.message}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <textarea
            id="address"
            rows={3}
            {...register('address')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" /> {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </div>
  );
} 