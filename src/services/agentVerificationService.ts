/** @format */

import { GET_REQUEST, POST_REQUEST, PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import {
  AgentVerificationSubscriptionPayload,
  AgentVerificationResponse,
  SubscriptionApiResponse,
} from "@/types/subscription.types";
import {
  AgentState,
  AgentUpgradeFormData,
  PublicAgentProfile,
  InspectionFeeSetup,
} from "@/types/agent-upgrade.types";

export class AgentVerificationService {
  private static getAuthToken() {
    return Cookies.get("token");
  }

  /**
   * Submit agent upgrade request with verification data
   */
  static async submitAgentUpgrade(
    upgradeData: Partial<AgentUpgradeFormData>
  ): Promise<AgentVerificationResponse> {
    const payload: AgentVerificationSubscriptionPayload = {
      subscriptionType: upgradeData.selectedPlan?.type as 'monthly' | 'quarterly' | 'yearly',
      duration: upgradeData.selectedPlan?.duration as 1 | 3 | 12,
      amount: upgradeData.selectedPlan?.discountedPrice || 0,
      agentVerificationData: {
        basicProfile: upgradeData.basicProfile!,
        extendedProfile: upgradeData.extendedProfile!,
        inspectionFee: upgradeData.inspectionFee!,
      },
    };

    try {
      const response = await POST_REQUEST(
        `${URLS.BASE}${URLS.agentUpgrade}`,
        payload,
        this.getAuthToken()
      );

      return response as AgentVerificationResponse;
    } catch (error) {
      console.error("Agent upgrade submission failed:", error);
      throw error;
    }
  }

  /**
   * Get agent verification status
   */
  static async getAgentVerificationStatus(): Promise<{
    agentState: AgentState;
    verificationStatus: {
      kycCompleted: boolean;
      profileCompleted: boolean;
      inspectionFeeSet: boolean;
      hasActiveSubscription: boolean;
    };
    publicProfileUrl?: string;
  }> {
    try {
      const response = await GET_REQUEST(
        `${URLS.BASE}${URLS.agentVerificationStatus}`,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get agent verification status:", error);
      throw error;
    }
  }

  /**
   * Get agent's public profile data
   */
  static async getAgentPublicProfile(agentId: string): Promise<PublicAgentProfile> {
    try {
      const response = await GET_REQUEST(
        `${URLS.BASE}${URLS.agentPublicProfile}/${agentId}`,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get agent public profile:", error);
      throw error;
    }
  }

  /**
   * Update agent profile information
   */
  static async updateAgentProfile(profileData: any): Promise<SubscriptionApiResponse> {
    try {
      const response = await PUT_REQUEST(
        `${URLS.BASE}${URLS.updateAgentProfile}`,
        profileData,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update agent profile:", error);
      throw error;
    }
  }

  /**
   * Set or update agent inspection fee
   */
  static async setInspectionFee(
    inspectionFeeData: InspectionFeeSetup
  ): Promise<SubscriptionApiResponse> {
    try {
      const response = await PUT_REQUEST(
        `${URLS.BASE}${URLS.setInspectionFee}`,
        inspectionFeeData,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to set inspection fee:", error);
      throw error;
    }
  }

  /**
   * Get agent statistics and metrics
   */
  static async getAgentStats(): Promise<{
    totalListings: number;
    activeListings: number;
    completedDeals: number;
    totalInspections: number;
    inspectionEarnings: number;
    profileViews: number;
    rating: number;
    reviewCount: number;
  }> {
    try {
      const response = await GET_REQUEST(
        `${URLS.BASE}${URLS.getAgentStats}`,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to get agent stats:", error);
      throw error;
    }
  }

  /**
   * Verify payment for agent upgrade
   */
  static async verifyUpgradePayment(reference: string): Promise<{
    success: boolean;
    verificationComplete: boolean;
    agentState: AgentState;
    publicProfileUrl?: string;
  }> {
    try {
      const response = await GET_REQUEST(
        `${URLS.BASE}${URLS.verifyPayment}?reference=${reference}&type=agent_upgrade`,
        this.getAuthToken()
      );

      return response.data;
    } catch (error) {
      console.error("Failed to verify upgrade payment:", error);
      throw error;
    }
  }

  /**
   * Generate shareable links for agent profile
   */
  static generateShareableLinks(agentId: string, agentName: string) {
    const profileUrl = `${window.location.origin}/agent-profile/${agentId}`;
    
    const whatsappMessage = `🏠 Check out my verified agent profile on Khabiteq Realty! I'm ${agentName}, a verified real estate agent offering professional services. View my profile: ${profileUrl}`;
    
    const linkedinMessage = `I'm excited to announce that I'm now a verified agent on Khabiteq Realty! Check out my professional profile and connect with me for all your real estate needs.`;

    return {
      profileUrl,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
      linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(linkedinMessage)}`,
      facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my verified agent profile on Khabiteq Realty!`)}&url=${encodeURIComponent(profileUrl)}`,
    };
  }

  /**
   * Check if agent can access certain features based on their state
   */
  static checkAgentPermissions(agentState: AgentState) {
    const permissions = {
      canCreatePublicPage: agentState === 'verified',
      canPostUnlimitedListings: agentState === 'verified',
      hasCommissionRemoved: agentState === 'verified',
      hasVerifiedBadge: agentState === 'verified',
      canSetInspectionFee: agentState === 'verified',
      canReceiveInspectionBookings: agentState === 'verified',
    };

    return permissions;
  }

  /**
   * Format agent state for display
   */
  static formatAgentStateDisplay(agentState: AgentState) {
    const stateConfig = {
      free: {
        label: "Free Agent",
        color: "gray",
        description: "Basic features available",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      },
      verified: {
        label: "Verified Agent",
        color: "green",
        description: "All premium features unlocked",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
      },
      expired: {
        label: "Subscription Expired",
        color: "orange",
        description: "Renew to restore premium features",
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
      },
    };

    return stateConfig[agentState];
  }

  /**
   * Calculate subscription renewal date
   */
  static calculateRenewalDate(startDate: string, duration: number): string {
    const start = new Date(startDate);
    const renewal = new Date(start);
    renewal.setMonth(renewal.getMonth() + duration);
    return renewal.toISOString();
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  static isSubscriptionExpiringSoon(endDate: string): boolean {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Format currency for Nigerian Naira
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate total earnings after Khabiteq deduction
   */
  static calculateInspectionEarnings(inspectionFee: number): {
    clientPays: number;
    khabiteqDeduction: number;
    agentEarns: number;
  } {
    const khabiteqDeduction = 1000; // Fixed deduction as per specification
    const agentEarns = Math.max(0, inspectionFee - khabiteqDeduction);
    
    return {
      clientPays: inspectionFee,
      khabiteqDeduction,
      agentEarns,
    };
  }
}

export default AgentVerificationService;
