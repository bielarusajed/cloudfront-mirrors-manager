import { updateDistributionCommentsAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DistributionSummary } from '@/types/distribution';
import { Loader2, Plus, X } from 'lucide-react';
import { useState, useTransition } from 'react';
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
      <Loader2 className="h-3 w-3 ml-1 animate-spin" />
    ) : (
      onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-3 w-3 p-0 text-muted-foreground hover:bg-transparent hover:text-destructive transition-colors"
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
        className="h-5 px-2 text-xs w-24"
        placeholder="Новы тэг..."
        autoFocus
      />
    </div>
  );
};

const AddTagButton = ({ onClick }: { onClick: () => void }) => (
  <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-muted" onClick={onClick}>
    <Plus />
  </Badge>
);

const StatusIndicator = ({ enabled, status }: { enabled: boolean; status: string }) => {
  if (status === 'InProgress') {
    return (
      <Badge variant="secondary">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
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
}: TagsListProps & {
  pendingOperation: { type: 'add' | 'delete'; tag: string } | null;
}) => (
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

type PendingOperation = {
  type: 'add' | 'delete';
  tag: string;
};

function parseTags(commentsString?: string): Tag[] {
  const tags = commentsString?.split(';').filter(Boolean) || [];
  return tags.map((tag) => ({ value: tag.trim() }));
}

export function StatusBadge({ distribution }: StatusBadgeProps) {
  const { status, enabled, comments, id } = distribution;
  const [isPending, startTransition] = useTransition();
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<PendingOperation | null>(null);

  const existingTags = parseTags(comments);

  const handleDeleteTag = (tagToDelete: string) => {
    setPendingOperation({ type: 'delete', tag: tagToDelete });
    startTransition(async () => {
      try {
        const newTags = existingTags
          .filter((tag) => tag.value !== tagToDelete)
          .map((tag) => tag.value)
          .join(';');

        const result = await updateDistributionCommentsAction(id, newTags);
        if (result.error) toast.error(result.error);
      } catch (error) {
        toast.error('Не атрымалася выдаліць тэг');
      }
      setPendingOperation(null);
    });
  };

  const handleAddTag = async (newTag: string) => {
    setIsAddingTag(false);
    setPendingOperation({ type: 'add', tag: newTag });

    startTransition(async () => {
      try {
        const newTags = [...existingTags.map((tag) => tag.value), newTag].join(';');
        const result = await updateDistributionCommentsAction(id, newTags);
        if (result.error) toast.error(result.error);
      } catch (error) {
        toast.error('Не атрымалася дадаць тэг');
      } finally {
        setPendingOperation(null);
      }
    });
  };

  return (
    <div className="flex items-stretch flex-wrap gap-1">
      <StatusIndicator enabled={enabled} status={status} />
      <TagsList
        existingTags={existingTags}
        onDeleteTag={handleDeleteTag}
        isAddingTag={isAddingTag}
        onAddTag={handleAddTag}
        onCancelAdd={() => setIsAddingTag(false)}
        onStartAdd={() => setIsAddingTag(true)}
        isPending={isPending}
        pendingOperation={pendingOperation}
      />
    </div>
  );
}
