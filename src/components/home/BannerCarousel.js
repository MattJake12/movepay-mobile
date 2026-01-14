/**
 * 🎨 BannerCarousel
 * ✅ MISSÃO 4: Carrossel automático de banners de marketing
 * 
 * Features:
 * - Auto-scroll a cada 5 segundos
 * - Snap to item (paging)
 * - Paginação visual com dots
 * - Clique navega para detalhe (se targetRoute definida)
 * - Skeleton loader enquanto carrega
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useBanners } from '../../hooks/useMarketing';
import { colors, spacing, borderRadius, shadows } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Card width: tela inteira - padding lateral (24px cada lado = 48px total)
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 160;

// ===== STYLED COMPONENTS =====

const Container = styled.View`
  margin-top: -80px; /* Puxa para cima para sobrepor o Header (Estilo Nubank/Uber) */
  margin-bottom: ${spacing[6]}px;
`;

const BannerCard = styled.View.attrs({
  style: shadows.md
})`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border-radius: ${borderRadius.xl}px;
  margin-left: ${spacing[6]}px;
  margin-right: 8px;
  overflow: hidden;
  background-color: ${colors.slate[200]};
`;

const BannerImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const TextOverlay = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(0,0,0,0.8)'],
  start: { x: 0, y: 0.4 },
  end: { x: 0, y: 1 }
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  justify-content: flex-end;
  padding: ${spacing[4]}px;
`;

const Title = styled.Text`
  color: ${colors.white};
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.Text`
  color: ${colors.blue[100]};
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${spacing[3]}px;
  gap: 6px;
`;

const Dot = styled.View`
  width: ${props => props.active ? '20px' : '6px'};
  height: 6px;
  border-radius: 3px;
  background-color: ${props => props.active ? colors.brand[600] : colors.slate[300]};
`;

const SkeletonLoader = styled.View`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  margin-left: ${spacing[6]}px;
  border-radius: ${borderRadius.xl}px;
  background-color: ${colors.slate[200]};
`;

// ===== COMPONENT =====

export function BannerCarousel() {
  const router = useRouter();
  const { data: banners, isLoading } = useBanners();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-scroll a cada 5 segundos
  useEffect(() => {
    if (!banners || banners.length < 2) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5
        });
      }
      
      setActiveIndex(nextIndex);
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [activeIndex, banners]);

  // Handler: clique no banner
  const handlePress = (banner) => {
    if (banner.targetRoute) {
      router.push({
        pathname: banner.targetRoute,
        params: banner
      });
    }
  };

  // Handler: scroll end (tracking de qual banner está visível)
  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // Loading state
  if (isLoading) {
    return (
      <Container>
        <SkeletonLoader />
      </Container>
    );
  }

  // Empty state
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <Container>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 8}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 24 }}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback onPress={() => handlePress(item)}>
            <BannerCard>
              <BannerImage
                source={{ uri: item.imageUrl }}
                resizeMode="cover"
              />
              {item.title && (
                <TextOverlay>
                  <Title>{item.title}</Title>
                  {item.subtitle && <Subtitle>{item.subtitle}</Subtitle>}
                </TextOverlay>
              )}
            </BannerCard>
          </TouchableWithoutFeedback>
        )}
      />

      {/* Pagination Dots */}
      <PaginationContainer>
        {banners.map((_, idx) => (
          <Dot key={idx} active={idx === activeIndex} />
        ))}
      </PaginationContainer>
    </Container>
  );
}

export default BannerCarousel;
