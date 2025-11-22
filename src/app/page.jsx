import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StockMasterSidebar from "../components/StockMasterSidebar";
import StockMasterHeader from "../components/StockMasterHeader";
import {
  Package,
  AlertTriangle,
  TruckIcon,
  ArrowUpCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Fetch dashboard statistics
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const kpis = [
    {
      title: "Total Products in Stock",
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: "+12.5%",
      trendUp: true,
      color: "blue",
      description: "Active inventory items",
    },
    {
      title: "Low Stock / Out of Stock",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      trend: "-8.2%",
      trendUp: false,
      color: "red",
      description: "Items needing reorder",
    },
    {
      title: "Pending Receipts",
      value: stats?.pendingReceipts || 0,
      icon: ArrowUpCircle,
      trend: "+4.1%",
      trendUp: true,
      color: "green",
      description: "Awaiting validation",
    },
    {
      title: "Pending Deliveries",
      value: stats?.pendingDeliveries || 0,
      icon: TruckIcon,
      trend: "+15.3%",
      trendUp: true,
      color: "purple",
      description: "Ready for shipment",
    },
  ];

  const getCardStyles = (color) => {
    const styles = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        text: "text-blue-800 dark:text-blue-300",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        text: "text-red-800 dark:text-red-300",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-800 dark:text-green-300",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
        text: "text-purple-800 dark:text-purple-300",
      },
    };
    return styles[color] || styles.blue;
  };

  if (error) {
    console.error("Dashboard error:", error);
  }

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
          title="Dashboard"
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white font-sora mb-2">
              Inventory Overview
            </h2>
            <p className="text-lg text-black/60 dark:text-white/60 font-inter">
              Real-time snapshot of your inventory health and operations
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              const styles = getCardStyles(kpi.color);
              const TrendIcon = kpi.trendUp ? TrendingUp : TrendingDown;

              return (
                <div
                  key={index}
                  className={`${styles.bg} ${styles.border} border rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon size={24} className={styles.icon} />
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                        kpi.trendUp
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <TrendIcon
                        size={12}
                        className={
                          kpi.trendUp
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      />
                      <span
                        className={`text-xs font-semibold ${
                          kpi.trendUp
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {kpi.trend}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3
                      className={`text-sm font-semibold ${styles.text} mb-1 font-inter`}
                    >
                      {kpi.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold text-black dark:text-white font-sora">
                          {kpi.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-black/50 dark:text-white/50 font-inter">
                    {kpi.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
            <h3 className="text-xl font-semibold text-black dark:text-white font-sora mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <Package
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
              />
              <p className="text-gray-500 dark:text-gray-400 font-inter">
                Activity tracking coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
