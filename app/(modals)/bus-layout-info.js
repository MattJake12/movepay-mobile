// File: app/(modals)/bus-layout-info.js

import React from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Wifi, Monitor, Wind, Smartphone, Armchair } from 'lucide-react-native';
import styled from 'styled-components/native';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flex: 1;
  background-color: ${colors.white};
  margin-top: 10%;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  overflow: hidden;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[6]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
`;

const HeaderTitle = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.lg}px;
  color: ${colors.slate[900]};
`;

const CloseButton = styled.Pressable`
  width: 32px;
  height: 32px;
  background-color: ${colors.slate[100]};
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${spacing[6]}px;
`;

const ClassCard = styled.View`
  margin-bottom: ${spacing[8]}px;
`;

const ClassBadge = styled.View`
  position: absolute;
  top: -12px;
  left: 24px;
  background-color: ${colors.brand[600]};
  padding: 4px 12px;
  border-radius: 20px;
  z-index: 10;
`;

const ClassBadgeText = styled.Text`
  color: ${colors.white};
  font-size: 8px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
`;

const ClassBox = styled.View`
  background-color: ${props => props.vip ? colors.brand[50] : colors.slate[50]};
  padding: ${spacing[6]}px;
  border-radius: 24px;
  border-width: 1px;
  border-color: ${props => props.vip ? colors.brand[100] : colors.slate[100]};
  position: ${props => props.vip ? 'relative' : 'static'};
`;

const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  backgroundColor: ${colors.white};
  borderRadius: 12px;
  alignItems: center;
  justifyContent: center;
  marginBottom: ${spacing[3]}px;
  shadowColor: #000;
  shadowOpacity: 0.1;
  shadowRadius: 2;
  shadowOffset: 0 1;
`;

const ClassName = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.vip ? colors.brand[900] : colors.slate[900]};
  margin-bottom: ${spacing[1]}px;
`;

const ClassDescription = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${props => props.vip ? colors.brand[700] : colors.slate[500]};
  margin-bottom: ${spacing[4]}px;
  line-height: 20px;
`;

const FeaturesRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing[3]}px;
`;

const FeatureTag = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background-color: ${colors.white};
  border-width: 1px;
  border-color: ${props => props.active ? colors.brand[200] : colors.slate[200]};
`;

const FeatureLabel = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  color: ${props => props.active ? colors.brand[700] : colors.slate[600]};
`;

const Footer = styled.View`
  padding: ${spacing[6]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
  padding-bottom: 32px;
`;

const FooterButton = styled.Pressable`
  background-color: ${colors.slate[900]};
  height: 56px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const FooterButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

export default function BusLayoutInfoScreen() {
  const router = useRouter();

  return (
    <Container>
      
      {/* HEADER */}
      <Header>
        <HeaderTitle></HeaderTitle>
        <HeaderTitle>Nossas Classes</HeaderTitle>
        <CloseButton onPress={() => router.back()}>
          <X size={16} color={colors.slate[500]} />
        </CloseButton>
      </Header>

      <Content>
        
        {/* CLASSE EXECUTIVA */}
        <ClassCard>
          <ClassBox>
            <IconContainer>
              <Armchair size={24} color={colors.slate[600]} />
            </IconContainer>
            <ClassName>Executivo</ClassName>
            <ClassDescription>
              Conforto e economia para suas viagens diárias. Padrão 2x2 (Dois assentos de cada lado).
            </ClassDescription>
            
            <FeaturesRow>
              <FeatureTag>
                <Wind size={12} color={colors.slate[400]} />
                <FeatureLabel>Ar Condicionado</FeatureLabel>
              </FeatureTag>
              <FeatureTag>
                <Smartphone size={12} color={colors.slate[400]} />
                <FeatureLabel>USB</FeatureLabel>
              </FeatureTag>
            </FeaturesRow>
          </ClassBox>
        </ClassCard>

        {/* CLASSE VIP (DESTAK) */}
        <ClassCard>
          <ClassBadge>
            <ClassBadgeText>Mais Escolhido</ClassBadgeText>
          </ClassBadge>
          
          <ClassBox vip>
            <IconContainer>
              <Armchair size={24} color={colors.brand[600]} />
            </IconContainer>
            <ClassName vip>VIP Leito</ClassName>
            <ClassDescription vip>
              Experiência de primeira classe. Poltronas que reclinam 160º, menos passageiros e serviço de bordo.
            </ClassDescription>
            
            <FeaturesRow>
              <FeatureTag active>
                <Wind size={12} color={colors.brand[600]} />
                <FeatureLabel active>Climatizado</FeatureLabel>
              </FeatureTag>
              <FeatureTag active>
                <Wifi size={12} color={colors.brand[600]} />
                <FeatureLabel active>Wi-Fi 4G</FeatureLabel>
              </FeatureTag>
              <FeatureTag active>
                <Monitor size={12} color={colors.brand[600]} />
                <FeatureLabel active>Telas Individuais</FeatureLabel>
              </FeatureTag>
              <FeatureTag active>
                <Smartphone size={12} color={colors.brand[600]} />
                <FeatureLabel active>Carregador Rápido</FeatureLabel>
              </FeatureTag>
            </FeaturesRow>
          </ClassBox>
        </ClassCard>

      </Content>

      {/* FOOTER */}
      <Footer>
        <FooterButton onPress={() => router.back()}>
          <FooterButtonText>Entendi</FooterButtonText>
        </FooterButton>
      </Footer>
    </Container>
  );
}

