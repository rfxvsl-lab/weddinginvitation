/**
 * Gateway Pakasir tiruan untuk test end-to-end.
 * Meniru dua endpoint yang dipakai aplikasi:
 *   POST /api/transactioncreate/:method
 *   GET  /api/transactiondetail
 */

import http from 'node:http';

export function startFakePakasir(port) {
  /** @type {Map<string, {amount:number, status:string, method:string}>} */
  const orders = new Map();
  const state = { down: false };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const send = (code, body) => {
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (state.down) return send(503, { message: 'gateway down' });

    if (req.method === 'POST' && url.pathname.startsWith('/api/transactioncreate/')) {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', () => {
        const body = JSON.parse(raw || '{}');
        const method = url.pathname.split('/').pop();
        orders.set(body.order_id, { amount: Number(body.amount), status: 'pending', method });
        send(200, {
          payment: {
            project: body.project,
            order_id: body.order_id,
            amount: Number(body.amount),
            fee: 0,
            total_payment: Number(body.amount),
            payment_method: method,
            payment_number: method === 'qris' ? `00020101FAKE${body.order_id}` : '8808123456789012',
            expired_at: new Date(Date.now() + 3600_000).toISOString(),
          },
        });
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/transactiondetail') {
      const orderId = url.searchParams.get('order_id');
      const amount = Number(url.searchParams.get('amount'));
      const order = orders.get(orderId);
      // Seperti gateway asli: order hanya ditemukan jika nominalnya cocok.
      if (!order || order.amount !== amount) return send(404, { message: 'Transaction not found' });
      return send(200, {
        transaction: {
          amount: order.amount,
          order_id: orderId,
          project: url.searchParams.get('project'),
          status: order.status,
          payment_method: order.method,
          completed_at: order.status === 'completed' ? new Date().toISOString() : undefined,
        },
      });
    }

    send(404, { message: 'not found' });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () =>
      resolve({
        orders,
        /** Tandai order lunas di sisi gateway (belum mengirim webhook). */
        complete(orderId) {
          const order = orders.get(orderId);
          if (!order) throw new Error(`order ${orderId} tidak ada di gateway tiruan`);
          order.status = 'completed';
        },
        setDown(value) {
          state.down = value;
        },
        close: () => new Promise((r) => server.close(r)),
      })
    );
  });
}
