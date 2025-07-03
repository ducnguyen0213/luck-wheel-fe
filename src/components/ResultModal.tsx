'use client';

import { Fragment, useRef, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import confetti from 'canvas-confetti';

interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  codeShop: string;
}

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  isRealPrize?: boolean;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  isWin: boolean;
  remainingSpins: number;
  user: User | null;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  prize,
  isWin,
  remainingSpins,
  user
}) => {
  const cancelButtonRef = useRef(null);
  const [showImage, setShowImage] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [showParticles, setShowParticles] = useState(false);

  // Kiểm soát hiệu ứng xuất hiện dần dần của các phần tử
  useEffect(() => {
    if (isOpen) {
      // Hiệu ứng đầu tiên ngay khi modal mở
      setAnimationClass('animate-bounce');
      
      // Hiển thị hình ảnh sau 300ms
      const imageTimer = setTimeout(() => {
        setShowImage(true);
      }, 300);
      
      // Hiển thị kết quả sau 600ms
      const resultTimer = setTimeout(() => {
        setShowResult(true);
      }, 600);
      
      // Dừng hiệu ứng bounce sau 1.5s
      const bounceTimer = setTimeout(() => {
        setAnimationClass('');
      }, 1500);
      
      // Nếu trúng thưởng và là phần thưởng thật, hiển thị particles sau 800ms
      // Chỉ hiển thị hiệu ứng confetti cho phần thưởng thật
      if (isWin && prize?.isRealPrize !== false) {
        const particlesTimer = setTimeout(() => {
          setShowParticles(true);
        }, 800);
        return () => {
          clearTimeout(imageTimer);
          clearTimeout(resultTimer);
          clearTimeout(bounceTimer);
          clearTimeout(particlesTimer);
        };
      }
      
      return () => {
        clearTimeout(imageTimer);
        clearTimeout(resultTimer);
        clearTimeout(bounceTimer);
      };
    } else {
      setShowImage(false);
      setShowResult(false);
      setAnimationClass('');
      setShowParticles(false);
    }
  }, [isOpen, isWin, prize]);
  
  // Hiệu ứng confetti nếu trúng thưởng thật
  useEffect(() => {
    if (isWin && prize?.isRealPrize !== false && showParticles) {
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isWin, showParticles, prize]);

  // Xử lý đóng modal tự động sau thời gian định sẵn
  useEffect(() => {
    let closeTimer: NodeJS.Timeout;
    
    // Chỉ tự động đóng khi người dùng không trúng thưởng và còn lượt quay
    if (isOpen && !isWin && remainingSpins > 0) {
      closeTimer = setTimeout(() => {
        onClose();
      }, 5000); // Đóng sau 5 giây nếu không trúng thưởng
    }
    
    return () => {
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [isOpen, isWin, remainingSpins, onClose]);
  
  // Hiệu ứng confetti đẹp cho trường hợp trúng thưởng
  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && confetti) {
      // Confetti từ giữa
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 }
      });
      
      // Confetti từ góc trái
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 }
        });
      }, 250);
      
      // Confetti từ góc phải
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 }
        });
      }, 400);
    }
  };
  
  // Xác định màu nền dựa vào kết quả thắng/thua
  const getBackgroundGradient = () => {
    if (isWin) {
      return 'bg-gradient-to-br from-green-500/10 to-blue-500/10';
    }
    return 'bg-gradient-to-br from-gray-500/10 to-slate-500/10';
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-80 transition-opacity backdrop-blur-md" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          >
            <div className={`card-container inline-block align-bottom rounded-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative ${getBackgroundGradient()}`}>
              {/* Hiệu ứng trang trí cho modal */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-white to-transparent rounded-full opacity-10 blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-white to-transparent rounded-full opacity-10 blur-2xl"></div>
              
              {/* Nút đóng ở góc phải */}
              <button
                type="button"
                className="absolute top-3 right-3 z-10 bg-white/30 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/50 focus:outline-none transition-colors"
                onClick={onClose}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-900"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
              
              <div className="px-5 pt-6 pb-5 sm:p-8">
                {isWin && prize && prize.isRealPrize !== false ? (
                  <div className="w-full flex flex-col items-center text-center">
                    {/* Tiêu đề khi thắng phần thưởng thật */}
                    <h1 className={`title-text text-5xl font-extrabold mb-6 ${animationClass} text-center text-green-600 drop-shadow-md tracking-wide`}>
                      CHÚC MỪNG!
                    </h1>

                    {/* Hình ảnh phần thưởng */}
                    <Transition
                      as="div"
                      show={showImage}
                      enter="transition ease-out duration-500 transform"
                      enterFrom="opacity-0 scale-50 rotate-12"
                      enterTo="opacity-100 scale-100 rotate-0"
                      leave="transition ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-50"
                      className="mb-6 relative mx-auto"
                    >
                      <div className="relative max-w-[240px] mx-auto">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 opacity-60 animate-pulse blur-xl"></div>
                        {prize.imageUrl ? (
                          <img
                            src={prize.imageUrl}
                            alt={prize.name}
                            className="w-full h-auto rounded-lg shadow-lg relative"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center relative">
                            <span className="text-gray-500">Không có hình ảnh</span>
                          </div>
                        )}
                      </div>
                    </Transition>
                    
                    <Transition
                      as="div"
                      show={showResult}
                      enter="transition ease-out duration-500 transform"
                      enterFrom="opacity-0 translate-y-4"
                      enterTo="opacity-100 translate-y-0"
                    >
                      <h3 className="text-2xl font-bold text-gray-800">
                        {prize.name}
                      </h3>
                      <p className="mt-2 text-md text-gray-500">
                        {prize.description || 'Chúc bạn may mắn lần sau'}
                      </p>
                    </Transition>
                    
                    {user && (
                      <div className="mt-8 w-full text-left bg-gray-500/10 p-4 rounded-lg border border-gray-200/50">
                        <h4 className="font-bold text-lg mb-3 text-gray-800 border-b pb-2">Thông tin nhận thưởng</h4>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center">
                            <span className="font-semibold min-w-32 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Người nhận:
                            </span>
                            <span className="font-medium">{user.name}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-semibold min-w-32 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              SĐT:
                            </span>
                            <span className="font-medium">{user.phone}</span>
                          </p>
                          <p className="flex items-start">
                            <span className="font-semibold min-w-32 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Địa chỉ:
                            </span>
                            <span className="font-medium">{user.address || "Chưa cung cấp"}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-semibold min-w-32 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Mã cửa hàng:
                            </span>
                            <span className="font-medium">{user.codeShop}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-semibold min-w-32 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email:
                            </span>
                            <span className="font-medium">{user.email}</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 italic">
                          Mọi thông tin chi tiết về việc nhận giải sẽ được gửi đến email và số điện thoại trên.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center text-center">
                    {/* Tiêu đề khi không trúng */}
                    <h1 className={`title-text text-5xl font-extrabold mb-6 ${animationClass} text-center text-gray-600 drop-shadow-md`}>
                      CHÚC BẠN MAY MẮN LẦN SAU
                    </h1>
                    
                    <Transition
                      as="div"
                      show={showImage}
                      enter="transition ease-out duration-500 transform"
                      enterFrom="opacity-0 scale-50"
                      enterTo="opacity-100 scale-100"
                      className="mb-6"
                    >
                      <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-200 rounded-full shadow-inner">
                        <span className="text-7xl">😢</span>
                      </div>
                    </Transition>
                    
                    <Transition
                      as="div"
                      show={showResult}
                      enter="transition ease-out duration-500 transform"
                      enterFrom="opacity-0 translate-y-4"
                      enterTo="opacity-100 translate-y-0"
                    >
                      <p className="text-lg text-gray-600">
                        {remainingSpins > 0 ?
                          `Bạn còn ${remainingSpins} lượt quay. Hãy thử lại nhé!` :
                          'Bạn đã hết lượt quay. Hẹn gặp lại vào ngày mai!'
                        }
                      </p>
                      
                      {user && (
                        <p className="text-sm text-gray-500 mt-1">
                          Xin chào <strong>{user.name}</strong>, cảm ơn bạn đã tham gia!
                        </p>
                      )}
                    </Transition>
                  </div>
                )}
                
                {/* Các nút hành động */}
                <div className="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  {isWin ? (
                    <>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
                        onClick={onClose}
                      >
                        {remainingSpins > 0 ? `Tiếp tục quay (${remainingSpins})` : 'Đóng'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                        onClick={onClose}
                        ref={cancelButtonRef}
                      >
                        Xem lại
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm"
                      onClick={onClose}
                    >
                      {remainingSpins > 0 ? `Thử lại ngay (${remainingSpins})` : 'Tôi đã hiểu'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ResultModal; 