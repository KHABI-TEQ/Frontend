"use client";

import React, { useState } from "react";
import {
  Home,
  Star,
  Check,
  Shield,
  Lock,
  Zap,
  Award,
  Truck,
  MapPin,
  Users,
  Heart,
  Briefcase,
  TrendingUp,
  DollarSign,
  Eye,
  Handshake,
  Target,
  Lightbulb,
  Clock,
  Verified,
  Building,
  Search,
  Key,
  Anchor,
  AlertCircle,
  Bookmark,
  Compass,
  Crown,
  Database,
  Gift,
  Globe,
  Headphones,
  Hexagon,
  Inbox,
  Infinity,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Move,
  Package,
  PieChart,
  Play,
  Pocket,
  Power,
  Printer,
  RefreshCw,
  Repeat,
  Rocket,
  RotateCw,
  Save,
  Server,
  Slack,
  Smile,
  Square,
  Sun,
  Trello,
  Unlock,
  Watch,
  Wifi,
  Wind,
  X,
} from "lucide-react";

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
  customIcons?: Record<string, React.ComponentType<any>>;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Home,
  Star,
  Check,
  Shield,
  Lock,
  Zap,
  Award,
  Truck,
  MapPin,
  Users,
  Heart,
  Briefcase,
  TrendingUp,
  DollarSign,
  Eye,
  Handshake,
  Target,
  Lightbulb,
  Clock,
  Verified,
  Building,
  Search,
  Key,
  Anchor,
  AlertCircle,
  Bookmark,
  Compass,
  Crown,
  Database,
  Gift,
  Globe,
  Headphones,
  Hexagon,
  Inbox,
  Infinity,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Move,
  Package,
  PieChart,
  Play,
  Pocket,
  Power,
  Printer,
  RefreshCw,
  Repeat,
  Rocket,
  RotateCw,
  Save,
  Server,
  Slack,
  Smile,
  Square,
  Sun,
  Trello,
  Unlock,
  Watch,
  Wifi,
  Wind,
  X,
};

export const IconSelector: React.FC<IconSelectorProps> = ({
  value,
  onChange,
  className = "",
  customIcons,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const mergedMap = React.useMemo(() => ({ ...(customIcons || {}), ...ICON_MAP }), [customIcons]);
  const iconNames = React.useMemo(() => Object.keys(mergedMap).sort(), [mergedMap]);

  const SelectedIcon = value ? mergedMap[value] : null;

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon size={18} className="text-gray-600" />
              <span className="text-gray-700">{value}</span>
            </>
          ) : (
            <span className="text-gray-500">Select an icon</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-96 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-2 p-3 max-h-96 overflow-y-auto">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => {
                const Icon = mergedMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-all ${
                      value === iconName
                        ? "bg-emerald-100 border border-emerald-500"
                        : "hover:bg-gray-100 border border-transparent"
                    }`}
                    title={iconName}
                  >
                    <Icon size={20} className="text-gray-700" />
                    <span className="text-xs text-gray-600 truncate max-w-full">
                      {iconName}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-6 py-4 text-center text-sm text-gray-500">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;
