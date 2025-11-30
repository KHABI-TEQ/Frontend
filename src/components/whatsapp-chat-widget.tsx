"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Phone, Send } from 'lucide-react';
import { WHATSAPP_CONFIG, getWhatsAppUrl, isBusinessHours } from '@/config/whatsapp-config';

interface WhatsAppChatWidgetProps {
  phoneNumber?: string;
  message?: string;
}

const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  phoneNumber = WHATSAPP_CONFIG.phoneNumber,
  message = WHATSAPP_CONFIG.defaultMessages.general
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const openWhatsAppChat = () => {
    const whatsappUrl = getWhatsAppUrl(phoneNumber, message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const minimizeWidget = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Chat Popup */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="text-white p-4 rounded-t-2xl flex items-center justify-between" style={{backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor}}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{WHATSAPP_CONFIG.team.name}</h3>
                <p className="text-xs text-green-100">
                  {isBusinessHours() ? "Online" : "Offline"} • {WHATSAPP_CONFIG.team.responseTime}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="p-4 space-y-4">
            {/* Welcome Message */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-2">
                    👋 Hi there! Welcome to Khabi-Teq support.
                  </p>
                  <p className="text-sm text-gray-600">
                    How can we help you with document verification today?
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Quick Actions
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    const whatsappUrl = getWhatsAppUrl(phoneNumber, WHATSAPP_CONFIG.defaultMessages.documentVerification);
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      📄
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Document Verification Help
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const whatsappUrl = getWhatsAppUrl(phoneNumber, WHATSAPP_CONFIG.defaultMessages.paymentSupport);
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      💳
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Payment Support
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const whatsappUrl = getWhatsAppUrl(phoneNumber, WHATSAPP_CONFIG.defaultMessages.technicalIssue);
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      🔧
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Technical Support
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{WHATSAPP_CONFIG.team.availability}</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isBusinessHours() ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>{isBusinessHours() ? "Online" : "Offline"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <button
              onClick={openWhatsAppChat}
              className="w-full text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              style={{
                backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.hoverColor}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.primaryColor}
            >
              <Send className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group relative"
        style={{
          backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.hoverColor}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = WHATSAPP_CONFIG.appearance.primaryColor}
        aria-label="Open WhatsApp Chat"
      >
        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{backgroundColor: WHATSAPP_CONFIG.appearance.primaryColor}}></div>
        
        {/* Icon */}
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </div>

        {/* Badge */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Chat with us on WhatsApp
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        )}
      </button>

      {/* Minimize button when widget is open */}
      {isOpen && (
        <button
          onClick={minimizeWidget}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Minimize widget"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default WhatsAppChatWidget;
