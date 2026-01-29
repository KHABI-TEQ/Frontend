/**
 * Test script to submit preferences for all types as a real user would
 * Run this in the browser console or via Node.js (with fetch polyfill)
 */

const API_URL = "https://khabiteq-realty.onrender.com/api";

// Test data for Buy preference
const buyPreferencePayload = {
  preferenceType: "buy",
  preferenceMode: "buy",
  location: {
    state: "Lagos",
    localGovernmentAreas: ["Ikoyi", "Victoria Island"],
    lgasWithAreas: [
      {
        lgaName: "Ikoyi",
        areas: ["Ikoyi", "Old Ikoyi Road"]
      },
      {
        lgaName: "Victoria Island",
        areas: ["VI", "Lekki"]
      }
    ],
    customLocation: ""
  },
  budget: {
    minPrice: 100000000,
    maxPrice: 500000000,
    currency: "NGN"
  },
  propertyDetails: {
    propertyType: "Residential",
    buildingType: "Detached",
    minBedrooms: 4,
    minBathrooms: 3,
    propertyCondition: "New",
    purpose: "For living",
    measurementUnit: "sqm",
    minLandSize: "500",
    maxLandSize: "2000"
  },
  features: {
    baseFeatures: ["Swimming Pool", "Security", "Parking Space"],
    premiumFeatures: ["Home Cinema", "Gym"],
    autoAdjustToFeatures: false
  },
  contactInfo: {
    fullName: "John Doe Test",
    email: "johntest@example.com",
    phoneNumber: "+2347012345678"
  },
  nearbyLandmark: "Near Lekki Conservation Centre",
  additionalNotes: "Preference test submission for BUY type"
};

// Test data for Rent preference
const rentPreferencePayload = {
  preferenceType: "rent",
  preferenceMode: "tenant",
  location: {
    state: "Abuja",
    localGovernmentAreas: ["Garki", "Maitama"],
    lgasWithAreas: [
      {
        lgaName: "Garki",
        areas: ["Garki I", "Garki II"]
      },
      {
        lgaName: "Maitama",
        areas: ["Maitama"]
      }
    ],
    customLocation: ""
  },
  budget: {
    minPrice: 5000000,
    maxPrice: 15000000,
    currency: "NGN"
  },
  propertyDetails: {
    propertyType: "Flat",
    buildingType: "Block of Flats",
    minBedrooms: 3,
    minBathrooms: 2,
    leaseTerm: "1 Year",
    propertyCondition: "New",
    purpose: "Residential"
  },
  features: {
    baseFeatures: ["Security", "Parking Space"],
    premiumFeatures: ["Generator", "Solar"],
    autoAdjustToFeatures: false
  },
  contactInfo: {
    fullName: "Jane Smith Test",
    email: "janesmith@example.com",
    phoneNumber: "+2348012345678"
  },
  nearbyLandmark: "Near Nnamdi Azikiwe International Airport",
  additionalNotes: "Preference test submission for RENT type"
};

// Test data for Shortlet preference
const shortletPreferencePayload = {
  preferenceType: "shortlet",
  preferenceMode: "shortlet",
  location: {
    state: "Lagos",
    localGovernmentAreas: ["Lekki", "Ikoyi"],
    lgasWithAreas: [
      {
        lgaName: "Lekki",
        areas: ["Lekki Phase 1", "Lekki Phase 2"]
      },
      {
        lgaName: "Ikoyi",
        areas: ["Ikoyi"]
      }
    ],
    customLocation: ""
  },
  budget: {
    minPrice: 50000,
    maxPrice: 200000,
    currency: "NGN"
  },
  bookingDetails: {
    propertyType: "2-Bed Apartment",
    minBedrooms: 2,
    numberOfGuests: 4,
    checkInDate: "2024-02-15",
    checkOutDate: "2024-02-22",
    travelType: "Vacation"
  },
  features: {
    baseFeatures: ["WiFi", "Kitchen", "Parking"],
    premiumFeatures: ["Pool Access", "Gym"],
    autoAdjustToFeatures: false
  },
  contactInfo: {
    fullName: "Robert Brown Test",
    email: "rbrown@example.com",
    phoneNumber: "+2349012345678",
    maxBudgetPerNight: 150000,
    willingToPayExtra: true,
    petsAllowed: false,
    smokingAllowed: false,
    partiesAllowed: false,
    cancellationPolicy: "Flexible"
  },
  nearbyLandmark: "Near Chevron",
  additionalNotes: "Preference test submission for SHORTLET type"
};

