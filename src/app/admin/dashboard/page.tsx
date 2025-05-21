'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUsers, FiGift, FiPieChart, FiTarget, FiCalendar, FiRefreshCw, FiFilter, FiDownload } from 'react-icons/fi';

import { getSpinStats, getAllUsers, getAllPrizes } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [usersCount, setUsersCount] = useState(0);
  const [prizesCount, setPrizesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, usersResponse, prizesResponse] = await Promise.all([
          getSpinStats(dateRange.startDate ? dateRange : undefined),
          getAllUsers(1, 10),
          getAllPrizes(),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (usersResponse.data.success) {
          setUsersCount(usersResponse.data.pagination.totalItems || 0);
        }

        if (prizesResponse.data.success) {
          setPrizesCount(prizesResponse.data.count);
        }
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const resetDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Tổng quan về hoạt động vòng quay may mắn" 
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <FiCalendar className="mr-2 text-indigo-500" /> 
              Lọc theo ngày
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="admin-date-picker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="admin-date-picker"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetDateRange}
              className="admin-btn-secondary"
            >
              <FiRefreshCw className="mr-2" /> Đặt lại
            </button>
            <button className="admin-btn-secondary">
              <FiFilter className="mr-2" /> Lọc
            </button>
            <button className="admin-btn-secondary">
              <FiDownload className="mr-2" /> Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Spins */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center border border-gray-100 transition-all hover:shadow-md">
          <div className="p-3 rounded-full bg-blue-100 mr-4 flex items-center justify-center">
            <FiPieChart className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tổng lượt quay</p>
            <p className="text-xl font-bold text-gray-800">{stats?.totalSpins || 0}</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center border border-gray-100 transition-all hover:shadow-md">
          <div className="p-3 rounded-full bg-green-100 mr-4 flex items-center justify-center">
            <FiTarget className="text-green-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tỉ lệ trúng</p>
            <p className="text-xl font-bold text-gray-800">{stats?.winRate || 0}%</p>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center border border-gray-100 transition-all hover:shadow-md">
          <div className="p-3 rounded-full bg-purple-100 mr-4 flex items-center justify-center">
            <FiUsers className="text-purple-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Người chơi</p>
            <div className="flex items-baseline">
              <p className="text-xl font-bold text-gray-800">{usersCount}</p>
              
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center border border-gray-100 transition-all hover:shadow-md">
          <div className="p-3 rounded-full bg-amber-100 mr-4 flex items-center justify-center">
            <FiGift className="text-amber-600 text-xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phần thưởng</p>
            <p className="text-xl font-bold text-gray-800">{prizesCount}</p>
          </div>
        </div>
      </div>

      {/* Prize Stats */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-lg font-semibold mb-5 flex items-center text-gray-800">
          <FiGift className="mr-2 text-indigo-500" />
          Thống kê phần thưởng
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                  Tên phần thưởng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Số lượng trúng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Số lượng gốc
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Số lượng còn lại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                  Tỉ lệ (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.prizeStats?.length > 0 ? (
                stats.prizeStats.map((prize: any) => (
                  <tr key={prize._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {prize.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {prize.count}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {prize.originalQuantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {prize.remainingQuantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="inline-flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(((prize.count / (stats.totalWins || 1)) * 100), 100)}%` }}
                          ></div>
                        </div>
                        {((prize.count / (stats.totalWins || 1)) * 100).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-4">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 