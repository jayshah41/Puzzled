import { createProxyMiddleware } from 'http-proxy-middleware';

export default async function handler(req, res) {
  const proxy = createProxyMiddleware({
    target: 'http://teampuzzled25.pythonanywhere.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  });

  return new Promise((resolve, reject) => {
    proxy(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}