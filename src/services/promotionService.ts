import api from '@/utils/axiosConfig';

export type PromotionType = 'banner' | 'sidebar' | 'popup' | 'carousel' | 'inline';

export interface ApiPromotion {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  redirectUrl?: string;
  type: PromotionType | string;
  isFeatured: boolean;
  tags: string[];
  views: number;
  clicks: number;
}

export const fetchActivePromotions = async (type?: PromotionType, limit: number = 3) => {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (limit) params.limit = String(Math.min(Math.max(limit, 1), 10));
  const { data } = await api.get<{ success: true; message: string; data: ApiPromotion[] }>(`/promotions/active`, { params });
  return data.data;
};

export const fetchFeaturedPromotions = async (limit: number = 5) => {
  const { data } = await api.get<{ success: true; message: string; data: ApiPromotion[] }>(`/promotions/featured`, {
    params: { limit: String(Math.min(Math.max(limit, 1), 10)) },
  });
  return data.data;
};

export const logPromotionClick = async (promotionId: string) => {
  try {
    await api.post<{ success: true; message: string }>(`/promotions/click`, { promotionId });
  } catch (e) {
    // swallow errors for logging
  }
};

export const logPromotionViews = async (promotionIds: string[]) => {
  if (!promotionIds || promotionIds.length === 0) return;
  try {
    await api.post<{ success: true; message: string }>(`/promotions/views`, { promotionIds: Array.from(new Set(promotionIds)) });
  } catch (e) {
    // swallow errors for logging
  }
};
