const { createFinalizeTransaction } = require('../../services/transactionFinalize');

function buildDeps(overrides = {}) {
  const noop = async () => {};
  const User = {
    findOne: jest.fn().mockResolvedValue({
      userId: 123,
      username: 'testuser',
      saldo: 0,
      totalTransaksi: 0,
      language: 'id',
      save: jest.fn().mockResolvedValue(),
      redeemedVouchers: [],
    }),
  };
  const Product = {
    findById: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
  };
  const Voucher = {
    findOne: jest.fn().mockResolvedValue(null),
  };
  const Transaction = {
    findById: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
  };
  return {
    User,
    Transaction,
    Setting: { findOne: jest.fn().mockResolvedValue(null) },
    Product,
    Voucher,
    t: () => '',
    formatMoney: (v) => String(v),
    getKeyboard: () => ({ reply_markup: {} }),
    userStates: {},
    bot: { telegram: { sendMessage: jest.fn().mockResolvedValue() } },
    sendChannelNotification: jest.fn().mockResolvedValue(),
    deletePaymentMessageRef: jest.fn().mockResolvedValue(),
    finalizePanelTransaction: noop,
    deliverProduct: jest.fn().mockResolvedValue([]),
    sendProductPurchaseResult: jest.fn().mockResolvedValue(),
    checkAndNotifyCriticalStock: jest.fn().mockResolvedValue(),
    ADMIN_IDS: [],
    CHANNEL_ID: null,
    notifyAdminsManualOrder: jest.fn().mockResolvedValue(),
    ...overrides,
  };
}

describe('finalizeTransaction - basic guards', () => {
  test('status SUCCESS → alreadyProcessed dan tidak menyentuh deps lain', async () => {
    const deps = buildDeps();
    const finalizeTransaction = createFinalizeTransaction(deps);

    const trx = {
      status: 'SUCCESS',
      produkInfo: { type: 'PRODUCT' },
    };

    const result = await finalizeTransaction(trx, 'QRIS', { source: 'test_guard' });

    expect(result).toEqual({ alreadyProcessed: true });
    // Guard ini seharusnya return sebelum query User/Product
    expect(deps.User.findOne).not.toHaveBeenCalled();
    expect(deps.Product.findById).not.toHaveBeenCalled();
  });

  test('AUTO PRODUCT dengan stokDikirim sudah terisi → alreadyDelivered dan tidak memanggil deliverProduct', async () => {
    const fakeProduct = { _id: 'prod1', namaProduk: 'Test Product', deliveryType: 'AUTO' };
    const freshTrxFromDb = {
      produkInfo: { type: 'PRODUCT', stokDikirim: [], productId: 'prod1', jumlah: 1 },
      status: 'PENDING',
    };
    const claimedTrx = {
      _id: 'trx123',
      userId: 123,
      refId: 'REFTEST',
      totalBayar: 10000,
      status: 'PROCESSING',
      produkInfo: { type: 'PRODUCT', productId: 'prod1', namaProduk: 'Test Product', jumlah: 1, stokDikirim: ['SUDAH'] },
      save: jest.fn().mockResolvedValue(),
    };

    const deps = buildDeps({
      Product: {
        findById: jest.fn().mockResolvedValue(fakeProduct),
        findOne: jest.fn().mockResolvedValue(fakeProduct),
      },
      Transaction: {
        findById: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(freshTrxFromDb),
        }),
        findOneAndUpdate: jest.fn().mockResolvedValue(claimedTrx),
      },
    });

    const finalizeTransaction = createFinalizeTransaction(deps);

    const trx = {
      _id: 'trx123',
      userId: 123,
      refId: 'REFTEST',
      totalBayar: 10000,
      status: 'PENDING',
      produkInfo: {
        type: 'PRODUCT',
        productId: 'prod1',
        namaProduk: 'Test Product',
        jumlah: 1,
        stokDikirim: ['SUDAH'],
      },
      save: jest.fn().mockResolvedValue(),
    };

    const result = await finalizeTransaction(trx, 'QRIS', { source: 'test_stok' });

    expect(result).toEqual({ alreadyDelivered: true });
    expect(claimedTrx.status).toBe('SUCCESS');
    expect(claimedTrx.finalizedBy).toBeDefined();
    expect(deps.deliverProduct).not.toHaveBeenCalled();
  });
});

