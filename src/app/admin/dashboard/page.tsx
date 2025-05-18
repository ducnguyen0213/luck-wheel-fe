'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUsers, FiGift, FiPieChart, FiTarget } from 'react-icons/fi';

import { getSpinStats, getAllUsers, getAllPrizes } from '@/lib/api';

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
          getAllUsers(),
          getAllPrizes(),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (usersResponse.data.success) {
          setUsersCount(usersResponse.data.count);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Lọc theo ngày</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetDateRange}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Spins */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <FiPieChart className="text-blue-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tổng lượt quay</p>
            <p className="text-2xl font-bold">{stats?.totalSpins || 0}</p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <FiTarget className="text-green-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Tỉ lệ trúng</p>
            <p className="text-2xl font-bold">{stats?.winRate || 0}%</p>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <FiUsers className="text-purple-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Người chơi</p>
            <p className="text-2xl font-bold">{usersCount}</p>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 mr-4">
            <FiGift className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phần thưởng</p>
            <p className="text-2xl font-bold">{prizesCount}</p>
          </div>
        </div>
      </div>

      {/* Prize Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Thống kê phần thưởng</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên phần thưởng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng trúng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng gốc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng còn lại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỉ lệ (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.prizeStats?.length > 0 ? (
                stats.prizeStats.map((prize: any) => (
                  <tr key={prize._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prize.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prize.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prize.originalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prize.remainingQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((prize.count / (stats.totalWins || 1)) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
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