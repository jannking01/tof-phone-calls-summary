export default {
  async fetch(request) {
    const url = new URL(request.url);
    const voipId = url.searchParams.get('voip_id');
    const token = url.searchParams.get('token');

    if (!voipId || !token) {
      return new Response(JSON.stringify({ error: 'Missing voip_id or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Forward remaining params to Phone.com
    const forward = new URLSearchParams(url.searchParams);
    forward.delete('voip_id');
    forward.delete('token');

    const apiUrl = `https://api.phone.com/v4/accounts/${voipId}/call-logs?${forward.toString()}`;

    const resp = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
