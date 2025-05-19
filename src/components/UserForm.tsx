'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaUser, FaEnvelope, FaPhone, FaStore, FaMapMarkerAlt } from 'react-icons/fa';

const userSchema = z.object({
  name: z.string()
    .min(3, 'Họ tên phải có ít nhất 3 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .regex(/^[A-Za-zÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái tiếng Việt')
    .refine(val => val.trim().includes(' '), {
      message: 'Vui lòng nhập đầy đủ họ và tên'
    }),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(500, 'Địa chỉ không được vượt quá 500 ký tự'),
  codeShop: z.string().min(1, 'Mã cửa hàng không được để trống'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  defaultValues?: Partial<UserFormData>;
  isSubmitting?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, defaultValues, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phone: '',
      address: '',
      codeShop: '',
    },
  });

  return (
    <div className="card-container p-8 backdrop-blur-md max-w-md mx-auto relative overflow-hidden">
      {/* Sparkle decorations */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Thông tin người chơi</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="group">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
              Họ tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                <FaUser />
              </div>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 outline-none"
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="group">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                <FaPhone />
              </div>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 outline-none"
                placeholder="0xxxxxxxxx"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="group">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
              Địa chỉ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                <FaMapMarkerAlt />
              </div>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 outline-none"
                placeholder="Nhập địa chỉ của bạn"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="group">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                <FaEnvelope />
              </div>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 outline-none"
                placeholder="example@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="group">
            <label htmlFor="codeShop" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
              Mã cửa hàng
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                <FaStore />
              </div>
              <input
                id="codeShop"
                type="text"
                {...register('codeShop')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 outline-none"
                placeholder="Nhập mã cửa hàng"
              />
            </div>
            {errors.codeShop && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {errors.codeShop.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.03] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Bắt đầu chơi!'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 