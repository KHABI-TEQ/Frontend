"use client";

import React from "react";
import { Trash2, Image as ImageIcon } from "lucide-react";
import IconSelector from "@/components/public-access-page/IconSelector";

interface HomeSettingsTabProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  inputBase: string;
  onUploadTestimonialImage: (file: File, index: number) => void;
}

const HomeSettingsTab: React.FC<HomeSettingsTabProps> = ({ form, setForm, inputBase, onUploadTestimonialImage }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#09391C] mb-6">Home Settings</h2>

        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.testimonials?.title || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    testimonials: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.testimonials?.subTitle || '',
                      testimonials: form.homeSettings?.testimonials?.testimonials || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="What Our Clients Say"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.testimonials?.subTitle || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    testimonials: {
                      title: form.homeSettings?.testimonials?.title || '',
                      subTitle: e.target.value,
                      testimonials: form.homeSettings?.testimonials?.testimonials || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Real feedback from real clients"
              />
            </div>
          </div>

          <div className="space-y-4">
            {form.homeSettings?.testimonials?.testimonials?.map((testimonial: any, idx: number) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm text-[#09391C]">Testimonial {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: form.homeSettings?.testimonials?.testimonials?.filter((_: any, i: number) => i !== idx) || [],
                          },
                        },
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].rating = Math.max(1, (updated[idx].rating || 5) - 1);
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 border border-gray-300 rounded text-sm font-medium w-12 text-center bg-gray-50">
                        {testimonial.rating || 5}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].rating = Math.min(5, (updated[idx].rating || 5) + 1);
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={testimonial.name || ''}
                      onChange={(e) => {
                        const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                        updated[idx].name = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            testimonials: {
                              ...(prev.homeSettings?.testimonials || {}),
                              testimonials: updated,
                            },
                          },
                        }));
                      }}
                      className={`${inputBase} text-sm`}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={testimonial.company || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                      updated[idx].company = e.target.value;
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm`}
                    placeholder="Company name"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Description</label>
                  <textarea
                    value={testimonial.description || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                      updated[idx].description = e.target.value;
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm min-h-[60px]`}
                    placeholder="Share your experience..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-2">Image</label>
                  {testimonial.image ? (
                    <div className="flex items-center gap-2">
                      <img src={testimonial.image} alt="Testimonial" className="h-12 w-12 rounded object-cover border" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].image = undefined;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 px-2 py-2 border-2 border-dashed rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && onUploadTestimonialImage(e.target.files[0], idx)}
                      />
                      <ImageIcon size={14} /> Upload
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setForm((prev: any) => ({
                ...prev,
                homeSettings: {
                  ...(prev.homeSettings || {}),
                  testimonials: {
                    ...(prev.homeSettings?.testimonials || {}),
                    testimonials: [
                      ...(prev.homeSettings?.testimonials?.testimonials || []),
                      { rating: 5, description: '', name: '', company: '', image: '' },
                    ],
                  },
                },
              }));
            }}
            className="mt-3 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            + Add Testimonial
          </button>
        </div>

        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Why Choose Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.whyChooseUs?.title || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    whyChooseUs: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.whyChooseUs?.subTitle || '',
                      items: form.homeSettings?.whyChooseUs?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Why Choose Us"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.whyChooseUs?.subTitle || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    whyChooseUs: {
                      title: form.homeSettings?.whyChooseUs?.title || '',
                      subTitle: e.target.value,
                      items: form.homeSettings?.whyChooseUs?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="We stand out from the rest"
              />
            </div>
          </div>

          <div className="space-y-3">
            {form.homeSettings?.whyChooseUs?.items?.map((item: any, idx: number) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-[#09391C]">Item {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          whyChooseUs: {
                            ...(prev.homeSettings?.whyChooseUs || {}),
                            items: form.homeSettings?.whyChooseUs?.items?.filter((_: any, i: number) => i !== idx) || [],
                          },
                        },
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Icon</label>
                    <IconSelector
                      value={item.icon}
                      onChange={(iconName) => {
                        const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                        updated[idx].icon = iconName;
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            whyChooseUs: {
                              ...(prev.homeSettings?.whyChooseUs || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                        updated[idx].title = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            whyChooseUs: {
                              ...(prev.homeSettings?.whyChooseUs || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className={`${inputBase} text-sm`}
                      placeholder="Feature title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Content</label>
                  <textarea
                    value={item.content || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                      updated[idx].content = e.target.value;
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          whyChooseUs: {
                            ...(prev.homeSettings?.whyChooseUs || {}),
                            items: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm min-h-[60px]`}
                    placeholder="Describe this feature..."
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setForm((prev: any) => ({
                ...prev,
                homeSettings: {
                  ...(prev.homeSettings || {}),
                  whyChooseUs: {
                    ...(prev.homeSettings?.whyChooseUs || {}),
                    items: [
                      ...(prev.homeSettings?.whyChooseUs?.items || []),
                      { icon: '', title: '', content: '' },
                    ],
                  },
                },
              }));
            }}
            className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            + Add Item
          </button>
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Ready to Find Your Perfect Property?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.readyToFind?.title || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    readyToFind: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.readyToFind?.subTitle || '',
                      ctas: form.homeSettings?.readyToFind?.ctas || [],
                      items: form.homeSettings?.readyToFind?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Ready to Find Your Perfect Property?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.readyToFind?.subTitle || ''}
                onChange={(e) => setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    readyToFind: {
                      title: form.homeSettings?.readyToFind?.title || '',
                      subTitle: e.target.value,
                      ctas: form.homeSettings?.readyToFind?.ctas || [],
                      items: form.homeSettings?.readyToFind?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Start your journey today"
              />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-[#09391C] mb-2">Call-to-Action Buttons (Max 2)</h4>
            <div className="space-y-3">
              {form.homeSettings?.readyToFind?.ctas?.slice(0, 2).map((cta: any, idx: number) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm text-[#09391C]">CTA {idx + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            readyToFind: {
                              ...(prev.homeSettings?.readyToFind || {}),
                              ctas: form.homeSettings?.readyToFind?.ctas?.filter((_: any, i: number) => i !== idx) || [],
                            },
                          },
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={cta.text || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].text = e.target.value;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="Browse Properties"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Button Color (Hex)</label>
                      <input
                        type="color"
                        value={cta.bgColor || '#8DDB90'}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].bgColor = e.target.value;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className="w-full h-9 border rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Link/Route</label>
                      <input
                        type="text"
                        value={cta.actionLink || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].actionLink = e.target.value;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="/market-place"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(form.homeSettings?.readyToFind?.ctas?.length || 0) < 2 && (
              <button
                type="button"
                onClick={() => {
                  setForm((prev: any) => ({
                    ...prev,
                    homeSettings: {
                      ...(prev.homeSettings || {}),
                      readyToFind: {
                        ...(prev.homeSettings?.readyToFind || {}),
                        ctas: [
                          ...(prev.homeSettings?.readyToFind?.ctas || []),
                          { text: '', bgColor: '#8DDB90', actionLink: '' },
                        ],
                      },
                    },
                  }));
                }}
                className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                + Add CTA
              </button>
            )}
          </div>

          <div className="space-y-3">
            {form.homeSettings?.readyToFind?.items?.map((item: any, idx: number) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm text-[#09391C]">Item {idx + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev: any) => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          readyToFind: {
                            ...(prev.homeSettings?.readyToFind || {}),
                            items: form.homeSettings?.readyToFind?.items?.filter((_: any, i: number) => i !== idx) || [],
                          },
                        },
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Icon</label>
                    <IconSelector
                      value={item.icon}
                      onChange={(iconName) => {
                        const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                        updated[idx].icon = iconName;
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            readyToFind: {
                              ...(prev.homeSettings?.readyToFind || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                          updated[idx].title = e.target.value;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                items: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={item.subTitle || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                          updated[idx].subTitle = e.target.value;
                          setForm((prev: any) => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                items: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="Feature subtitle"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Content</label>
                    <textarea
                      value={item.content || ''}
                      onChange={(e) => {
                        const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                        updated[idx].content = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            readyToFind: {
                              ...(prev.homeSettings?.readyToFind || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className={`${inputBase} text-sm min-h-[50px]`}
                      placeholder="Describe this feature..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(form.homeSettings?.readyToFind?.items?.length || 0) < 2 && (
            <button
              type="button"
              onClick={() => {
                setForm((prev: any) => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    readyToFind: {
                      ...(prev.homeSettings?.readyToFind || {}),
                      items: [
                        ...(prev.homeSettings?.readyToFind?.items || []),
                        { icon: '', title: '', subTitle: '', content: '' },
                      ],
                    },
                  },
                }));
              }}
              className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              + Add Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeSettingsTab;
