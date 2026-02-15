# Preference Module - Complete Setup Checklist

Use this checklist to ensure you've properly integrated all preference module files into your application.

## Pre-Setup Requirements

- [ ] Node.js installed (v14+)
- [ ] npm or yarn available
- [ ] React/Next.js project set up
- [ ] TypeScript configured (if using TS)
- [ ] MongoDB instance running or Atlas connected
- [ ] Git initialized

## Phase 1: File Organization (15 minutes)

### Create Directory Structure
```bash
mkdir -p src/types
mkdir -p src/models
mkdir -p src/data
mkdir -p src/utils/validation
mkdir -p src/context
mkdir -p src/styles
mkdir -p public
```

### Copy Type Definition Files
- [ ] Copy `types-preference-form.ts` → `src/types/preference-form.ts`
- [ ] Copy `api-types.ts` → `src/types/api.types.ts`
- [ ] Copy `system-settings.ts` → `src/types/system-settings.ts`
- [ ] Verify: No import errors in IDE

### Copy Model Files
- [ ] Copy `Preference.ts` → `src/models/Preference.ts`
- [ ] Verify: Mongoose import available

### Copy Configuration Files
- [ ] Copy `preference-configs.ts` → `src/data/preference-configs.ts`
- [ ] Verify: File imports without errors

### Copy Logic Files
- [ ] Copy `preference-validation.ts` → `src/utils/validation/preference-validation.ts`
- [ ] Copy `preference-form-context.tsx` → `src/context/preference-form-context.tsx`
- [ ] Verify: React imports available

### Copy Styling Files
- [ ] Copy `preference-form.css` → `src/styles/preference-form.css`
- [ ] Verify: File readable from IDE

### Copy Testing Files
- [ ] Copy `test-preferences.js` → `public/test-preferences.js`
- [ ] Verify: File accessible in public folder

## Phase 2: Dependencies Installation (5 minutes)

### Install Required Packages
```bash
npm install mongoose yup react-hot-toast
```

- [ ] mongoose installed
- [ ] yup installed
- [ ] react-hot-toast installed
- [ ] package.json updated
- [ ] node_modules updated
- [ ] No conflicting versions

### Verify Installations
```bash
npm list mongoose yup react-hot-toast
```

- [ ] mongoose version compatible
- [ ] yup version compatible
- [ ] react-hot-toast version compatible

## Phase 3: Code Integration (30 minutes)

### Update Import Paths (if needed)

If your project structure differs, update these imports:

- [ ] Update all `@/types` imports if using different path alias
- [ ] Update all `@/data` imports if using different path alias
- [ ] Update all `@/context` imports if using different path alias
- [ ] Update all `@/utils` imports if using different path alias
- [ ] Update all `@/styles` imports if using different path alias
- [ ] Update all `@/models` imports if using different path alias

### Setup React Context Provider

**For Next.js App Router** (`app/layout.tsx`):
```typescript
import { PreferenceFormProvider } from '@/context/preference-form-context';
import '@/styles/preference-form.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PreferenceFormProvider>
          {children}
        </PreferenceFormProvider>
      </body>
    </html>
  );
}
```

- [ ] Added import for PreferenceFormProvider
- [ ] Added import for preference-form.css
- [ ] Wrapped children with provider
- [ ] No TypeScript errors

**For Next.js Pages Router** (`pages/_app.tsx`):
```typescript
import { PreferenceFormProvider } from '@/context/preference-form-context';
import '@/styles/preference-form.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PreferenceFormProvider>
      <Component {...pageProps} />
    </PreferenceFormProvider>
  );
}

export default MyApp;
```

- [ ] Added import for PreferenceFormProvider
- [ ] Added import for preference-form.css
- [ ] Wrapped component with provider
- [ ] No TypeScript errors

**For React (non-Next.js)** (`index.tsx` or `App.tsx`):
```typescript
import { PreferenceFormProvider } from './context/preference-form-context';
import './styles/preference-form.css';

export default function App() {
  return (
    <PreferenceFormProvider>
      {/* Your routes/components */}
    </PreferenceFormProvider>
  );
}
```

- [ ] Added import for PreferenceFormProvider
- [ ] Added import for preference-form.css
- [ ] Wrapped application with provider
- [ ] No TypeScript errors

### Verify CSS is Loaded

- [ ] CSS file imported in layout
- [ ] CSS classes available in browser DevTools
- [ ] No CSS conflicts with existing styles
- [ ] Responsive design works on mobile

## Phase 4: Database Setup (20 minutes)

### MongoDB Connection

**Option 1: Local MongoDB**
```typescript
// db.ts or similar
import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/preference-db');
```

- [ ] MongoDB running locally
- [ ] Connection string correct
- [ ] Connection established without errors

**Option 2: MongoDB Atlas**
```typescript
// db.ts or similar
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI!);
```

- [ ] MongoDB Atlas cluster created
- [ ] Connection string in `.env.local`
- [ ] Environment variable set correctly
- [ ] Connection successful

