import { atom } from 'jotai';

// Атам для захавання ID выбраных distributions
export const selectedDistributionsAtom = atom<Set<string>>(new Set<string>());

// Атам для пераключэння выбару distribution
export const toggleDistributionSelectionAtom = atom(null, (get, set, distributionId: string) => {
  const selected = get(selectedDistributionsAtom);
  const newSelected = new Set(selected);

  if (newSelected.has(distributionId)) {
    newSelected.delete(distributionId);
  } else {
    newSelected.add(distributionId);
  }

  set(selectedDistributionsAtom, newSelected);
});

// Атам для ачысткі выбару
export const clearSelectionAtom = atom(null, (get, set) => {
  set(selectedDistributionsAtom, new Set());
});
