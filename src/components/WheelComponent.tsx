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
  isRealPrize?: boolean;
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
  width = 600,
  height = 600,
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

  useEffect(() => {
    if (isSpinning) {
      setSpinButtonClass('animate-pulse shadow-lg');
    } else {
      setSpinButtonClass('transform hover:scale-105 transition-transform shadow-lg');
    }
  }, [isSpinning]);
  
  useEffect(() => {
    if (selectedPrize && isSpinning && !isAnimating) {
      startAnimation();
    }
  }, [selectedPrize, isSpinning]);
  
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

  const getContrastTextColor = (bgColor: string) => {
    const r = parseInt(bgColor.substring(1, 3), 16);
    const g = parseInt(bgColor.substring(3, 5), 16);
    const b = parseInt(bgColor.substring(5, 7), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    xAnchor: number,
    yCenter: number,
    maxWidthPerLine: number,
    lineHeight: number,
    textAlign: 'left' | 'right' | 'center'
  ) => {
    const words = text.split(' ');
    let currentLine = '';
    const linesToRender: string[] = [];

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidthPerLine && currentLine) {
        linesToRender.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    linesToRender.push(currentLine.trim());

    const numLines = linesToRender.length;

    linesToRender.forEach((lineText, index) => {
      const lineY = yCenter + (index - (numLines - 1) / 2) * lineHeight;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';
      ctx.fillText(lineText, xAnchor, lineY);
    });
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40; 
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#6C6C6C';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    const outerGradient = ctx.createLinearGradient(0, 0, width, height);
    outerGradient.addColorStop(0, '#f9a8d4');
    outerGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    prizes.forEach((prize, index) => {
      const angle = startAngle + index * arc;
      const colors = getSegmentColors(index);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, colors.bg);
      gradient.addColorStop(1, colors.bg);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      
      let displayName = prize.name;
      
      const textRadius = radius - 35; // Adjusted for potentially more lines
      const lineHeight = fontSize * 1.2; // fontSize is default 15px
      const maxLineWidth = textRadius - 75; // Max width for a single line radially

      const textColor = colors.text;
      ctx.fillStyle = textColor;
      
      ctx.font = `bold ${fontSize}px 'Montserrat', Arial, sans-serif`;
      

      const currentAngleNormalized = (angle + arc / 2) % (2 * Math.PI);
      const isUpsideDown = currentAngleNormalized > Math.PI / 2 && currentAngleNormalized < Math.PI * 3 / 2;
      
      if (isUpsideDown) {
        ctx.rotate(Math.PI);
        wrapText(ctx, displayName, -textRadius, 0, maxLineWidth, lineHeight, 'left');
      } else {
        wrapText(ctx, displayName, textRadius, 0, maxLineWidth, lineHeight, 'right');
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
    
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 5, centerY);
    ctx.lineTo(centerX + radius + 25, centerY - 15);
    ctx.lineTo(centerX + radius + 25, centerY + 15);
    ctx.closePath();
    
    const arrowGradient = ctx.createLinearGradient(
      centerX + radius + 5, centerY,
      centerX + radius + 25, centerY
    );
    arrowGradient.addColorStop(0, '#ef4444');
    arrowGradient.addColorStop(1, '#b91c1c');
    
    ctx.fillStyle = arrowGradient;
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
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


  const handleSpinClick = () => {
    if (isSpinning || isAnimating || prizes.length === 0) return;
    
    if (onSpin) {
      onSpin();
    } else {
      startAnimation();
    }
  };

  const startAnimation = () => {
    if (isAnimating || prizes.length === 0) return;
    
    setIsAnimating(true);

    playTickSound();
    

    const spinDuration = spinningTime;
    const fullRotations = 10;
    
    let finalAngle = 0;
    
    if (selectedPrize) {
      const selectedIndex = prizes.findIndex(prize => prize._id === selectedPrize._id);
      if (selectedIndex >= 0) {
        const prizeAngle = selectedIndex * arc + arc / 2;
        
        finalAngle = 2 * Math.PI - prizeAngle;
      }
    } else {
      finalAngle = Math.random() * 2 * Math.PI;
    }
    
    const initialAngle = startAngle % (2 * Math.PI);
    
    const totalRotationAngle = fullRotations * 2 * Math.PI + finalAngle - initialAngle;
    
    const startTime = performance.now();
    
    if (wheelContainerRef.current) {
      wheelContainerRef.current.classList.add('spinning');
    }
    
    const animateFrame = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      
      const progress = Math.min(elapsedTime / spinDuration, 1);
      
      const easeOutExpo = (t: number) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };
      
      const currentRotation = initialAngle + totalRotationAngle * easeOutExpo(progress);
      
      setStartAngle(currentRotation);
      
      if (progress < 0.9 && Math.random() > 0.95) {
        playTickSound(Math.min(0.3, (1 - progress) * 0.5));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        if (wheelContainerRef.current) {
          wheelContainerRef.current.classList.remove('spinning');
        }
        
        setIsAnimating(false);
        setTimeout(() => {

          playWinSound();
          

          const finalPosition = currentRotation % (2 * Math.PI);

          const normalizedPosition = (2 * Math.PI - finalPosition) % (2 * Math.PI);
          let winningIndex = Math.floor(normalizedPosition / arc);

          const angleWithinSegment = normalizedPosition % arc;
          const distanceToSegmentBoundary = Math.min(angleWithinSegment, arc - angleWithinSegment);
          
          if (distanceToSegmentBoundary < (5 * Math.PI / 180)) {
            const nearestSegmentCenter = Math.round(normalizedPosition / arc) * arc + arc / 2;
            const adjustment = nearestSegmentCenter - normalizedPosition;
            
            setStartAngle(currentRotation + adjustment * 0.5);
            winningIndex = Math.floor((nearestSegmentCenter % (2 * Math.PI)) / arc);
          }
          
          winningIndex = winningIndex % prizes.length;
          
          let finalPrize: Prize;
          
          if (selectedPrize) {
            finalPrize = selectedPrize;
          } else if (winningIndex >= 0 && winningIndex < prizes.length) {
            finalPrize = prizes[winningIndex];
          } else {
            finalPrize = prizes[0];
          }
          
          // Hiệu ứng confetti cho các giải thưởng lớn
          if (finalPrize.name.includes('000')) {
            triggerConfetti();
          }
          

          onFinished(finalPrize);
        }, 200); 
      }
    };
    
    // Bắt đầu animation
    requestAnimationFrame(animateFrame);
  };

  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };


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