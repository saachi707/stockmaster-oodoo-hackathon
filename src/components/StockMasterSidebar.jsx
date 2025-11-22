import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  TruckIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  ClipboardCheck,
  Settings,
  ChevronDown,
  Users,
} from "lucide-react";

export default function StockMasterSidebar({
  onClose,
  activeItem,
  setActiveItem,
}) {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (item) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleItemClick = (itemName, hasSubmenu, route) => {
    setActiveItem(itemName);
    if (hasSubmenu) {
      toggleSubmenu(itemName);
    } else if (route) {
      // Navigate to route
      window.location.href = route;
    }
    // Close sidebar on mobile when item is clicked
    if (onClose && typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      hasSubmenu: false,
      route: "/",
    },
    {
      name: "Products",
      icon: Package,
      hasSubmenu: false,
      route: "/products",
    },
    {
      name: "Operations",
      icon: TruckIcon,
      hasSubmenu: true,
      submenu: [
        { name: "Receipts", icon: ArrowDownCircle, route: "/receipts" },
        { name: "Deliveries", icon: ArrowUpCircle, route: "/deliveries" },
        { name: "Transfers", icon: ArrowRightLeft, route: "/transfers" },
      ],
    },
    {
      name: "Adjustments",
      icon: ClipboardCheck,
      hasSubmenu: false,
      route: "/adjustments",
    },
    {
      name: "Users",
      icon: Users,
      hasSubmenu: false,
      route: "/users",
    },
    {
      name: "Settings",
      icon: Settings,
      hasSubmenu: false,
      route: "/settings",
    },
  ];

  return (
    <div className="w-60 bg-[#F3F3F3] dark:bg-[#1A1A1A] flex-shrink-0 flex flex-col h-full">
      {/* Brand Logo */}
      <div className="p-4 flex justify-start">
        <div className="w-12 h-12 bg-white dark:bg-[#262626] rounded-full border border-[#E4E4E4] dark:border-[#404040] flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm font-plus-jakarta">
              SM
            </span>
          </div>
        </div>
        <div className="ml-3 flex flex-col justify-center">
          <h1 className="font-bold text-lg text-black dark:text-white font-sora">
            StockMaster
          </h1>
          <p className="text-xs text-black/60 dark:text-white/60 font-inter">
            Pro IMS
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            const isExpanded = expandedMenus[item.name];

            return (
              <div key={item.name}>
                <button
                  onClick={() =>
                    handleItemClick(item.name, item.hasSubmenu, item.route)
                  }
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white dark:bg-[#262626] border border-[#E4E4E4] dark:border-[#404040] text-black dark:text-white"
                      : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 active:bg-white/70 dark:active:bg-white/15 active:scale-[0.98]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-black dark:text-white"
                          : "text-black/70 dark:text-white/70"
                      }
                    />
                    <span
                      className={`font-medium text-sm font-plus-jakarta ${
                        isActive
                          ? "text-black dark:text-white"
                          : "text-black/70 dark:text-white/70"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  {item.hasSubmenu && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      } ${isActive ? "text-black dark:text-white" : "text-black/70 dark:text-white/70"}`}
                    />
                  )}
                </button>

                {/* Submenu */}
                {item.hasSubmenu && isExpanded && item.submenu && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <button
                          key={subItem.name}
                          onClick={() => (window.location.href = subItem.route)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-150 font-plus-jakarta text-sm"
                        >
                          <SubIcon size={16} />
                          <span>{subItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="text-xs text-black/40 dark:text-white/40 text-center font-inter">
          v1.0.0 • StockMaster Pro
        </div>
      </div>
    </div>
  );
}
