import React, { useRef } from 'react';
import { FlatList, StyleSheet, View, type ViewToken } from 'react-native';

interface CarouselProps {
  children: React.ReactNode[];
  onIndexChange: (index: number) => void;
  initialIndex?: number;
}

export interface CarouselHandle {
  setPage: (index: number) => void;
}

// Web-safe fallback: swipe-friendly horizontal pager using FlatList.
export const Carousel = React.forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { children, onIndexChange, initialIndex = 0 },
  ref
) {
  const list = useRef<FlatList<number>>(null);

  React.useImperativeHandle(ref, () => ({
    setPage: (index) => list.current?.scrollToIndex({ index, animated: true }),
  }));

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === 'number') {
        onIndexChange(first.index);
      }
    }
  ).current;

  return (
    <FlatList
      ref={list}
      data={children.map((_, i) => i)}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(i) => String(i)}
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({ length: 1, offset: index, index })}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      renderItem={({ index }) => (
        <View style={styles.page} key={index}>
          {children[index]}
        </View>
      )}
    />
  );
});

const styles = StyleSheet.create({
  page: { width: '100%' },
});
