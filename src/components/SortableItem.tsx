import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types';

interface Props {
  item: Item;
}

export const SortableItem = ({ item }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden shadow-sm hover:shadow-md"
    >
      {item.content.startsWith('http') || item.content.startsWith('blob:') ? (
        <img src={item.content} alt="" className="w-full h-full object-cover pointer-events-none" />
      ) : (
        <span className="text-sm font-medium p-1 text-center">{item.content}</span>
      )}
    </div>
  );
};
