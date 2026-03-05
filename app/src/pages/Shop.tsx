import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, Grid3X3, LayoutList, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  primaryImage: string;
  productType: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  category?: {
    name: string;
    slug: string;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filters, setFilters] = useState({
    productType: searchParams.get('productType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    
    const params = new URLSearchParams();
    params.append('page', searchParams.get('page') || '1');
    params.append('limit', '12');
    
    if (category) {
      params.append('category', category);
    }
    if (filters.productType) {
      params.append('productType', filters.productType);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (searchParams.get('featured') === 'true') {
      params.append('featured', 'true');
    }
    if (searchParams.get('newArrival') === 'true') {
      params.append('newArrival', 'true');
    }
    if (searchParams.get('search')) {
      params.append('search', searchParams.get('search')!);
    }
    
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);

    try {
      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, category, filters, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    if (filters.productType) {
      newParams.set('productType', filters.productType);
    } else {
      newParams.delete('productType');
    }
    
    if (filters.minPrice) {
      newParams.set('minPrice', filters.minPrice);
    } else {
      newParams.delete('minPrice');
    }
    
    if (filters.maxPrice) {
      newParams.set('maxPrice', filters.maxPrice);
    } else {
      newParams.delete('maxPrice');
    }
    
    newParams.set('sortBy', filters.sortBy);
    newParams.set('sortOrder', filters.sortOrder);
    newParams.set('page', '1');
    
    setSearchParams(newParams);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      productType: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
    setSearchParams(new URLSearchParams());
  };

  const getPageTitle = () => {
    if (searchParams.get('featured') === 'true') return 'Featured Products';
    if (searchParams.get('newArrival') === 'true') return 'New Arrivals';
    if (category === 'round-neck-shirts') return 'Round Neck Shirts';
    if (category === 'sleeveless-shirts') return 'Sleeveless Shirts';
    if (searchParams.get('search')) return `Search: "${searchParams.get('search')}"`;
    return 'All Products';
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{getPageTitle()}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-display">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-2">
            {pagination.total} products found
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${isFilterOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : 'hidden lg:block'}`}>
            {isFilterOpen && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Product Type */}
              <div>
                <h3 className="font-semibold mb-3">Product Type</h3>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'All Types' },
                    { value: 'round-neck', label: 'Round Neck' },
                    { value: 'sleeveless', label: 'Sleeveless' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        value={type.value}
                        checked={filters.productType === type.value}
                        onChange={(e) => handleFilterChange('productType', e.target.value)}
                        className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-3">Sort By</h3>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="created_at-DESC">Newest First</option>
                  <option value="created_at-ASC">Oldest First</option>
                  <option value="price-ASC">Price: Low to High</option>
                  <option value="price-DESC">Price: High to Low</option>
                  <option value="name-ASC">Name: A to Z</option>
                </select>
              </div>

              <button
                onClick={applyFilters}
                className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Apply Filters
              </button>
              
              <button
                onClick={clearFilters}
                className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Filter size={18} />
                Filters
              </button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  Showing {products.length} of {pagination.total} products
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', page.toString());
                    setSearchParams(newParams);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
