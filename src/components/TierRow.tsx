import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { Tier } from '../types';
import { SortableItem } from './SortableItem';

interface Props {
  tier: Tier;
}

export const TierRow = ({ tier }: Props) => {
  const { setNodeRef } = useDroppable({
    id: tier.id,
    data: { type: 'tier', tier },
  });

  return (
    <div className="flex w-full border-b border-gray-800 bg-gray-900 min-h-[100px]">
      {/* Tier Label */}
      <div
        className="w-24 flex-shrink-0 flex items-center justify-center text-xl font-bold text-black p-2 select-none"
        style={{ backgroundColor: tier.color }}
      >
        <span className="text-center break-words">{tier.label}</span>
      </div>

      {/* Tier Items Area */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-wrap gap-2 p-2 items-center content-start min-h-[100px]"
      >
        <SortableContext items={tier.items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
          {tier.items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
      
      {/* Settings/Controls (Optional placeholder) */}
      <div className="w-12 flex-shrink-0 bg-gray-800 flex items-center justify-center">
        {/* Could add move up/down/edit buttons here */}
      </div>
    </div>
  );
};
