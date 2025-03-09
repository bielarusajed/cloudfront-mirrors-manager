import { deleteDistributionAction, disableDistributionAction, enableDistributionAction } from '@/app/actions';
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
import type { DistributionSummary } from '@/types/distribution';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Power, PowerOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ActionButtonsProps = {
  distribution: DistributionSummary;
};

export function ActionButtons({ distribution }: ActionButtonsProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteDistribution, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      if (!distribution.id) throw new Error('Немагчыма выдаліць distribution без ID');
      await deleteDistributionAction(distribution.id);
      await queryClient.invalidateQueries({ queryKey: ['distributions'] });
    },
    onError: (error) =>
      toast.error('Не атрымалася выдаліць distribution', {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: async () => {
      if (!distribution.id) throw new Error('Немагчыма змяніць статус distribution без ID');
      const action = distribution.enabled ? disableDistributionAction : enableDistributionAction;
      await action(distribution.id);
      await queryClient.invalidateQueries({ queryKey: ['distributions'] });
    },
    onError: (error) =>
      toast.error('Не атрымалася змяніць статус distribution', {
        description: error instanceof Error ? error.message : undefined,
      }),
  });

  const isDisabling = distribution.status === 'InProgress' && !distribution.enabled;
  const isEnabling = distribution.status === 'InProgress' && distribution.enabled;

  const handleToggleStatus = () => toggleStatus();

  return (
    <div className="flex w-full flex-col gap-2 2xl:w-auto 2xl:flex-row">
      {distribution.enabled ? (
        <Button
          variant="destructive"
          size="sm"
          className="w-full 2xl:w-auto"
          onClick={handleToggleStatus}
          disabled={isToggling || isDisabling}
        >
          {isDisabling || isToggling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Выключэнне...
            </>
          ) : (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Выключыць
            </>
          )}
        </Button>
      ) : (
        <>
          <Button
            variant="default"
            size="sm"
            className="w-full 2xl:w-auto"
            onClick={handleToggleStatus}
            disabled={isToggling || isEnabling}
          >
            {isEnabling || isToggling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Уключэнне...
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Уключыць
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full 2xl:w-auto"
                disabled={isDeleting || isDisabling || isEnabling}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Выдаленне...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Выдаліць
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Выдаліць Distribution?</AlertDialogTitle>
                <AlertDialogDescription>
                  Гэта дзеянне нельга адмяніць. Гэта назаўсёды выдаліць distribution{' '}
                  <span className="font-mono">{distribution.id}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Адмена</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteDistribution()}>Выдаліць</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
