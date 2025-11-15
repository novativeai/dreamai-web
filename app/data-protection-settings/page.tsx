"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { ROUTES } from "@/utils/routes";
import { APP_NAME, SUPPORT_EMAIL } from "@/constants";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  getCrashReportingConsent,
  setCrashReportingConsent,
  trackSettingsChange
} from "@/services/analyticsService";
import toast from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
}

export default function DataProtectionSettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: "essential_data",
      title: "Essential Data Processing",
      description: "Required for basic app functionality, authentication, and service delivery. Cannot be disabled.",
      enabled: true,
      locked: true,
    },
    {
      id: "image_processing",
      title: "Image Processing & AI Generation",
      description: "Process your uploaded images with AI to generate transformations. Required to use the core service.",
      enabled: true,
      locked: true,
    },
    {
      id: "usage_analytics",
      title: "Usage Analytics",
      description: "Collect anonymized usage data to improve app performance and user experience.",
      enabled: true,
      locked: false,
    },
    {
      id: "crash_reporting",
      title: "Crash & Error Reporting",
      description: "Automatically report crashes and errors to help us fix bugs and improve stability.",
      enabled: true,
      locked: false,
    },
  ]);

  useEffect(() => {
    const loadUserPreferences = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      try {
        // Load analytics and crash reporting preferences from Firestore
        const analyticsEnabled = await getAnalyticsConsent(user.uid);
        const crashReportingEnabled = await getCrashReportingConsent(user.uid);

        setSettings((prev) =>
          prev.map((setting) => {
            if (setting.id === "usage_analytics") {
              return { ...setting, enabled: analyticsEnabled };
            }
            if (setting.id === "crash_reporting") {
              return { ...setting, enabled: crashReportingEnabled };
            }
            return setting;
          })
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user preferences:", error);
        toast.error("Failed to load your privacy settings");
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, [router]);

  const handleToggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id && !setting.locked
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleSaveSettings = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to save settings");
      return;
    }

    setIsSaving(true);
    try {
      // Save analytics and crash reporting preferences
      const analyticsSetting = settings.find((s) => s.id === "usage_analytics");
      const crashReportingSetting = settings.find((s) => s.id === "crash_reporting");

      if (analyticsSetting) {
        await setAnalyticsConsent(user.uid, analyticsSetting.enabled);
        await trackSettingsChange(user.uid, "usage_analytics", analyticsSetting.enabled);
      }

      if (crashReportingSetting) {
        await setCrashReportingConsent(user.uid, crashReportingSetting.enabled);
        await trackSettingsChange(user.uid, "crash_reporting", crashReportingSetting.enabled);
      }

      toast.success("Privacy settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDataExport = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      toast.success("Data export request submitted. You will receive an email with your data within 30 days.");
      // TODO: Implement backend API call to request data export
    } catch (error) {
      console.error("Error requesting data export:", error);
      toast.error("Failed to request data export. Please contact support.");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-black">Data Protection Settings</h1>
          <p className="text-sm text-gray-600 mt-2">
            Manage how your data is collected and used
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-32">
        {/* Privacy Settings */}
        <div className="px-4 py-6">
          <h2 className="text-base font-semibold text-black mb-1">Privacy Controls</h2>
          <p className="text-sm text-gray-600 mb-5">
            Control what data we collect and how it's used
          </p>

          <div className="space-y-1">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-base font-medium text-black mb-1">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleToggleSetting(setting.id)}
                      disabled={setting.locked}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled ? "bg-[#FF5069]" : "bg-gray-300"
                      } ${setting.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {setting.locked && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    This setting is required for the app to function
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full mt-6 bg-[#FF5069] hover:bg-[#FF3050] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>

        {/* Data Rights */}
        <div className="h-2 bg-gray-50" />

        <div className="px-4 py-6">
          <h2 className="text-base font-semibold text-black mb-1">Your Data Rights</h2>
          <p className="text-sm text-gray-600 mb-5">
            Exercise your rights under GDPR and data protection laws
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRequestDataExport}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 rounded-xl transition-colors text-left px-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base">Request Data Export</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Download a copy of all your personal data
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => router.push(ROUTES.DELETE_ACCOUNT)}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 rounded-xl transition-colors text-left px-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base">Delete Account & Data</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => router.push(`${ROUTES.DOCS}/dataProtection`)}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-black font-medium py-4 rounded-xl transition-colors text-left px-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base">Data Protection Policy</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Read our full data protection and privacy policy
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Data Retention */}
        <div className="h-2 bg-gray-50" />

        <div className="px-4 py-6">
          <h2 className="text-base font-semibold text-black mb-1">Data Retention</h2>
          <p className="text-sm text-gray-600 mb-4">
            How long we keep your data
          </p>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-black">Account Data</p>
                <p className="text-xs text-gray-600 mt-1">
                  Stored while your account is active, deleted within 30 days of account deletion
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Uploaded Images</p>
                <p className="text-xs text-gray-600 mt-1">
                  Processed immediately and deleted after generation
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Generated Images</p>
                <p className="text-xs text-gray-600 mt-1">
                  Stored temporarily for download, then automatically deleted
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">Payment Records</p>
                <p className="text-xs text-gray-600 mt-1">
                  Retained for 7-10 years as required by law
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="h-2 bg-gray-50" />

        <div className="px-4 py-6">
          <h2 className="text-base font-semibold text-black mb-1">Questions or Concerns?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Contact our data protection team
          </p>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${APP_NAME} Data Protection Inquiry`}
            className="inline-flex items-center text-[#FF5069] hover:underline font-medium"
          >
            {SUPPORT_EMAIL}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