// Test data for Joint Venture preference
const jointVenturePayload = {
  preferenceType: "joint-venture",
  preferenceMode: "developer",
  location: {
    state: "Lagos",
    localGovernmentAreas: ["Ajah", "Lekki"],
    lgasWithAreas: [
      {
        lgaName: "Ajah",
        areas: ["Ajah", "Sangotedo"]
      },
      {
        lgaName: "Lekki",
        areas: ["Lekki Phase 2"]
      }
    ],
    customLocation: ""
  },
  budget: {
    minPrice: 500000000,
    maxPrice: 2000000000,
    currency: "NGN"
  },
  developmentDetails: {
    minLandSize: "5000",
    maxLandSize: "20000",
    measurementUnit: "sqm",
    developmentTypes: ["Residential Development", "Mixed Use Development"],
    preferredSharingRatio: "50-50",
    proposalDetails: "Looking for partnership in Lagos",
    minimumTitleRequirements: ["Registered Deed of Assignment", "Survey Plan"],
    willingToConsiderPendingTitle: true,
    additionalRequirements: "Land must be accessible by road"
  },
  features: {
    baseFeatures: [],
    premiumFeatures: [],
    autoAdjustToFeatures: false
  },
  contactInfo: {
    fullName: "David Properties Test",
    email: "daviddev@example.com",
    phoneNumber: "+2347019876543"
  }
};

// Function to submit a preference
async function submitPreference(
  payload: any,
  preferenceType: string
): Promise<void> {
  try {
    console.log(`\n📤 Submitting ${preferenceType.toUpperCase()} preference...`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/preferences/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      console.log(
        `✅ ${preferenceType.toUpperCase()} preference submitted successfully!`
      );
      console.log("Response:", result);
      return result;
    } else {
      console.error(
        `❌ Failed to submit ${preferenceType.toUpperCase()} preference`
      );
      console.error("Error:", result);
      throw new Error(result.message || "Submission failed");
    }
  } catch (error) {
    console.error(`❌ Error submitting ${preferenceType} preference:`, error);
    throw error;
  }
}

// Main test function
async function runAllPreferenceTests(): Promise<void> {
  console.log("🚀 Starting preference submission tests...\n");
  console.log("API URL:", API_URL);

  const results: Record<string, { success: boolean; error?: string }> = {
    buy: { success: false },
    rent: { success: false },
    shortlet: { success: false },
    "joint-venture": { success: false },
  };

  // Test BUY
  try {
    await submitPreference(buyPreferencePayload, "buy");
    results.buy.success = true;
  } catch (error) {
    results.buy.error = String(error);
  }

  // Test RENT
  try {
    await submitPreference(rentPreferencePayload, "rent");
    results.rent.success = true;
  } catch (error) {
    results.rent.error = String(error);
  }

  // Test SHORTLET
  try {
    await submitPreference(shortletPreferencePayload, "shortlet");
    results.shortlet.success = true;
  } catch (error) {
    results.shortlet.error = String(error);
  }

  // Test JOINT VENTURE
  try {
    await submitPreference(jointVenturePayload, "joint-venture");
    results["joint-venture"].success = true;
  } catch (error) {
    results["joint-venture"].error = String(error);
  }

  // Summary
  console.log("\n========== TEST SUMMARY ==========");
  console.log(
    `✅ Successful: ${
      Object.values(results).filter((r) => r.success).length
    } out of 4`
  );
  console.log(
    `❌ Failed: ${Object.values(results).filter((r) => !r.success).length} out of 4`
  );
  console.log("\nDetailed Results:");
  Object.entries(results).forEach(([type, result]) => {
    const status = result.success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`  ${type.toUpperCase()}: ${status}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  console.log("==================================\n");
}

// Export for use in browser or Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runAllPreferenceTests,
    submitPreference,
    buyPreferencePayload,
    rentPreferencePayload,
    shortletPreferencePayload,
    jointVenturePayload,
  };
}

// Run tests if executed directly
if (typeof window !== "undefined") {
  // Browser environment
  console.log(
    "Run: runAllPreferenceTests() to start testing all preference types"
  );
} else {
  // Node.js environment - run automatically
  runAllPreferenceTests().catch(console.error);
}
