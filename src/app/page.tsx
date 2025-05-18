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
  spinWheel 
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

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  probability: number;
}

export default function HomePage() {
  const [step, setStep] = useState<'form' | 'wheel'>('form');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
  
  // Xử lý sự kiện khi người dùng click vào nút quay
  const handleWheelSpin = async () => {
    if (!user || isSpinning || remainingSpins <= 0) return;
    
    // Đánh dấu bắt đầu quay
    setIsSpinning(true);
    
    try {
      // Gọi API để xác định kết quả quay
      const response = await spinWheel(user._id);
      
      if (response.data.success) {
        const result = response.data.data;
        
        // Lưu kết quả quay để hiển thị sau khi animation hoàn thành
        setSpinResult(result);
        setRemainingSpins(result.remainingSpins);
        
        // Tìm phần thưởng đã trúng để hiển thị đúng trong vòng quay
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
            Hãy nhập thông tin và thử vận may của bạn với vòng quay may mắn!
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {step === 'form' ? (
            <UserForm 
              onSubmit={handleUserFormSubmit} 
              isSubmitting={isFormSubmitting}
            />
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Xin chào, {user?.name}!
                </h2>
                <p className="text-gray-600 mb-2">
                  Bạn có <span className="font-bold text-blue-600">{remainingSpins}</span> lượt quay hôm nay
                </p>
                {remainingSpins <= 0 && (
                  <p className="text-red-500 mt-2 font-semibold">
                    Bạn đã hết lượt quay trong ngày hôm nay. Vui lòng quay lại vào ngày mai!
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
                  Đổi người chơi
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
          user={user}
        />
      )}
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
