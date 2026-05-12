const assert = require('assert');
const { withRetry } = require('../../services/payment/retry');
const { __test } = require('../../services/cs/openclawAdapter');

const { extractAnswerFromResponse, redactOpenClawContext, getNested } = __test;

describe('openclawAdapter __test helpers', () => {
  describe('getNested', () => {
    it('mengikuti path titik', () => {
      assert.strictEqual(getNested({ a: { b: 1 } }, 'a.b'), 1);
      assert.strictEqual(getNested({ a: { b: null } }, 'a.b'), null);
      assert.strictEqual(getNested(null, 'a'), undefined);
    });
  });

  describe('extractAnswerFromResponse', () => {
    it('memakai OPENCLAW_RESPONSE_ANSWER_PATH jika diisi', () => {
      assert.strictEqual(
        extractAnswerFromResponse({ data: { message: 'X' } }, 'data.message'),
        'X'
      );
    });
    it('fallback answer / text / data.answer / message.content / result', () => {
      assert.strictEqual(extractAnswerFromResponse({ answer: ' A ' }, ''), 'A');
      assert.strictEqual(extractAnswerFromResponse({ text: 't' }, ''), 't');
      assert.strictEqual(extractAnswerFromResponse({ data: { answer: 'd' } }, ''), 'd');
      assert.strictEqual(extractAnswerFromResponse({ message: { content: 'm' } }, ''), 'm');
      assert.strictEqual(extractAnswerFromResponse({ result: 'r' }, ''), 'r');
    });
  });

  describe('redactOpenClawContext', () => {
    it('menghapus key terlarang dan meredaksi secret-like', () => {
      const out = redactOpenClawContext({
        ok: true,
        gatewayResponse: { x: 1 },
        apiKey: 'secret',
        nested: { password: 'p' },
      });
      assert.strictEqual(out.ok, true);
      assert.strictEqual(out.gatewayResponse, undefined);
      assert.strictEqual(out.apiKey, '****');
      assert.strictEqual(out.nested.password, '****');
    });

    it('saat stringify melebihi batas, mengembalikan metadata truncasi (bukan JSON.parse slice)', () => {
      // getContextMaxChars() hanya menghormati nilai > 500 (prod safety)
      process.env.OPENCLAW_CONTEXT_MAX_CHARS = '600';
      const huge = {};
      for (let i = 0; i < 30; i += 1) huge[`f${i}`] = 'x'.repeat(120);
      const out = redactOpenClawContext(huge);
      assert.strictEqual(out._truncated, true);
      assert.strictEqual(typeof out.approxChars, 'number');
      assert(out.approxChars > 600);
      delete process.env.OPENCLAW_CONTEXT_MAX_CHARS;
    });
  });
});

describe('withRetry + retry:false', () => {
  it('tidak mengulang jika result.retry === false', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        return { success: false, retry: false, code: 400 };
      },
      { maxAttempts: 5, delayMs: 1, backoffMultiplier: 1 }
    );
    assert.strictEqual(calls, 1);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.retry, false);
  });

  it('tetap mengulang success:false tanpa retry:false sampai maxAttempts', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) return { success: false };
        return { success: true, n: calls };
      },
      { maxAttempts: 5, delayMs: 1, backoffMultiplier: 1 }
    );
    assert.strictEqual(calls, 3);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.n, 3);
  });
});
