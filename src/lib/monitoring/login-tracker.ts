'use client';

import { createClient } from '@/lib/supabase/client';

interface LoginInfo {
  userId: string;
  email: string;
  userName?: string;
  success: boolean;
  failureReason?: string;
}

interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  userAgent: string;
}

// Função para detectar informações do dispositivo
function getDeviceInfo(): DeviceInfo {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  // Detectar navegador
  let browser = 'Unknown';
  let browserVersion = '';
  
  if (userAgent.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
  } else if (userAgent.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || '';
  } else if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) {
    browser = 'Opera';
    browserVersion = userAgent.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || '';
  }

  // Detectar sistema operacional
  let os = 'Unknown';
  let osVersion = '';
  
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (userAgent.includes('Windows NT 6.3')) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows';
    osVersion = '8';
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows';
    osVersion = '7';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
    if (userAgent.includes('Ubuntu')) osVersion = 'Ubuntu';
    else if (userAgent.includes('Fedora')) osVersion = 'Fedora';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || '';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.') || '';
  }

  // Detectar tipo de dispositivo
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  
  if (/Mobi|Android.*Mobile|iPhone|iPod/.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/Windows|Mac OS|Linux/.test(userAgent) && !/Mobi/.test(userAgent)) {
    deviceType = 'desktop';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    userAgent
  };
}

// Função para obter IP e geolocalização
async function getGeoLocation(): Promise<{ ip: string; geo: GeoLocation }> {
  try {
    // Usar serviço gratuito para obter IP e geolocalização
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch geo data');
    }
    
    const data = await response.json();
    
    return {
      ip: data.ip || 'Unknown',
      geo: {
        country: data.country_name || undefined,
        region: data.region || undefined,
        city: data.city || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        timezone: data.timezone || undefined,
        isp: data.org || undefined
      }
    };
  } catch (error) {
    console.error('Error fetching geo location:', error);
    return {
      ip: 'Unknown',
      geo: {}
    };
  }
}

// Gerar ID de sessão único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Função principal para registrar login
export async function trackLogin(loginInfo: LoginInfo): Promise<void> {
  try {
    const supabase = createClient();
    const deviceInfo = getDeviceInfo();
    const { ip, geo } = await getGeoLocation();
    const sessionId = generateSessionId();
    
    // Salvar session ID no localStorage para rastrear páginas
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('providata_session_id', sessionId);
    }

    // Inserir log de login
    const { error: logError } = await supabase
      .from('login_logs')
      .insert({
        user_id: loginInfo.userId,
        email: loginInfo.email,
        user_name: loginInfo.userName,
        ip_address: ip,
        user_agent: deviceInfo.userAgent,
        browser: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        os: deviceInfo.os,
        os_version: deviceInfo.osVersion,
        device_type: deviceInfo.deviceType,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timezone: geo.timezone,
        isp: geo.isp,
        session_id: sessionId,
        success: loginInfo.success,
        failure_reason: loginInfo.failureReason
      });

    if (logError) {
      console.error('Error inserting login log:', logError);
    }

    // Atualizar ou criar estatísticas do usuário
    if (loginInfo.success) {
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', loginInfo.userId)
        .single();

      if (existingStats) {
        // Atualizar estatísticas existentes
        await supabase
          .from('user_stats')
          .update({
            total_logins: (existingStats.total_logins || 0) + 1,
            last_login_at: new Date().toISOString(),
            last_ip_address: ip,
            last_browser: deviceInfo.browser,
            last_os: deviceInfo.os,
            last_city: geo.city,
            last_country: geo.country,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', loginInfo.userId);
      } else {
        // Criar novas estatísticas
        await supabase
          .from('user_stats')
          .insert({
            user_id: loginInfo.userId,
            email: loginInfo.email,
            user_name: loginInfo.userName,
            total_logins: 1,
            last_login_at: new Date().toISOString(),
            last_ip_address: ip,
            last_browser: deviceInfo.browser,
            last_os: deviceInfo.os,
            last_city: geo.city,
            last_country: geo.country,
            total_page_views: 0
          });
      }
    }
  } catch (error) {
    console.error('Error tracking login:', error);
  }
}

// Exportar funções auxiliares para uso em outros componentes
export { getDeviceInfo, getGeoLocation, generateSessionId };
