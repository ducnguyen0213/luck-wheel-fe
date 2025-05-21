'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

import { getAllPrizes, updatePrize } from '@/lib/api';

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  probability: number;
  remainingQuantity: number;
  originalQuantity: number;
  active: boolean;
  isRealPrize: boolean;
  createdAt: string;
}

export default function PrizeProbabilityPage() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [totalProbability, setTotalProbability] = useState(100);
  const [probabilities, setProbabilities] = useState<{[key: string]: number}>({});
  const [remainingProbability, setRemainingProbability] = useState(0);
  const [showNoWinModal, setShowNoWinModal] = useState(false);
  const [noWinPercent, setNoWinPercent] = useState(30);

  // Fetch prizes on component mount
  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      setIsLoading(true);
      const response = await getAllPrizes();
      
      if (response.data.success) {
        const fetchedPrizes = response.data.data;
        setPrizes(fetchedPrizes);
        
        // Initialize probabilities
        const initialProbabilities: {[key: string]: number} = {};
        let total = 0;
        
        fetchedPrizes.forEach((prize: Prize) => {
          initialProbabilities[prize._id] = prize.probability;
          total += prize.probability;
        });
        
        setProbabilities(initialProbabilities);
        setTotalProbability(total);
        setRemainingProbability(0);
      } else {
        toast.error('Lỗi khi tải danh sách phần thưởng');
      }
    } catch (error) {
      toast.error('Không thể kết nối đến máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle probability change for a prize
  const handleProbabilityChange = (prizeId: string, newValue: number) => {
    // Prevent negative values
    if (newValue < 0) newValue = 0;
    
    const oldValue = probabilities[prizeId] || 0;
    const change = newValue - oldValue;
    
    // Calculate new total
    const newTotal = totalProbability + change;
    
    // Only allow changes that keep the total at or below 100%
    if (newTotal > 100) {
      return;
    }
    
    // Update the probability for this prize
    setProbabilities({
      ...probabilities,
      [prizeId]: newValue
    });
    
    // Update total and remaining
    setTotalProbability(newTotal);
    setRemainingProbability(100 - newTotal);
  };

  // Auto-balance probabilities to ensure they sum to 100%
  const autoBalance = () => {
    const prizesCount = prizes.length;
    if (prizesCount === 0) return;
    
    // Distribute remaining probability equally
    const equalShare = Math.floor(remainingProbability / prizesCount);
    let leftover = remainingProbability - (equalShare * prizesCount);
    
    const newProbabilities = { ...probabilities };
    
    prizes.forEach((prize, index) => {
      // Add equal share to each prize
      newProbabilities[prize._id] = (probabilities[prize._id] || 0) + equalShare;
      
      // Add 1% to some prizes if there's leftover
      if (leftover > 0) {
        newProbabilities[prize._id] += 1;
        leftover--;
      }
    });
    
    setProbabilities(newProbabilities);
    setTotalProbability(100);
    setRemainingProbability(0);
  };

  // Reset all probabilities to be equal
  const resetToEqual = () => {
    const prizesCount = prizes.length;
    if (prizesCount === 0) return;
    
    const equalShare = Math.floor(100 / prizesCount);
    let leftover = 100 - (equalShare * prizesCount);
    
    const newProbabilities: {[key: string]: number} = {};
    
    prizes.forEach((prize, index) => {
      newProbabilities[prize._id] = equalShare;
      
      // Add 1% to some prizes if there's leftover
      if (leftover > 0) {
        newProbabilities[prize._id] += 1;
        leftover--;
      }
    });
    
    setProbabilities(newProbabilities);
    setTotalProbability(100);
    setRemainingProbability(0);
  };

  // Thêm hàm để tự động phân bổ xác suất cho phần thưởng không trúng
  const allocateForNoWinPrizes = () => {
    // Hiển thị modal thay vì window.prompt
    setShowNoWinModal(true);
  };

  // Hàm xử lý khi người dùng xác nhận tỷ lệ trong modal
  const handleNoWinAllocation = () => {
    // Tìm tất cả phần thưởng không trúng (isRealPrize = false) và phần thưởng thật (isRealPrize = true)
    const noWinPrizes = prizes.filter(prize => !prize.isRealPrize);
    const realPrizes = prizes.filter(prize => prize.isRealPrize);
    
    if (noWinPrizes.length === 0) {
      toast.warning('Không có phần thưởng không trúng. Vui lòng thêm phần thưởng không trúng trước.');
      setShowNoWinModal(false);
      return;
    }
    
    if (realPrizes.length === 0) {
      toast.warning('Không có phần thưởng thật. Vui lòng thêm phần thưởng thật trước.');
      setShowNoWinModal(false);
      return;
    }
    
    const newProbabilities: {[key: string]: number} = {};
    
    // Phân bổ cho phần thưởng không trúng thưởng
    const equalNoWinShare = Math.floor(noWinPercent / noWinPrizes.length);
    let leftoverNoWin = noWinPercent - (equalNoWinShare * noWinPrizes.length);
    
    noWinPrizes.forEach(prize => {
      newProbabilities[prize._id] = equalNoWinShare;
      if (leftoverNoWin > 0) {
        newProbabilities[prize._id]++;
        leftoverNoWin--;
      }
    });
    
    // Phân bổ cho phần thưởng thật
    const realPercent = 100 - noWinPercent;
    const equalRealShare = Math.floor(realPercent / realPrizes.length);
    let leftoverReal = realPercent - (equalRealShare * realPrizes.length);
    
    realPrizes.forEach(prize => {
      newProbabilities[prize._id] = equalRealShare;
      if (leftoverReal > 0) {
        newProbabilities[prize._id]++;
        leftoverReal--;
      }
    });
    
    setProbabilities(newProbabilities);
    setTotalProbability(100);
    setRemainingProbability(0);
    
    toast.success(`Đã phân bổ ${noWinPercent}% cho phần thưởng không trúng và ${100 - noWinPercent}% cho phần thưởng thật`);
    setShowNoWinModal(false);
  };

  // Save all probability changes
  const saveChanges = async () => {
    if (totalProbability !== 100) {
      toast.warning('Tổng tỷ lệ phải đạt 100%. Vui lòng điều chỉnh lại.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create array of promises for all updates
      const updatePromises = prizes.map(prize => {
        const newProbability = probabilities[prize._id];
        if (newProbability !== prize.probability) {
          return updatePrize(prize._id, {
            ...prize,
            probability: newProbability
          });
        }
        return Promise.resolve();
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      toast.success('Cập nhật tỷ lệ thành công');
    } catch (error) {
      toast.error('Lỗi khi cập nhật tỷ lệ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/prizes" className="mr-4 text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Quản lý tỷ lệ phần thưởng</h1>
        </div>
        
        <button
          onClick={saveChanges}
          disabled={isSaving || totalProbability !== 100}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSave className="mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Cài đặt xác suất</h2>
            <div className="flex items-center">
              <button
                onClick={autoBalance}
                disabled={remainingProbability === 0}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tự cân đối
              </button>
              <button
                onClick={resetToEqual}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm mr-2"
              >
                Đặt lại bằng nhau
              </button>
              <button
                onClick={allocateForNoWinPrizes}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm"
              >
                Phân bổ theo loại thưởng
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Tổng tỷ lệ của tất cả phần thưởng phải bằng 100%. Hiện tại: <strong>{totalProbability}%</strong>.
                  {remainingProbability > 0 && (
                    <span className="font-medium"> Còn {remainingProbability}% chưa phân bổ.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden bg-gray-50 rounded-lg">
            <div className="h-4 flex">
              {prizes.map(prize => (
                <div
                  key={prize._id}
                  className="h-full"
                  style={{
                    width: `${probabilities[prize._id] || 0}%`,
                    backgroundColor: getRandomColor(prize._id),
                    minWidth: probabilities[prize._id] > 0 ? '1px' : '0'
                  }}
                  title={`${prize.name}: ${probabilities[prize._id] || 0}%`}
                ></div>
              ))}
              {remainingProbability > 0 && (
                <div
                  className="h-full bg-gray-300"
                  style={{ width: `${remainingProbability}%` }}
                  title={`Chưa phân bổ: ${remainingProbability}%`}
                ></div>
              )}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {prizes.length > 0 ? (
              prizes.map(prize => (
                <div key={prize._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {prize.imageUrl ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={prize.imageUrl} 
                            alt={prize.name} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xl">🎁</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">
                          {prize.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prize.description?.substring(0, 30) || 'Không có mô tả'}
                          {prize.description && prize.description.length > 30 ? '...' : ''}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 text-xs inline-flex items-center rounded-full ${
                            prize.isRealPrize 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {prize.isRealPrize ? 'Phần thưởng thật' : 'Không trúng thưởng'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full md:w-64">
                        <div className="flex items-center space-x-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={probabilities[prize._id] || 0}
                            onChange={(e) => handleProbabilityChange(prize._id, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="w-16">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={probabilities[prize._id] || 0}
                              onChange={(e) => handleProbabilityChange(prize._id, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${probabilities[prize._id] || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {probabilities[prize._id] || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Không có phần thưởng nào. Vui lòng thêm phần thưởng trước.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal phân bổ theo loại thưởng */}
      {showNoWinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
            <h2 className="text-xl font-bold mb-6 text-center">Phân bổ theo loại thưởng</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỷ lệ cho phần thưởng không trúng (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={noWinPercent}
                    onChange={(e) => setNoWinPercent(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="w-16">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={noWinPercent}
                      onChange={(e) => setNoWinPercent(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${noWinPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Không trúng: {noWinPercent}%</span>
                  <span>Thưởng thật: {100 - noWinPercent}%</span>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Hệ thống sẽ tự động phân bổ {noWinPercent}% tỷ lệ cho tất cả phần thưởng không trúng và {100 - noWinPercent}% cho các phần thưởng thật.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNoWinModal(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Hủy
                </button>
                <button
                  onClick={handleNoWinAllocation}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hàm tạo màu ngẫu nhiên nhưng ổn định dựa trên ID
function getRandomColor(id: string): string {
  // Tạo một số hash đơn giản từ chuỗi ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Chọn từ một bộ màu đẹp
  const colors = [
    '#FF9A8B', '#8DC4FA', '#FFCC80', '#A5D6A7', 
    '#CE93D8', '#90CAF9', '#FFAB91', '#B39DDB',
    '#FFF59D', '#80DEEA', '#EF9A9A', '#C5E1A5'
  ];
  
  // Chọn màu dựa trên hash
  const index = Math.abs(hash) % colors.length;
  return colors[index];
} 