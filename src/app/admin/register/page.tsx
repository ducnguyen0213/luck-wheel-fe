'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

import { registerAdmin } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

export default function AdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin đăng ký');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await registerAdmin({ name, email, password });
      
      if (response.data.success) {
        toast.success('Đăng ký admin mới thành công!');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Đăng ký thất bại');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-xl w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-lg text-red-700 font-medium">
                Bạn không có quyền truy cập trang này
              </p>
              <p className="text-red-500 mt-2">
                Vui lòng đăng nhập với tài khoản admin để tiếp tục.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8 border border-gray-100">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md">
            <FaUserPlus className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Đăng ký tài khoản quản trị mới
            </h1>
            <p className="text-gray-500">Tạo tài khoản admin mới cho hệ thống</p>
          </div>
        </div>

        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 mb-8"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
                Họ tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser className="group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 text-base"
                  placeholder="Nhập họ tên"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 text-base"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 text-base"
                  placeholder="Tạo mật khẩu"
                />
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 text-base"
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaUserPlus className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                </span>
              )}
              <span className="ml-2">{isLoading ? 'Đang xử lý...' : 'Đăng ký admin mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 