"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { WHATSAPP_CONFIG, getWhatsAppUrl, isBusinessHours } from "@/config/whatsapp-config";
import { WHATSAPP_SUPPORT_FAQ, type SupportFaqItem } from "@/data/whatsapp-support-faq";

interface WhatsAppChatWidgetProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  phoneNumber = WHATSAPP_CONFIG.phoneNumber,
  message = WHATSAPP_CONFIG.defaultMessages.general,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openWhatsAppChat = (customMessage?: string) => {
    const whatsappUrl = getWhatsAppUrl(phoneNumber, customMessage ?? message);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const toggleFaq = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
                  <p className="text-sm text-gray-600">Browse answers below, or chat with us on WhatsApp.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">
                What would you like to know about Khabi-Teq?
              </h4>
              <div
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                role="note"
                aria-label="How to use support topics"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  How to use this guide
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-600">
                  <li>
                    Open the question that matches your situation—many mention
                    Agent, Landlord, Developer, buyer, or renter in the title.
                  </li>
                  <li>Tap a question to expand and read the answer.</li>
                  <li>
                    If you need more help, use the WhatsApp button under any answer.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                {WHATSAPP_SUPPORT_FAQ.map((item: SupportFaqItem) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(item.id)}
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
                            onClick={() => openWhatsAppChat(item.whatsappMessage)}
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
