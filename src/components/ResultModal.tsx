'use client';

import { Fragment, useRef, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import confetti from 'canvas-confetti';

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  isWin: boolean;
  remainingSpins: number;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  prize,
  isWin,
  remainingSpins,
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
      
      // Nếu trúng thưởng, hiển thị particles sau 800ms
      if (isWin) {
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
  }, [isOpen, isWin]);
  
  // Hiệu ứng confetti nếu trúng thưởng
  useEffect(() => {
    if (isWin && showParticles) {
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isWin, showParticles]);

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
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className={`title-text text-3xl font-extrabold text-center mb-5 ${animationClass} ${
                        isWin 
                        ? 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500' 
                        : 'text-gray-900'
                      }`}
                    >
                      {isWin ? '🎉 Chúc mừng! 🎉' : 'Rất tiếc!'}
                    </Dialog.Title>
                    <div className="mt-4 flex flex-col items-center">
                      {isWin && prize ? (
                        <>
                          <Transition
                            as="div"
                            show={showImage}
                            enter="transition ease-out duration-500 transform"
                            enterFrom="opacity-0 scale-50 rotate-12"
                            enterTo="opacity-100 scale-100 rotate-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-50"
                            className="mb-6 w-48 h-48 relative"
                          >
                            {prize.imageUrl ? (
                              <div className="relative w-full h-full">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 opacity-50 animate-pulse blur-xl"></div>
                                <img
                                  src={prize.imageUrl}
                                  alt={prize.name}
                                  className="relative z-10 w-full h-full object-contain filter drop-shadow-xl"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/0 to-yellow-300/50 animate-pulse"></div>
                                <span className="text-7xl relative z-10 animate-bounce" style={{ animationDuration: '2s' }}>🎁</span>
                              </div>
                            )}
                          </Transition>
                          
                          <Transition
                            as="div"
                            show={showResult}
                            enter="transition ease-out duration-500"
                            enterFrom="opacity-0 translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="text-center w-full"
                          >
                            <p className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{prize.name}</p>
                            {prize.description && (
                              <p className="text-sm text-gray-600 mb-6">{prize.description}</p>
                            )}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl relative mt-4 shadow-sm backdrop-blur-sm">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                                <div>
                                  <strong className="font-bold text-green-700">Thành công!</strong>
                                  <span className="block sm:inline ml-1">Phần thưởng đã được lưu vào hệ thống!</span>
                                </div>
                              </div>
                            </div>
                          </Transition>
                        </>
                      ) : (
                        <div className="mb-4 flex flex-col items-center">
                          <Transition
                            as="div"
                            show={showImage}
                            enter="transition ease-out duration-300 transform"
                            enterFrom="opacity-0 rotate-180"
                            enterTo="opacity-100 rotate-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mb-6 shadow-inner"
                          >
                            <span className="text-6xl">😔</span>
                          </Transition>
                          
                          <Transition
                            as="div"
                            show={showResult}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="text-center"
                          >
                            <p className="text-xl font-medium mb-4 text-gray-700">Bạn chưa may mắn lần này. Hãy thử lại!</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
                              <p className="text-sm">Đừng nản lòng, có thể lần sau bạn sẽ gặp may hơn!</p>
                            </div>
                          </Transition>
                        </div>
                      )}
                      
                      <p className={`mt-5 text-sm bg-blue-50 py-2.5 px-5 rounded-full inline-flex items-center ${
                        remainingSpins > 0 ? 'text-blue-700' : 'text-red-600'
                      }`}>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Số lượt quay còn lại: <span className="font-bold ml-1">{remainingSpins}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50/80 backdrop-blur-sm px-5 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                {remainingSpins > 0 ? (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all hover:shadow-md transform hover:scale-105"
                    onClick={onClose}
                  >
                    Quay tiếp
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all hover:shadow-md transform hover:scale-105"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                )}
                
                {remainingSpins > 0 && (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ResultModal; 