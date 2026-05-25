"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { WHATSAPP_CONFIG, getWhatsAppUrl, isBusinessHours } from "@/config/whatsapp-config";
import {
  SUPPORT_FAQ_ROLE_TABS,
  partitionFaqsForRole,
  type SupportFaqItem,
  type SupportFaqRoleTab,
} from "@/data/whatsapp-support-faq";
import { useUserContext } from "@/context/user-context";

interface WhatsAppChatWidgetProps {
  phoneNumber?: string;
  message?: string;
}

function roleFromUserType(userType: string | undefined): SupportFaqRoleTab | null {
  switch (userType) {
    case "Agent":
    case "FieldAgent":
      return "agent";
    case "Developer":
      return "developer";
    case "Landowners":
      return "landlord";
    default:
      return null;
  }
}

function FaqAccordion({
  items,
  expandedId,
  onToggle,
  onWhatsApp,
}: {
  items: SupportFaqItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onWhatsApp: (message: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
          >
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="flex w-full items-start justify-between gap-2 p-3 text-left transition-colors hover:bg-gray-100"
              aria-expanded={isExpanded}
            >
              <span className="text-sm font-medium text-gray-800">{item.question}</span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="space-y-3 border-t border-gray-100 bg-white px-3 pb-3 pt-2">
                <p className="text-sm leading-relaxed text-gray-700">{item.answer}</p>
                <button
                  type="button"
                  onClick={() => onWhatsApp(item.whatsappMessage)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 px-3 py-2 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Still need help? Chat on WhatsApp
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  phoneNumber = WHATSAPP_CONFIG.phoneNumber,
  message = WHATSAPP_CONFIG.defaultMessages.general,
}) => {
  const { user } = useUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<SupportFaqRoleTab | null>(null);
  const [roleTouched, setRoleTouched] = useState(false);

  useEffect(() => {
    if (roleTouched || selectedRole) return;
    const inferred = roleFromUserType(user?.userType);
    if (inferred) setSelectedRole(inferred);
  }, [user?.userType, roleTouched, selectedRole]);

  const { general, forYou } = useMemo(
    () => (selectedRole ? partitionFaqsForRole(selectedRole) : { general: [], forYou: [] }),
    [selectedRole],
  );

  const selectedRoleLabel =
    SUPPORT_FAQ_ROLE_TABS.find((tab) => tab.id === selectedRole)?.label ?? "";
  const selectedRoleHeading =
    selectedRole === "client"
      ? "For clients & buyers"
      : selectedRole
        ? `For ${selectedRoleLabel}s`
        : "";

  const openWhatsAppChat = (customMessage?: string) => {
    const whatsappUrl = getWhatsAppUrl(phoneNumber, customMessage ?? message);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const toggleFaq = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const selectRole = (role: SupportFaqRoleTab) => {
    setRoleTouched(true);
    setSelectedRole(role);
    setExpandedId(null);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) setExpandedId(null);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex max-h-[calc(100dvh-1.5rem)] flex-col items-start justify-end">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Khabi-Teq support"
          className="mb-4 flex max-h-[calc(100dvh-7.5rem)] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          <div
            className="flex shrink-0 items-center justify-between rounded-t-2xl p-4 text-white"
            style={{ backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{WHATSAPP_CONFIG.team.name}</h3>
                <p className="text-xs text-green-100">
                  {isBusinessHours() ? "Online" : "Offline"} • {WHATSAPP_CONFIG.team.responseTime}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleChat}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close support panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scroll-smooth">
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="flex items-start space-x-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-sm text-gray-800">Hi there! Welcome to Khabi-Teq support.</p>
                  <p className="text-sm text-gray-600">
                    Choose your role, then browse answers that apply to you—or chat on WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">I am a…</h4>
                <p className="mt-1 text-xs text-gray-500">
                  Pick your account type so we only show relevant questions.
                </p>
                <div
                  className="mt-2 grid grid-cols-2 gap-2"
                  role="tablist"
                  aria-label="Support topics by user type"
                >
                  {SUPPORT_FAQ_ROLE_TABS.map((tab) => {
                    const isActive = selectedRole === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => selectRole(tab.id)}
                        className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                          isActive
                            ? "border-[#128C7E] bg-[#25D366]/10 text-[#128C7E]"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="block text-sm font-medium">{tab.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
                          {tab.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                role="note"
                aria-label="How to use support topics"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  How to use this guide
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-600">
                  <li>Select Agent, Developer, Landlord, or Client / Buyer above.</li>
                  <li>Tap a question to expand and read the answer.</li>
                  <li>If you need more help, use the WhatsApp button under any answer.</li>
                </ul>
              </div>

              {!selectedRole ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center">
                  <p className="text-sm text-gray-600">
                    Choose your role to see support topics tailored for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forYou.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-gray-900">
                        {selectedRoleHeading}
                      </h4>
                      <FaqAccordion
                        items={forYou}
                        expandedId={expandedId}
                        onToggle={toggleFaq}
                        onWhatsApp={openWhatsAppChat}
                      />
                    </div>
                  )}

                  {general.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-gray-900">General</h4>
                      <FaqAccordion
                        items={general}
                        expandedId={expandedId}
                        onToggle={toggleFaq}
                        onWhatsApp={openWhatsAppChat}
                      />
                    </div>
                  )}

                  {forYou.length === 0 && general.length === 0 && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-4 text-center">
                      <p className="text-sm text-gray-600">No topics found for this role.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
              <span>{WHATSAPP_CONFIG.team.availability}</span>
              <div className="flex items-center space-x-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isBusinessHours() ? "animate-pulse bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span>{isBusinessHours() ? "Online" : "Offline"}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openWhatsAppChat()}
              className="flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-3 font-medium text-white transition-colors"
              style={{ backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.hoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.primaryColor;
              }}
            >
              <Send className="h-4 w-4" />
              <span>Start WhatsApp Chat</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="group relative transform rounded-full p-4 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.primaryColor;
        }}
        aria-label="Open WhatsApp support"
      >
        <div
          className="absolute inset-0 animate-ping rounded-full opacity-30"
          style={{ backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor }}
        />
        <div className="relative">
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </div>

        {!isOpen && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          </div>
        )}

        {!isOpen && (
          <div className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Chat with us on WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        )}
      </button>
    </div>
  );
};

export default WhatsAppChatWidget;