**Option 3: Other MongoDB Service**
- [ ] Provider configured
- [ ] Connection string available
- [ ] Credentials set in environment
- [ ] Connection tested

### Verify Connection
```bash
# In your code, test:
const pref = new Preference();
console.log(pref.model);  // Should log the model
```

- [ ] Preference model instantiates
- [ ] No connection errors in console
- [ ] MongoDB logs connection

## Phase 5: API Routes Setup (30 minutes)

### Create Preference CRUD Routes

**Create** (`api/preferences/POST`):
```typescript
// api/preferences/route.ts (App Router)
import { Preference } from '@/models/Preference';

export async function POST(request: Request) {
  const data = await request.json();
  const pref = new Preference();
  const model = pref.model;
  
  try {
    const newPreference = await model.create(data);
    return Response.json({
      success: true,
      message: 'Preference created',
      data: newPreference,
      statusCode: 201
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
      statusCode: 500
    });
  }
}
```

- [ ] POST /api/preferences created
- [ ] Accepts form data
- [ ] Returns proper response format
- [ ] Error handling included

**Read** (`api/preferences/GET`):
```typescript
// api/preferences/route.ts (App Router)
export async function GET(request: Request) {
  const pref = new Preference();
  const model = pref.model;
  
  try {
    const preferences = await model.find();
    return Response.json({
      success: true,
      data: preferences,
      statusCode: 200
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
      statusCode: 500
    });
  }
}
```

- [ ] GET /api/preferences created
- [ ] Returns all preferences
- [ ] Returns proper response format
- [ ] Error handling included

**Update** (`api/preferences/[id]/PUT`):
- [ ] PUT /api/preferences/[id] created
- [ ] Updates preference by ID
- [ ] Returns updated preference
- [ ] Error handling included

**Delete** (`api/preferences/[id]/DELETE`):
- [ ] DELETE /api/preferences/[id] created
- [ ] Deletes preference by ID
- [ ] Returns success response
- [ ] Error handling included

### Test API Routes
```bash
# Test in Postman or curl
curl -X POST http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"preferenceType":"buy",...}'
```

- [ ] POST works and saves to DB
- [ ] GET works and returns data
- [ ] PUT works and updates
- [ ] DELETE works and removes
- [ ] Error responses proper format

## Phase 6: Component Implementation (1 hour)

### Create Form Components

**Step 1: Location Selection**
```tsx
import { usePreferenceForm } from '@/context/preference-form-context';

export function LocationStep() {
  const { state, updateFormData } = usePreferenceForm();
  return (
    <div>
      <input
        value={state.formData.location?.state || ''}
        onChange={(e) => updateFormData({
          location: { ...state.formData.location, state: e.target.value }
        })}
      />
    </div>
  );
}
```

- [ ] Location step component created
- [ ] Hooks into context
- [ ] Updates form data
- [ ] No TypeScript errors

**Step 2: Budget Selection**
- [ ] Budget step component created
- [ ] Uses DEFAULT_BUDGET_THRESHOLDS
- [ ] Updates budget in form data
- [ ] Shows min budget for location

**Step 3: Features Selection**
- [ ] Features step component created
- [ ] Uses FEATURE_CONFIGS
- [ ] Allows multi-select
- [ ] Updates form data

**Step 4: Contact Information**
- [ ] Contact step component created
- [ ] Validates email format
- [ ] Validates phone format
- [ ] Updates form data

### Create Form Container
- [ ] Main form component created
- [ ] Step navigation working
- [ ] Previous/Next buttons functional
- [ ] Step indicators visible

## Phase 7: Validation Integration (30 minutes)

### Add Form Validation
```tsx
import { validationSchemas } from '@/utils/validation/preference-validation';

async function validateForm(data: PreferenceForm) {
  try {
    const schema = validationSchemas[data.preferenceType];
    await schema.validate(data);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: error.inner };
  }
}
```

- [ ] Validation schemas imported
- [ ] Validation function created
- [ ] Called on form submission
- [ ] Errors properly formatted

### Display Validation Errors
- [ ] Error messages shown under fields
- [ ] Error styling applied
- [ ] Errors clear on field update
- [ ] Summary of errors shown

## Phase 8: Form Submission (20 minutes)

### Implement Submit Handler
```tsx
async function handleSubmit() {
  const { state, isFormValid } = usePreferenceForm();
  
  if (!isFormValid()) {
    toast.error('Please complete all fields');
    return;
  }
  
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.formData)
    });
    
    const result = await response.json();
    if (result.success) {
      toast.success('Preference saved!');
      // Redirect or reset form
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('Failed to save');
  }
}
```

- [ ] Submit handler created
- [ ] Validates form before submit
- [ ] Makes API call
- [ ] Handles errors
- [ ] Shows success message
- [ ] Handles loading state

## Phase 9: Testing (45 minutes)

### Manual Testing with Test Data
```javascript
// In browser console at /preference
testAllPreferences()
```

