const { buildGatewayTransactionKey } = require('../../services/transactionHelpers');

describe('buildGatewayTransactionKey', () => {
  test('QIOSPAY: same mutasi produces same key', () => {
    const mutasi = { issuer_reff: 'REF123', amount: 50000, date: '10/02/2025 14:30' };
    const key1 = buildGatewayTransactionKey('QIOSPAY', mutasi);
    const key2 = buildGatewayTransactionKey('QIOSPAY', mutasi);
    expect(key1).toBe(key2);
    expect(key1).toMatch(/^QIOSPAY:REF123_50000_/);
  });

  test('QIOSPAY: uses buyer_reff if issuer_reff empty', () => {
    const mutasi = { buyer_reff: 'BUY99', amount: 25000, date: '01/01/2025 12:00' };
    const key = buildGatewayTransactionKey('QIOSPAY', mutasi);
    expect(key).toMatch(/^QIOSPAY:BUY99_25000_/);
  });

  test('QIOSPAY: different mutasi produce different keys', () => {
    const m1 = { issuer_reff: 'A', amount: 1000, date: '01/01/2025' };
    const m2 = { issuer_reff: 'B', amount: 1000, date: '01/01/2025' };
    const m3 = { issuer_reff: 'A', amount: 2000, date: '01/01/2025' };
    expect(buildGatewayTransactionKey('QIOSPAY', m1)).not.toBe(buildGatewayTransactionKey('QIOSPAY', m2));
    expect(buildGatewayTransactionKey('QIOSPAY', m1)).not.toBe(buildGatewayTransactionKey('QIOSPAY', m3));
  });

  test('SANPAY: same transactionID and amount produce same key', () => {
    const mutasi = { transactionID: 'TXN-XYZ', amount: 75000 };
    const key1 = buildGatewayTransactionKey('SANPAY', mutasi);
    const key2 = buildGatewayTransactionKey('SANPAY', mutasi);
    expect(key1).toBe(key2);
    expect(key1).toBe('SANPAY:TXN-XYZ_75000');
  });

  test('SANPAY: different transactionID produce different keys', () => {
    const m1 = { transactionID: 'T1', amount: 10000 };
    const m2 = { transactionID: 'T2', amount: 10000 };
    expect(buildGatewayTransactionKey('SANPAY', m1)).not.toBe(buildGatewayTransactionKey('SANPAY', m2));
  });

  test('default provider: uses id/referenceId/transactionId and amount', () => {
    const mutasi = { id: 'MID-123', amount: 100000 };
    const key = buildGatewayTransactionKey('MIDTRANS', mutasi);
    expect(key).toMatch(/^MIDTRANS:MID-123_100000/);
  });

  test('provider or mutasi null/empty returns safe prefix', () => {
    expect(buildGatewayTransactionKey('QIOSPAY', null)).toMatch(/^QIOSPAY:/);
    expect(buildGatewayTransactionKey(null, { amount: 1 })).toMatch(/^UNKNOWN:/);
  });
});
