"use client";

import React, { useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { BookOpen, Save, Trash2, Plus, ImageIcon } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import {
  AboutSection,
  AboutWhoWeAre,
  AboutOurMission,
  AboutOurExperience,
  AboutWhatWeStandFor,
  AboutWhatWeDo,
  AboutWhereWeOperate,
  AboutProfile,
  AboutValueItem,
  AboutWhatWeDoItem,
  AboutLocationSection,
  AboutTeamMember,
} from "@/context/deal-site-context";
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import WYSIWYGEditor from "@/components/public-access-page/WYSIWYGEditor";

export default function AboutPage() {
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);
  const [preloader, setPreloader] = useState({ visible: false, message: "" });

  // Properly typed aboutData with default empty object
  const aboutData: AboutSection = useMemo(
    () => settings.about || {},
    [settings.about]
  );

  const showPreloader = (message: string) =>
    setPreloader({ visible: true, message });
  const hidePreloader = () =>
    setPreloader({ visible: false, message: "" });

  const updateAboutSection = useCallback(
    <K extends keyof AboutSection>(
      section: K,
      data: AboutSection[K]
    ) => {
      updateSettings({
        about: {
          ...aboutData,
          [section]: data,
        },
      });
    },
    [aboutData, updateSettings]
  );

  const handleImageUpload = useCallback(
    async (file: File, section: string, memberIdx?: number) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("for", "about-page");
      const token = Cookies.get("token");

      showPreloader("Uploading image...");
      try {
        const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
          `${URLS.BASE}${URLS.uploadSingleImg}`,
          formData,
          token
        );
        hidePreloader();
        if (res?.success && res.data?.url) {
          if (section === "profile" && memberIdx !== undefined) {
            const members = aboutData.profile?.members || [];
            const updated = [...members];
            if (updated[memberIdx]) {
              updated[memberIdx] = {
                ...updated[memberIdx],
                image: res.data.url,
              };
            }
            updateAboutSection("profile", {
              ...aboutData.profile,
              members: updated,
            });
          }
          toast.success("Image uploaded successfully");
        } else {
          toast.error(res?.message || "Upload failed");
        }
      } catch (error) {
        hidePreloader();
        toast.error("Upload failed");
      }
    },
    [aboutData, updateAboutSection]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = { about: aboutData };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload);
        toast.success("About page updated successfully");
      } else {
        toast.error(res?.message || "Failed to save changes");
      }
    } catch (error) {
      toast.error("Failed to save about page");
    } finally {
      setSaving(false);
    }
  }, [aboutData, updateSettings]);

  const inputBase =
    "w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-gray-900";

  return (
    <div className="space-y-8">
      <OverlayPreloader isVisible={preloader.visible} message={preloader.message} />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <BookOpen size={32} />
          About Us
        </h1>
        <p className="text-gray-600 mt-2">
          Tell your story to potential clients with detailed sections
        </p>
      </div>

      {/* Section 1: Who We Are */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 1: Who We Are
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.whoWeAre?.title || ""}
            onChange={(e) =>
              updateAboutSection("whoWeAre", {
                ...aboutData.whoWeAre,
                title: e.target.value,
              })
            }
            placeholder="Who We Are"
            className={inputBase}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <WYSIWYGEditor
            value={aboutData.whoWeAre?.description || ""}
            onChange={(value) =>
              updateAboutSection("whoWeAre", {
                ...aboutData.whoWeAre,
                description: value,
              })
            }
            placeholder="Write a detailed description of who you are..."
            minHeight="250px"
          />
        </div>
      </div>

      {/* Section 2: Our Mission */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 2: Our Mission
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.ourMission?.title || ""}
            onChange={(e) =>
              updateAboutSection("ourMission", {
                ...aboutData.ourMission,
                title: e.target.value,
              })
            }
            placeholder="Our Mission"
            className={inputBase}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <WYSIWYGEditor
            value={aboutData.ourMission?.description || ""}
            onChange={(value) =>
              updateAboutSection("ourMission", {
                ...aboutData.ourMission,
                description: value,
              })
            }
            placeholder="Describe your mission and values..."
            minHeight="250px"
          />
        </div>
      </div>

      {/* Section 3: Our Experience */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 3: Our Experience
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.ourExperience?.title || ""}
            onChange={(e) =>
              updateAboutSection("ourExperience", {
                ...aboutData.ourExperience,
                title: e.target.value,
              })
            }
            placeholder="Our Experience"
            className={inputBase}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <WYSIWYGEditor
            value={aboutData.ourExperience?.description || ""}
            onChange={(value) =>
              updateAboutSection("ourExperience", {
                ...aboutData.ourExperience,
                description: value,
              })
            }
            placeholder="Share your experience and achievements..."
            minHeight="250px"
          />
        </div>
      </div>

      {/* Section 4: What We Stand For */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 4: What We Stand For
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.whatWeStandFor?.title || ""}
            onChange={(e) =>
              updateAboutSection("whatWeStandFor", {
                ...aboutData.whatWeStandFor,
                title: e.target.value,
              })
            }
            placeholder="What We Stand For"
            className={inputBase}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <WYSIWYGEditor
            value={aboutData.whatWeStandFor?.description || ""}
            onChange={(value) =>
              updateAboutSection("whatWeStandFor", {
                ...aboutData.whatWeStandFor,
                description: value,
              })
            }
            placeholder="Describe your values and principles..."
            minHeight="250px"
          />
        </div>

        {/* Dynamic Items */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Value Items</h3>
            <button
              type="button"
              onClick={() => {
                const items = aboutData.whatWeStandFor?.items || [];
                updateAboutSection("whatWeStandFor", {
                  ...aboutData.whatWeStandFor,
                  items: [...items, { title: "", shortText: "" }],
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {(aboutData.whatWeStandFor?.items || []).map(
              (item: AboutValueItem, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">
                      Item {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const items = aboutData.whatWeStandFor?.items || [];
                        updateAboutSection("whatWeStandFor", {
                          ...aboutData.whatWeStandFor,
                          items: items.filter((_: AboutValueItem, i: number) => i !== idx),
                        });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => {
                        const items = aboutData.whatWeStandFor?.items || [];
                        const updated = [...items];
                        if (updated[idx]) {
                          updated[idx] = { ...updated[idx], title: e.target.value };
                        }
                        updateAboutSection("whatWeStandFor", {
                          ...aboutData.whatWeStandFor,
                          items: updated,
                        });
                      }}
                      placeholder="Item title"
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Text
                    </label>
                    <textarea
                      value={item.shortText || ""}
                      onChange={(e) => {
                        const items = aboutData.whatWeStandFor?.items || [];
                        const updated = [...items];
                        if (updated[idx]) {
                          updated[idx] = {
                            ...updated[idx],
                            shortText: e.target.value,
                          };
                        }
                        updateAboutSection("whatWeStandFor", {
                          ...aboutData.whatWeStandFor,
                          items: updated,
                        });
                      }}
                      placeholder="Brief description"
                      rows={2}
                      className={`${inputBase} resize-none`}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Section 5: What We Do */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 5: What We Do
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.whatWeDo?.title || ""}
            onChange={(e) =>
              updateAboutSection("whatWeDo", {
                ...aboutData.whatWeDo,
                title: e.target.value,
              })
            }
            placeholder="What We Do"
            className={inputBase}
          />
        </div>

        {/* Dynamic Service Items */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Services</h3>
            <button
              type="button"
              onClick={() => {
                const items = aboutData.whatWeDo?.items || [];
                updateAboutSection("whatWeDo", {
                  ...aboutData.whatWeDo,
                  items: [...items, { title: "" }],
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>

          <div className="space-y-3">
            {(aboutData.whatWeDo?.items || []).map(
              (item: AboutWhatWeDoItem, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg"
                >
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => {
                      const items = aboutData.whatWeDo?.items || [];
                      const updated = [...items];
                      if (updated[idx]) {
                        updated[idx] = { title: e.target.value };
                      }
                      updateAboutSection("whatWeDo", {
                        ...aboutData.whatWeDo,
                        items: updated,
                      });
                    }}
                    placeholder="Service name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const items = aboutData.whatWeDo?.items || [];
                      updateAboutSection("whatWeDo", {
                        ...aboutData.whatWeDo,
                        items: items.filter(
                          (_: AboutWhatWeDoItem, i: number) => i !== idx
                        ),
                      });
                    }}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Where We Operate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 6: Where We Operate
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={aboutData.whereWeOperate?.title || ""}
            onChange={(e) =>
              updateAboutSection("whereWeOperate", {
                ...aboutData.whereWeOperate,
                title: e.target.value,
              })
            }
            placeholder="Where We Operate"
            className={inputBase}
          />
        </div>

        {/* Dynamic Location Items */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Locations</h3>
            <button
              type="button"
              onClick={() => {
                const locations = aboutData.whereWeOperate?.locations || [];
                updateAboutSection("whereWeOperate", {
                  ...aboutData.whereWeOperate,
                  locations: [
                    ...locations,
                    { name: "", address: "", coordinates: [0, 0] },
                  ],
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
            >
              <Plus size={16} />
              Add Location
            </button>
          </div>

          <div className="space-y-4">
            {(aboutData.whereWeOperate?.locations || []).map(
              (location: AboutLocationSection, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">
                      Location {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const locations = aboutData.whereWeOperate?.locations || [];
                        updateAboutSection("whereWeOperate", {
                          ...aboutData.whereWeOperate,
                          locations: locations.filter(
                            (_: AboutLocationSection, i: number) => i !== idx
                          ),
                        });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name
                    </label>
                    <input
                      type="text"
                      value={location.name || ""}
                      onChange={(e) => {
                        const locations = aboutData.whereWeOperate?.locations || [];
                        const updated = [...locations];
                        if (updated[idx]) {
                          updated[idx] = {
                            ...updated[idx],
                            name: e.target.value,
                          };
                        }
                        updateAboutSection("whereWeOperate", {
                          ...aboutData.whereWeOperate,
                          locations: updated,
                        });
                      }}
                      placeholder="e.g., Lagos Office"
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={location.address || ""}
                      onChange={(e) => {
                        const locations = aboutData.whereWeOperate?.locations || [];
                        const updated = [...locations];
                        if (updated[idx]) {
                          updated[idx] = {
                            ...updated[idx],
                            address: e.target.value,
                          };
                        }
                        updateAboutSection("whereWeOperate", {
                          ...aboutData.whereWeOperate,
                          locations: updated,
                        });
                      }}
                      placeholder="Full address"
                      className={inputBase}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={location.coordinates?.[0] || ""}
                        onChange={(e) => {
                          const locations = aboutData.whereWeOperate?.locations || [];
                          const updated = [...locations];
                          if (updated[idx]) {
                            updated[idx] = {
                              ...updated[idx],
                              coordinates: [
                                parseFloat(e.target.value),
                                location.coordinates?.[1] || 0,
                              ],
                            };
                          }
                          updateAboutSection("whereWeOperate", {
                            ...aboutData.whereWeOperate,
                            locations: updated,
                          });
                        }}
                        placeholder="0.0000"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={location.coordinates?.[1] || ""}
                        onChange={(e) => {
                          const locations = aboutData.whereWeOperate?.locations || [];
                          const updated = [...locations];
                          if (updated[idx]) {
                            updated[idx] = {
                              ...updated[idx],
                              coordinates: [
                                location.coordinates?.[0] || 0,
                                parseFloat(e.target.value),
                              ],
                            };
                          }
                          updateAboutSection("whereWeOperate", {
                            ...aboutData.whereWeOperate,
                            locations: updated,
                          });
                        }}
                        placeholder="0.0000"
                        className={inputBase}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Section 7: Profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#09391C] border-b border-gray-200 pb-3">
          Section 7: Profile
        </h2>

        {/* Team Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Team Members</h3>
            <button
              type="button"
              onClick={() => {
                const members = aboutData.profile?.members || [];
                updateAboutSection("profile", {
                  ...aboutData.profile,
                  members: [
                    ...members,
                    {
                      name: "",
                      role: "",
                      image: "",
                      bio: "",
                    },
                  ],
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-sm hover:bg-emerald-200"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>

          <div className="space-y-6">
            {(aboutData.profile?.members || []).map(
              (member: AboutTeamMember, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">
                      Member {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const members = aboutData.profile?.members || [];
                        updateAboutSection("profile", {
                          ...aboutData.profile,
                          members: members.filter(
                            (_: AboutTeamMember, i: number) => i !== idx
                          ),
                        });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    {member.image ? (
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={member.image}
                          alt={member.name || "Member"}
                          className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const members = aboutData.profile?.members || [];
                              const updated = [...members];
                              if (updated[idx]) {
                                updated[idx] = {
                                  ...updated[idx],
                                  image: "",
                                };
                              }
                              updateAboutSection("profile", {
                                ...aboutData.profile,
                                members: updated,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                          <label className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleImageUpload(
                                    e.target.files[0],
                                    "profile",
                                    idx
                                  );
                                }
                              }}
                            />
                            Change
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(
                                e.target.files[0],
                                `profileMember${idx}`
                              );
                            }
                          }}
                        />
                        <ImageIcon size={18} />
                        <span className="text-sm">Upload Image</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={member.name || ""}
                      onChange={(e) => {
                        const members = aboutData.profile?.members || [];
                        const updated = [...members];
                        if (updated[idx]) {
                          updated[idx] = { ...updated[idx], name: e.target.value };
                        }
                        updateAboutSection("profile", {
                          ...aboutData.profile,
                          members: updated,
                        });
                      }}
                      placeholder="Member name"
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={member.role || ""}
                      onChange={(e) => {
                        const members = aboutData.profile?.members || [];
                        const updated = [...members];
                        if (updated[idx]) {
                          updated[idx] = { ...updated[idx], role: e.target.value };
                        }
                        updateAboutSection("profile", {
                          ...aboutData.profile,
                          members: updated,
                        });
                      }}
                      placeholder="e.g., Managing Director"
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <WYSIWYGEditor
                      value={member.bio || ""}
                      onChange={(value) => {
                        const members = aboutData.profile?.members || [];
                        const updated = [...members];
                        if (updated[idx]) {
                          updated[idx] = { ...updated[idx], bio: value };
                        }
                        updateAboutSection("profile", {
                          ...aboutData.profile,
                          members: updated,
                        });
                      }}
                      placeholder="Write a bio about this team member..."
                      minHeight="180px"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-lg">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
