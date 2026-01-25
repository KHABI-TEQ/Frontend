"use client";

import React, { useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Home, Save, ImageIcon, Trash2, Plus, X, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

const LUCIDE_ICONS = [
  // Popular and relevant icons
  "Award", "Briefcase", "CheckCircle", "Clock", "Cog", "DollarSign", "Eye", "Feather",
  "Flame", "Gauge", "Gift", "Globe", "Heart", "Home", "Key", "Landmark", "Lightbulb",
  "Lock", "MapPin", "Maximize2", "Mic", "Monitor", "Mountain", "Network", "Package",
  "PieChart", "Rocket", "Shield", "ShoppingCart", "Smartphone", "Sparkles", "Star",
  "Target", "ThumbsUp", "TrendingUp", "Truck", "Users", "Zap", "Building2", "Hammer",
  "Leaf", "Search", "MessageSquare", "PalmTree", "Smile", "Compass", "Crown",
  "Palette", "Play", "Settings", "Music", "Coffee", "Anchor", "AlertCircle", "Bookmark",
  "Database", "Headphones", "Hexagon", "Inbox", "Infinity", "Layers", "Minimize2",
  "Moon", "Move", "Pocket", "Power", "Printer", "RefreshCw", "Repeat", "RotateCw",
  "Save", "Server", "Square", "Sun", "Unlock", "Watch", "Wifi", "Wind", "Building",
  "Handshake", "Bell", "BookOpen", "Bot", "Box", "Brain", "Brush", "Bug",
  "Calendar", "Camera", "Cast", "Chat", "ChevronDown", "ChevronLeft", "ChevronRight",
  "ChevronUp", "Circle", "Code", "Clipboard", "Coins", "Columns", "Command", "Copy",
  "CreditCard", "Crop", "Cpu", "Crosshair", "Cube", "Cut", "DivideSquare", "Download",
  "DownloadCloud", "Droplet", "Edit", "Edit2", "Edit3", "ExternalLink", "FileText",
  "Filter", "Flag", "Folder", "FolderOpen", "Grid", "HardDrive", "Headphones", "Help",
  "Home2", "Image", "Info", "LayoutGrid", "LayoutList", "Link", "List", "Lock2",
  "LogOut", "Mail", "MailOpen", "MapPin2", "Maximize", "Menu", "MessageCircle", "Minus",
  "Mobile", "MoreHorizontal", "MoreVertical", "Navigation", "Navigation2", "Paperclip",
  "PauseCircle", "Percent", "PercentCircle", "Phone", "PhoneCall", "PhoneOff", "PieChart2",
  "Plus", "PlusCircle", "PlusSquare", "Pocket2", "Printer2", "Radio", "RefreshCcw", "Reload",
  "Rewind", "Save2", "Search2", "Send", "Settings2", "Share", "Share2", "Shield2",
  "ShoppingBag", "ShoppingCart2", "Slash", "Sliders", "Smartphone2", "Speaker", "Square2",
  "Squares", "Star2", "StopCircle", "Strikethrough", "Subscript", "Superscript", "Tag",
  "Tags", "Trash", "Trash2", "Triangle", "TrendingDown", "TrendingUp2", "Type", "Underline",
  "Undo", "Undo2", "Upload", "UploadCloud", "User", "UserCheck", "UserMinus", "UserPlus",
  "UserX", "Volume", "Volume1", "Volume2", "VolumeX", "Watch2", "Wifi2", "WifiOff",
  "Wind2", "X", "XCircle", "XSquare", "Zap2", "ZoomIn", "ZoomOut"
];

type Testimonial = {
  id: string;
  rating: number;
  description: string;
  image: string;
  name: string;
  company: string;
};

type WhyChooseUsItem = {
  _id?: string; // Client-side ID for tracking; not persisted to backend
  icon: string;
  title: string;
  content: string;
};

export default function HomePageSettings() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "testimonials" | "why-choose-us">("hero");

  // Hero state
  const [formData, setFormData] = useState({
    heroTitle: settings.publicPage?.heroTitle || "",
    heroSubtitle: settings.publicPage?.heroSubtitle || "",
    heroImageUrl: settings.publicPage?.heroImageUrl || "",
    ctaText: settings.publicPage?.ctaText || "",
    ctaLink: settings.publicPage?.ctaLink || "",
    ctaText2: settings.publicPage?.ctaText2 || "",
    ctaLink2: settings.publicPage?.ctaLink2 || "",
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    settings.homeSettings?.testimonials?.testimonials || []
  );
  const [testimonialsSection, setTestimonialsSection] = useState({
    title: settings.homeSettings?.testimonials?.title || "Our Testimonials",
    subTitle: settings.homeSettings?.testimonials?.subTitle || "What our clients say about us",
  });

  // Why Choose Us state - ensure all items have client-side _id for state management
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>(
    (settings.homeSettings?.whyChooseUs?.items || []).map((item, index) => ({
      ...item,
      _id: item._id || `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    }))
  );

  const [whyChooseUsSection, setWhyChooseUsSection] = useState({
    title: settings.homeSettings?.whyChooseUs?.title || "Why Choose Us",
    subTitle: settings.homeSettings?.whyChooseUs?.subTitle || "Here's what sets us apart",
  });

  const [uploadingTestimonialId, setUploadingTestimonialId] = useState<string>("");
  const [showIconPicker, setShowIconPicker] = useState<Record<string, boolean>>({});
  const [iconSearchTerms, setIconSearchTerms] = useState<Record<string, string>>({});

  // Ensure icon picker state is initialized for all items
  React.useEffect(() => {
    setShowIconPicker((prev) => {
      const updated = { ...prev };
      whyChooseUs.forEach((item, index) => {
        const id = item._id || `index-${index}`;
        if (!(id in updated)) {
          updated[id] = false;
        }
      });
      return updated;
    });
    setIconSearchTerms((prev) => {
      const updated = { ...prev };
      whyChooseUs.forEach((item, index) => {
        const id = item._id || `index-${index}`;
        if (!(id in updated)) {
          updated[id] = "";
        }
      });
      return updated;
    });
  }, [whyChooseUs]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleUploadHeroImage = useCallback(async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("for", "public-hero-image");
    const token = Cookies.get("token");

    setUploading(true);
    setPreloader(true);
    try {
      const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formDataUpload,
        token
      );
      if (res?.success && res.data?.url) {
        setFormData((prev) => ({
          ...prev,
          heroImageUrl: res.data.url,
        }));
        toast.success("Hero image uploaded successfully");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload hero image");
    } finally {
      setUploading(false);
      setPreloader(false);
    }
  }, []);

  const handleRemoveHeroImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      heroImageUrl: "",
    }));
    toast.success("Hero image removed");
  }, []);

  // Testimonial handlers
  const addTestimonial = useCallback(() => {
    const newTestimonial: Testimonial = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rating: 5,
      description: "",
      image: "",
      name: "",
      company: "",
    };
    setTestimonials((prev) => [...prev, newTestimonial]);
  }, []);

  const updateTestimonial = useCallback((id: string, field: string, value: any) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }, []);

  const removeTestimonial = useCallback((id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleUploadTestimonialImage = useCallback(async (file: File, testimonialId: string) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("for", "testimonial-image");
    const token = Cookies.get("token");

    setUploadingTestimonialId(testimonialId);
    setPreloader(true);
    try {
      const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formDataUpload,
        token
      );
      if (res?.success && res.data?.url) {
        updateTestimonial(testimonialId, "image", res.data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingTestimonialId("");
      setPreloader(false);
    }
  }, [updateTestimonial]);

  // Why Choose Us handlers
  const addWhyChooseUsItem = useCallback(() => {
    const newItem: WhyChooseUsItem = {
      _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      icon: "Award",
      title: "",
      content: "",
    };
    setWhyChooseUs((prev) => [...prev, newItem]);
  }, []);

  const updateWhyChooseUsItem = useCallback((id: string, field: string, value: any) => {
    setWhyChooseUs((prev) =>
      prev.map((item) => (item._id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const removeWhyChooseUsItem = useCallback((id: string) => {
    setWhyChooseUs((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    setPreloader(true);
    try {
      const token = Cookies.get("token");

      // Remove client-side _id from testimonials before sending to backend
      const testimonialsForBackend = testimonials.map(({ id, ...rest }) => rest);

      // Remove client-side _id from why choose us items before sending to backend
      const whyChooseUsForBackend = whyChooseUs.map(({ _id, ...rest }) => rest);

      const payload = {
        publicPage: {
          ...settings.publicPage,
          heroTitle: formData.heroTitle,
          heroSubtitle: formData.heroSubtitle,
          heroImageUrl: formData.heroImageUrl,
          ctaText: formData.ctaText,
          ctaLink: formData.ctaLink,
          ctaText2: formData.ctaText2,
          ctaLink2: formData.ctaLink2,
        },
        homeSettings: {
          testimonials: {
            title: testimonialsSection.title,
            subTitle: testimonialsSection.subTitle,
            testimonials: testimonialsForBackend,
          },
          whyChooseUs: {
            title: whyChooseUsSection.title,
            subTitle: whyChooseUsSection.subTitle,
            items: whyChooseUsForBackend,
          },
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        // Update context with the full payload structure (backend won't have _id/id, but frontend state has them)
        updateSettings({
          publicPage: payload.publicPage,
          homeSettings: {
            testimonials: {
              title: testimonialsSection.title,
              subTitle: testimonialsSection.subTitle,
              testimonials: testimonials, // Use frontend state with id fields
            },
            whyChooseUs: {
              title: whyChooseUsSection.title,
              subTitle: whyChooseUsSection.subTitle,
              items: whyChooseUs, // Use frontend state with _id fields
            },
          },
        } as any);
        toast.success("Home page settings saved successfully");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save home page settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, settings, testimonials, testimonialsSection, whyChooseUs, whyChooseUsSection, updateSettings]);

  const getLucideIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || (LucideIcons as any)["Award"];
  };

  // Helper to get item ID - uses _id if available, falls back to finding index
  const getItemId = (item: WhyChooseUsItem, index: number): string => {
    return item._id || `index-${index}`;
  };

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Home size={32} />
          Home Page Settings
        </h1>
        <p className="text-gray-600 mt-2">Customize your homepage appearance, testimonials, and why choose us section</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "hero", label: "Hero Section" },
          { id: "testimonials", label: "Testimonials" },
          { id: "why-choose-us", label: "Why Choose Us" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Section Tab */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          {/* Hero Image Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#09391C] mb-4">Hero Image</h2>
              <p className="text-sm text-gray-600 mb-4">Upload an image to display in your hero section</p>

              {formData.heroImageUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full">
                    <img
                      src={formData.heroImageUrl}
                      alt="Hero"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveHeroImage}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={16} />
                    Remove Hero Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon size={40} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-700 font-medium">Click to upload hero image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadHeroImage(file);
                      }
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Hero Text Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-[#09391C] mb-4">Hero Text</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                  placeholder="Welcome to my real estate business"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Subtitle
                </label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                  placeholder="Describe your main value proposition..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#09391C] mb-4">Call-to-Action Buttons</h3>
              </div>

              {/* Primary CTA Button */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                <h4 className="font-medium text-gray-900">Primary CTA Button</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => handleInputChange("ctaText", e.target.value)}
                      placeholder="Browse Listings"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaLink}
                      onChange={(e) => handleInputChange("ctaLink", e.target.value)}
                      placeholder="/market-place"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary CTA Button */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
                <h4 className="font-medium text-gray-900">Secondary CTA Button (Optional)</h4>
                <p className="text-sm text-gray-600">Add a second call-to-action button for additional engagement</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText2}
                      onChange={(e) => handleInputChange("ctaText2", e.target.value)}
                      placeholder="Learn More"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaLink2}
                      onChange={(e) => handleInputChange("ctaLink2", e.target.value)}
                      placeholder="/about-us"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section Tab */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          {/* Testimonials Section Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-[#09391C] mb-4">Testimonials Section</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={testimonialsSection.title}
                onChange={(e) => setTestimonialsSection((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Our Testimonials"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={testimonialsSection.subTitle}
                onChange={(e) => setTestimonialsSection((prev) => ({ ...prev, subTitle: e.target.value }))}
                placeholder="What our clients say about us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Testimonials List */}
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#09391C]">Testimonial {index + 1}</h3>
                  <button
                    onClick={() => removeTestimonial(testimonial.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  {testimonial.image ? (
                    <div className="space-y-2">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => updateTestimonial(testimonial.id, "image", "")}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={24} className="text-gray-400 mb-2" />
                        <p className="text-xs text-gray-700">Click to upload image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadTestimonialImage(file, testimonial.id);
                          }
                        }}
                        disabled={uploadingTestimonialId === testimonial.id}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => updateTestimonial(testimonial.id, "rating", rating)}
                        className={`p-1 transition-colors ${
                          testimonial.rating >= rating ? "text-amber-400" : "text-gray-300"
                        }`}
                      >
                        <Star size={24} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={testimonial.description}
                    onChange={(e) => updateTestimonial(testimonial.id, "description", e.target.value)}
                    placeholder="What did the client say..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(testimonial.id, "name", e.target.value)}
                    placeholder="Client Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={testimonial.company}
                    onChange={(e) => updateTestimonial(testimonial.id, "company", e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addTestimonial}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} />
            Add Testimonial
          </button>
        </div>
      )}

      {/* Why Choose Us Section Tab */}
      {activeTab === "why-choose-us" && (
        <div className="space-y-6">
          {/* Why Choose Us Section Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-[#09391C] mb-4">Why Choose Us Section</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={whyChooseUsSection.title}
                onChange={(e) => setWhyChooseUsSection((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Why Choose Us"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={whyChooseUsSection.subTitle}
                onChange={(e) => setWhyChooseUsSection((prev) => ({ ...prev, subTitle: e.target.value }))}
                placeholder="Here's what sets us apart"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Why Choose Us Items */}
          <div className="space-y-4">
            {whyChooseUs.map((item, index) => {
              const itemId = getItemId(item, index);
              return (
              <div key={itemId} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#09391C]">Item {index + 1}</h3>
                  <button
                    onClick={() => removeWhyChooseUsItem(itemId)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowIconPicker((prev) => ({
                          ...prev,
                          [itemId]: !prev[itemId],
                        }));
                        if (!showIconPicker[itemId]) {
                          setIconSearchTerms((prev) => ({
                            ...prev,
                            [itemId]: "",
                          }));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 flex items-center gap-2 justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {React.createElement(getLucideIcon(item.icon), { size: 20 })}
                        {item.icon}
                      </span>
                      <span className={`text-gray-500 transition-transform ${showIconPicker[itemId] ? "rotate-180" : ""}`}>▼</span>
                    </button>

                    {showIconPicker[itemId] && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-96">
                        {/* Search Input */}
                        <div className="border-b border-gray-200 p-3">
                          <input
                            type="text"
                            placeholder="Search icons..."
                            value={iconSearchTerms[itemId] || ""}
                            onChange={(e) =>
                              setIconSearchTerms((prev) => ({
                                ...prev,
                                [itemId]: e.target.value,
                              }))
                            }
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                          />
                        </div>

                        {/* Icon Grid */}
                        <div className="grid grid-cols-6 gap-2 p-3 max-h-72 overflow-y-auto">
                          {LUCIDE_ICONS.filter(icon =>
                            icon.toLowerCase().includes((iconSearchTerms[itemId] || "").toLowerCase())
                          ).map((iconName, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                updateWhyChooseUsItem(itemId, "icon", iconName);
                                setShowIconPicker((prev) => ({
                                  ...prev,
                                  [itemId]: false,
                                }));
                                setIconSearchTerms((prev) => ({
                                  ...prev,
                                  [itemId]: "",
                                }));
                              }}
                              className={`p-2 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${
                                item.icon === iconName
                                  ? "bg-emerald-100 border border-emerald-500"
                                  : "hover:bg-gray-100 border border-transparent"
                              }`}
                              title={iconName}
                            >
                              {React.createElement(getLucideIcon(iconName), { size: 20 })}
                              <span className="text-xs line-clamp-2 text-center">{iconName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateWhyChooseUsItem(itemId, "title", e.target.value)}
                    placeholder="Feature Title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateWhyChooseUsItem(itemId, "content", e.target.value)}
                    placeholder="Describe this feature..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>)
            })}
          </div>

          <button
            onClick={addWhyChooseUsItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={uploading || uploadingTestimonialId !== ""}
          className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
