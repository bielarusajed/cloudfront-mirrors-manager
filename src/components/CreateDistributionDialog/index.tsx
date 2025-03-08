'use client';

import { createDistributionAction } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchPolicies } from '@/lib/api';
import type {
  CachePolicySummary,
  OriginRequestPolicySummary,
} from '@aws-sdk/client-cloudfront';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type FormValues, formSchema } from './schema';

type Policies = {
  cachePolicies: CachePolicySummary[];
  originRequestPolicies: OriginRequestPolicySummary[];
};

export function CreateDistributionDialog() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const { data } = useQuery<Policies>({
    queryKey: ['policies'],
    queryFn: async () => {
      const response = await fetchPolicies();
      if (response.error) {
        toast.error(response.error);
      }
      return {
        cachePolicies: response.cachePolicies,
        originRequestPolicies: response.originRequestPolicies,
      };
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originDomainName: '',
      cachePolicyId: '',
      originRequestPolicyId: '',
    },
  });

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const values = form.getValues();
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    startTransition(async () => {
      try {
        const result = await createDistributionAction(values);
        if (result.error) {
          toast.error(result.error);
        } else if (result.id) {
          toast.success('Distribution створаны');
          form.reset();
          setOpen(false);
        }
      } catch (error) {
        toast.error('Не атрымалася стварыць distribution');
      }
    });
  };

  const cachePolicies = data?.cachePolicies ?? [];
  const originRequestPolicies = data?.originRequestPolicies ?? [];

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Стварыць Distribution
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Стварыць Distribution</AlertDialogTitle>
          <AlertDialogDescription>
            Запоўніце форму для стварэння новага CloudFront distribution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="originDomainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дамен крыніцы</FormLabel>
                  <FormControl>
                    <Input placeholder="origin.example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Дамен, з якога будуць загружацца файлы
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cachePolicyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Палітыка кэшавання</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберыце палітыку кэшавання">
                          {field.value
                            ? cachePolicies.find(
                                (p) => p.CachePolicy?.Id === field.value,
                              )?.CachePolicy?.CachePolicyConfig?.Name
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cachePolicies.map((policy) => (
                        <SelectItem
                          key={policy.CachePolicy?.Id}
                          value={policy.CachePolicy?.Id || ''}
                        >
                          <div className="flex flex-col gap-1">
                            <div>
                              {policy.CachePolicy?.CachePolicyConfig?.Name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {policy.CachePolicy?.CachePolicyConfig?.Comment}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Выберыце палітыку кэшавання для distribution
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originRequestPolicyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Палітыка запытаў да крыніцы</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберыце палітыку запытаў">
                          {field.value
                            ? originRequestPolicies.find(
                                (p) =>
                                  p.OriginRequestPolicy?.Id === field.value,
                              )?.OriginRequestPolicy?.OriginRequestPolicyConfig
                                ?.Name
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {originRequestPolicies.map((policy) => (
                        <SelectItem
                          key={policy.OriginRequestPolicy?.Id}
                          value={policy.OriginRequestPolicy?.Id || ''}
                        >
                          <div className="flex flex-col gap-1">
                            <div>
                              {
                                policy.OriginRequestPolicy
                                  ?.OriginRequestPolicyConfig?.Name
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {
                                policy.OriginRequestPolicy
                                  ?.OriginRequestPolicyConfig?.Comment
                              }
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Выберыце палітыку запытаў да крыніцы
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Адмена</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Стварэнне...
                  </>
                ) : (
                  'Стварыць'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
