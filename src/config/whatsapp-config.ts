export const WHATSAPP_CONFIG = {
  // Main support number (Nigerian format)
  phoneNumber: "+2348132108659",
  
  // Default messages for different scenarios
  defaultMessages: {
    general: "Hi! I need help with Khabi-Teq services.",
    documentVerification: "I need help with document verification",
    paymentSupport: "I need support with payment verification",
    technicalIssue: "I have a technical issue with the platform",
    propertyInquiry: "I have questions about a property listing",
    inspectionHelp: "I need help with property inspection services"
  },

  // Business hours (in user's timezone)
  businessHours: {
    start: "09:00",
    end: "18:00",
    timezone: "Africa/Lagos",
    workdays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
  },

  // Widget appearance settings
  appearance: {
    position: "bottom-left", // or "bottom-right"
    primaryColor: "#25D366", // WhatsApp green
    hoverColor: "#22C55E",
    showOnlineStatus: true,
    showTooltip: true,
    animateButton: true,
  },

  // Team info
  team: {
    name: "Khabi-Teq Support",
    responseTime: "Responds quickly",
    availability: "Available 24/7", // or "Available during business hours"
  }
};

export const getWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
};

export const isBusinessHours = (): boolean => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toLocaleTimeString('en-GB', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: WHATSAPP_CONFIG.businessHours.timezone 
  });

  const isWorkday = WHATSAPP_CONFIG.businessHours.workdays.includes(currentDay);
  const isWithinHours = currentTime >= WHATSAPP_CONFIG.businessHours.start && 
                       currentTime <= WHATSAPP_CONFIG.businessHours.end;

  return isWorkday && isWithinHours;
};
