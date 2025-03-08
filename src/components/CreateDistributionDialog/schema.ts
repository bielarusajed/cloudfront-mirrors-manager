import z from 'zod';

export const formSchema = z.object({
  originDomainName: z.string().min(1, 'Увядзіце дамен крыніцы'),
  cachePolicyId: z.string().min(1, 'Выберыце палітыку кэшавання'),
  originRequestPolicyId: z.string().min(1, 'Выберыце палітыку запытаў'),
  comments: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
