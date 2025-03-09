import { updateDistributionCommentsAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DistributionSummary } from '@/types/distribution';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Tag = {
  value: string;
};

type TagBadgeProps = {
  tag: Tag;
  onDelete?: (tag: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

const TagBadge = ({ tag, onDelete, disabled, isLoading }: TagBadgeProps) => (
  <Badge variant="outline" className={isLoading ? 'text-muted-foreground' : ''}>
    {tag.value}
    {isLoading ? (
      <Loader2 className="ml-1 h-3 w-3 animate-spin" />
    ) : (
      onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-3 w-3 p-0 text-muted-foreground transition-colors hover:bg-transparent hover:text-destructive"
          onClick={() => onDelete(tag.value)}
          disabled={disabled}
        >
          <X />
        </Button>
      )
    )}
  </Badge>
);

type AddTagInputProps = {
  onAdd: (value: string) => void;
  onCancel: () => void;
};

const AddTagInput = ({ onAdd, onCancel }: AddTagInputProps) => {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue) {
        onAdd(trimmedValue);
        setValue('');
      }
    }
    if (e.key === 'Escape') {
      onCancel();
      setValue('');
    }
  };

  return (
    <div className="flex items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-5 w-24 px-2 text-xs"
        placeholder="Новы тэг..."
        autoFocus
      />
    </div>
  );
};

const AddTagButton = ({ onClick }: { onClick: () => void }) => (
  <Badge variant="outline" className="flex cursor-pointer items-center gap-1 hover:bg-muted" onClick={onClick}>
    <Plus />
  </Badge>
);

const StatusIndicator = ({ enabled, status }: { enabled: boolean; status: string }) => {
  if (status === 'InProgress') {
    return (
      <Badge variant="secondary">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        {enabled ? 'Уключэнне...' : 'Выключэнне...'}
      </Badge>
    );
  }

  if (!enabled) {
    return <Badge variant="destructive">Выключаны</Badge>;
  }

  return <Badge variant="default">Уключаны</Badge>;
};

type TagsListProps = {
  existingTags: Tag[];
  onDeleteTag: (tag: string) => void;
  isAddingTag: boolean;
  onAddTag: (value: string) => void;
  onCancelAdd: () => void;
  onStartAdd: () => void;
  isPending: boolean;
  pendingOperation: { type: 'add' | 'delete'; tag: string } | null;
};

const TagsList = ({
  existingTags,
  onDeleteTag,
  isAddingTag,
  onAddTag,
  onCancelAdd,
  onStartAdd,
  isPending,
  pendingOperation,
}: TagsListProps) => (
  <>
    {existingTags.map((tag) => (
      <TagBadge
        key={tag.value}
        tag={tag}
        onDelete={onDeleteTag}
        disabled={isPending}
        isLoading={pendingOperation?.type === 'delete' && pendingOperation.tag === tag.value}
      />
    ))}
    {isAddingTag ? (
      <AddTagInput onAdd={onAddTag} onCancel={onCancelAdd} />
    ) : pendingOperation?.type === 'add' ? (
      <TagBadge tag={{ value: pendingOperation.tag }} isLoading={true} />
    ) : (
      <AddTagButton onClick={onStartAdd} />
    )}
  </>
);

type StatusBadgeProps = {
  distribution: DistributionSummary;
};

function parseTags(commentsString?: string): Tag[] {
  const tags = commentsString?.split(';').filter(Boolean) || [];
  return tags.map((tag) => ({ value: tag.trim() }));
}

export function StatusBadge({ distribution }: StatusBadgeProps) {
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
