// @ts-ignore
import { Schema, model, Document, Model } from 'mongoose';

// Location Interface
export interface IPropertyLocation {
  state: string;
  localGovernment: string;
  area: string;
  streetAddress?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Land Size Interface
export interface ILandSize {
  size: string;
  measurementType: 'sqm' | 'sqft' | 'hectares' | 'plots';
}

// Additional Features Interface
export interface IAdditionalFeatures {
  noOfBedroom?: number;
  noOfBathroom?: number;
  noOfToilet?: number;
  noOfCarPark?: number;
  maxGuests?: number;
}

// Document on Property Interface
export interface IDocOnProperty {
  _id?: string;
  docName: string;
  docType: string;
  verified: boolean;
  uploadedAt: Date;
}

// Video Interface
export interface IPropertyVideo {
  file?: null;
  preview: string;
  id: string;
  url: string;
  isUploading: boolean;
}

// Owner Interface
export interface IPropertyOwner {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  verified: boolean;
}

// Availability Interface
export interface IPropertyAvailability {
  minStay: number;
  maxStay?: number;
  calendar?: string;
}

// Pricing Interface
export interface IPropertyPricing {
  nightly?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  cancellationPolicy?: string;
}

// House Rules Interface
export interface IPropertyHouseRules {
  checkIn: string;
  checkOut: string;
  smoking: boolean;
  pets: boolean;
  parties: boolean;
  otherRules?: string;
}

// Main Property Interface
export interface IProperty {
  briefType: 'Outright Sales' | 'Rent' | 'Shortlet' | 'Joint Venture';
  propertyType: string;
  propertyCategory: 'Residential' | 'Commercial' | 'Land' | 'Mixed Development';
  propertyCondition?: string;
  typeOfBuilding?: string;
  rentalType?: string;
  leaseHold?: string;
  holdDuration?: string;
  shortletDuration?: string;
  location: IPropertyLocation;
  landSize?: ILandSize;
  price: number;
  additionalFeatures?: IAdditionalFeatures;
  docOnProperty?: IDocOnProperty[];
  features?: string[];
  tenantCriteria?: string[];
  rentalConditions?: string[];
  employmentType?: string;
  tenantGenderPreference?: string;
  jvConditions?: string[];
  description: string;
  addtionalInfo?: string;
  pictures: string[];
  videos?: IPropertyVideo[];
  owner: IPropertyOwner;
  areYouTheOwner: boolean;
  ownershipDocuments?: string[];
  isTenanted?: string;
  availability?: IPropertyAvailability;
  pricing?: IPropertyPricing;
  houseRules?: IPropertyHouseRules;
  status: 'active' | 'inactive' | 'sold' | 'rented' | 'under-review' | 'suspended';
  views: number;
  likes: number;
  isPremium: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IPropertyDoc extends IProperty, Document {}

export type IPropertyModel = Model<IPropertyDoc>;

export class Property {
  private PropertyModel: Model<IPropertyDoc>;

