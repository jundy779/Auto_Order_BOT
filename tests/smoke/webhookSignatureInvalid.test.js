/**
 * Smoke test: webhook signature invalid → ditolak (401).
 * Memastikan callback dengan signature salah tidak mem-finalize transaksi.
 */
const express = require('express');
const createWebhookRouter = require('../../routes/webhooks');

describe('Smoke: webhook signature invalid → ditolak', () => {
  let app;
  let server;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const paymentManager = {
      pakasir: { enabled: false },
      sanpay: { enabled: false },
      tripay: { enabled: true }, // aktif agar pengecekan signature jalan → 401
      midtrans: { enabled: false },
      violetpay: { enabled: false },
      toyyibpay: { enabled: false },
    };
    const router = createWebhookRouter({
      paymentManager,
      Transaction: { findOne: () => null, findById: () => null },
      bot: { telegram: { deleteMessage: () => Promise.resolve() } },
      finalizeTransaction: () => Promise.resolve(),
      getCheckAmount: () => 10000,
      MIDTRANS_ENABLED: true,
      MIDTRANS_SERVER_KEY: 'test-server-key-secret',
      TRIPAY_PRIVATE_KEY: 'test-tripay-private-key',
    });
    app.use('/', router);
  });

  afterAll(async () => {
    if (server) await new Promise((r) => server.close(r));
  });

  test('POST /midtrans-webhook dengan signature_key salah → 401', async () => {
    const origWarn = console.warn;
    console.warn = () => {}; // suppress expected invalid-signature log
    server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/midtrans-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: 'REF-TEST-001',
          status_code: '200',
          gross_amount: 10000,
          signature_key: 'invalid-signature-wrong',
        }),
      });
      expect(res.status).toBe(401);
      const body = await res.json().catch(() => ({}));
      expect(body.message).toMatch(/invalid signature/i);
    } finally {
      console.warn = origWarn;
      await new Promise((r) => server.close(r));
      server = null;
    }
  });

  test('POST /tripay-callback dengan signature salah → 401', async () => {
    server = app.listen(0);
    const port = server.address().port;
    try {
      const res = await fetch(`http://127.0.0.1:${port}/tripay-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Callback-Signature': 'wrong-signature-hex',
        },
        body: JSON.stringify({ reference: 'REF', status: 'PAID' }),
      });
      expect(res.status).toBe(401);
      const body = await res.json().catch(() => ({}));
      expect(body.message).toMatch(/invalid signature/i);
    } finally {
      await new Promise((r) => server.close(r));
      server = null;
    }
  });
});
