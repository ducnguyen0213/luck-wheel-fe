'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-xl overflow-hidden p-8 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 shadow-md">
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Zm0-18a8,8,0,1,0,8,8A8,8,0,0,0,12,4Z" opacity="0.4" />
              <path d="M15.09,12.79l-2.09.85V9.21a1,1,0,0,0-1.29-.96L7.79,9.71a1,1,0,0,0-.71.95v4.38a1,1,0,0,0,.62.92l4.17,1.74a1,1,0,0,0,1.38-.92V14.5l2.09-.85a1,1,0,0,0,0-1.86Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-indigo-700">
            Đăng nhập quản trị
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            Vòng Quay May Mắn - Admin Panel
          </p>
          <div className="mt-4 h-1 w-16 bg-gradient-to-r from-indigo-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">            
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiMail />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 flex justify-center items-center bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none transition-all relative"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FiLogIn className="mr-2" />
                  <span>Đăng nhập</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 