  constructor() {
    const locationSchema = new Schema(
      {
        state: {
          type: String,
          required: true,
          trim: true,
        },
        localGovernment: {
          type: String,
          required: true,
          trim: true,
        },
        area: {
          type: String,
          required: true,
          trim: true,
        },
        streetAddress: {
          type: String,
          trim: true,
        },
        coordinates: {
          latitude: {
            type: Number,
          },
          longitude: {
            type: Number,
          },
        },
      },
      { _id: false }
    );

    const landSizeSchema = new Schema(
      {
        size: {
          type: String,
          required: true,
        },
        measurementType: {
          type: String,
          enum: ['sqm', 'sqft', 'hectares', 'plots'],
          required: true,
        },
      },
      { _id: false }
    );

    const additionalFeaturesSchema = new Schema(
      {
        noOfBedroom: {
          type: Number,
          min: 0,
          max: 20,
        },
        noOfBathroom: {
          type: Number,
          min: 0,
          max: 20,
        },
        noOfToilet: {
          type: Number,
          min: 0,
          max: 20,
        },
        noOfCarPark: {
          type: Number,
          min: 0,
        },
        maxGuests: {
          type: Number,
          min: 0,
        },
      },
      { _id: false }
    );

    const docOnPropertySchema = new Schema(
      {
        docName: {
          type: String,
          required: true,
        },
        docType: {
          type: String,
          required: true,
        },
        verified: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
      { _id: true }
    );

    const videoSchema = new Schema(
      {
        file: {
          type: null,
          default: null,
        },
        preview: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        isUploading: {
          type: Boolean,
          default: false,
        },
      },
      { _id: false }
    );

    const ownerSchema = new Schema(
      {
        fullName: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
        },
        phoneNumber: {
          type: String,
          required: true,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
      { _id: true }
    );

    const availabilitySchema = new Schema(
      {
        minStay: {
          type: Number,
          required: true,
          min: 1,
        },
        maxStay: {
          type: Number,
          min: 1,
        },
        calendar: {
          type: String,
        },
      },
      { _id: false }
    );

    const pricingSchema = new Schema(
      {
        nightly: {
          type: Number,
          min: 0,
        },
        weeklyDiscount: {
          type: Number,
          min: 0,
          max: 100,
        },
        monthlyDiscount: {
          type: Number,
          min: 0,
          max: 100,
        },
        cleaningFee: {
          type: Number,
          min: 0,
        },
        securityDeposit: {
          type: Number,
          min: 0,
        },
        cancellationPolicy: {
          type: String,
        },
      },
      { _id: false }
    );

    const houseRulesSchema = new Schema(
      {
        checkIn: {
          type: String,
          required: true,
        },
        checkOut: {
          type: String,
          required: true,
        },
        smoking: {
          type: Boolean,
          default: false,
        },
        pets: {
          type: Boolean,
          default: false,
        },
        parties: {
          type: Boolean,
          default: false,
        },
        otherRules: {
          type: String,
        },
      },
      { _id: false }
    );

    const schema = new Schema(
      {
        briefType: {
          type: String,
          enum: ['Outright Sales', 'Rent', 'Shortlet', 'Joint Venture'],
          required: true,
          index: true,
        },
        propertyType: {
          type: String,
          required: true,
        },
        propertyCategory: {
          type: String,
          enum: ['Residential', 'Commercial', 'Land', 'Mixed Development'],
          required: true,
          index: true,
        },
        propertyCondition: {
          type: String,
        },
        typeOfBuilding: {
          type: String,
        },
        rentalType: {
          type: String,
        },
        leaseHold: {
          type: String,
        },
        holdDuration: {
          type: String,
        },
        shortletDuration: {
          type: String,
        },
        location: {
          type: locationSchema,
          required: true,
        },
        landSize: {
          type: landSizeSchema,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        additionalFeatures: {
          type: additionalFeaturesSchema,
        },
        docOnProperty: [docOnPropertySchema],
        features: [
          {
            type: String,
          },
        ],
        tenantCriteria: [
          {
            type: String,
          },
        ],
        rentalConditions: [
          {
            type: String,
          },
        ],
        employmentType: {
          type: String,
        },
        tenantGenderPreference: {
          type: String,
        },
        jvConditions: [
          {
            type: String,
          },
        ],
        description: {
          type: String,
          required: true,
        },
        addtionalInfo: {
          type: String,
        },
        pictures: [
          {
            type: String,
            required: true,
          },
        ],
        videos: [videoSchema],
        owner: {
          type: ownerSchema,
          required: true,
        },
        areYouTheOwner: {
          type: Boolean,
          required: true,
          default: false,
        },
        ownershipDocuments: [
          {
            type: String,
          },
        ],
        isTenanted: {
          type: String,
        },
        availability: {
          type: availabilitySchema,
        },
        pricing: {
          type: pricingSchema,
        },
        houseRules: {
          type: houseRulesSchema,
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'sold', 'rented', 'under-review', 'suspended'],
          default: 'active',
          index: true,
        },
        views: {
          type: Number,
          default: 0,
        },
        likes: {
          type: Number,
          default: 0,
        },
        isPremium: {
          type: Boolean,
          default: false,
          index: true,
        },
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending',
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );

    // Indexes for better query performance
    schema.index({ createdAt: -1 });
    schema.index({ status: 1 });
    schema.index({ briefType: 1 });
    schema.index({ 'location.state': 1, 'location.localGovernment': 1 });
    schema.index({ 'owner._id': 1 });
    schema.index({ price: 1 });
    schema.index({ isPremium: 1, createdAt: -1 });
    schema.index({ views: -1 });

    this.PropertyModel = model<IPropertyDoc>('Property', schema);
  }

  public get model(): Model<IPropertyDoc> {
    return this.PropertyModel;
  }
}
