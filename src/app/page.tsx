'use client';

import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import UserForm from '@/components/UserForm';
import WheelComponent from '@/components/WheelComponent';
import ResultModal from '@/components/ResultModal';
import { 
  checkUser, 
  createOrUpdateUser, 
  getPublicPrizes, 
  getUserSpins, 
  spinWheelForUser,
  verifyEmployeeCode,
  spinWheelForEmployee,
} from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  codeShop: string;
  spinsToday: number;
}

interface Employee {
  name: string;
  email: string;
  phone: string;
  codeShop: string;
  address: string;
  remainingSpins: number;
  machinesSold: number;
}

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  probability: number;
  isRealPrize?: boolean;
}

export default function HomePage() {
  const [step, setStep] = useState<'form' | 'wheel'>('form');
  const [viewMode, setViewMode] = useState<'user' | 'employee'>('user');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // User state
  const [user, setUser] = useState<User | null>(null);

  // Employee state
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employeeCode, setEmployeeCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [remainingSpins, setRemainingSpins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  
  // Fetch prizes on component mount
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await getPublicPrizes();
        if (response.data.success) {
          setPrizes(response.data.data);
        }
      } catch (error) {
        toast.error('Không thể tải danh sách phần thưởng');
        console.error('Error fetching prizes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrizes();
  }, []);
  
  const handleUserFormSubmit = async (formData: any) => {
    setIsFormSubmitting(true);
    
    try {
      // Kiểm tra người dùng đã tồn tại chưa
      const checkResponse = await checkUser({ 
        email: formData.email, 
        phone: formData.phone,
        address: formData.address,
        codeShop: formData.codeShop
      });
      
      if (checkResponse.data.success) {
        const userData = checkResponse.data.data;
        
        if (userData.exists && userData.user) {
          // Người dùng đã tồn tại
          setUser(userData.user);
          setRemainingSpins(5 - userData.user.spinsToday);
          
          // Hiển thị lịch sử quay nếu có
          const spinsResponse = await getUserSpins(userData.user._id);
          if (spinsResponse.data.success) {
            setRemainingSpins(spinsResponse.data.data.remainingSpins);
          }
        } else {
          // Tạo người dùng mới
          const createResponse = await createOrUpdateUser(formData);
          if (createResponse.data.success) {
            setUser(createResponse.data.data);
            setRemainingSpins(5); // Người dùng mới có 5 lượt quay
          }
        }
        
        // Chuyển sang bước quay vòng quay
        setStep('wheel');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xử lý thông tin người dùng');
      console.error('Error handling user form:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleVerifyEmployee = async () => {
    if (!employeeCode) {
      toast.warn('Vui lòng nhập mã nhân viên của bạn');
      return;
    }
    setIsVerifying(true);
    try {
      const response = await verifyEmployeeCode(employeeCode);
      if (response.data.exists) {
        setEmployee(response.data.employee);
        setRemainingSpins(response.data.employee.remainingSpins);
        setStep('wheel');
        toast.success(`Xác minh thành công! Chào ${response.data.employee.name}.`);
      } else {
        toast.error('Mã nhân viên không tồn tại hoặc không hợp lệ.');
        setEmployee(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xác minh mã nhân viên.');
      setEmployee(null);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Xử lý sự kiện khi người dùng click vào nút quay
  const handleWheelSpin = async () => {
    if (isSpinning || remainingSpins <= 0) return;

    if (viewMode === 'user' && !user) return;
    if (viewMode === 'employee' && !employee) return;

    setIsSpinning(true);
    
    try {
      const response = viewMode === 'employee'
        ? await spinWheelForEmployee(employeeCode)
        : await spinWheelForUser(user!._id);
      
      if (response.data.success) {
        const result = response.data.data;
        
        setSpinResult(result);
        setRemainingSpins(result.remainingSpins);
        
        const wonPrize = prizes.find(prize => prize._id === result.spin.prize._id);
        setSelectedPrize(wonPrize || null);
      } else {
        toast.error('Lỗi khi quay');
        setIsSpinning(false);
        setSelectedPrize(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi quay');
      console.error('Error spinning wheel:', error);
      setIsSpinning(false);
      setSelectedPrize(null);
    }
  };
  
  // Xử lý khi animation quay hoàn thành
  const handleSpinComplete = (prize: Prize) => {
    // Hiển thị modal kết quả sau khi animation quay hoàn thành
    setShowResult(true);
  };
  
  const resetForm = () => {
    setUser(null);
    setEmployee(null);
    setEmployeeCode('');
    setStep('form');
    setShowResult(false);
    setSpinResult(null);
    setSelectedPrize(null);
  };
  
  const handleResultClose = () => {
    // Đóng modal kết quả
    setShowResult(false);
    
    // Reset trạng thái quay để có thể quay tiếp (nếu còn lượt)
    setIsSpinning(false);
    setSelectedPrize(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
            Vòng Quay May Mắn
          </h1>
          <p className="text-white text-xl max-w-xl mx-auto">
            Hãy nhập thông tin và thử vận may của bạn!
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {step === 'form' ? (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex justify-center mb-6 border-b">
                <button
                  className={`px-6 py-3 font-semibold ${viewMode === 'user' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setViewMode('user')}
                >
                  KHÁCH HÀNG
                </button>
                <button
                  className={`px-6 py-3 font-semibold ${viewMode === 'employee' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                  onClick={() => setViewMode('employee')}
                >
                  NHÂN VIÊN
                </button>
              </div>

              {viewMode === 'user' ? (
                <UserForm 
                  onSubmit={handleUserFormSubmit} 
                  isSubmitting={isFormSubmitting}
                />
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Xác Minh Mã Nhân Viên</h2>
                  <p className="text-gray-600 mb-6">Vui lòng nhập mã nhân viên của bạn để tiếp tục.</p>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: NV001"
                    className="w-full max-w-md mx-auto px-4 py-3 border rounded-lg mb-4 text-center"
                    disabled={isVerifying}
                  />
                  <button
                    onClick={handleVerifyEmployee}
                    disabled={isVerifying || !employeeCode}
                    className="w-full max-w-md mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isVerifying ? 'Đang xác minh...' : 'Xác Minh và Quay'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Xin chào, {viewMode === 'user' ? user?.name : employee?.name}!
                </h2>
                <p>Số lượt quay còn lại: <span className="font-bold text-blue-600">{remainingSpins}</span></p>
                {remainingSpins <= 0 && (
                  <p className="text-red-500 mt-2 font-semibold">
                    Bạn đã hết lượt quay. Vui lòng quay lại sau!
                  </p>
                )}
                {isSpinning && !showResult && (
                  <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mt-2 inline-flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang quay vòng quay...</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center justify-center relative mx-auto">
                {/* Đặt giới hạn kích thước phù hợp cho vòng quay */}
                <div className="w-full max-w-md mx-auto">
                  <WheelComponent
                    prizes={prizes}
                    onFinished={handleSpinComplete}
                    width={420}
                    height={420}
                    isSpinning={isSpinning}
                    setIsSpinning={setIsSpinning}
                    selectedPrize={selectedPrize}
                    onSpin={handleWheelSpin}
                  />
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {spinResult && (
        <ResultModal
          isOpen={showResult}
          onClose={handleResultClose}
          prize={spinResult.spin.prize}
          isWin={spinResult.isWin}
          remainingSpins={remainingSpins}
          user={viewMode === 'user' ? user : employee}
        />
      )}
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
