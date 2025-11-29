import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Item } from '../types';
import { SortableItem } from './SortableItem';
import type { ChangeEvent } from 'react';

interface Props {
  items: Item[];
  id: string;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ItemPool = ({ items, id, onUpload }: Props) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: 'pool' },
  });

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg min-h-[200px]">
      <div className="mb-4">
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <span>上传图片</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-wrap gap-2 min-h-[150px]"
      >
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
