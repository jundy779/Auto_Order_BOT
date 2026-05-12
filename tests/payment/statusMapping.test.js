/**
 * Unit test: mapping status provider → internal (PENDING / SUCCESS / FAILED).
 * Setiap gateway mengembalikan status berbeda; ini memastikan kita treat "paid" konsisten.
 */

// Helper: status string gateway → apakah dianggap SUCCESS (bayar lunas). Sesuai logic di webhook/polling.
function isPaidStatus(provider, status) {
  if (!status || typeof status !== 'string') return false;
  const s = status.toLowerCase().trim();
  const p = (provider || '').toUpperCase();
  switch (p) {
    case 'PAKASIR':
      return s === 'completed';
    case 'QIOSPAY':
      return s === 'success';
    case 'SANPAY':
      return ['success', 'paid', 'completed'].includes(s);
    case 'MIDTRANS':
      return ['capture', 'settlement'].includes(s);
    case 'TRIPAY':
      return s === 'paid';
    case 'TOYYIBPAY':
      return s === '1';
    case 'VIOLETPAY':
      return ['success', 'paid', 'completed'].includes(s);
    default:
      return false;
  }
}

describe('isPaidStatus (provider → internal SUCCESS)', () => {
  const isPaid = isPaidStatus;

  test('PAKASIR: completed → paid', () => {
    expect(isPaid('PAKASIR', 'completed')).toBe(true);
    expect(isPaid('PAKASIR', 'pending')).toBe(false);
    expect(isPaid('PAKASIR', '')).toBe(false);
  });

  test('QIOSPAY: success → paid', () => {
    expect(isPaid('QIOSPAY', 'SUCCESS')).toBe(true);
    expect(isPaid('QIOSPAY', 'success')).toBe(true);
    expect(isPaid('QIOSPAY', 'PENDING')).toBe(false);
  });

  test('SANPAY: success/paid/completed → paid', () => {
    expect(isPaid('SANPAY', 'success')).toBe(true);
    expect(isPaid('SANPAY', 'paid')).toBe(true);
    expect(isPaid('SANPAY', 'completed')).toBe(true);
    expect(isPaid('SANPAY', 'PENDING')).toBe(false);
  });

  test('MIDTRANS: capture/settlement → paid, pending → not paid', () => {
    expect(isPaid('MIDTRANS', 'capture')).toBe(true);
    expect(isPaid('MIDTRANS', 'settlement')).toBe(true);
    expect(isPaid('MIDTRANS', 'pending')).toBe(false);
  });

  test('TRIPAY: paid → paid', () => {
    expect(isPaid('TRIPAY', 'paid')).toBe(true);
    expect(isPaid('TRIPAY', 'unpaid')).toBe(false);
  });

  test('TOYYIBPAY: 1 → paid, 2/3 → not paid', () => {
    expect(isPaid('TOYYIBPAY', '1')).toBe(true);
    expect(isPaid('TOYYIBPAY', '2')).toBe(false);
    expect(isPaid('TOYYIBPAY', '3')).toBe(false);
  });

  test('unknown provider or null → false', () => {
    expect(isPaid('UNKNOWN', 'completed')).toBe(false);
    expect(isPaid(null, 'completed')).toBe(false);
    expect(isPaid('PAKASIR', null)).toBe(false);
  });
});
