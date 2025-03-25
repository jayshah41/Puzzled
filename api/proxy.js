export default async function handler(req, res) {
  const backendBaseUrl = process.env.BACKEND_URL;
  const backendUrl = `${backendBaseUrl}${req.url.replace('/api/proxy', '')}`;

  try {
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(backendUrl).host,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null,
    });

    const data = await backendResponse.text();

    res.status(backendResponse.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
