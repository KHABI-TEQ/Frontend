import { useCallback, useMemo } from 'react';
import { useGlobalNegotiation, useNegotiation } from '@/context/negotiation-context';
import { toast } from 'react-hot-toast';

export const useNegotiationUtils = () => {
  const globalContext = useGlobalNegotiation();

  let negotiationContext = null;
  try {
    negotiationContext = useNegotiation();
  } catch {
    // Context not available in this component tree
  }

  const isContextAvailable = globalContext?.isAvailable ?? false;

  const isGloballyAccessible = !!(
    'canMakeCounter' in globalContext &&
    typeof globalContext.canMakeCounter === 'function' &&
    'getRemainingCounters' in globalContext &&
    typeof globalContext.getRemainingCounters === 'function'
  );

  const checkCounterLimits = useCallback((type: 'price' | 'loi') => {
    if (
      isGloballyAccessible &&
      typeof globalContext.canMakeCounter === 'function' &&
      typeof globalContext.getRemainingCounters === 'function'
    ) {
      const canCounter = globalContext.canMakeCounter(type);
      const remaining = globalContext.getRemainingCounters(type);

      if (!canCounter) {
        const message = type === 'price'
          ? 'You have reached the maximum number of price negotiations for this property.'
          : `You have reached the maximum number of LOI request changes (${globalContext.counterLimits?.loiRequests || 0}). No more changes allowed.`;

        return { canCounter: false, message };
      }

      if (type === 'loi' && remaining !== null && remaining <= 1) {
        const message = remaining === 1
          ? 'This is your last LOI request change!'
          : 'You have used all your LOI request changes.';

        return { canCounter: true, message, isLastChance: remaining === 1 };
      }

      return { canCounter: true, message: '' };
    }

    if (!negotiationContext) {
      return { canCounter: false, message: 'Negotiation context not available' };
    }

    const canCounter = negotiationContext.state.counterTracking?.canCounter(type);
    const remaining = negotiationContext.state.counterTracking?.getRemainingCounters(type);

    if (!canCounter) {
      const message = type === 'price'
        ? 'You have reached the maximum number of price negotiations for this property.'
        : `You have reached the maximum number of LOI request changes (${negotiationContext.state.counterLimits?.loiRequests || 0}). No more changes allowed.`;

      return { canCounter: false, message };
    }

    if (type === 'loi' && remaining !== null && remaining <= 1) {
      const message = remaining === 1
        ? 'This is your last LOI request change!'
        : 'You have used all your LOI request changes.';

      return { canCounter: true, message, isLastChance: remaining === 1 };
    }

    return { canCounter: true, message: '' };
  }, [negotiationContext, isGloballyAccessible, globalContext]);

  const showCounterLimitWarning = useCallback((type: 'price' | 'loi') => {
    const result = checkCounterLimits(type);

    if (!result.canCounter) {
      toast.error(result.message);
      return false;
    }

    if (result.message && result.isLastChance) {
      toast.error(result.message);
    }

    return true;
  }, [checkCounterLimits]);

  const initializeNegotiation = useCallback((data: any, userRole: 'seller' | 'buyer') => {
    if (!globalContext?.initializeContext) {
      console.warn('Negotiation context initialization not available');
      return false;
    }

    try {
      globalContext.initializeContext(data, userRole);
      globalContext.makeGloballyAccessible?.();
      return true;
    } catch (error) {
      console.error('Failed to initialize negotiation context:', error);
      toast.error('Failed to initialize negotiation');
      return false;
    }
  }, [globalContext]);

  const getCounterStats = useCallback(() => {
    if (!negotiationContext || !isGloballyAccessible) {
      return null;
    }

    const priceCountersUsed = negotiationContext.priceCounterCount ?? 0;
    const priceCountersRemaining = negotiationContext.getRemainingPriceCounters?.() ?? 0;
    const priceUnlimited = negotiationContext.counterLimits?.priceNegotiation === null;

    const loiCountersUsed = negotiationContext.loiCounterCount ?? 0;
    const loiCountersRemaining = negotiationContext.getRemainingLoiCounters?.() ?? 0;
    const loiLimit = negotiationContext.counterLimits?.loiRequests ?? 0;

    return {
      priceCounters: {
        used: priceCountersUsed,
        remaining: priceCountersRemaining,
        unlimited: priceUnlimited,
      },
      loiCounters: {
        used: loiCountersUsed,
        remaining: loiCountersRemaining,
        limit: loiLimit,
      },
    };
  }, [negotiationContext, isGloballyAccessible]);

  const formatCounterDisplay = useCallback((type: 'price' | 'loi') => {
    const stats = getCounterStats();
    if (!stats) return '';

    if (type === 'price') {
      return stats.priceCounters.unlimited
        ? `${stats.priceCounters.used} counters used (unlimited)`
        : `${stats.priceCounters.used} of ${stats.priceCounters.used + (stats.priceCounters.remaining || 0)} counters used`;
    } else {
      return `${stats.loiCounters.used} of ${stats.loiCounters.limit} changes used`;
    }
  }, [getCounterStats]);

  const isNegotiationActive = useMemo(() => {
    if (!negotiationContext || !isGloballyAccessible) return false;

    return negotiationContext.details?.negotiationStatus &&
      !['completed', 'cancelled', 'rejected'].includes(negotiationContext.details.negotiationStatus);
  }, [negotiationContext, isGloballyAccessible]);

  const getCurrentStage = useCallback(() => {
    if (!negotiationContext || !isGloballyAccessible) return null;

    return {
      stage: negotiationContext.details?.stage || 'unknown',
      status: negotiationContext.details?.negotiationStatus || 'unknown',
      pendingFrom: negotiationContext.details?.pendingResponseFrom || 'unknown',
      isLOI: negotiationContext.negotiationType === 'LOI',
    };
  }, [negotiationContext, isGloballyAccessible]);

  return {
    isContextAvailable,
    isGloballyAccessible,
    initializeNegotiation,
    checkCounterLimits,
    showCounterLimitWarning,
    getCounterStats,
    formatCounterDisplay,
    isNegotiationActive,
    getCurrentStage,
    negotiationContext: isGloballyAccessible ? negotiationContext : null,
    canMakeCounterOffer: (type: 'price' | 'loi') => checkCounterLimits(type).canCounter,
    getRemainingCounters: (type: 'price' | 'loi') => {
      const stats = getCounterStats();
      return type === 'price' ? stats?.priceCounters.remaining : stats?.loiCounters.remaining;
    },
  };
};

export default useNegotiationUtils;
