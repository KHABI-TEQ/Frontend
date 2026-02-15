// @ts-ignore
import { Schema, model, Document, Model } from 'mongoose';

// Location Interface
export interface IPreferenceLocation {
  state: string;
  localGovernmentAreas: string[];
  selectedAreas?: string[];
  customLocation?: string;
}

// Budget Interface
export interface IBudget {
  minPrice: number;
  maxPrice: number;
  currency: 'NGN';
}

// Property Details Interface
export interface IPropertyDetails {
  propertySubtype?: string;
  buildingType?: string;
  bedrooms?: number | string;
  bathrooms?: number;
  propertyCondition?: string;
  purpose?: string;
  measurementUnit?: string;
  landSize?: string;
  documentTypes?: string[];
  landConditions?: string[];
}

// Features Interface
export interface IFeatures {
  baseFeatures?: string[];
  premiumFeatures?: string[];
  comfortFeatures?: string[];
  autoAdjustToFeatures?: boolean;
}

// Contact Info Interface
export interface IContactInfo {
  fullName?: string;
  email: string;
  phoneNumber: string;
  companyName?: string;
  contactPerson?: string;
  cacRegistrationNumber?: string;
}

// Development Details Interface
export interface IDevelopmentDetails {
  minLandSize?: string;
  jvType?: string;
  propertyType?: string;
  expectedStructureType?: string;
  timeline?: string;
  budgetRange?: number;
  measurementUnit?: string;
  developmentTypes?: string[];
  preferredSharingRatio?: string;
  minimumTitleRequirements?: string[];
}

// Booking Details Interface
export interface IBookingDetails {
  propertyType?: string;
  bedrooms?: number;
  numberOfGuests?: number;
  checkInDate?: string;
  checkOutDate?: string;
  travelType?: string;
}

// Main Preference Interface
export interface IPreference {
  preferenceType: 'buy' | 'rent' | 'joint-venture' | 'shortlet';
  preferenceMode: 'buyer' | 'tenant' | 'developer' | 'shortlet';
  userId: string;
  location: IPreferenceLocation;
  budget: IBudget;
  propertyDetails?: IPropertyDetails;
  features?: IFeatures;
  contactInfo: IContactInfo;
  developmentDetails?: IDevelopmentDetails;
  bookingDetails?: IBookingDetails;
  additionalNotes?: string;
  partnerExpectations?: string;
  nearbyLandmark?: string;
  status: 'active' | 'paused' | 'fulfilled' | 'expired' | 'archived';
  matchedProperties?: string[];
  views: number;
  responses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface IPreferenceDoc extends IPreference, Document {}

export type IPreferenceModel = Model<IPreferenceDoc>;

export class Preference {
  private PreferenceModel: Model<IPreferenceDoc>;

