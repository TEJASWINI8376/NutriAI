import React from "react";
import { Home, FileText, Pill, User } from "lucide-react";

export type NavTab = "home" | "reports" | "prescriptions" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  reportsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  reportsCount,
}) => {
  const tabs = [
    { id: "home" as NavTab, label: "Home", icon: Home },
    { id: "reports" as NavTab, label: "Reports", icon: FileText, badge: reportsCount },
    { id: "prescriptions" as NavTab, label: "Prescriptions", icon: Pill },
    { id: "profile" as NavTab, label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "text-[#006194]"
                  : "text-[#64748b] hover:text-[#0b1c30]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.75px]"
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#006194] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-['Plus_Jakarta_Sans'] ${
                  isActive ? "font-bold text-[#006194]" : "font-medium text-[#707881]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
