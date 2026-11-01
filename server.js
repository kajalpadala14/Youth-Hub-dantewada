const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Sensitive file patterns and directories that should never be served directly
const BLOCKED_PATTERNS = [
  /^\/\./,                   // Hidden files (.env, .git, etc.)
  /\/\./,                    // Hidden files in subdirectories
  /^\/(?:server\.js|package(?:-lock)?\.json|PROJECT_AUDIT\.md|\.gitignore|\.env.*)$/i,
  /^\/(?:scripts|AppsScript|test|node_modules)(?:\/|$)/i
];

function isSafePath(targetPath) {
  const resolved = path.resolve(targetPath);
  return resolved.startsWith(ROOT_DIR) && (resolved === ROOT_DIR || resolved.startsWith(ROOT_DIR + path.sep));
}

const server = http.createServer((req, res) => {
  // 1. Method verification
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  // 2. URL parsing and routing
  let reqUrl;
  try {
    reqUrl = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request: Malformed URI');
    return;
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  } else if (reqUrl === '/admin') {
    reqUrl = '/admin.html';
  }

  // 3. Security checks: blocked files & paths
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(reqUrl)) {
      res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="utf-8"><title>403 Forbidden</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>403 - Access Forbidden</h2>
          <p>Access to the requested resource is restricted.</p>
          <p><a href="/index.html">Return to Portal</a></p>
        </body>
        </html>
      `);
      return;
    }
  }

  const normalizedSubPath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, normalizedSubPath);

  // 4. Path traversal prevention
  if (!isSafePath(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  // 5. File stats and delivery
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="hi">
        <head>
          <meta charset="utf-8">
          <title>404 Not Found - Dantewada Youth Portal</title>
        </head>
        <body style="font-family:system-ui, -apple-system, sans-serif; text-align:center; padding:50px; background:#f8fafc; color:#1e293b;">
          <h2 style="font-size:24px; font-weight:800; color:#0f172a;">404 - पृष्ठ नहीं मिला (Page Not Found)</h2>
          <p style="color:#64748b; font-size:14px;">अनुरोधित पृष्ठ सर्वर पर उपलब्ध नहीं है।</p>
          <p style="margin-top:20px;">
            <a href="/index.html" style="color:#1d4ed8; font-weight:bold; text-decoration:none; margin-right:15px;">सार्वजनिक पोर्टल (Live Portal)</a> | 
            <a href="/admin.html" style="color:#1d4ed8; font-weight:bold; text-decoration:none; margin-left:15px;">एडमिन डैशबोर्ड (Admin Console)</a>
          </p>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Standard production security and anti-caching headers
    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error('File stream error:', streamErr);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Server Error');
      }
    });

    req.on('close', () => {
      if (!stream.destroyed) {
        stream.destroy();
      }
    });

    stream.pipe(res);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏛️  Dantewada Youth Development & Success Story Portal`);
  console.log(`🏢  District Administration / Zilla Panchayat, Dantewada`);
  console.log(`🌐  Public Portal:    http://localhost:${PORT}/index.html`);
  console.log(`📊  Admin Dashboard:  http://localhost:${PORT}/admin.html`);
  console.log(`🛡️  Security:         Headers & Path Guard Active`);
  console.log(`=======================================================`);
});

// Graceful process shutdown
function handleShutdown(signal) {
  console.log(`Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