  constructor() {
    const locationSchema = new Schema(
      {
        state: {
          type: String,
          required: true,
          trim: true,
        },
        localGovernmentAreas: [
          {
            type: String,
            required: true,
            trim: true,
          },
        ],
        selectedAreas: [
          {
            type: String,
            trim: true,
          },
        ],
        customLocation: {
          type: String,
          trim: true,
          maxlength: 100,
        },
      },
      { _id: false }
    );

    const budgetSchema = new Schema(
      {
        minPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        maxPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        currency: {
          type: String,
          enum: ['NGN'],
          default: 'NGN',
          required: true,
        },
      },
      { _id: false }
    );

    const propertyDetailsSchema = new Schema(
      {
        propertySubtype: {
          type: String,
        },
        buildingType: {
          type: String,
        },
        bedrooms: {
          type: Schema.Types.Mixed,
        },
        bathrooms: {
          type: Number,
          min: 0,
        },
        propertyCondition: {
          type: String,
        },
        purpose: {
          type: String,
        },
        measurementUnit: {
          type: String,
          enum: ['sqm', 'sqft', 'hectares', 'plots'],
        },
        landSize: {
          type: String,
        },
        documentTypes: [
          {
            type: String,
          },
        ],
        landConditions: [
          {
            type: String,
          },
        ],
      },
      { _id: false }
    );

    const featuresSchema = new Schema(
      {
        baseFeatures: [
          {
            type: String,
          },
        ],
        premiumFeatures: [
          {
            type: String,
          },
        ],
        comfortFeatures: [
          {
            type: String,
          },
        ],
        autoAdjustToFeatures: {
          type: Boolean,
          default: false,
        },
      },
      { _id: false }
    );

    const contactInfoSchema = new Schema(
      {
        fullName: {
          type: String,
          trim: true,
          minlength: 2,
          maxlength: 50,
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        phoneNumber: {
          type: String,
          required: true,
          trim: true,
        },
        companyName: {
          type: String,
          trim: true,
          minlength: 3,
          maxlength: 100,
        },
        contactPerson: {
          type: String,
          trim: true,
        },
        cacRegistrationNumber: {
          type: String,
          trim: true,
          maxlength: 20,
        },
      },
      { _id: false }
    );

    const developmentDetailsSchema = new Schema(
      {
        minLandSize: {
          type: String,
        },
        jvType: {
          type: String,
          enum: ['Equity Split', 'Lease-to-Build', 'Development Partner'],
        },
        propertyType: {
          type: String,
        },
        expectedStructureType: {
          type: String,
        },
        timeline: {
          type: String,
          enum: ['Ready Now', 'In 3 Months', 'Within 1 Year'],
        },
        budgetRange: {
          type: Number,
          min: 0,
        },
        measurementUnit: {
          type: String,
          enum: ['sqm', 'sqft', 'hectares', 'plots'],
        },
        developmentTypes: [
          {
            type: String,
          },
        ],
        preferredSharingRatio: {
          type: String,
        },
        minimumTitleRequirements: [
          {
            type: String,
          },
        ],
      },
      { _id: false }
    );

    const bookingDetailsSchema = new Schema(
      {
        propertyType: {
          type: String,
        },
        bedrooms: {
          type: Number,
          min: 0,
        },
        numberOfGuests: {
          type: Number,
          min: 1,
        },
        checkInDate: {
          type: Date,
        },
        checkOutDate: {
          type: Date,
        },
        travelType: {
          type: String,
          enum: ['Leisure', 'Business', 'Relocation'],
        },
      },
      { _id: false }
    );

    const schema = new Schema(
      {
        preferenceType: {
          type: String,
          enum: ['buy', 'rent', 'joint-venture', 'shortlet'],
          required: true,
          index: true,
        },
        preferenceMode: {
          type: String,
          enum: ['buyer', 'tenant', 'developer', 'shortlet'],
          required: true,
        },
        userId: {
          type: String,
          required: true,
          index: true,
        },
        location: {
          type: locationSchema,
          required: true,
        },
        budget: {
          type: budgetSchema,
          required: true,
        },
        propertyDetails: {
          type: propertyDetailsSchema,
        },
        features: {
          type: featuresSchema,
        },
        contactInfo: {
          type: contactInfoSchema,
          required: true,
        },
        developmentDetails: {
          type: developmentDetailsSchema,
        },
        bookingDetails: {
          type: bookingDetailsSchema,
        },
        additionalNotes: {
          type: String,
          maxlength: 1000,
        },
        partnerExpectations: {
          type: String,
          maxlength: 1000,
        },
        nearbyLandmark: {
          type: String,
          maxlength: 200,
        },
        status: {
          type: String,
          enum: ['active', 'paused', 'fulfilled', 'expired', 'archived'],
          default: 'active',
          index: true,
        },
        matchedProperties: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Property',
          },
        ],
        views: {
          type: Number,
          default: 0,
        },
        responses: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
          index: true,
        },
        expiresAt: {
          type: Date,
          index: true,
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // Indexes for better query performance
    schema.index({ userId: 1, createdAt: -1 });
    schema.index({ preferenceType: 1 });
    schema.index({ status: 1, expiresAt: 1 });
    schema.index({ 'location.state': 1, preferenceType: 1 });
    schema.index({ 'budget.minPrice': 1, 'budget.maxPrice': 1 });
    schema.index({ createdAt: -1 });
    schema.index({ isActive: 1, expiresAt: 1 });
    schema.index({ matchedProperties: 1 });
    schema.index({ responses: -1 });

    this.PreferenceModel = model<IPreferenceDoc>('Preference', schema);
  }

  public get model(): Model<IPreferenceDoc> {
    return this.PreferenceModel;
  }
}
