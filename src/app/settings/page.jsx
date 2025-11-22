import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StockMasterSidebar from "../../components/StockMasterSidebar";
import StockMasterHeader from "../../components/StockMasterHeader";
import {
  Settings,
  Save,
  Loader2,
  CheckCircle,
  Bell,
  Globe,
  Shield,
  Palette,
  Database,
} from "lucide-react";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Settings");
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  // Local state for settings form
  const [formSettings, setFormSettings] = useState({
    app_name: "",
    preferences: {
      default_location_id: "",
      currency: "USD",
      timezone: "UTC",
      date_format: "MM/DD/YYYY",
    },
    notifications: {
      email_alerts: true,
      push_notifications: false,
      low_stock_threshold: 10,
    },
    features: {
      barcode_scanning: true,
      low_stock_alerts: true,
      multi_location: true,
      reports: true,
    },
  });

  // Update form settings when data loads
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormSettings({
        app_name: settings.app_name || "",
        preferences: {
          default_location_id: settings.preferences?.default_location_id || "",
          currency: settings.preferences?.currency || "USD",
          timezone: settings.preferences?.timezone || "UTC",
          date_format: settings.preferences?.date_format || "MM/DD/YYYY",
        },
        notifications: {
          email_alerts: settings.notifications?.email_alerts ?? true,
          push_notifications:
            settings.notifications?.push_notifications ?? false,
          low_stock_threshold:
            settings.notifications?.low_stock_threshold || 10,
        },
        features: {
          barcode_scanning: settings.features?.barcode_scanning ?? true,
          low_stock_alerts: settings.features?.low_stock_alerts ?? true,
          multi_location: settings.features?.multi_location ?? true,
          reports: settings.features?.reports ?? true,
        },
      });
    }
  }, [settings]);

  // Fetch locations for default location dropdown
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

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData) => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formSettings);
  };

  const updateFormSetting = (path, value) => {
    setFormSettings((prev) => {
      const newSettings = { ...prev };
      const keys = path.split(".");
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "features", label: "Features", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Database },
  ];

  const currencyOptions = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
  ];

  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
  ];

  const dateFormatOptions = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

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
          title="System Settings"
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white font-sora mb-2">
                Settings
              </h2>
              <p className="text-lg text-black/60 dark:text-white/60 font-inter">
                Configure your StockMaster Pro preferences and settings
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={updateSettingsMutation.isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-semibold font-inter"
            >
              {updateSettingsMutation.isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {updateSettingsMutation.isSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
              <CheckCircle
                size={20}
                className="text-green-600 dark:text-green-400"
              />
              <span className="text-green-800 dark:text-green-300 font-inter">
                Settings saved successfully!
              </span>
            </div>
          )}

          {updateSettingsMutation.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 font-inter">
                {updateSettingsMutation.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-inter ${
                          activeTab === tab.id
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#E6E6E6] dark:border-[#333333] p-6">
                {settingsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    {activeTab === "general" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white font-inter mb-4">
                            General Preferences
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
                                Application Name
                              </label>
                              <input
                                type="text"
                                value={formSettings.app_name}
                                onChange={(e) =>
                                  updateFormSetting("app_name", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                                placeholder="StockMaster Pro"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
                                Default Location
                              </label>
                              <select
                                value={
                                  formSettings.preferences.default_location_id
                                }
                                onChange={(e) =>
                                  updateFormSetting(
                                    "preferences.default_location_id",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                              >
                                <option value="">No default</option>
                                {locations.map((location) => (
                                  <option key={location.id} value={location.id}>
                                    {location.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
                                Currency
                              </label>
                              <select
                                value={formSettings.preferences.currency}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "preferences.currency",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                              >
                                {currencyOptions.map((currency) => (
                                  <option
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
                                Timezone
                              </label>
                              <select
                                value={formSettings.preferences.timezone}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "preferences.timezone",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                              >
                                {timezoneOptions.map((tz) => (
                                  <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-inter">
                                Date Format
                              </label>
                              <select
                                value={formSettings.preferences.date_format}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "preferences.date_format",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                              >
                                {dateFormatOptions.map((format) => (
                                  <option
                                    key={format.value}
                                    value={format.value}
                                  >
                                    {format.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === "notifications" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white font-inter mb-4">
                            Notification Preferences
                          </h3>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Email Alerts
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Receive email notifications for important
                                  events
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  formSettings.notifications.email_alerts
                                }
                                onChange={(e) =>
                                  updateFormSetting(
                                    "notifications.email_alerts",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Push Notifications
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Receive browser push notifications
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={
                                  formSettings.notifications.push_notifications
                                }
                                onChange={(e) =>
                                  updateFormSetting(
                                    "notifications.push_notifications",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>

                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter mb-2">
                                Low Stock Alert Threshold
                              </label>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-inter mb-3">
                                Get notified when stock falls below this level
                              </p>
                              <input
                                type="number"
                                min="1"
                                value={
                                  formSettings.notifications.low_stock_threshold
                                }
                                onChange={(e) =>
                                  updateFormSetting(
                                    "notifications.low_stock_threshold",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white font-inter"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features Settings */}
                    {activeTab === "features" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white font-inter mb-4">
                            Feature Toggles
                          </h3>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Barcode Scanning
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Enable barcode scanning features
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={formSettings.features.barcode_scanning}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "features.barcode_scanning",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Low Stock Alerts
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Show alerts for low stock items
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={formSettings.features.low_stock_alerts}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "features.low_stock_alerts",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Multi-Location Support
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Enable multiple warehouse locations
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={formSettings.features.multi_location}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "features.multi_location",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter">
                                  Reports & Analytics
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                                  Enable reporting and analytics features
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={formSettings.features.reports}
                                onChange={(e) =>
                                  updateFormSetting(
                                    "features.reports",
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === "appearance" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white font-inter mb-4">
                            Appearance & Theme
                          </h3>

                          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                              Theme preferences are automatically detected from
                              your system settings. Dark and light modes are
                              supported.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* System Settings */}
                    {activeTab === "system" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white font-inter mb-4">
                            System Information
                          </h3>

                          <div className="space-y-4">
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter mb-1">
                                Version
                              </label>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                                {settings.version || "1.0.0"}
                              </p>
                            </div>

                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <label className="block text-sm font-medium text-gray-900 dark:text-white font-inter mb-1">
                                Database Connection
                              </label>
                              <p className="text-sm text-green-600 dark:text-green-400 font-inter flex items-center gap-2">
                                <CheckCircle size={16} />
                                Connected
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
