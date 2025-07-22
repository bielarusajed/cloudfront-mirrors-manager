import z from 'zod';

export const formSchema = z.object({
  originDomainName: z.string().min(1, 'Увядзіце дамен крыніцы'),
  cachePolicyId: z.string().min(1, 'Выберыце палітыку кэшавання'),
  originRequestPolicyId: z.string().min(1, 'Выберыце палітыку запытаў'),
  count: z.coerce.number().min(1, 'Колькасць павінна быць мінімум 1').default(1),
});

export type FormValues = z.infer<typeof formSchema>;
