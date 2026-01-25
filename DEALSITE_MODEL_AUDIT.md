# DealSite Model Alignment - Detailed Audit

## Issues Found

### 1. **Missing Field in Frontend Context: `_id`**
- **Location**: `src/context/deal-site-context.tsx` - `DealSiteSettings` interface
- **Used in**: `src/app/public-access-page/featured/page.tsx` line 89
- **Issue**: Frontend uses `settings._id` but it's not in the `DealSiteSettings` interface
- **Fix**: Add `_id?: string` to `DealSiteSettings` interface

### 2. **Subscribe Settings Form Fields Not Persisted**
- **Location**: `src/app/public-access-page/subscribe-settings/page.tsx`
- **Issue**: Form has 3 fields that are NOT being saved to backend:
  1. `enableEmailSubscription` (checkbox) - form control only
  2. `subscriptionPlaceholder` (input) - form control only  
  3. `confirmationMessage` (textarea) - form control only
- **Current behavior**: Only `title` and `subTitle` are persisted
- **Options**:
  - A) These are UI-only fields → Remove from model, leave as-is
  - B) These should be persisted → Add to model and update save logic

### 3. **Potential Missing Fields in Subscribe Settings**
- **Question**: Should these frontend form fields be persisted?
  - `subscriptionPlaceholder` - Email input placeholder text
  - `confirmationMessage` - Success message shown after subscription
  - `enableEmailSubscription` - Toggle for subscription feature

---

## Complete Field Inventory by Section

### A. Top-Level Fields
| Field | Type | Frontend | Backend Model | Status |
|-------|------|----------|---------------|--------|
| publicSlug | string | ✅ | ✅ | OK |
| title | string | ✅ | ✅ | OK |
| description | string | ✅ | ✅ | OK |
| keywords | string[] | ✅ | ✅ | OK |
| logoUrl | string | ✅ | ✅ | OK |
| listingsLimit | number | ✅ | ✅ | OK |
| _id | string | ✅ (featured.page) | ✅ (Mongoose) | **MISSING from DealSiteSettings interface** |
| status | string | ❓ | ✅ | Should add to interface |

### B. Theme
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| theme.primaryColor | string | ✅ | ✅ | OK |
| theme.secondaryColor | string | ✅ | ✅ | OK |

### C. Inspection Settings
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| inspectionSettings.allowPublicBooking | boolean | ✅ | ✅ | OK |
| inspectionSettings.defaultInspectionFee | number | ✅ | ✅ | OK |
| inspectionSettings.negotiationEnabled | boolean | ✅ | ✅ | OK |
| inspectionSettings.inspectionStatus | string | ❓ | ✅ | May be in schema but check usage |

### D. Social Links
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| socialLinks.website | string | ✅ | ✅ | OK |
| socialLinks.twitter | string | ✅ | ✅ | OK |
| socialLinks.instagram | string | ✅ | ✅ | OK |
| socialLinks.facebook | string | ✅ | ✅ | OK |
| socialLinks.linkedin | string | ✅ | ✅ | OK |

### E. Contact Visibility
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| contactVisibility.showEmail | boolean | ✅ | ✅ | OK |
| contactVisibility.showPhone | boolean | ✅ | ✅ | OK |
| contactVisibility.enableContactForm | boolean | ✅ | ✅ | OK |
| contactVisibility.showWhatsAppButton | boolean | ✅ | ✅ | OK |
| contactVisibility.whatsappNumber | string | ✅ | ✅ | OK |

### F. Feature Selection
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| featureSelection.mode | string (enum) | ✅ | ✅ | OK |
| featureSelection.propertyIds | string | ✅ | ✅ | OK |
| featureSelection.featuredListings | string[] | ✅ | ✅ | OK |

### G. Marketplace Defaults
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| marketplaceDefaults.defaultTab | string (enum) | ✅ | ✅ | OK |
| marketplaceDefaults.defaultSort | string (enum) | ❓ | ✅ | Added but verify frontend usage |
| marketplaceDefaults.showVerifiedOnly | boolean | ✅ | ✅ | OK |
| marketplaceDefaults.enablePriceNegotiationButton | boolean | ✅ | ✅ | OK |

### H. Public Page (Hero)
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| publicPage.heroTitle | string | ✅ | ✅ | OK |
| publicPage.heroSubtitle | string | ✅ | ✅ | OK |
| publicPage.heroImage | string | ✅ | ✅ | OK |
| publicPage.ctaText | string | ✅ | ✅ | OK |
| publicPage.ctaLink | string | ✅ | ✅ | OK |
| publicPage.ctaText2 | string | ✅ | ✅ | OK |
| publicPage.ctaLink2 | string | ✅ | ✅ | OK |

