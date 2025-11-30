import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';

export type FeatureType = 'boolean' | 'count' | 'unlimited';

export interface FeatureCatalogItem {
  _id: string;
  key: string;
  label: string;
  isActive: boolean;
}

export interface ActiveFeatureEntry {
  featureId: string; // catalog _id
  key: string; // catalog key
  type: FeatureType;
  value: number; // for boolean: 0/1, for count: total, for unlimited: Infinity encoded as -1
  remaining: number; // for count
}

export interface SubscriptionMeta {
  planType?: string;
  planCode?: string;
  appliedPlanName?: string;
}

export interface SubscriptionState {
  initialized: boolean;
  catalog: {
    byId: Record<string, FeatureCatalogItem>;
    byKey: Record<string, FeatureCatalogItem>;
    loaded: boolean;
  };
  active: {
    subscriptionId?: string;
    status?: string;
    startedAt?: string;
    expiresAt?: string;
    autoRenew?: boolean;
    meta?: SubscriptionMeta;
    featuresByKey: Record<string, ActiveFeatureEntry>;
  } | null;
  lastSyncAt?: string;
}

const initialState: SubscriptionState = {
  initialized: false,
  catalog: { byId: {}, byKey: {}, loaded: false },
  active: null,
  lastSyncAt: undefined,
};

export const fetchFeaturesCatalog = createAsyncThunk(
  'subscription/fetchCatalog',
  async () => {
    const token = Cookies.get('token');
    const res = await GET_REQUEST<{ _id: string; key: string; label: string; isActive: boolean }[]>(`${URLS.BASE}${URLS.featuresGetAll}`, token);
    if (res.success && Array.isArray(res.data)) {
      return res.data as FeatureCatalogItem[];
    }
    return [] as FeatureCatalogItem[];
  }
);

const slice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    initializeFromProfile: (state, action: PayloadAction<any | null>) => {
      const user = action.payload;
      if (!user || !user.activeSubscription) {
        state.active = null;
        state.initialized = true;
        return;
      }
      const sub = user.activeSubscription;
      const featuresArr = Array.isArray(sub.features) ? sub.features : [];
      const featuresByKey: Record<string, ActiveFeatureEntry> = {};
      for (const f of featuresArr) {
        // Support backend returning either a feature id string or a feature object
        let featureId: string = '';
        let featureKey: string | null = null;
        if (f && typeof f.feature === 'string') {
          featureId = f.feature;
        } else if (f && typeof f.feature === 'object' && f.feature !== null) {
          featureId = f.feature._id || f.feature.id || '';
          featureKey = f.feature.key || null;
        }

        const cat = featureId ? state.catalog.byId[featureId] : undefined;
        const key = (cat && cat.key) || featureKey || featureId || String(f.feature || 'unknown_feature'); // fallback
        const type = String(f.type) as FeatureType;
        const isUnlimited = type === 'unlimited' || (type === 'count' && (f.value === -1 || f.remaining === -1));
        featuresByKey[key] = {
          featureId,
          key,
          type: isUnlimited ? 'unlimited' : (type as FeatureType),
          value: isUnlimited ? -1 : Number(f.value || 0),
          remaining: isUnlimited ? -1 : Number(f.remaining ?? f.value ?? 0),
        };
      }
      state.active = {
        subscriptionId: sub._id,
        status: sub.status,
        startedAt: sub.startedAt || sub.startDate,
        expiresAt: sub.expiresAt || sub.endDate,
        autoRenew: !!sub.autoRenew,
        meta: sub.meta || {},
        featuresByKey,
      };
      state.lastSyncAt = new Date().toISOString();
      state.initialized = true;
    },
    setCatalog: (state, action: PayloadAction<FeatureCatalogItem[]>) => {
      const byId: Record<string, FeatureCatalogItem> = {};
      const byKey: Record<string, FeatureCatalogItem> = {};
      for (const item of action.payload) {
        byId[item._id] = item;
        byKey[item.key] = item;
      }
      state.catalog = { byId, byKey, loaded: true };
      // backfill keys for active features if needed
      if (state.active) {
        for (const k of Object.keys(state.active.featuresByKey)) {
          const entry = state.active.featuresByKey[k];
          if (!entry.key || entry.key === entry.featureId) {
            const cat = byId[entry.featureId];
            if (cat) {
              delete state.active.featuresByKey[k];
              state.active.featuresByKey[cat.key] = { ...entry, key: cat.key };
            }
          }
        }
      }
    },
    decrementFeature: (state, action: PayloadAction<{ key: string; amount?: number }>) => {
      if (!state.active) return;
      const { key, amount = 1 } = action.payload;
      const entry = state.active.featuresByKey[key];
      if (!entry) return;
      if (entry.type === 'count') {
        if (entry.remaining === -1) return; // unlimited
        entry.remaining = Math.max(0, (Number(entry.remaining) || 0) - amount);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFeaturesCatalog.fulfilled, (state, action) => {
      const items = action.payload || [];
      const byId: Record<string, FeatureCatalogItem> = {};
      const byKey: Record<string, FeatureCatalogItem> = {};
      for (const item of items) {
        byId[item._id] = item;
        byKey[item.key] = item;
      }
      state.catalog = { byId, byKey, loaded: true };
    });
  },
});

export const { initializeFromProfile, setCatalog, decrementFeature } = slice.actions;
export default slice.reducer;

// Selectors
export const selectCatalogLoaded = (s: { subscription: SubscriptionState }) => s.subscription.catalog.loaded;
export const selectFeatureEntry = (key: string) => (s: { subscription: SubscriptionState }) => s.subscription.active?.featuresByKey[key];
export const selectCanUseFeature = (key: string) => (s: { subscription: SubscriptionState }) => {
  const sub = s.subscription.active;
  if (!sub) return false;
  const entry = sub.featuresByKey[key];
  if (!entry) return false;
  if (entry.type === 'boolean') return Number(entry.value) === 1;
  if (entry.type === 'unlimited') return true;
  return Number(entry.remaining) > 0;
};
export const selectShowCommissionFee = (s: { subscription: SubscriptionState }) => {
  // show commission fee if NO_COMMISSION_FEES is not enabled
  const e = s.subscription.active?.featuresByKey['NO_COMMISSION_FEES'];
  if (!e) return true;
  if (e.type === 'boolean') return Number(e.value) !== 1;
  return true;
};
