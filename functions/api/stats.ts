interface Env {
  DB?: any;
  BACKEND_URL?: string;
}

const RENDER_BACKEND_URL = 'https://brutelvlup.onrender.com';

export const onRequestGet = async ({ env }: { env: Env }) => {
  const backendBase = (env.BACKEND_URL || RENDER_BACKEND_URL).replace(/\/$/, '');
  const targetUrl = `${backendBase}/api/stats`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers,
      });
    }

    // Fallback JSON payload when backend is waking up or deploying
    return new Response(JSON.stringify({
      status: 'connecting',
      message: `Render backend responded with HTTP ${res.status}`,
      total_accounts: 0,
      total_matches: 0,
      total_matches_started: 0,
      total_active_matches: 0,
      total_gained_exp: 0,
      exp_per_hour: 0,
      accounts: [],
      logs: [{
        time: new Date().toTimeString().split(' ')[0],
        level: 'warn',
        message: `Render backend is booting up (${backendBase}). Please wait ~30s if waking from sleep.`
      }]
    }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    // Guaranteed JSON response so Cloudflare Pages never serves HTML to an API consumer
    return new Response(JSON.stringify({
      status: 'connecting',
      message: `Connecting to Render backend: ${error.message || 'Backend starting...'}`,
      total_accounts: 0,
      total_matches: 0,
      total_matches_started: 0,
      total_active_matches: 0,
      total_gained_exp: 0,
      exp_per_hour: 0,
      accounts: [],
      logs: [{
        time: new Date().toTimeString().split(' ')[0],
        level: 'warn',
        message: `Connecting to Render backend at ${backendBase}...`
      }]
    }), {
      status: 200,
      headers,
    });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
};
