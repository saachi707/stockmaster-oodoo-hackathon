import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StockMasterSidebar from "../../components/StockMasterSidebar";
import StockMasterHeader from "../../components/StockMasterHeader";
import {
  ArrowUpCircle,
  Plus,
  Search,
  Package,
  X,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";

export default function DeliveriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Operations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  // Form state for new delivery order
  const [newDelivery, setNewDelivery] = useState({
    salesOrderId: "",
    customerName: "",
    shippingAddress: "",
    notes: "",
    items: [{ productId: "", locationId: "", quantityRequested: "" }],
  });

  // Fetch delivery orders
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery({
    queryKey: ["deliveries", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/deliveries?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch delivery orders");
      }
      return response.json();
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      return response.json();
    },
  });

  // Create delivery order mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async (deliveryData) => {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deliveryData,
          created_by: "Current User", // In real app, get from auth
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create delivery order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      setShowAddModal(false);
      setNewDelivery({
        salesOrderId: "",
        customerName: "",
        shippingAddress: "",
        notes: "",
        items: [{ productId: "", locationId: "", quantityRequested: "" }],
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newDelivery.customerName) {
      alert("Customer name is required");
      return;
    }

    const validItems = newDelivery.items.filter(
      (item) => item.productId && item.locationId && item.quantityRequested,
    );

    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const deliveryData = {
      sales_order_id: newDelivery.salesOrderId || null,
      customer_name: newDelivery.customerName,
      shipping_address: newDelivery.shippingAddress || null,
      notes: newDelivery.notes,
      items: validItems.map((item) => ({
        product_id: parseInt(item.productId),
        location_id: parseInt(item.locationId),
        quantity_requested: parseInt(item.quantityRequested),
      })),
    };

    createDeliveryMutation.mutate(deliveryData);
  };

  const addItem = () => {
    setNewDelivery((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", locationId: "", quantityRequested: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    setNewDelivery((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setNewDelivery((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        icon: Clock,
        color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
      },
      picking: {
        icon: Package,
        color:
          "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
      },
      packing: {
        icon: Package,
        color:
          "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
      },
      shipped: {
        icon: Truck,
        color:
          "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
      },
      delivered: {
        icon: CheckCircle,
        color:
          "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (delivery.sales_order_id &&
        delivery.sales_order_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  );

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
          title="Delivery Management"
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white font-sora mb-2">
                Delivery Orders
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 font-inter">
                Manage outbound shipments and customer deliveries
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold font-inter"
            >
              <Plus size={20} />
              Create Delivery Order
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
                  placeholder="Search order numbers, customers, or sales orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter min-w-[200px]"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="picking">Picking</option>
                <option value="packing">Packing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Delivery Orders Table */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Order #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Sales Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {deliveriesLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <ArrowUpCircle
                          size={48}
                          className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                        />
                        <p className="text-gray-500 dark:text-gray-400 font-inter">
                          {searchQuery || statusFilter
                            ? "No delivery orders match your filters"
                            : "No delivery orders found. Create your first delivery order to get started."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <tr
                        key={delivery.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-black dark:text-white font-mono">
                            {delivery.order_number}
                          </div>
                          {delivery.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                              {delivery.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-inter font-semibold">
                            {delivery.customer_name}
                          </div>
                          {delivery.shipping_address && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                              {delivery.shipping_address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {delivery.sales_order_id || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-black dark:text-white font-inter">
                            {delivery.item_count || 0} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(delivery.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {new Date(delivery.created_at).toLocaleDateString()}
                          </span>
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

      {/* Add Delivery Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-black dark:text-white font-sora">
                  Create New Delivery Order
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDelivery.customerName}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                      Sales Order ID
                    </label>
                    <input
                      type="text"
                      value={newDelivery.salesOrderId}
                      onChange={(e) =>
                        setNewDelivery({
                          ...newDelivery,
                          salesOrderId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                      placeholder="Optional sales order reference"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Shipping Address
                  </label>
                  <textarea
                    value={newDelivery.shippingAddress}
                    onChange={(e) =>
                      setNewDelivery({
                        ...newDelivery,
                        shippingAddress: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="Enter shipping address"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={newDelivery.notes}
                    onChange={(e) =>
                      setNewDelivery({ ...newDelivery, notes: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="Optional notes"
                  />
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-black dark:text-white font-inter">
                      Items to Ship
                    </h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-inter"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {newDelivery.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              updateItem(index, "productId", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-inter"
                          >
                            <option value="">Select product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <select
                            value={item.locationId}
                            onChange={(e) =>
                              updateItem(index, "locationId", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-inter"
                          >
                            <option value="">Select location</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-32">
                          <input
                            type="number"
                            min="1"
                            value={item.quantityRequested}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantityRequested",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-inter"
                            placeholder="Qty"
                          />
                        </div>

                        {newDelivery.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {createDeliveryMutation.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                      {createDeliveryMutation.error.message}
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
                    disabled={createDeliveryMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-semibold font-inter"
                  >
                    {createDeliveryMutation.isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Delivery Order"
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
