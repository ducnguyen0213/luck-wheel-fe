'use client';

import { FC } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Xác định số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Số trang tối đa hiển thị
    
    // Xác định trang bắt đầu và kết thúc để hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return { pages, startPage, endPage };
  };

  if (totalPages <= 1) return null;

  const { pages: pageNumbers, startPage, endPage } = getPageNumbers();
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="flex flex-col items-center mt-6 mb-4">
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">{totalItems}</span> mục | Hiển thị{' '}
          <span className="font-semibold">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>{' '}
          đến{' '}
          <span className="font-semibold">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>
        </div>
      )}
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-100'
          } px-3 py-2 rounded-md flex items-center text-indigo-700 transition-colors`}
          aria-label="Trang trước"
        >
          <IoChevronBack className="h-5 w-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={`${
                currentPage === 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100'
              } px-3 py-1 rounded-md transition-colors`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 py-1 text-gray-500">...</span>
            )}
          </>
        )}
        
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${
              currentPage === page
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 hover:bg-indigo-100'
            } px-3 py-1 rounded-md transition-colors`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 py-1 text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`${
                currentPage === totalPages ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100'
              } px-3 py-1 rounded-md transition-colors`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-100'
          } px-3 py-2 rounded-md flex items-center text-indigo-700 transition-colors`}
          aria-label="Trang kế tiếp"
        >
          <IoChevronForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 