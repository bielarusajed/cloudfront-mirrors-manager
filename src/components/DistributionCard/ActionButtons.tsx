import {
  deleteDistributionAction,
  disableDistributionAction,
  enableDistributionAction,
  revalidateDistributionsAction,
} from '@/app/actions';
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
import { Loader2, Power, PowerOff, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import type { MouseEvent } from 'react';
import { toast } from 'sonner';

type ActionButtonsProps = {
  distribution: DistributionSummary;
};

export function ActionButtons({ distribution }: ActionButtonsProps) {
  const [isDeleting, startDeleting] = useTransition();
  const [isToggling, startToggling] = useTransition();

  const isDisabling =
    distribution.status === 'InProgress' && !distribution.enabled;
  const isEnabling =
    distribution.status === 'InProgress' && distribution.enabled;

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    startDeleting(async () => {
      try {
        if (!distribution.id) {
          toast.error('Немагчыма выдаліць distribution без ID');
          return;
        }
        const result = await deleteDistributionAction(distribution.id);
        if (result.error) {
          toast.error(result.error, { description: `ID: ${distribution.id}` });
          return;
        }
        await revalidateDistributionsAction();
      } catch (error) {
        toast.error('Не атрымалася выдаліць distribution', {
          description: `ID: ${distribution.id}`,
        });
      }
    });
  };

  const handleToggleStatus = () => {
    startToggling(async () => {
      try {
        if (!distribution.id) {
          toast.error('Немагчыма зменіць статус distribution без ID');
          return;
        }
        const action = distribution.enabled
          ? disableDistributionAction
          : enableDistributionAction;
        const result = await action(distribution.id);
        if (result.error)
          toast.error(result.error, { description: `ID: ${distribution.id}` });
      } catch (error) {
        toast.error('Не атрымалася зменіць статус distribution', {
          description: `ID: ${distribution.id}`,
        });
      }
    });
  };

  return (
    <div className="flex gap-2">
      {distribution.enabled ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleToggleStatus}
          disabled={isToggling || isDisabling}
        >
          {isDisabling || isToggling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Выключэнне...
            </>
          ) : (
            <>
              <PowerOff className="h-4 w-4 mr-2" />
              Выключыць
            </>
          )}
        </Button>
      ) : (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isToggling || isEnabling}
          >
            {isEnabling || isToggling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Уключэнне...
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Уключыць
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting || isDisabling || isEnabling}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Выдаліць
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Выдаліць Distribution?</AlertDialogTitle>
                <AlertDialogDescription>
                  Гэта дзеянне нельга адмяніць. Гэта назаўсёды выдаліць
                  distribution{' '}
                  <span className="font-mono">{distribution.id}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Адмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Выдаленне...
                    </>
                  ) : (
                    'Выдаліць'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
