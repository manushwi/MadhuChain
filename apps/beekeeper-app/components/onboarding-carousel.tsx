import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';

interface CarouselProps {
  children: React.ReactNode[];
  onIndexChange: (index: number) => void;
  initialIndex?: number;
}

export interface CarouselHandle {
  setPage: (index: number) => void;
}

export const Carousel = React.forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { children, onIndexChange, initialIndex = 0 },
  ref
) {
  const pager = useRef<PagerView>(null);

  React.useImperativeHandle(ref, () => ({
    setPage: (index) => pager.current?.setPage(index),
  }));

  const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
    onIndexChange(e.nativeEvent.position);
  };

  return (
    <PagerView
      ref={pager}
      style={styles.pager}
      initialPage={initialIndex}
      onPageSelected={onPageSelected}>
      {children.map((child, i) => (
        <View key={i} style={styles.page}>
          {child}
        </View>
      ))}
    </PagerView>
  );
});

const styles = StyleSheet.create({
  pager: { flex: 1 },
  page: { flex: 1 },
});
