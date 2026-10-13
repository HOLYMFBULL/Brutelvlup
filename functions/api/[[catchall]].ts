interface Env {
  BACKEND_URL?: string;
}

const RENDER_BACKEND_URL = 'https://brutelvlup.onrender.com';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const backendBase = (env.BACKEND_URL || RENDER_BACKEND_URL).replace(/\/$/, '');

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    const rawCatchall = params.catchall;
    const pathPart = Array.isArray(rawCatchall) ? rawCatchall.join('/') : (rawCatchall || '');
    const url = new URL(request.url);
    const targetUrl = `${backendBase}/api/${pathPart}${url.search}`;

    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set('host', new URL(backendBase).host);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const init: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      signal: controller.signal,
      redirect: 'follow',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.clone().arrayBuffer();
    }

    const res = await fetch(targetUrl, init);
    clearTimeout(timeoutId);

    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      status: 'error',
      message: `Backend proxy error: ${err.message}`,
      backend: backendBase,
    }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }
};
