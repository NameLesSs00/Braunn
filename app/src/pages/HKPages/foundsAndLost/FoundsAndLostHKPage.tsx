import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchLostAndFoundItems } from '../../../features/HKfeatures/lostAndFound/lostAndFoundSlice';
import { LostFoundHeader } from './components/LostFoundHeader';
import { LostFoundStats } from './components/LostFoundStats';
import { LostFoundControls } from './components/LostFoundControls';
import { LostFoundGrid } from './components/LostFoundGrid';
import { AddLostFoundModal } from './components/modals/AddLostFoundModal';
import { ItemDetailsModal } from './components/modals/ItemDetailsModal';
import type { LostAndFoundReadDto } from '../../../models/HKmodels/LostAndFound';

export function FoundsAndLostHKPage() {
  const dispatch = useAppDispatch();
  const { items, totalCount, status } = useAppSelector(state => state.lostAndFound);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'unclaimed' | 'claimed'>('All');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostAndFoundReadDto | null>(null);

  useEffect(() => {
    // Determine the IsClaimed boolean based on the segment filter
    const isClaimedParam = filter === 'All' ? undefined : filter === 'claimed';
    
    // Fetch data whenever query or filter changes
    dispatch(fetchLostAndFoundItems({
      PageNumber: 1,
      PageSize: 50,
      Search: searchQuery || undefined,
      IsClaimed: isClaimedParam,
    }));
  }, [dispatch, searchQuery, filter]);

  const unclaimedCount = items.filter(i => !i.isClaimed).length;
  const claimedCount = items.filter(i => i.isClaimed).length;

  return (
    <div className="max-w-[1600px] mx-auto p-8 pb-12">
      <LostFoundHeader onReportClick={() => setIsAddOpen(true)} />
      
      <LostFoundStats 
        totalCount={totalCount} 
        unclaimedCount={unclaimedCount}
        claimedCount={claimedCount}
      />
      
      <LostFoundControls 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
      />
      
      {status === 'loading' ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a4bbd]"></div>
        </div>
      ) : (
        <LostFoundGrid 
          items={items}
          onItemClick={(item) => setSelectedItem(item)}
        />
      )}

      <AddLostFoundModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <ItemDetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
