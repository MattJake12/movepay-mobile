// File: app/(public)/onboarding.js

import React, { useState, useRef } from 'react';
import { 
  FlatList, 
  useWindowDimensions, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { Ticket, Utensils, QrCode, ArrowRight, Check } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// DADOS DOS SLIDES
const SLIDES = [
  {
    id: '1',
    icon: 'ticket',
    title: 'Viaje sem Filas',
    description: 'Compre bilhetes da Macon, Real e outras operadoras sem sair de casa. O seu assento garantido em segundos.'
  },
  {
    id: '2',
    icon: 'utensils',
    title: 'Bilhete + Lanche',
    description: 'Adicione combos de Fast Food à sua viagem. Retire no terminal e embarque sem fome.'
  },
  {
    id: '3',
    icon: 'qrcode',
    title: 'Embarque Digital',
    description: 'Diga adeus ao papel. Use o QR Code no seu telemóvel para validar a viagem. Simples e seguro.'
  },
];

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flex: 1;
  background-color: ${colors.slate[900]};
`;

const GradientBg = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Slide = styled.View`
  width: ${props => props.width}px;
  justify-content: center;
  align-items: center;
  padding-horizontal: ${spacing[6]}px;
  padding-vertical: ${spacing[12]}px;
`;

const SlideContent = styled.View`
  align-items: center;
`;

const IconContainer = styled.View`
  width: 120px;
  height: 120px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 60px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${spacing[8]}px;
`;

const SlideTitle = styled.Text`
  font-size: 32px;
  font-weight: ${fontWeight.extrabold};
  color: ${colors.white};
  text-align: center;
  margin-bottom: ${spacing[4]}px;
`;

const SlideDescription = styled.Text`
  font-size: ${fontSize.base}px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 24px;
  max-width: 90%;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${spacing[2]}px;
  margin-bottom: ${spacing[8]}px;
`;

const Dot = styled.View`
  width: ${props => props.active ? 32 : 8}px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.active ? colors.brand[500] : 'rgba(255, 255, 255, 0.3)'};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[8]}px;
`;

const SkipButton = styled.TouchableOpacity`
  flex: 1;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding-vertical: ${spacing[4]}px;
  align-items: center;
  justify-content: center;
`;

const SkipButtonText = styled.Text`
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  font-size: ${fontSize.base}px;
`;

const NextButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.brand[600]};
  border-radius: 12px;
  padding-vertical: ${spacing[4]}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]}px;
`;

const NextButtonText = styled.Text`
  color: ${colors.white};
  font-weight: 600;
  font-size: ${fontSize.base}px;
`;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Função para mudar o indicador de bolinhas
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Botão Pular ou Finalizar
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(public)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(public)/login');
  };

  const renderSlide = ({ item }) => {
    let IconComponent = null;
    switch (item.icon) {
      case 'ticket':
        IconComponent = () => <Ticket size={80} color={colors.brand[400]} />;
        break;
      case 'utensils':
        IconComponent = () => <Utensils size={80} color={colors.green[400]} />;
        break;
      case 'qrcode':
        IconComponent = () => <QrCode size={80} color={colors.pink[400]} />;
        break;
      default:
        IconComponent = () => null;
    }

    return (
      <Slide width={width}>
        <SlideContent>
          <IconContainer>
            <IconComponent />
          </IconContainer>
          <SlideTitle>{item.title}</SlideTitle>
          <SlideDescription>{item.description}</SlideDescription>
        </SlideContent>
      </Slide>
    );
  };

  return (
    <Container>
      <StatusBar style="light" />
      
      {/* Background Fixo */}
      <GradientBg
        colors={['#2e1065', '#1e1b4b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* SLIDER */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        scrollEnabled={true}
        contentContainerStyle={{ minWidth: '100%' }}
      />

      {/* FOOTER: Dots + Botões */}
      <DotsContainer>
        {SLIDES.map((_, index) => (
          <Dot key={index} active={index === currentIndex} />
        ))}
      </DotsContainer>

      <ButtonContainer>
        <SkipButton onPress={handleSkip}>
          <SkipButtonText>Pular</SkipButtonText>
        </SkipButton>
        <NextButton onPress={handleNext}>
          <NextButtonText>
            {currentIndex === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
          </NextButtonText>
          <ArrowRight size={18} color={colors.white} />
        </NextButton>
      </ButtonContainer>
    </Container>
  );
}