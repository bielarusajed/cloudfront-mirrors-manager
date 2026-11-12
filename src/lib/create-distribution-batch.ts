import { z } from 'zod';
import type {
  CreateDistributionBatchResponse,
  CreateDistributionRequest,
  DistributionSummary,
} from '../types/distribution';

export const createBatchSchema = z.object({
  originDomainName: z
    .string()
    .trim()
    .min(1, 'Увядзіце дамен крыніцы')
    .max(253)
    .regex(/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i, 'Увядзіце дамен без https:// і шляху'),
  count: z
    .number()
    .int()
    .min(1, 'Колькасць павінна быць не меншай за 1')
    .max(100, 'За адзін раз можна стварыць не больш за 100 люстэркаў'),
  cachePolicyId: z.string().trim().min(1, 'Выберыце палітыку кэшавання'),
  originRequestPolicyId: z.string().trim().min(1, 'Выберыце палітыку запытаў'),
});

export async function createDistributionBatch(
  input: unknown,
  create: (params: CreateDistributionRequest) => Promise<DistributionSummary>,
): Promise<CreateDistributionBatchResponse> {
  const { count, ...params } = createBatchSchema.parse(input);
  const items: DistributionSummary[] = [];
  const errors: CreateDistributionBatchResponse['errors'] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < count) {
      const index = cursor++;
      try {
        items[index] = await create({ ...params, callerReference: `${Date.now()}-${crypto.randomUUID()}` });
      } catch (error) {
        errors.push({
          index: index + 1,
          message: error instanceof Error ? error.message : 'Невядомая памылка стварэння',
        });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(count, 4) }, worker));
  return { items: items.filter(Boolean), errors: errors.sort((a, b) => a.index - b.index) };
}
