'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiPlusCircle, FiUpload, FiDownload, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';

import { getAllEmployees, importEmployeesFromExcel, deleteEmployee, deleteAllEmployees } from '@/lib/api';
import Pagination from '@/components/Pagination';

interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  useEffect(() => {
    fetchEmployees(pagination.page);
  }, []);
  
  const fetchEmployees = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await getAllEmployees(page, pagination.limit);
      
      if (response.data.success) {
        setEmployees(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        toast.error('Lỗi: Dữ liệu nhân viên trả về không đúng định dạng.');
        setEmployees([]);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchEmployees(newPage);
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
      
      if (response.data && response.data.success) {
        const { total, created, updated, failed } = response.data.results;
        toast.success(`Import thành công: ${total} nhân viên (Tạo mới: ${created}, Cập nhật: ${updated}, Lỗi: ${failed})`);
        
        fetchEmployees();
      } else {
        toast.error('Có lỗi xảy ra khi import nhân viên');
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
        // Tải lại dữ liệu trang hiện tại để cập nhật tổng số item
        fetchEmployees(pagination.page);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa nhân viên');
      }
    }
  };

  const handleDeleteAllEmployees = async () => {
    const confirmation = window.prompt('Hành động này không thể hoàn tác. Để xác nhận xóa TẤT CẢ nhân viên, vui lòng nhập "xóa tất cả" vào ô bên dưới:');
    if (confirmation === 'xóa tất cả') {
      try {
        await deleteAllEmployees();
        toast.success('Đã xóa tất cả nhân viên.');
        fetchEmployees(1); // Tải lại trang đầu tiên
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa tất cả nhân viên.');
      }
    } else if (confirmation !== null) { 
      toast.warn('Xác nhận không hợp lệ. Hành động đã bị hủy.');
    }
  };
  
  const filteredEmployees = searchTerm.trim() === '' 
    ? employees 
    : employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm) ||
        employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.codeShop && employee.codeShop.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Nhân viên</h1>
        <div className="flex space-x-2">
           <button
            onClick={handleDeleteAllEmployees}
            disabled={employees.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            <FiAlertTriangle className="mr-2" /> Xóa tất cả
          </button>

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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiDownload className="mr-2" /> Tải mẫu Excel
          </button>
          
          <label
            htmlFor="excel-upload"
            className={`bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiUpload className="mr-2" /> {isImporting ? 'Đang import...' : 'Import Excel'}
          </label>
          
          <Link
            href="/admin/employees/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlusCircle className="mr-2" /> Thêm nhân viên
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã, tên, email, SĐT, cửa hàng..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cửa hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số máy đã bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt quay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold">
                                {employee.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email} / {employee.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.employeeCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employee.codeShop || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {employee.machinesSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {employee.remainingSpins} / {employee.totalSpins}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(employee.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                           <Link
                            href={`/admin/employees/edit/${employee._id}`}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <FiEdit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEmployee(employee._id, employee.name)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm 
                          ? 'Không tìm thấy nhân viên phù hợp'
                          : 'Chưa có nhân viên nào'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="py-2">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 