/**
 * Test flowStockBroadcast: handleStockBroadcastConfirm memanggil broadcastQueue.addJob
 */

const flowStockBroadcast = require('../../features/admin/flowStockBroadcast');
const { t } = require('../../utils/i18n');

const deps = (overrides = {}) => ({
  getUser: jest.fn().mockResolvedValue({ language: 'id' }),
  t: (lang, key) => t(lang || 'id', key),
  ...overrides,
});

describe('flowStockBroadcast', () => {
  describe('handleStockBroadcastConfirm', () => {
    it('return false jika state tidak STOCK_BROADCAST_WAITING_CONFIRM', async () => {
      const ctx = {
        from: { id: 1 },
        answerCbQuery: jest.fn().mockResolvedValue(),
      };
      const adminStates = {};
      const result = await flowStockBroadcast.handleStockBroadcastConfirm(ctx, {
        adminStates,
        broadcastQueue: { addJob: jest.fn() },
        ...deps(),
      });
      expect(result).toBe(false);
    });

    it('tambahkan job ke broadcastQueue dengan target not_banned', async () => {
      const ctx = {
        from: { id: 456 },
        answerCbQuery: jest.fn().mockResolvedValue(),
        editMessageReplyMarkup: jest.fn().mockResolvedValue(),
        reply: jest.fn().mockResolvedValue(),
      };
      const message = '*Produk A*\nHarga: Rp 10.000';
      const adminStates = {
        456: { step: 'STOCK_BROADCAST_WAITING_CONFIRM', payload: { message } },
      };
      const broadcastQueue = { addJob: jest.fn() };

      const result = await flowStockBroadcast.handleStockBroadcastConfirm(ctx, {
        adminStates,
        broadcastQueue,
        ...deps(),
      });

      expect(result).toBe(true);
      expect(broadcastQueue.addJob).toHaveBeenCalledWith({
        target: 'not_banned',
        payload: { type: 'text', text: message, parse_mode: 'Markdown' },
        adminChatId: 456,
        completionMessage: t('id', 'stock_broadcast_completion'),
      });
      expect(adminStates[456]).toBeUndefined();
      expect(ctx.reply).toHaveBeenCalledWith(t('id', 'stock_broadcast_started'));
    });

    it('return false jika payload kosong', async () => {
      const ctx = {
        from: { id: 1 },
        answerCbQuery: jest.fn().mockResolvedValue(),
      };
      const adminStates = { 1: { step: 'STOCK_BROADCAST_WAITING_CONFIRM', payload: null } };
      const broadcastQueue = { addJob: jest.fn() };

      const result = await flowStockBroadcast.handleStockBroadcastConfirm(ctx, {
        adminStates,
        broadcastQueue,
        ...deps(),
      });

      expect(result).toBe(false);
      expect(broadcastQueue.addJob).not.toHaveBeenCalled();
    });
  });

  describe('handleStockBroadcastCancel', () => {
    it('hapus state dan reply dibatalkan', async () => {
      const ctx = {
        from: { id: 1 },
        answerCbQuery: jest.fn().mockResolvedValue(),
        editMessageReplyMarkup: jest.fn().mockResolvedValue(),
        reply: jest.fn().mockResolvedValue(),
      };
      const adminStates = { 1: { step: 'STOCK_BROADCAST_WAITING_CONFIRM', payload: {} } };

      const result = await flowStockBroadcast.handleStockBroadcastCancel(ctx, { adminStates, ...deps() });

      expect(result).toBe(true);
      expect(adminStates[1]).toBeUndefined();
      expect(ctx.answerCbQuery).toHaveBeenCalledWith(t('id', 'stock_broadcast_cancelled'));
      expect(ctx.reply).toHaveBeenCalledWith(t('id', 'stock_broadcast_cancelled_msg'));
    });
  });
});
