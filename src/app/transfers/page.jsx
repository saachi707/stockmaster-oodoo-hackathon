import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StockMasterSidebar from "../../components/StockMasterSidebar";
import StockMasterHeader from "../../components/StockMasterHeader";
import {
  ArrowRightLeft,
  Plus,
  Search,
  Package,
  X,
  Loader2,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function TransfersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Operations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  // Form state for new transfer
  const [newTransfer, setNewTransfer] = useState({
    fromLocationId: "",
    toLocationId: "",
    notes: "",
    items: [{ productId: "", quantity: "", notes: "" }],
  });

  // Fetch transfers
  const { data: transfers = [], isLoading: transfersLoading } = useQuery({
    queryKey: ["transfers", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/transfers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transfers");
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

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: async (transferData) => {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...transferData,
          created_by: "Current User", // In real app, get from auth
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transfer");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      setShowAddModal(false);
      setNewTransfer({
        fromLocationId: "",
        toLocationId: "",
        notes: "",
        items: [{ productId: "", quantity: "", notes: "" }],
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newTransfer.fromLocationId || !newTransfer.toLocationId) {
      alert("From and to locations are required");
      return;
    }

    if (newTransfer.fromLocationId === newTransfer.toLocationId) {
      alert("From and to locations cannot be the same");
      return;
    }

    const validItems = newTransfer.items.filter(
      (item) => item.productId && item.quantity,
    );

    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const transferData = {
      from_location_id: parseInt(newTransfer.fromLocationId),
      to_location_id: parseInt(newTransfer.toLocationId),
      notes: newTransfer.notes,
      items: validItems.map((item) => ({
        product_id: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        notes: item.notes,
      })),
    };

    createTransferMutation.mutate(transferData);
  };

  const addItem = () => {
    setNewTransfer((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: "", notes: "" }],
    }));
  };

  const removeItem = (index) => {
    setNewTransfer((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setNewTransfer((prev) => ({
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
      in_transit: {
        icon: ArrowRightLeft,
        color:
          "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
      },
      completed: {
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
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.transfer_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (transfer.from_location_name &&
        transfer.from_location_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (transfer.to_location_name &&
        transfer.to_location_name
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
          title="Transfer Management"
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white font-sora mb-2">
                Internal Transfers
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 font-inter">
                Transfer inventory between warehouse locations
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold font-inter"
            >
              <Plus size={20} />
              Create Transfer
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
                  placeholder="Search transfer numbers or locations..."
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
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Transfer #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Route
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 font-inter">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transfersLoading ? (
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
                  ) : filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <ArrowRightLeft
                          size={48}
                          className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                        />
                        <p className="text-gray-500 dark:text-gray-400 font-inter">
                          {searchQuery || statusFilter
                            ? "No transfers match your filters"
                            : "No transfers found. Create your first transfer to get started."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((transfer) => (
                      <tr
                        key={transfer.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-black dark:text-white font-mono">
                            {transfer.transfer_number}
                          </div>
                          {transfer.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                              {transfer.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-inter">
                              {transfer.from_location_name || "Unknown"}
                            </span>
                            <ArrowRight size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-inter">
                              {transfer.to_location_name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-black dark:text-white font-inter">
                            {transfer.item_count || 0} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {new Date(transfer.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                            {transfer.created_by || "Unknown"}
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

      {/* Add Transfer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-black dark:text-white font-sora">
                  Create New Transfer
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
                      From Location *
                    </label>
                    <select
                      required
                      value={newTransfer.fromLocationId}
                      onChange={(e) =>
                        setNewTransfer({
                          ...newTransfer,
                          fromLocationId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    >
                      <option value="">Select from location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                      To Location *
                    </label>
                    <select
                      required
                      value={newTransfer.toLocationId}
                      onChange={(e) =>
                        setNewTransfer({
                          ...newTransfer,
                          toLocationId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    >
                      <option value="">Select to location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-inter">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={newTransfer.notes}
                    onChange={(e) =>
                      setNewTransfer({ ...newTransfer, notes: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                    placeholder="Optional transfer notes"
                  />
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-black dark:text-white font-inter">
                      Items to Transfer
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
                    {newTransfer.items.map((item, index) => (
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

                        <div className="w-32">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(index, "quantity", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-inter"
                            placeholder="Qty"
                          />
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) =>
                              updateItem(index, "notes", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm font-inter"
                            placeholder="Item notes (optional)"
                          />
                        </div>

                        {newTransfer.items.length > 1 && (
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

                {createTransferMutation.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400 font-inter">
                      {createTransferMutation.error.message}
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
                    disabled={createTransferMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-semibold font-inter"
                  >
                    {createTransferMutation.isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Transfer"
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
