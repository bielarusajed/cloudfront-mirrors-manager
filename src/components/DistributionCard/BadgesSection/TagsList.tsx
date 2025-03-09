import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';

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

export function TagsList({
  existingTags,
  onDeleteTag,
  isAddingTag,
  onAddTag,
  onCancelAdd,
  onStartAdd,
  isPending,
  pendingOperation,
}: TagsListProps) {
  return (
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
}