### I. Footer
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| footer.shortDescription | string | ✅ | ✅ | OK |
| footer.copyrightText | string | ✅ | ✅ | OK |

### J. About Section
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| about.whoWeAre.* | object | ✅ | ✅ | OK |
| about.ourMission.* | object | ✅ | ✅ | OK |
| about.ourExperience.* | object | ✅ | ✅ | OK |
| about.whatWeStandFor.* | object | ✅ | ✅ | OK |
| about.whatWeDo.* | object | ✅ | ✅ | OK |
| about.whereWeOperate.* | object | ✅ | ✅ | OK |
| about.profile.members[] | array | ✅ | ✅ | OK |

### K. Contact Us
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| contactUs.hero.title | string | ✅ | ✅ | OK |
| contactUs.hero.description | string | ✅ | ✅ | OK |
| contactUs.cta.title | string | ✅ | ✅ | OK |

### L. Home Settings
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| homeSettings.testimonials.* | object | ✅ | ✅ | OK |
| homeSettings.whyChooseUs.* | object | ✅ | ✅ | OK |
| homeSettings.readyToFind.* | object | ✅ | ✅ | OK |

### M. Subscribe Settings
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| subscribeSettings.title | string | ✅ | ✅ | OK |
| subscribeSettings.subTitle | string | ✅ | ✅ | OK |
| subscribeSettings.miniTitle | string | ❓ | ✅ | In model, verify frontend |
| subscribeSettings.backgroundColor | string | ❓ | ✅ | In model, verify frontend |
| subscribeSettings.cta.* | object | ❓ | ✅ | In model, verify frontend |
| **subscribeSettings.enableEmailSubscription** | boolean | ❌ | ❌ | **FORM FIELD ONLY** |
| **subscribeSettings.subscriptionPlaceholder** | string | ❌ | ❌ | **FORM FIELD ONLY** |
| **subscribeSettings.confirmationMessage** | string | ❌ | ❌ | **FORM FIELD ONLY** |

### N. Payment Details
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| paymentDetails.businessName | string | ✅ | ✅ | OK |
| paymentDetails.accountNumber | string | ✅ | ✅ | OK |
| paymentDetails.sortCode | string | ✅ | ✅ | OK |
| paymentDetails.primaryContactName | string | ✅ | ✅ | OK |
| paymentDetails.primaryContactEmail | string | ✅ | ✅ | OK |
| paymentDetails.primaryContactPhone | string | ✅ | ✅ | OK |
| paymentDetails.accountName | string | ❓ | ✅ | Check if used |
| paymentDetails.accountBankName | string | ❓ | ✅ | Check if used |
| paymentDetails.subAccountCode | string | ❓ | ✅ | Check if used |
| paymentDetails.percentageCharge | number | ❓ | ✅ | Check if used |
| paymentDetails.isVerified | boolean | ❓ | ✅ | Check if used |
| paymentDetails.active | boolean | ❓ | ✅ | Check if used |

### O. Security Settings
| Field | Type | Frontend | Backend | Status |
|-------|------|----------|---------|--------|
| securitySettings.* | object | ❓ | ✅ | No frontend form found |

---

## Summary of Required Fixes

### CRITICAL - Must Fix:
1. Add `_id?: string` to `DealSiteSettings` interface (line 329 in deal-site-context.tsx)
2. Add `status?: string` to `DealSiteSettings` interface (optional but good to have)

### IMPORTANT - Clarify Intent:
1. **Subscribe Settings Extra Fields** - Decide:
   - If `enableEmailSubscription`, `subscriptionPlaceholder`, `confirmationMessage` should be persisted:
     - Add them to backend model
     - Update subscribe-settings/page.tsx to save them
   - If they're UI-only:
     - Document this clearly
     - Consider removing them from form if they can't be persisted

### OPTIONAL - Enhancement:
1. Expose `subscribeSettings.miniTitle`, `backgroundColor`, `cta` in frontend form
2. Verify `securitySettings` is accessible and updatable from frontend

---

## Recommendation

1. **Immediately fix** `_id` field in context
2. **Clarify** whether subscribe settings extra fields should be persisted
3. **Document** which fields are UI-only vs persistent
4. **Run through** each page to verify all fields match model
