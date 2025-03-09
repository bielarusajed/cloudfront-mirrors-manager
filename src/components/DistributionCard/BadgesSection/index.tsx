import { updateDistributionCommentsAction } from '@/app/actions';
import type { DistributionSummary } from '@/types/distribution';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusIndicator } from './StatusIndicator';
import { TagsList } from './TagsList';

type BadgesSectionProps = {
  distribution: DistributionSummary;
};

type TagOperation = {
  type: 'add' | 'delete';
  tag: string;
};

function parseTags(commentsString?: string) {
  const tags = commentsString?.split(';').filter(Boolean) || [];
  return tags.map((tag) => ({ value: tag.trim() }));
}

function buildNewTags(existingTags: Array<{ value: string }>, operation: TagOperation) {
  const { type, tag } = operation;

  if (type === 'add') {
    return [...existingTags.map((t) => t.value), tag].join(';');
  }

  return existingTags
    .filter((t) => t.value !== tag)
    .map((t) => t.value)
    .join(';');
}

export function BadgesSection({ distribution }: BadgesSectionProps) {
  const { status, enabled, comments, id } = distribution;
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [pendingTag, setPendingTag] = useState<TagOperation | null>(null);
  const queryClient = useQueryClient();

  const existingTags = parseTags(comments);

  const { mutate: updateTags, isPending } = useMutation({
    mutationFn: async (operation: TagOperation) => {
      if (!id) throw new Error('Немагчыма абнавіць тэгі distribution без ID');

      const newTags = buildNewTags(existingTags, operation);
      await updateDistributionCommentsAction(id, newTags);
      await queryClient.invalidateQueries({ queryKey: ['distributions'] });
    },
    onMutate: (operation) => {
      setIsAddingTag(false);
      setPendingTag(operation);
      return operation;
    },
    onSettled: () => setPendingTag(null),
    onError: (error) => {
      toast.error('Не атрымалася абнавіць тэгі', {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const handleAddTag = (tag: string) => updateTags({ type: 'add', tag });
  const handleDeleteTag = (tag: string) => updateTags({ type: 'delete', tag });
  const handleStartAdd = () => setIsAddingTag(true);
  const handleCancelAdd = () => setIsAddingTag(false);

  return (
    <div className="flex flex-wrap items-stretch gap-1">
      <StatusIndicator enabled={enabled} status={status} />
      <TagsList
        existingTags={existingTags}
        onDeleteTag={handleDeleteTag}
        isAddingTag={isAddingTag}
        onAddTag={handleAddTag}
        onCancelAdd={handleCancelAdd}
        onStartAdd={handleStartAdd}
        isPending={isPending}
        pendingOperation={pendingTag}
      />
    </div>
  );
}
