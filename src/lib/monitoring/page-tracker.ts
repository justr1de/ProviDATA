'use client';

import { createClient } from '@/lib/supabase/client';
import { getDeviceInfo } from './login-tracker';

interface PageViewInfo {
  userId: string;
  email: string;
  userName?: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
}

// Rastrear visualização de página
export async function trackPageView(pageInfo: PageViewInfo): Promise<void> {
  try {
    const supabase = createClient();
    const deviceInfo = getDeviceInfo();
    
    // Obter session ID do localStorage
    const sessionId = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('providata_session_id') 
      : null;

    // Obter IP (simplificado - sem chamada externa para cada página)
    let ipAddress = 'Unknown';
    try {
      const storedIp = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('providata_user_ip') 
        : null;
      if (storedIp) {
        ipAddress = storedIp;
      }
    } catch {
      // Ignorar erro
    }

    // Inserir visualização de página
    const { error } = await supabase
      .from('page_views')
      .insert({
        user_id: pageInfo.userId,
        email: pageInfo.email,
        user_name: pageInfo.userName,
        page_path: pageInfo.pagePath,
        page_title: pageInfo.pageTitle,
        referrer: pageInfo.referrer || (typeof document !== 'undefined' ? document.referrer : ''),
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        device_type: deviceInfo.deviceType
      });

    if (error) {
      console.error('Error tracking page view:', error);
    }

    // Atualizar estatísticas do usuário
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', pageInfo.userId)
      .single();

    if (existingStats) {
      await supabase
        .from('user_stats')
        .update({
          total_page_views: (existingStats.total_page_views || 0) + 1,
          last_page_viewed: pageInfo.pagePath,
          last_page_viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', pageInfo.userId);
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Hook para usar em componentes React
export function usePageTracking() {
  const trackPage = async (
    userId: string, 
    email: string, 
    userName?: string
  ) => {
    if (typeof window === 'undefined') return;
    
    await trackPageView({
      userId,
      email,
      userName,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer
    });
  };

  return { trackPage };
}
