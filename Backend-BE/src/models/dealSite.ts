import { Schema, model, Document, Model, Types } from "mongoose";

export type DealSiteStatus = "pending" | "on-hold" | "deleted" | "running" | "paused";
export type DefaultTab = "buy" | "rent" | "shortlet" | "jv";

export interface IDealSite {
  publicSlug: string;
  title: string;
  keywords: string[];
  description: string;
  logoUrl?: string;

  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };

  inspectionSettings?: {
    allowPublicBooking: boolean;
    defaultInspectionFee: number;
    inspectionStatus?: string;
    negotiationEnabled: boolean;
  };

  listingsLimit?: number;

  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };

  contactVisibility?: {
    showEmail: boolean;
    showPhone: boolean;
    enableContactForm: boolean;
    showWhatsAppButton: boolean;
    whatsappNumber?: string;
  };

  featureSelection?: {
    mode?: "auto" | "manual";
    propertyIds?: string;
    featuredListings?: string[];
  };

  marketplaceDefaults?: {
    defaultTab: DefaultTab;
    defaultSort?: "newest" | "price-asc" | "price-desc";
    showVerifiedOnly: boolean;
    enablePriceNegotiationButton: boolean;
  };

  footer?: {
    shortDescription: string;
    copyrightText: string;
  };

  securitySettings?: {
    enablePasswordProtection?: boolean;
    pagePassword?: string;
    enableRateLimiting?: boolean;
    enableSpamFilter?: boolean;
    requireEmailVerification?: boolean;
  };

  publicPage?: {
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    ctaLink: string;
    ctaText2?: string;
    ctaLink2?: string;
    heroImageUrl?: string;
    heroImage?: string;
  };

  about?: {
    whoWeAre?: {
      title: string;
      description: string;
      image?: string;
    };
    ourMission?: {
      title: string;
      description: string;
      image?: string;
    };
    ourExperience?: {
      title: string;
      description: string;
      image?: string;
    };
    whatWeStandFor?: {
      title: string;
      description: string;
      items?: {
        title: string;
        shortText: string;
      }[];
    };
    whatWeDo?: {
      title: string;
      items?: {
        title: string;
      }[];
    };
    whereWeOperate?: {
      title: string;
      locations?: {
        name: string;
        address: string;
        coordinates?: [number, number];
      }[];
    };
    profile?: {
      members?: {
        name: string;
        role: string;
        image: string;
        bio: string;
      }[];
    };
  };

  contactUs?: {
    hero?: {
      title: string;
      description: string;
    };
    cta?: {
      title: string;
    };
  };

  homeSettings?: {
    testimonials?: {
      title: string;
      subTitle: string;
      testimonials: {
        _id?: string;
        id?: string;
        rating: number;
        description: string;
        image: string;
        name: string;
        company: string;
      }[];
    };
    whyChooseUs?: {
      title: string;
      subTitle: string;
      items: {
        _id?: string;
        id?: string;
        icon: string;
        title: string;
        content: string;
      }[];
    };
    readyToFind?: {
      title?: string;
      subTitle?: string;
      ctas?: Array<{ bgColor: string; text: string; actionLink: string }>;
      items?: Array<{ icon?: string; title: string; subTitle: string; content: string }>;
    };
  };


  subscribeSettings?: {
    title: string;
    subTitle: string;
    miniTitle?: string;
    backgroundColor?: string;
    cta?: {
      text?: string;
      color?: string;
    };
  };

  paymentDetails?: {
    subAccountCode?: string;
    businessName?: string;
    accountNumber?: string;
    accountName?: string;
    accountBankName?: string;
    primaryContactEmail?: string;
    primaryContactName?: string;
    primaryContactPhone?: string;
    sortCode?: string;
    percentageCharge?: number;
    isVerified?: boolean;
    active?: boolean;
  };

  status: DealSiteStatus;
  createdBy: Types.ObjectId;
}

export interface IDealSiteDoc extends IDealSite, Document {}
export type IDealSiteModel = Model<IDealSiteDoc>;

export class DealSite {
  private dealSiteModel: IDealSiteModel;

