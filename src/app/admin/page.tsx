'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

import { loginAdmin } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Kiểm tra xác thực và chuyển hướng trong useEffect để tránh lỗi render
    if (isAuthenticated && shouldRedirect) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, shouldRedirect, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await loginAdmin({ email, password });
      
      if (response.data.success) {
        toast.success('Đăng nhập thành công');
        login(response.data.token, response.data.admin);
        setShouldRedirect(true);
      } else {
        toast.error('Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Đăng nhập vào hệ thống quản trị
          </h2>
          <p className="mt-2 text-center text-base text-gray-500">
            Vòng Quay May Mắn - Admin Panel
          </p>
          <div className="mt-4 h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">            
            <div className="group">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-indigo-600 transition-colors">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="email-address"
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400 text-base"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>
          </div>

          <div>
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
                  <svg
                    className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              <span className="ml-2">{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 