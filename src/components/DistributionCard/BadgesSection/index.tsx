import { updateDistributionCommentsAction } from '@/app/actions';
import type { DistributionSummary } from '@/types/distribution';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusIndicator } from './StatusIndicator';
import { TagsList } from './TagsList';

type BadgesSectionProps = {
  distribution: DistributionSummary;
};

function parseTags(commentsString?: string) {
  const tags = commentsString?.split(';').filter(Boolean) || [];
  return tags.map((tag) => ({ value: tag.trim() }));
}

export function BadgesSection({ distribution }: BadgesSectionProps) {
  const { status, enabled, comments, id } = distribution;
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [pendingTag, setPendingTag] = useState<{ type: 'add' | 'delete'; tag: string } | null>(null);

  const existingTags = parseTags(comments);

  const { mutate: updateTags, isPending } = useMutation({
    mutationFn: async ({ type, tag }: { type: 'add' | 'delete'; tag: string }) => {
      if (!id) throw new Error('Немагчыма абнавіць тэгі distribution без ID');

      const newTags =
        type === 'add'
          ? [...existingTags.map((t) => t.value), tag].join(';')
          : existingTags
              .filter((t) => t.value !== tag)
              .map((t) => t.value)
              .join(';');

      await updateDistributionCommentsAction(id, newTags);
    },
    onMutate: (variables) => {
      setIsAddingTag(false);
      setPendingTag(variables);
      return variables;
    },
    onSettled: () => setPendingTag(null),
    onError: (error) => {
      toast.error('Не атрымалася абнавіць тэгі', {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  return (
    <div className="flex flex-wrap items-stretch gap-1">
      <StatusIndicator enabled={enabled} status={status} />
      <TagsList
        existingTags={existingTags}
        onDeleteTag={(tag: string) => updateTags({ type: 'delete', tag })}
        isAddingTag={isAddingTag}
        onAddTag={(tag: string) => updateTags({ type: 'add', tag })}
        onCancelAdd={() => setIsAddingTag(false)}
        onStartAdd={() => setIsAddingTag(true)}
        isPending={isPending}
        pendingOperation={pendingTag}
      />
    </div>
  );
}
