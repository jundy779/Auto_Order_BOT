const { detectIntent } = require('../../services/cs/intentRouter');

describe('detectIntent', () => {
  const cases = [
    ['stok produk panel berapa?', 'produk'],
    ['ada kategori game?', 'produk'],
    ['cara order gimana?', 'produk'],
    ['harga produk termurah apa?', 'produk'],
    ['best seller minggu ini apa', 'produk'],
    ['saya mau bayar pakai qris', 'payment'],
    ['duitnow belum kebaca', 'payment'],
    ['toyyibpay pending', 'payment'],
    ['status transaksi saya bagaimana', 'payment'],
    ['payment chip berhasil belum', 'payment'],
    ['order saya gagal', 'kendala'],
    ['error pas checkout', 'kendala'],
    ['belum masuk produknya', 'kendala'],
    ['problem di pesanan saya', 'kendala'],
    ['refund dong admin', 'kendala'],
    ['saya butuh bantuan', 'kendala'],
    ['hello', 'fallback'],
    ['tes', 'fallback'],
    ['?', 'fallback'],
    ['', 'fallback'],
  ];

  it.each(cases)('detects "%s" as %s', (input, expectedIntent) => {
    const result = detectIntent(input);
    expect(result.intent).toBe(expectedIntent);
    expect(typeof result.confidence).toBe('number');
  });
});