- [ ] Test Buy preference type
- [ ] Test Rent preference type
- [ ] Test Shortlet preference type
- [ ] Test Joint Venture preference type
- [ ] All fields populate correctly
- [ ] Form submits without errors
- [ ] Data appears in database

### Unit Testing
- [ ] Validation tests passing
- [ ] Context provider tests passing
- [ ] Component render tests passing
- [ ] API endpoint tests passing

### Integration Testing
- [ ] Complete form flow works
- [ ] Data persists to database
- [ ] Can retrieve saved preferences
- [ ] Can update preferences
- [ ] Can delete preferences

### Validation Testing
- [ ] Required fields enforced
- [ ] Email validation works
- [ ] Phone format validated
- [ ] Budget constraints applied
- [ ] Feature selection limits enforced

### Error Testing
- [ ] Missing field shows error
- [ ] Invalid email shows error
- [ ] Invalid phone shows error
- [ ] API errors handled
- [ ] Network errors handled

## Phase 10: Performance & Optimization (30 minutes)

### Performance Checks
- [ ] No unnecessary re-renders
- [ ] Form state updates smooth
- [ ] API calls complete in < 1s
- [ ] No memory leaks
- [ ] Bundle size acceptable

### Accessibility Checks
- [ ] Form fields have labels
- [ ] Labels associated with inputs
- [ ] Keyboard navigation works
- [ ] Error messages properly announced
- [ ] Color contrast sufficient

### Cross-Browser Testing
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works
- [ ] Mobile Safari works
- [ ] Chrome Mobile works

### Responsive Design
- [ ] Mobile (320px) responsive
- [ ] Tablet (768px) responsive
- [ ] Desktop (1024px) responsive
- [ ] Touch targets adequate
- [ ] No horizontal scroll

## Phase 11: Documentation (20 minutes)

- [ ] Installation documented
- [ ] API endpoints documented
- [ ] Component structure documented
- [ ] Configuration options documented
- [ ] Troubleshooting guide created
- [ ] Environment variables documented

## Phase 12: Production Readiness (30 minutes)

### Environment Setup
- [ ] Environment variables configured
- [ ] MongoDB connection string set
- [ ] API keys configured
- [ ] CORS configured if needed
- [ ] Rate limiting configured

### Code Quality
- [ ] No console.log statements
- [ ] No TODO comments
- [ ] TypeScript strict mode
- [ ] ESLint passing
- [ ] Prettier formatted

### Security
- [ ] Input validation on backend
- [ ] Output sanitization
- [ ] HTTPS enabled
- [ ] API authentication (if needed)
- [ ] Rate limiting enabled
- [ ] No sensitive data in logs

### Monitoring
- [ ] Error logging configured
- [ ] Analytics set up
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] API monitoring

## Final Verification Checklist

- [ ] All files present and correct
- [ ] All dependencies installed
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] All tests passing
- [ ] API endpoints working
- [ ] Form submits successfully
- [ ] Data persists to database
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Performance acceptable
- [ ] Error handling complete
- [ ] Documentation complete
- [ ] Environment variables set
- [ ] Security measures in place

## Deployment Checklist

- [ ] Code committed to Git
- [ ] Tests passing in CI/CD
- [ ] Build completes successfully
- [ ] Environment variables set on server
- [ ] Database migrations run
- [ ] Backup created
- [ ] Deployed to staging
- [ ] Staging tests passing
- [ ] Production backup created
- [ ] Deployed to production
- [ ] Production health check passed
- [ ] Monitoring active
- [ ] Team notified

## Post-Deployment

- [ ] Monitor for errors
- [ ] Check user feedback
- [ ] Monitor performance
- [ ] Monitor database
- [ ] Verify backups working
- [ ] Document any issues
- [ ] Plan improvements

---

## Summary

Total estimated time to complete: **6-8 hours**

- Phase 1 (File Organization): 15 min
- Phase 2 (Dependencies): 5 min
- Phase 3 (Integration): 30 min
- Phase 4 (Database): 20 min
- Phase 5 (API Routes): 30 min
- Phase 6 (Components): 60 min
- Phase 7 (Validation): 30 min
- Phase 8 (Submission): 20 min
- Phase 9 (Testing): 45 min
- Phase 10 (Optimization): 30 min
- Phase 11 (Documentation): 20 min
- Phase 12 (Production): 30 min

**Total: ~5-6 hours of active work**

## Troubleshooting

If you get stuck:
1. Check FILES_INVENTORY.md for file details
2. Check HOW_TO_USE_THESE_FILES.md for implementation guide
3. Verify all dependencies installed
4. Check import paths match your structure
5. Verify database connection working
6. Test API endpoints in Postman
7. Check browser console for errors

## Support

For issues or questions:
1. Review the documentation files
2. Check the test data in test-preferences.js
3. Verify file structure matches requirements
4. Test each phase independently
5. Review error messages carefully

---

**You've got this! Complete this checklist and the preference module will be fully operational. 🚀**
