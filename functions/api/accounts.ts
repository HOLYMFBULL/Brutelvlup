interface Env {
  DB?: any;
}

export const onRequestGet = async ({ env }: { env: Env }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    if (env.DB) {
      const { results } = await env.DB.prepare('SELECT uid, nickname, region, level, initial_exp, current_exp, gained_exp, likes, status, created_at FROM accounts ORDER BY created_at DESC').all();
      return new Response(JSON.stringify({ status: 'ok', accounts: results }), { headers });
    }
    return new Response(JSON.stringify({ status: 'ok', accounts: [], message: 'D1 binding not initialized' }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 'error', error: error.message }), { status: 500, headers });
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data: any = await request.json();
    const uid = String(data.uid || '').trim();
    const nickname = String(data.nickname || `Player_${uid.slice(-5)}`).trim();
    const password = String(data.password || 'DEFAULT_SECURE_TOKEN').trim();
    const region = String(data.region || 'BD').trim();
    const level = Number(data.level) || 1;
    const initialExp = Number(data.initialExp) || level * 3200;

    if (!uid) {
      return new Response(JSON.stringify({ status: 'error', message: 'UID required' }), { status: 400, headers });
    }

    // Encrypt password (simulated AES/Base64 hash for storage)
    const encryptedPassword = btoa(`ENC_${password}_${Date.now()}`);

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO accounts (uid, encrypted_password, nickname, region, level, initial_exp, current_exp, gained_exp, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'STOPPED', CURRENT_TIMESTAMP)
        ON CONFLICT(uid) DO UPDATE SET
          nickname = excluded.nickname,
          region = excluded.region,
          level = excluded.level,
          encrypted_password = excluded.encrypted_password,
          updated_at = CURRENT_TIMESTAMP
      `).bind(uid, encryptedPassword, nickname, region, level, initialExp, initialExp).run();

      return new Response(JSON.stringify({ status: 'ok', message: `Account ${uid} saved to D1` }), { headers });
    }

    return new Response(JSON.stringify({ status: 'ok', message: `Account ${uid} registered (local fallback)` }), { headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 'error', error: error.message }), { status: 500, headers });
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
