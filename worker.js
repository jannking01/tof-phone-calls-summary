export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const VOIP_ID   = '1385837';
    const API_TOKEN = '6WcGq8owUh0Mmzc6kijt0Op8NVUDuQRbnMXYMsqnZKOBnkK7';

    const url = new URL(request.url);
    const forward = new URLSearchParams(url.searchParams);

    let allItems = [];
    let offset = 0;
    const limit = 100;
    let total = null;

    try {
      do {
        forward.set('limit', limit);
        forward.set('offset', offset);

        const apiUrl = `https://api.phone.com/v4/accounts/${VOIP_ID}/call-logs?${forward.toString()}`;

        const resp = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resp.ok) {
          const e = await resp.json().catch(() => ({}));
          return new Response(JSON.stringify({
            error: e.message || `API error: HTTP ${resp.status}`,
            hint: resp.status === 401 ? 'Token expired — get a new one from api-client.cit-phone.com' : ''
          }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const data = await resp.json();
        if (total === null) total = data.total || 0;

        const items = data.items || [];
        allItems = allItems.concat(items);
        offset += limit;

        if (items.length === 0 || allItems.length >= total) break;
        if (allItems.length >= 2000) break;

      } while (offset < total);

      return new Response(JSON.stringify({
        total,
        fetched: allItems.length,
        items: allItems
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};