/**
 * Test flowBroadcast: handleBroadcastConfirmation memanggil broadcastQueue.addJob
 */

const flowBroadcast = require('../../features/admin/flowBroadcast');

describe('flowBroadcast', () => {
  describe('handleBroadcastConfirmation', () => {
    it('return false jika state tidak BROADCAST_WAITING_CONFIRMATION', async () => {
      const ctx = {
        from: { id: 1 },
        message: { text: 'ya' },
      };
      const adminStates = {};
      const result = await flowBroadcast.handleBroadcastConfirmation(ctx, {
        adminStates,
        getUser: async () => ({ language: 'id' }),
        t: (lang, key) => key,
        User: {},
        broadcastQueue: { addJob: jest.fn() },
      });
      expect(result).toBe(false);
    });

    it('batalkan jika reply bukan ya/yes/y/ok', async () => {
      const ctx = {
        from: { id: 1 },
        message: { text: 'tidak' },
        reply: jest.fn().mockResolvedValue(),
      };
      const adminStates = { 1: { step: 'BROADCAST_WAITING_CONFIRMATION', payload: { type: 'text', text: 'hi' } } };
      const broadcastQueue = { addJob: jest.fn() };

      const result = await flowBroadcast.handleBroadcastConfirmation(ctx, {
        adminStates,
        getUser: async () => ({ language: 'id' }),
        t: (lang, key) => key,
        User: {},
        broadcastQueue,
      });

      expect(result).toBe(true);
      expect(broadcastQueue.addJob).not.toHaveBeenCalled();
      expect(adminStates[1]).toBeUndefined();
      expect(ctx.reply).toHaveBeenCalledWith('broadcast_cancelled_wrong_reply');
    });

    it('tambahkan job ke broadcastQueue saat konfirmasi ya', async () => {
      const ctx = {
        from: { id: 123 },
        message: { text: 'ya' },
        reply: jest.fn().mockResolvedValue(),
      };
      const payload = { type: 'text', text: 'Pesan broadcast', entities: [] };
      const adminStates = { 123: { step: 'BROADCAST_WAITING_CONFIRMATION', payload } };
      const broadcastQueue = { addJob: jest.fn() };

      const result = await flowBroadcast.handleBroadcastConfirmation(ctx, {
        adminStates,
        getUser: async () => ({ language: 'id' }),
        t: (lang, key) => key,
        User: {},
        broadcastQueue,
      });

      expect(result).toBe(true);
      expect(broadcastQueue.addJob).toHaveBeenCalledWith({
        target: 'all',
        payload,
        adminChatId: 123,
      });
      expect(adminStates[123]).toBeUndefined();
      expect(ctx.reply).toHaveBeenCalledWith('broadcast_started');
    });

    it('normalisasi reply ya/yes/y/ok (case insensitive)', async () => {
      const tests = ['ya', 'YA', 'yes', 'Yes', 'y', 'Y', 'ok', 'OK'];
      for (const reply of tests) {
        const ctx = {
          from: { id: 1 },
          message: { text: reply },
          reply: jest.fn().mockResolvedValue(),
        };
        const adminStates = { 1: { step: 'BROADCAST_WAITING_CONFIRMATION', payload: { type: 'text', text: 'x' } } };
        const broadcastQueue = { addJob: jest.fn() };

        await flowBroadcast.handleBroadcastConfirmation(ctx, {
          adminStates,
          getUser: async () => ({ language: 'id' }),
          t: (lang, key) => key,
          User: {},
          broadcastQueue,
        });

        expect(broadcastQueue.addJob).toHaveBeenCalled();
      }
    });
  });
});
