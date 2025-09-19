
import { useEffect } from 'react';
import { supabase } from '../app/integrations/supabase/client';

interface TrackingEvent {
  action_type: 'view' | 'add_to_cart' | 'purchase' | 'search' | 'like';
  product_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

export function useAITracking() {
  const sessionId = `session_${Date.now()}_${Math.random()}`;

  const trackEvent = async (event: TrackingEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return; // Ne pas tracker les utilisateurs non connectés

      await supabase
        .from('user_behavior_tracking')
        .insert({
          user_id: user.id,
          product_id: event.product_id,
          action_type: event.action_type,
          session_id: event.session_id || sessionId,
          metadata: event.metadata || {}
        });

      console.log('AI tracking event recorded:', event.action_type);
    } catch (error) {
      console.error('Error tracking AI event:', error);
    }
  };

  const trackProductView = (productId: string, metadata?: Record<string, any>) => {
    trackEvent({
      action_type: 'view',
      product_id: productId,
      metadata
    });
  };

  const trackAddToCart = (productId: string, metadata?: Record<string, any>) => {
    trackEvent({
      action_type: 'add_to_cart',
      product_id: productId,
      metadata
    });
  };

  const trackPurchase = (productId: string, metadata?: Record<string, any>) => {
    trackEvent({
      action_type: 'purchase',
      product_id: productId,
      metadata
    });
  };

  const trackSearch = (query: string, metadata?: Record<string, any>) => {
    trackEvent({
      action_type: 'search',
      metadata: { query, ...metadata }
    });
  };

  const trackLike = (productId: string, metadata?: Record<string, any>) => {
    trackEvent({
      action_type: 'like',
      product_id: productId,
      metadata
    });
  };

  return {
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackLike,
    trackEvent,
    sessionId
  };
}
