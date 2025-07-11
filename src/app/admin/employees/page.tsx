'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { toast } from 'react-toastify';
import { FiEdit, FiPlusCircle, FiUpload, FiDownload, FiTrash2, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

import { getAllEmployees, importEmployeesFromExcel, deleteEmployee, deleteMultipleEmployees } from '@/lib/api';
import Pagination from '@/components/Pagination';

interface Employee {
  _id: string;
  employeeCode: string;
  name:string;
  email: string;
  phone: string;
  codeShop: string;
  machinesSold: number;
  remainingSpins: number;
  totalSpins: number;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for search inputs
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchMachinesSold, setSearchMachinesSold] = useState<number | null>(null);

  // State for applied filters
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterMachinesSold, setFilterMachinesSold] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage, filterKeyword, filterMachinesSold]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = selectedIds.length > 0 && selectedIds.length < employees.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds, employees]);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);
  
  const fetchEmployees = async (pageToFetch: number = 1) => {
    setIsLoading(true);
    try {
      const filters = {
        keyword: filterKeyword || undefined,
        machinesSold: filterMachinesSold === null ? undefined : filterMachinesSold,
      };
      const response = await getAllEmployees(pageToFetch, 10, filters.keyword, filters.machinesSold);
      const responseData = response.data;
      
      // Safeguard against unexpected API responses and use correct data structure
      setEmployees(responseData?.data || []);
      
      if (responseData && responseData.pagination) {
        setPagination({
          page: responseData.pagination.page,
          limit: responseData.pagination.limit,
          totalPages: responseData.pagination.totalPages,
          totalItems: responseData.pagination.totalItems,
          hasNextPage: responseData.pagination.hasNextPage,
          hasPrevPage: responseData.pagination.hasPrevPage,
        });
      } else {
        setPagination(null);
      }
      
      setSelectedIds([]);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
      setEmployees([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    setFilterKeyword(searchKeyword);
    setFilterMachinesSold(searchMachinesSold);
    setCurrentPage(1); 
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSearchMachinesSold(null);
    setFilterKeyword('');
    setFilterMachinesSold(null);
    if (currentPage !== 1) {
        setCurrentPage(1);
    }
  };

  const handleRowDoubleClick = (id: string) => {
    router.push(`/admin/employees/edit/${id}`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Vui lòng chọn file Excel có định dạng .xlsx hoặc .xls');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsImporting(true);
      const response = await importEmployeesFromExcel(file);
      const responseData = response.data;
      
      if (responseData.success) {
        const { total, created, updated, failed } = responseData.results;
        toast.success(`Import thành công: ${total} nhân viên (Tạo mới: ${created}, Cập nhật: ${updated}, Lỗi: ${failed})`);
        fetchEmployees(1);
      } else {
        toast.error(responseData.message || 'Có lỗi xảy ra khi import nhân viên');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi import nhân viên');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const templateUrl = '/templates/mau_nhap_nhan_vien.xlsx';
    const a = document.createElement('a');
    a.href = templateUrl;
    a.download = 'mau_nhap_nhan_vien.xlsx';
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" không?`)) {
      try {
        await deleteEmployee(id);
        toast.success(`Đã xóa nhân viên ${name}`);
        fetchEmployees(currentPage);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa nhân viên');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn không?`)) {
      try {
        await deleteMultipleEmployees(selectedIds);
        toast.success(`Đã xóa ${selectedIds.length} nhân viên.`);
        setSelectedIds([]);
        fetchEmployees(currentPage);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa các nhân viên đã chọn.');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = employees.map(emp => emp._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(prevId => prevId !== id));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Nhân viên</h1>
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiTrash2 className="mr-2" /> Xóa ({selectedIds.length})
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
            id="excel-upload"
          />

          <button
            onClick={handleDownloadTemplate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FiDownload className="mr-2" /> Tải mẫu
          </button>
          
          <label
            htmlFor="excel-upload"
            className={`bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center cursor-pointer transition-colors ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiUpload className="mr-2" /> {isImporting ? 'Đang import...' : 'Import Excel'}
          </label>
          
          <Link
            href="/admin/employees/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FiPlusCircle className="mr-2" /> Thêm mới
          </Link>
        </div>
      </div>

    <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Tìm theo mã, tên, email, SĐT..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
                <input
                    type="number"
                    placeholder="Số máy bán"
                    value={searchMachinesSold === null ? '' : searchMachinesSold}
                    onChange={(e) => setSearchMachinesSold(e.target.value === '' ? null : Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                    className="w-40 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
            </div>
            <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
                <FiSearch className="mr-2"/> Tìm kiếm
            </button>
            <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
                Đặt lại
            </button>
        </div>
    </div>
      
    {selectedIds.length > 0 && (
        <div className="flex justify-start items-center mb-4 -mt-2">
            <span className="ml-1 text-sm font-medium text-gray-700">{selectedIds.length} nhân viên được chọn</span>
        </div>
     )}

    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox"
                ref={selectAllCheckboxRef}
                checked={selectedIds.length === employees.length && employees.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã NV</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên Nhân viên</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Điện thoại</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã Shop</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Máy đã bán</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lượt quay còn lại</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng lượt quay</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={11} className="text-center py-10">
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-4">Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-10 text-gray-500">
                Không tìm thấy nhân viên nào.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr 
                key={employee._id}
                onDoubleClick={() => handleRowDoubleClick(employee._id)}
                className={`border-b border-gray-200 hover:bg-indigo-50 cursor-pointer ${selectedIds.includes(employee._id) ? 'bg-indigo-100' : ''}`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(employee._id)}
                    onChange={(e) => handleSelectOne(e, employee._id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employeeCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.codeShop}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{employee.machinesSold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold">{employee.remainingSpins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-semibold">{employee.totalSpins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(employee.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-4">
                    <Link href={`/admin/employees/edit/${employee._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <FiEdit title="Chỉnh sửa"/>
                    </Link>
                    <button
                      onClick={() => handleDeleteEmployee(employee._id, employee.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 title="Xóa"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    
    {pagination && pagination.totalPages > 1 && (
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    )}
  </div>
  );
} 