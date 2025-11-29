import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Tier, Item } from './types';
import { TierRow } from './components/TierRow';
import { ItemPool } from './components/ItemPool';
import { SortableItem } from './components/SortableItem';

const initialTiers: Tier[] = [
  { id: 'tier-s', label: '夯', color: '#ff7f7f', items: [] },
  { id: 'tier-a', label: '顶级', color: '#ffbf7f', items: [] },
  { id: 'tier-b', label: '人上人', color: '#ffdf7f', items: [] },
  { id: 'tier-c', label: 'NPC', color: '#ffff7f', items: [] },
  { id: 'tier-d', label: '拉完了', color: '#bfff7f', items: [] },
];

const initialPool: Item[] = [];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

function App() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [poolItems, setPoolItems] = useState<Item[]>(initialPool);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newItems: Item[] = Array.from(files).map((file) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        content: URL.createObjectURL(file),
      }));
      setPoolItems((prev) => [...prev, ...newItems]);
    }
  };

  const findContainer = (id: string): string | undefined => {
    if (poolItems.find((i) => i.id === id)) return 'pool';
    const tier = tiers.find((t) => t.items.find((i) => i.id === id));
    if (tier) return tier.id;
    if (id === 'pool') return 'pool';
    if (tiers.find((t) => t.id === id)) return id;
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    const item = poolItems.find((i) => i.id === id) || 
                 tiers.flatMap((t) => t.items).find((i) => i.id === id);
    setActiveItem(item || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (overId == null || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const getItems = (containerId: string) => {
      if (containerId === 'pool') return poolItems;
      return tiers.find(t => t.id === containerId)?.items || [];
    };

    const overItems = getItems(overContainer);
    const overIndex = overItems.findIndex(i => i.id === overId);
    
    let newIndex;
    if (overId === overContainer) {
      newIndex = overItems.length + 1;
    } else {
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    if (activeContainer === 'pool') {
      setPoolItems(prev => prev.filter(i => i.id !== active.id));
      setTiers(prev => prev.map(t => {
        if (t.id === overContainer) {
          if (t.items.find(i => i.id === active.id)) return t;
          const item = active.data.current?.item as Item;
          if (!item) return t;
          
          const newItems = [...t.items];
          const insertIndex = Math.min(newIndex, newItems.length);
          newItems.splice(insertIndex, 0, item);
          return { ...t, items: newItems };
        }
        return t;
      }));
    } else if (overContainer === 'pool') {
      setTiers(prev => prev.map(t => {
        if (t.id === activeContainer) {
          return { ...t, items: t.items.filter(i => i.id !== active.id) };
        }
        return t;
      }));
      setPoolItems(prev => {
        if (prev.find(i => i.id === active.id)) return prev;
        const item = active.data.current?.item as Item;
        if (!item) return prev;
        
        const newItems = [...prev];
        const insertIndex = Math.min(newIndex, newItems.length);
        newItems.splice(insertIndex, 0, item);
        return newItems;
      });
    } else {
      setTiers(prev => {
        const activeTier = prev.find(t => t.id === activeContainer);
        if (!activeTier) return prev;
        const item = activeTier.items.find(i => i.id === active.id);
        if (!item) return prev;
        
        const overTier = prev.find(t => t.id === overContainer);
        if (overTier?.items.find(i => i.id === active.id)) return prev;

        return prev.map(t => {
          if (t.id === activeContainer) {
            return { ...t, items: t.items.filter(i => i.id !== active.id) };
          }
          if (t.id === overContainer) {
            const newItems = [...t.items];
            const insertIndex = Math.min(newIndex, newItems.length);
            newItems.splice(insertIndex, 0, item);
            return { ...t, items: newItems };
          }
          return t;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = over ? findContainer(over.id as string) : null;

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      setActiveItem(null);
      return;
    }

    const activeIndex = (activeContainer === 'pool' ? poolItems : tiers.find(t => t.id === activeContainer)!.items)
      .findIndex((i) => i.id === active.id);
    const overIndex = (overContainer === 'pool' ? poolItems : tiers.find(t => t.id === overContainer)!.items)
      .findIndex((i) => i.id === over!.id);

    if (activeIndex !== overIndex) {
      if (activeContainer === 'pool') {
        setPoolItems((items) => arrayMove(items, activeIndex, overIndex));
      } else {
        setTiers((prev) =>
          prev.map((tier) => {
            if (tier.id === activeContainer) {
              return {
                ...tier,
                items: arrayMove(tier.items, activeIndex, overIndex),
              };
            }
            return tier;
          })
        );
      }
    }

    setActiveItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">从夯到拉</h1>
        
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-1 bg-black border-2 border-gray-700">
            {tiers.map((tier) => (
              <TierRow key={tier.id} tier={tier} />
            ))}
          </div>

          <ItemPool id="pool" items={poolItems} onUpload={handleFileUpload} />

          <DragOverlay dropAnimation={dropAnimation}>
            {activeItem ? <SortableItem item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default App;
