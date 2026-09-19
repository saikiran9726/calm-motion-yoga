import type { Connect } from 'vite';
import url from 'url';

// Dynamically route local /api/* requests during vite dev
export function devApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/')) {
      return next();
    }

    try {
      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname || '';

      // Read JSON body for POST/PUT/DELETE
      let body: any = {};
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const raw = Buffer.concat(buffers).toString();
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch {
            body = {};
          }
        }
      }

      const query = parsedUrl.query;

      // Enhance response with .status() and .json() methods to match Vercel/Express signature
      const resExtended = res as any;
      resExtended.status = function (code: number) {
        res.statusCode = code;
        return resExtended;
      };
      resExtended.json = function (data: any) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return resExtended;
      };

      const reqExtended = req as any;
      reqExtended.body = body;
      reqExtended.query = query;

      // Match path to handler
      if (pathname === '/api/clinic/auth') {
        const mod = await import('../clinic/auth');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/clinic/patients') {
        const mod = await import('../clinic/patients');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/clinic/patient') {
        const mod = await import('../clinic/patient');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/clinic/program') {
        const mod = await import('../clinic/program');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/clinic/notes') {
        const mod = await import('../clinic/notes');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/clinic/seed') {
        const mod = await import('../clinic/seed');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/reports') {
        const mod = await import('../reports');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/patient/join') {
        const mod = await import('../patient/join');
        return await mod.default(reqExtended, resExtended);
      }
      if (pathname === '/api/patient/delete-data') {
        const mod = await import('../patient/delete-data');
        return await mod.default(reqExtended, resExtended);
      }

      return resExtended.status(404).json({ error: 'Endpoint not found: ' + pathname });
    } catch (err: any) {
      console.error('Dev API middleware error:', err);
      const resExtended = res as any;
      if (!res.headersSent) {
        resExtended.statusCode = 500;
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    }
  };
}
