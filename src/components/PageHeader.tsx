'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

interface PageHeaderProps {
  title: string;
  description?: string;
  showSearch?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showSearch = true,
}) => {
  const pathname = usePathname();
  
  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const paths = pathname?.split('/').filter(Boolean) || [];
    
    if (!paths.length) return [];
    
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      
      return { href, label };
    });
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex text-sm text-gray-500 mb-4">
          <Link href="/admin/dashboard" className="hover:text-gray-700">
            Trang chủ
          </Link>
          
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              <FiChevronRight className="mx-2 text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-gray-700">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <div className="mt-1 text-sm text-gray-500">{description}</div>
          )}
        </div>

        {showSearch && (
          <div className="mt-4 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 