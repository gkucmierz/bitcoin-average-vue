import { test } from 'node:test';
import assert from 'node:assert';
import { format } from './format.js';

test('format utility', async (t) => {
  await t.test('default parameters (precision=2, split=false)', () => {
    assert.strictEqual(format(1234.567), '1234.57');
    assert.strictEqual(format(0), '0.00');
  });

  await t.test('custom precision', () => {
    assert.strictEqual(format(1234.567, 1), '1234.6');
    assert.strictEqual(format(1234.567, 0), '1235');
  });

  await t.test('split=true with various number lengths (no decimals)', () => {
    assert.strictEqual(format(1, 0, true), '1');
    assert.strictEqual(format(12, 0, true), '12');
    assert.strictEqual(format(123, 0, true), '123');
    assert.strictEqual(format(1234, 0, true), '1 234');
    assert.strictEqual(format(12345, 0, true), '12 345');
    assert.strictEqual(format(123456, 0, true), '123 456');
    assert.strictEqual(format(1234567, 0, true), '1 234 567');
  });

  await t.test('split=true with decimals', () => {
    assert.strictEqual(format(1234.567, 2, true), '1 234.57');
  });

  await t.test('edge cases: NaN, null, undefined', () => {
    assert.strictEqual(format(NaN), '0.00');
    assert.strictEqual(format(null), '0.00');
    assert.strictEqual(format(undefined), '0.00');
  });
});
