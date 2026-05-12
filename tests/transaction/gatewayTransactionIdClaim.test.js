/**
 * Unit test: gatewayTransactionId claim logic (anti double-use).
 * Key harus deterministik per mutasi agar findOne({ gatewayTransactionId, status: 'SUCCESS' })
 * mendeteksi transaksi yang sudah mengklaim mutasi tersebut.
 */
const { buildGatewayTransactionKey } = require('../../services/transactionHelpers');

describe('gatewayTransactionId claim (anti double-use)', () => {
  test('key deterministik: mutasi sama → key sama → satu transaksi saja yang bisa claim', () => {
    const mutasi = { issuer_reff: 'REF-X', amount: 50000, date: '10/02/2025 12:00' };
    const key1 = buildGatewayTransactionKey('QIOSPAY', mutasi);
    const key2 = buildGatewayTransactionKey('QIOSPAY', mutasi);
    expect(key1).toBe(key2);
    // Di polling: Transaction.findOne({ gatewayTransactionId: key1, status: 'SUCCESS' })
    // jika sudah ada → skip. Jadi mutasi yang sama tidak bisa difinalize dua kali oleh dua trx berbeda.
  });

  test('key unik per mutasi: mutasi beda → key beda', () => {
    const m1 = { transactionID: 'T1', amount: 10000 };
    const m2 = { transactionID: 'T2', amount: 10000 };
    const k1 = buildGatewayTransactionKey('SANPAY', m1);
    const k2 = buildGatewayTransactionKey('SANPAY', m2);
    expect(k1).not.toBe(k2);
  });

  test('format key konsisten untuk lookup DB', () => {
    const mutasi = { issuer_reff: 'ORD-1', amount: 25000, date: '01/01/2025 08:00' };
    const key = buildGatewayTransactionKey('QIOSPAY', mutasi);
    expect(key).toMatch(/^QIOSPAY:.+$/); // value boleh mengandung colon (mis. waktu 08:00)
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(10);
  });
});
