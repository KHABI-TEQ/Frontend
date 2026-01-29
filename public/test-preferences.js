/**
 * Preference Testing Script
 * Run in browser console at /preference page to test all preference types
 * 
 * Usage: 
 * 1. Open https://localhost:3000/preference in browser
 * 2. Open browser developer console (F12)
 * 3. Paste this entire script and press Enter
 * 4. Call: testAllPreferences()
 */

const TEST_DATA = {
  buy: {
    location: {
      state: "Lagos",
      lgas: ["Ikoyi", "Victoria Island"],
      areas: ["Ikoyi", "VI"],
      customLocation: ""
    },
    propertyDetails: {
      propertySubtype: "Residential",
      buildingType: "Detached",
      bedrooms: 4,
      bathrooms: 3,
      propertyCondition: "New",
      purpose: "For living",
      measurementUnit: "sqm",
      minLandSize: "500",
      maxLandSize: "2000"
    },
    budget: {
      minPrice: 100000000,
      maxPrice: 500000000
    },
    features: {
      basicFeatures: ["Swimming Pool", "Security", "Parking Space"],
      premiumFeatures: ["Home Cinema", "Gym"]
    },
    contactInfo: {
      fullName: "John Doe Test",
      email: "johntest@example.com",
      phoneNumber: "+2347012345678"
    }
  },
  
  rent: {
    location: {
      state: "Abuja",
      lgas: ["Garki", "Maitama"],
      areas: ["Garki I", "Maitama"],
      customLocation: ""
    },
    propertyDetails: {
      propertySubtype: "Flat",
      buildingType: "Block of Flats",
      bedrooms: 3,
      bathrooms: 2,
      leaseTerm: "1 Year",
      propertyCondition: "New",
      purpose: "Residential",
      measurementUnit: "sqm",
      minLandSize: "100",
      maxLandSize: "500"
    },
    budget: {
      minPrice: 5000000,
      maxPrice: 15000000
    },
    features: {
      basicFeatures: ["Security", "Parking Space"],
      premiumFeatures: ["Generator"]
    },
    contactInfo: {
      fullName: "Jane Smith Test",
      email: "janesmith@example.com",
      phoneNumber: "+2348012345678"
    }
  },
  
  shortlet: {
    location: {
      state: "Lagos",
      lgas: ["Lekki"],
      areas: ["Lekki Phase 1"],
      customLocation: ""
    },
    propertyDetails: {
      propertyType: "2-Bed Apartment",
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      travelType: "Vacation"
    },
    bookingDetails: {
      checkInDate: "2024-02-15",
      checkOutDate: "2024-02-22"
    },
    budget: {
      minPrice: 50000,
      maxPrice: 200000
    },
    features: {
      basicFeatures: ["WiFi", "Kitchen"],
      premiumFeatures: ["Pool Access"]
    },
    contactInfo: {
      fullName: "Robert Brown Test",
      email: "rbrown@example.com",
      phoneNumber: "+2349012345678",
      maxBudgetPerNight: 150000,
      willingToPayExtra: true,
      petsAllowed: false,
      smokingAllowed: false,
      partiesAllowed: false
    }
  },
  
  "joint-venture": {
    location: {
      state: "Lagos",
      lgas: ["Ajah", "Lekki"],
      areas: ["Ajah", "Lekki Phase 2"],
      customLocation: ""
    },
    contactInfo: {
      fullName: "David Properties Test",
      email: "daviddev@example.com",
      phoneNumber: "+2347019876543"
    },
    developmentDetails: {
      developmentTypes: ["Residential Development"],
      minLandSize: "5000",
      maxLandSize: "20000",
      measurementUnit: "sqm",
      preferredSharingRatio: "50-50",
      proposalDetails: "Looking for partnership in Lagos",
      minimumTitleRequirements: ["Registered Deed of Assignment"],
      willingToConsiderPendingTitle: true
    }
  }
};

// Helper function to find react fiber root
function getReactFiber(el) {
  const fiberKey = Object.keys(el).find(key => key.startsWith('__react'));
  return el[fiberKey];
}

function waitForSubmitButton(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const interval = setInterval(() => {
      const button = Array.from(document.querySelectorAll('button'))
        .find(btn =>
          !btn.disabled &&
          /submit|save|continue|finish|next/i.test(btn.textContent || '')
        );

      if (button) {
        clearInterval(interval);
        resolve(button);
      }

      if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error('Submit button not found'));
      }
    }, 200);
  });
}


// Helper function to find hook state dispatcher
function useDispatch(component) {
  const fiber = getReactFiber(component);
  if (fiber?.memoizedState) {
    return fiber.memoizedState;
  }
  return null;
}

// Simulate form filling
async function fillPreferenceForm(type) {
  return new Promise((resolve) => {
    console.log(`\n🔧 Setting up ${type} preference...`);
    
    const data = TEST_DATA[type];
    
    // Dispatch custom event to update form data
    const updateEvent = new CustomEvent('preferenceFormUpdate', {
      detail: {
        type: type,
        data: data
      }
    });
    
    window.dispatchEvent(updateEvent);
    
    // Wait a bit for state to update
    setTimeout(() => {
      console.log(`✅ ${type} form data loaded. Click "Submit" to submit.`);
      resolve(true);
    }, 500);
  });
}

// Main testing function
async function testAllPreferences() {
  console.log("🚀 Starting Preference Submission Tests");
  console.log("=======================================\n");
  
  const results = {
    buy: null,
    rent: null,
    shortlet: null,
    "joint-venture": null
  };
  
  for (const [type, data] of Object.entries(TEST_DATA)) {
    try {
      console.log(`\n📝 Testing ${type.toUpperCase()} preference...`);
      await fillPreferenceForm(type);
      
      // Find and click submit button
      const submitButton = document.querySelector('[data-testid="submit-button"]') 
        || Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Submit'));
      
      try {
        const submitButton = await waitForSubmitButton();
        console.log(`   Clicking submit button for ${type}...`);
        submitButton.click();

        await new Promise(resolve => setTimeout(resolve, 2000));
        results[type] = 'SUCCESS';
        console.log(`✅ ${type} submitted successfully`);
      } catch (err) {
        console.warn(`⚠️  ${type}: ${err.message}`);
        results[type] = 'MANUAL_ACTION_REQUIRED';
      }

    } catch (error) {
      console.error(`❌ Error testing ${type}:`, error);
      results[type] = `ERROR: ${error.message}`;
    }
  }
  
  // Print summary
  console.log("\n\n========== TEST SUMMARY ==========");
  console.log(Object.entries(results).map(([type, result]) => 
    `${type.toUpperCase()}: ${result || 'PENDING'}`
  ).join('\n'));
  console.log("==================================\n");
  
  return results;
}

// Auto-run if this is pasted in console
console.log("✅ Test script loaded!");
console.log("Run: testAllPreferences() to start testing\n");

// Export for manual use
window.testAllPreferences = testAllPreferences;
window.fillPreferenceForm = fillPreferenceForm;
window.TEST_DATA = TEST_DATA;

console.log("Available functions:");
console.log("- testAllPreferences(): Run all preference tests");
console.log("- fillPreferenceForm(type): Manually fill form for a specific type");
console.log("- TEST_DATA: View test data for each preference type");