  constructor() {
    const schema = new Schema<IDealSiteDoc>(
      {
        publicSlug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        keywords: { type: [String], default: [] },
        description: { type: String, required: true },
        logoUrl: { type: String },

        theme: {
          primaryColor: { type: String, default: "#09391C" },
          secondaryColor: { type: String, default: "#8DDB90" },
        },

        inspectionSettings: {
          allowPublicBooking: { type: Boolean, default: true },
          defaultInspectionFee: { type: Number, default: 0 },
          inspectionStatus: {
            type: String,
            enum: ["required", "optional", "disabled"],
            default: "optional",
          },
          negotiationEnabled: { type: Boolean, default: true },
        },

        listingsLimit: { type: Number, default: 6 },

        socialLinks: {
          website: String,
          twitter: String,
          instagram: String,
          facebook: String,
          linkedin: String,
        },

        contactVisibility: {
          showEmail: { type: Boolean, default: true },
          showPhone: { type: Boolean, default: true },
          enableContactForm: { type: Boolean, default: true },
          showWhatsAppButton: { type: Boolean, default: false },
          whatsappNumber: { type: String, default: "" },
        },

        featureSelection: {
          mode: { type: String, enum: ["auto", "manual"], default: "auto" },
          propertyIds: { type: String, default: "" },
          featuredListings: [{ type: String }],
        },

        marketplaceDefaults: {
          defaultTab: {
            type: String,
            enum: ["buy", "rent", "shortlet", "jv"],
            default: "buy",
          },
          defaultSort: {
            type: String,
            enum: ["newest", "price-asc", "price-desc"],
            default: "newest",
          },
          showVerifiedOnly: { type: Boolean, default: false },
          enablePriceNegotiationButton: { type: Boolean, default: true },
        },

        publicPage: {
          heroTitle: { type: String, default: "" },
          heroSubtitle: { type: String, default: "" },
          ctaText: { type: String, default: "" },
          ctaLink: { type: String, default: "" },
          ctaText2: { type: String, default: "" },
          ctaLink2: { type: String, default: "" },
          heroImageUrl: { type: String, default: "" },
          heroImage: { type: String, default: "" },
        },

        // 🟢 About Section
        about: {
          // Who We Are
          whoWeAre: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            image: { type: String, default: "" },
          },

          // Our Mission
          ourMission: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            image: { type: String, default: "" },
          },

          // Our Experience
          ourExperience: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            image: { type: String, default: "" },
          },

          // What We Stand For
          whatWeStandFor: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            items: [
              {
                title: { type: String },
                shortText: { type: String },
              },
            ],
          },

          // What We Do
          whatWeDo: {
            title: { type: String, default: "" },
            items: [
              {
                title: { type: String },
              },
            ],
          },

          // Where We Operate
          whereWeOperate: {
            title: { type: String, default: "" },
            locations: [
              {
                name: { type: String },
                address: { type: String },
                coordinates: [{ type: Number }],
              },
            ],
          },

          // Profile / Team Members
          profile: {
            members: [
              {
                name: { type: String },
                role: { type: String },
                image: { type: String },
                bio: { type: String },
              },
            ],
          },
        },

        // 🟣 Contact Us Section
        contactUs: {
          // Hero Section
          hero: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },

          // Call to Action
          cta: {
            title: { type: String, default: "" },
          },
        },


        homeSettings: {
          testimonials: {
            title: { type: String, default: "" },
            subTitle: { type: String, default: "" },
            testimonials: [
              {
                _id: { type: String },
                id: { type: String },
                rating: { type: Number },
                description: { type: String },
                image: { type: String },
                name: { type: String },
                company: { type: String },
              },
            ],
          },
          whyChooseUs: {
            title: { type: String, default: "" },
            subTitle: { type: String, default: "" },
            items: [
              {
                _id: { type: String },
                id: { type: String },
                icon: { type: String },
                title: { type: String },
                content: { type: String },
              },
            ],
          },
        },
 
        subscribeSettings: {
          title: { type: String, default: "" },
          subTitle: { type: String, default: "" },
        },

        footer: {
          shortDescription: { type: String, default: "" },
          copyrightText: { type: String, default: "" },
        },

        securitySettings: {
          enablePasswordProtection: { type: Boolean, default: false },
          pagePassword: { type: String, default: "" },
          enableRateLimiting: { type: Boolean, default: true },
          enableSpamFilter: { type: Boolean, default: true },
          requireEmailVerification: { type: Boolean, default: false },
        },

        paymentDetails: {
          subAccountCode: { type: String },
          accountNumber: { type: String },
          businessName: { type: String },
          accountName: { type: String },
          accountBankName: { type: String },
          primaryContactEmail: { type: String },
          primaryContactPhone: { type: String },
          primaryContactName: { type: String },
          sortCode: { type: String },
          percentageCharge: { type: Number, default: 0 },
          isVerified: { type: Boolean, default: false },
          active: { type: Boolean, default: false },
        },

        status: {
          type: String,
          enum: ["pending", "on-hold", "deleted", "running", "paused"],
          default: "pending",
        },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
      { timestamps: true }
    );

    this.dealSiteModel = model<IDealSiteDoc>("DealSite", schema);
  }

  public get model(): IDealSiteModel {
    return this.dealSiteModel;
  }
}
