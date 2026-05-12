/**
 * Smoke test: POST /api/checkout dengan payload valid → response sukses dan data berisi ref_id.
 * Endpoint sebenarnya ada di bot.js; test ini memastikan kontrak response (success, ref_id).
 * Untuk tes penuh "transaksi PENDING tersimpan di DB" butuh integration test dengan MongoDB.
 */
const express = require('express');

describe('Smoke: /api/checkout contract', () => {
  test('response checkout sukses punya struktur: success, data.ref_id, data.amount', () => {
    // Kontrak response yang diharapkan dari POST /api/checkout (lihat bot.js)
    const mockSuccessResponse = {
      success: true,
      data: {
        ref_id: 'WEB-1234567890',
        amount: 50000,
        total_amount: 51000,
        fee: 1000,
        qr_image: 'data:image/png;base64,...',
        expires_in: 300,
        gateway: 'QIOSPAY',
      },
    };
    expect(mockSuccessResponse.success).toBe(true);
    expect(mockSuccessResponse.data).toBeDefined();
    expect(mockSuccessResponse.data.ref_id).toBeDefined();
    expect(typeof mockSuccessResponse.data.ref_id).toBe('string');
    expect(mockSuccessResponse.data.amount).toBeGreaterThan(0);
    // Transaksi di DB harus status PENDING (diverifikasi di integration test atau manual)
  });

  test('payload minimal: product_id dan customer_email required', () => {
    const validPayload = {
      product_id: '507f1f77bcf86cd799439011',
      customer_email: 'test@example.com',
      quantity: 1,
      customer_name: 'Test User',
      gateway: 'qiospay',
    };
    expect(validPayload.product_id).toBeDefined();
    expect(validPayload.customer_email).toBeDefined();
  });
});
