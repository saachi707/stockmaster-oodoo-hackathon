import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StockMasterSidebar from "../../components/StockMasterSidebar";
import StockMasterHeader from "../../components/StockMasterHeader";
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Edit3,
  X,
  Loader2,
} from "lucide-react";

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unitOfMeasure: "",
    minStockLevel: "",
    description: "",
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", searchQuery, showLowStock, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (showLowStock) params.append("lowStock", "true");
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setShowAddModal(false);
      setNewProduct({
        name: "",
        sku: "",
        categoryId: "",
        unitOfMeasure: "",
        minStockLevel: "",
        description: "",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.unitOfMeasure) {
      alert("Please fill in all required fields");
      return;
    }

    createProductMutation.mutate({
      name: newProduct.name,
      sku: newProduct.sku,
      categoryId: newProduct.categoryId
        ? parseInt(newProduct.categoryId)
        : null,
      unitOfMeasure: newProduct.unitOfMeasure,
      minStockLevel: parseInt(newProduct.minStockLevel) || 0,
      description: newProduct.description || null,
    });
  };

  const getStockStatusColor = (isLowStock, totalStock) => {
    if (totalStock === 0) return "text-red-600 dark:text-red-400";
    if (isLowStock) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getStockStatusIcon = (isLowStock, totalStock) => {
    if (totalStock === 0) return <X size={16} />;
    if (isLowStock) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className="flex h-screen bg-[#F3F3F3] dark:bg-[#0A0A0A]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}
      >
        <StockMasterSidebar
          onClose={() => setSidebarOpen(false)}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <StockMasterHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Products"
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white font-sora mb-2">
                Product Catalog
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 font-inter">
                Manage your product inventory and stock levels
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold font-inter"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search products or SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Low Stock Toggle */}
              <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer min-w-fit">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-black dark:text-white font-inter text-sm">
                  Low Stock Only
                </span>
              </label>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Stock Level
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Min Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {productsLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Package
                          size={48}
                          className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                        />
                        <p className="text-gray-500 dark:text-gray-400 font-inter">
                          {searchQuery || showLowStock || selectedCategory
                            ? "No products match your filters"
                            : "No products found. Add your first product to get started."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-black dark:text-white font-inter">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                              {product.description || "No description"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100 font-inter">
                            {product.category_name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-black dark:text-white font-inter">
                            {parseInt(product.total_stock)}{" "}
                            {product.unit_of_measure}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {product.min_stock_level} {product.unit_of_measure}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center gap-2 ${getStockStatusColor(product.is_low_stock, parseInt(product.total_stock))}`}
                          >
                            {getStockStatusIcon(
                              product.is_low_stock,
                              parseInt(product.total_stock),
                            )}
                            <span className="text-sm font-medium font-inter">
                              {parseInt(product.total_stock) === 0
                                ? "Out of Stock"
                                : product.is_low_stock
                                  ? "Low Stock"
                                  : "In Stock"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Edit3 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-black dark:text-white font-sora">
                  Add New Product
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    SKU/Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-mono"
                    placeholder="Enter unique SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Category
                  </label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.unitOfMeasure}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        unitOfMeasure: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="e.g., pcs, kg, liters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.minStockLevel}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        minStockLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="Optional product description"
                    rows="3"
                  />
                </div>

                {createProductMutation.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                      {createProductMutation.error.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold font-inter"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProductMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-semibold font-inter"
                  >
                    {createProductMutation.isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
