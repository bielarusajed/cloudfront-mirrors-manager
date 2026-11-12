import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CreateDistributionRequest, DistributionSummary } from '../types/distribution.ts';
import { createDistributionBatch } from './create-distribution-batch.ts';

const input = {
  originDomainName: 'news.example.org',
  count: 10,
  cachePolicyId: 'cache-id',
  originRequestPolicyId: 'request-id',
};
const item = (id: string): DistributionSummary => ({
  id,
  domainName: `${id}.cloudfront.net`,
  status: 'InProgress',
  enabled: true,
  origins: [{ domainName: input.originDomainName }],
});

test('creates ten with both policies, unique replay references, and at most four AWS calls at once', async () => {
  const params: CreateDistributionRequest[] = [];
  let active = 0;
  let peak = 0;
  const result = await createDistributionBatch(input, async (p) => {
    params.push(p);
    active++;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active--;
    return item(p.callerReference as string);
  });
  assert.equal(result.items.length, 10);
  assert.equal(result.errors.length, 0);
  assert.equal(new Set(params.map((p) => p.callerReference)).size, 10);
  assert.equal(peak, 4);
  assert.ok(
    params.every(
      (p) => p.cachePolicyId === input.cachePolicyId && p.originRequestPolicyId === input.originRequestPolicyId,
    ),
  );
});

test('keeps partial successes and reports failures without retrying successful creates', async () => {
  let calls = 0;
  const result = await createDistributionBatch(input, async () => {
    const index = ++calls;
    if (index === 3 || index === 7) throw new Error(`AWS failure ${index}`);
    return item(String(index));
  });
  assert.equal(calls, 10);
  assert.deepEqual(
    result.items.map((i) => i.id),
    ['1', '2', '4', '5', '6', '8', '9', '10'],
  );
  assert.deepEqual(
    result.errors.map((e) => e.index),
    [3, 7],
  );
});

test('complete failure returns no successes and preserves each failure', async () => {
  const result = await createDistributionBatch({ ...input, count: 2 }, async () => {
    throw new Error('denied');
  });
  assert.equal(result.items.length, 0);
  assert.deepEqual(
    result.errors.map((e) => e.message),
    ['denied', 'denied'],
  );
});

test('rejects invalid batch inputs before any AWS call', async () => {
  let calls = 0;
  for (const patch of [
    { count: 0 },
    { count: 101 },
    { count: 1.5 },
    { originDomainName: 'https://example.org/path' },
    { cachePolicyId: '' },
    { originRequestPolicyId: '' },
  ]) {
    await assert.rejects(
      createDistributionBatch({ ...input, ...patch }, async () => {
        calls++;
        return item('never');
      }),
    );
  }
  assert.equal(calls, 0);
});
