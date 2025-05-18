'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

interface Prize {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  probability: number;
}

interface WheelComponentProps {
  prizes: Prize[];
  onFinished: (prize: Prize) => void;
  spinningTime?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  selectedPrize?: Prize | null;
  onSpin?: () => void;
}

const WheelComponent: React.FC<WheelComponentProps> = ({
  prizes,
  onFinished,
  spinningTime = 5000,
  width = 500,
  height = 500,
  fontSize = 15,
  isSpinning,
  setIsSpinning,
  selectedPrize,
  onSpin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [startAngle, setStartAngle] = useState(0);
  const [arc, setArc] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [spinButtonClass, setSpinButtonClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Initialize wheel configuration
  useEffect(() => {
    if (prizes.length > 0 && !isInitialized) {
      setArc(2 * Math.PI / prizes.length);
      setIsInitialized(true);
    }
  }, [prizes, isInitialized]);

  // Draw the wheel
  useEffect(() => {
    if (isInitialized && canvasRef.current) {
      drawWheel();
    }
  }, [startAngle, isInitialized, prizes]);

  // Thêm hiệu ứng shadow cho button khi hover
  useEffect(() => {
    if (isSpinning) {
      setSpinButtonClass('animate-pulse shadow-lg');
    } else {
      setSpinButtonClass('transform hover:scale-105 transition-transform shadow-lg');
    }
  }, [isSpinning]);
  
  // Xử lý khi component re-render khi có selectedPrize mới
  useEffect(() => {
    if (selectedPrize && isSpinning && !isAnimating) {
      startAnimation();
    }
  }, [selectedPrize, isSpinning]);
  
  // Chọn màu sắc cố định cho các phần của bánh xe
  const getSegmentColors = (index: number) => {
    const colors = [
      { bg: '#FF9A8B', text: '#7B241C' },
      { bg: '#8DC4FA', text: '#1A5276' },
      { bg: '#FFCC80', text: '#7E5109' },
      { bg: '#A5D6A7', text: '#145A32' },
      { bg: '#CE93D8', text: '#4A235A' },
      { bg: '#90CAF9', text: '#1B4F72' },
      { bg: '#FFAB91', text: '#943126' },
      { bg: '#B39DDB', text: '#512E5F' },
      { bg: '#FFF59D', text: '#7D6608' },
      { bg: '#80DEEA', text: '#0E6251' }
    ];
    return colors[index % colors.length];
  };

  // Kiểm tra độ tương phản giữa màu chữ và màu nền
  const getContrastTextColor = (bgColor: string) => {
    // Chuyển mã màu hex thành RGB
    const r = parseInt(bgColor.substring(1, 3), 16);
    const g = parseInt(bgColor.substring(3, 5), 16);
    const b = parseInt(bgColor.substring(5, 7), 16);
    
    // Tính toán độ sáng (brightness) theo công thức YIQ
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Nếu màu nền sáng, trả về màu text đen, ngược lại trả về trắng
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40; // Giảm bán kính để tránh lệch tâm
    
    // Vẽ viền ngoài
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#6C6C6C';
    ctx.fill();
    
    // Vẽ viền trong
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    const outerGradient = ctx.createLinearGradient(0, 0, width, height);
    outerGradient.addColorStop(0, '#f9a8d4');
    outerGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    // Draw main wheel shadow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Reset shadow for segments
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Vẽ các phần của vòng quay
    prizes.forEach((prize, index) => {
      const angle = startAngle + index * arc;
      const colors = getSegmentColors(index);
      
      // Vẽ segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      // Tạo gradient cho mỗi phần để tạo hiệu ứng 3D
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, colors.bg);
      gradient.addColorStop(1, colors.bg);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Vẽ viền
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Vẽ text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      
      // Giới hạn độ dài tên phần thưởng
      let displayName = prize.name;
      if (displayName.length > 15) {
        displayName = displayName.substring(0, 12) + '...';
      }
      
      // Thay đổi cách hiển thị text để căn sát rìa vòng tròn
      const textRadius = radius - 25; // Tăng lên để text gần rìa hơn
      
      // Xác định tự động màu text dựa trên màu nền để đảm bảo độ tương phản
      const textColor = getContrastTextColor(colors.bg);
      ctx.fillStyle = textColor;
      
      // Tăng font size để text rõ hơn
      ctx.font = `bold ${fontSize + 2}px 'Montserrat', Arial, sans-serif`;
      
      // Điều chỉnh hướng text để luôn hiển thị theo chiều dễ đọc
      // Xác định nếu đang ở nửa trên hay nửa dưới của vòng tròn
      const currentAngleNormalized = (angle + arc / 2) % (2 * Math.PI);
      const isUpsideDown = currentAngleNormalized > Math.PI / 2 && currentAngleNormalized < Math.PI * 3 / 2;
      
      if (isUpsideDown) {
        // Nếu đang ở nửa dưới, quay text lại để đọc dễ dàng hơn
        ctx.rotate(Math.PI);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayName, -textRadius, 0);
      } else {
        // Nếu đang ở nửa trên, giữ nguyên hướng
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayName, textRadius, 0);
      }
      
      ctx.restore();
    });
    
    // Vẽ vòng tròn trung tâm
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(
      centerX, centerY, 10,
      centerX, centerY, 60
    );
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Vẽ mũi tên chỉ vị trí nằm bên phải vòng quay
    // Mũi tên này ở vị trí 0 radian (chính xác là bên phải)
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 5, centerY);
    ctx.lineTo(centerX + radius + 25, centerY - 15);
    ctx.lineTo(centerX + radius + 25, centerY + 15);
    ctx.closePath();
    
    // Tạo gradient cho mũi tên
    const arrowGradient = ctx.createLinearGradient(
      centerX + radius + 5, centerY,
      centerX + radius + 25, centerY
    );
    arrowGradient.addColorStop(0, '#ef4444');
    arrowGradient.addColorStop(1, '#b91c1c');
    
    ctx.fillStyle = arrowGradient;
    ctx.fill();
    
    // Viền mũi tên
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Thêm hiệu ứng glow cho mũi tên khi đang quay
    if (isSpinning || isAnimating) {
      ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.beginPath();
      ctx.moveTo(centerX + radius + 5, centerY);
      ctx.lineTo(centerX + radius + 25, centerY - 15);
      ctx.lineTo(centerX + radius + 25, centerY + 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  };

  // Xử lý sự kiện click vào nút quay
  const handleSpinClick = () => {
    if (isSpinning || isAnimating || prizes.length === 0) return;
    
    // Gọi hàm onSpin được truyền từ component cha
    if (onSpin) {
      onSpin();
    } else {
      // Fallback nếu không có onSpin
      startAnimation();
    }
  };

  // Xử lý animation quay vòng quay
  const startAnimation = () => {
    if (isAnimating || prizes.length === 0) return;
    
    setIsAnimating(true);
    
    // Phát tiếng "tick" khi bắt đầu quay
    playTickSound();
    
    // Thiết lập các thông số animation
    const spinDuration = spinningTime; // Thời gian quay tổng cộng
    const fullRotations = 8; // Số vòng quay đầy đủ trước khi dừng lại
    
    // Tìm vị trí phần thưởng cần dừng lại (nếu có selectedPrize)
    let finalAngle = 0;
    
    if (selectedPrize) {
      const selectedIndex = prizes.findIndex(prize => prize._id === selectedPrize._id);
      if (selectedIndex >= 0) {
        // Góc cần dừng lại để mũi tên chỉ vào giữa phần thưởng được chọn
        // Lưu ý: Mũi tên chỉ ở vị trí 0 radian (bên phải)
        
        // Góc giữa của phần thưởng được chọn
        const prizeAngle = selectedIndex * arc + arc / 2;
        
        // Để mũi tên (0 radian) trỏ vào góc giữa của phần thưởng,
        // phần thưởng cần được xoay đến vị trí 0 radian
        // Vì vòng quay xoay ngược chiều kim đồng hồ, nên ta cần đảo ngược góc
        finalAngle = 2 * Math.PI - prizeAngle;
      }
    } else {
      // Nếu không có selectedPrize, chọn vị trí dừng ngẫu nhiên
      finalAngle = Math.random() * 2 * Math.PI;
    }
    
    // Thiết lập góc quay ban đầu
    const initialAngle = startAngle % (2 * Math.PI);
    
    // Tính tổng góc quay = số vòng quay đầy đủ + góc dừng cuối cùng
    const totalRotationAngle = fullRotations * 2 * Math.PI + finalAngle - initialAngle;
    
    // Thời gian bắt đầu animation
    const startTime = performance.now();
    
    // Thêm class quay cho wheel container
    if (wheelContainerRef.current) {
      wheelContainerRef.current.classList.add('spinning');
    }
    
    // Hàm animation frame
    const animateFrame = (currentTime: number) => {
      // Tính thời gian đã trôi qua
      const elapsedTime = currentTime - startTime;
      
      // Tính tiến độ animation (0 -> 1)
      const progress = Math.min(elapsedTime / spinDuration, 1);
      
      // Hàm easing mượt mà - sử dụng easeOutExpo
      const easeOutExpo = (t: number) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };
      
      // Tính góc quay hiện tại dựa vào tiến độ và hàm easing
      const currentRotation = initialAngle + totalRotationAngle * easeOutExpo(progress);
      
      // Cập nhật góc quay
      setStartAngle(currentRotation);
      
      // Phát âm thanh tick ngẫu nhiên trong quá trình quay
      if (progress < 0.9 && Math.random() > 0.95) {
        playTickSound(Math.min(0.3, (1 - progress) * 0.5));
      }
      
      // Tiếp tục animation nếu chưa hoàn thành
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        // Kết thúc animation
        if (wheelContainerRef.current) {
          wheelContainerRef.current.classList.remove('spinning');
        }
        
        // Reset trạng thái animation
        setIsAnimating(false);
        
        // Xử lý kết quả
        setTimeout(() => {
          // Phát hiệu ứng âm thanh khi hoàn thành
          playWinSound();
          
          // Xác định phần thưởng dựa vào vị trí dừng của vòng quay
          // (Mũi tên ở 0 radian, phía bên phải)
          const finalPosition = currentRotation % (2 * Math.PI);
          
          // Tính toán phần nào của vòng quay đang ở vị trí mũi tên (0 radian)
          const normalizedPosition = (2 * Math.PI - finalPosition) % (2 * Math.PI);
          let winningIndex = Math.floor(normalizedPosition / arc);
          
          // Kiểm tra nếu mũi tên gần với ranh giới giữa các phần
          const angleWithinSegment = normalizedPosition % arc;
          const distanceToSegmentBoundary = Math.min(angleWithinSegment, arc - angleWithinSegment);
          
          // Nếu quá gần ranh giới (dưới 5 độ), thực hiện micro-adjustment để căn chỉnh
          if (distanceToSegmentBoundary < (5 * Math.PI / 180)) {
            // Tính toán góc trung tâm của phần gần nhất
            const nearestSegmentCenter = Math.round(normalizedPosition / arc) * arc + arc / 2;
            const adjustment = nearestSegmentCenter - normalizedPosition;
            
            // Áp dụng điều chỉnh nhỏ cho góc hiển thị (không ảnh hưởng đến kết quả)
            setStartAngle(currentRotation + adjustment * 0.5);
            
            // Cập nhật lại index dựa trên phần gần nhất
            winningIndex = Math.floor((nearestSegmentCenter % (2 * Math.PI)) / arc);
          }
          
          // Đảm bảo index nằm trong khoảng hợp lệ
          winningIndex = winningIndex % prizes.length;
          
          // Lấy phần thưởng tương ứng
          let finalPrize: Prize;
          
          if (selectedPrize) {
            // Sử dụng phần thưởng được chỉ định
            finalPrize = selectedPrize;
          } else if (winningIndex >= 0 && winningIndex < prizes.length) {
            // Sử dụng phần thưởng dựa trên vị trí dừng
            finalPrize = prizes[winningIndex];
          } else {
            // Fallback nếu có vấn đề với index
            finalPrize = prizes[0];
          }
          
          // Hiệu ứng confetti cho các giải thưởng lớn
          if (finalPrize.name.includes('000')) {
            triggerConfetti();
          }
          
          // Gọi callback với phần thưởng đã chọn
          onFinished(finalPrize);
        }, 200); // Đợi một chút trước khi hiển thị kết quả
      }
    };
    
    // Bắt đầu animation
    requestAnimationFrame(animateFrame);
  };

  // Hiệu ứng confetti khi trúng thưởng lớn
  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Hiệu ứng âm thanh khi quay
  const playTickSound = (volume = 0.5) => {
    try {
      const audio = new Audio('/sounds/bike-loop-103290.mp3');
      audio.volume = volume;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      // Bỏ qua lỗi phát âm thanh
    }
  };

  // Hiệu ứng âm thanh khi thắng
  const playWinSound = () => {
    try {
      const audio = new Audio('/sounds/brass-new-level-151765.mp3');
      audio.volume = 0.7;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      // Bỏ qua lỗi phát âm thanh
    }
  };

  return (
    <div ref={wheelContainerRef} className="wheel-container relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="wheel-canvas transition-transform duration-300 mx-auto"
      />
      <button
        onClick={handleSpinClick}
        disabled={isSpinning || isAnimating}
        className={`spin-button absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-full ${spinButtonClass} disabled:opacity-50 disabled:cursor-not-allowed text-base`}
        style={{ 
          width: '120px', 
          height: '120px',
          zIndex: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)' 
        }}
      >
        {isSpinning || isAnimating ? (
          <div className="flex flex-col items-center justify-center">
            <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mb-1"></span>
            <span className="text-xs">Đang quay...</span>
          </div>
        ) : (
          <span className="text-center">QUAY NGAY!</span>
        )}
      </button>
      
      <style jsx>{`
        .wheel-container.spinning .wheel-canvas {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
        }
      `}</style>
    </div>
  );
};

export default WheelComponent; 