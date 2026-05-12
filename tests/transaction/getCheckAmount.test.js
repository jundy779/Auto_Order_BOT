const { getCheckAmount } = require('../../services/transactionHelpers');

describe('getCheckAmount', () => {
  test('mengambil externalPayAmount jika ada', () => {
    const trx = {
      externalPayAmount: 12345,
      totalPayment: 999,
      totalBayar: 888,
    };
    const result = getCheckAmount(trx);
    expect(result).toBe(12345);
  });

  test('fallback ke totalPayment jika externalPayAmount kosong', () => {
    const trx = {
      externalPayAmount: null,
      totalPayment: 20000,
      totalBayar: 15000,
    };
    const result = getCheckAmount(trx);
    expect(result).toBe(20000);
  });

  test('fallback ke totalBayar jika externalPayAmount & totalPayment kosong', () => {
    const trx = {
      externalPayAmount: '',
      totalPayment: undefined,
      totalBayar: 30000,
    };
    const result = getCheckAmount(trx);
    expect(result).toBe(30000);
  });

  test('semua kosong → 0', () => {
    const trx = {};
    const result = getCheckAmount(trx);
    expect(result).toBe(0);
  });

  test('transaction null/undefined → 0', () => {
    expect(getCheckAmount(null)).toBe(0);
    expect(getCheckAmount(undefined)).toBe(0);
  });
});

