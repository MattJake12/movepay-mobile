// File: src/components/home/RecommendedFeed.jsx

import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  ShieldCheck,
  Zap
} from 'lucide-react-native';

// Imports Locais
import { useRecommendations } from '../../hooks/useRecommendations';
import { 
  colors, 
  spacing, 
  fontSize, 
  fontWeight, 
  borderRadius, 
  shadows 
} from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Ocupa 75% da largura da tela

// ==========================================
// 1. STYLED COMPONENTS (PREMIUM)
// ==========================================

const Container = styled.View`
  margin-bottom: ${spacing[2]}px;
`;

const LoadingContainer = styled.View`
  height: 200px;
  align-items: center;
  justify-content: center;
`;

// --- CARD PRINCIPAL ---
// Usamos .attrs para passar a sombra via style prop (Evita erros de unitless/crash)
const Card = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
  style: {
    ...shadows.lg, // Sombra Premium definida no theme.js
    marginRight: spacing[4]
  }
})`
  width: ${CARD_WIDTH}px;
  height: 240px;
  background-color: ${colors.white};
  border-radius: ${borderRadius.xl}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${colors.slate[100]};
`;

// --- HEADER DO CARD (IMAGEM/GRADIENTE) ---

const CardHeader = styled.View`
  height: 130px;
  position: relative;
  background-color: ${colors.slate[800]};
`;

// Gradiente sobre a imagem para garantir legibilidade do texto
const HeaderGradient = styled(LinearGradient).attrs({
  colors: ['transparent', 'rgba(15, 23, 42, 0.9)'],
  start: { x: 0, y: 0.2 },
  end: { x: 0, y: 1 },
})`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  justify-content: flex-end;
  padding: ${spacing[3]}px;
  z-index: 2;
`;

// Badge de "AI MATCH"
const MatchBadge = styled.View.attrs({
  style: shadows.sm
})`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: ${colors.white};
  padding-horizontal: 10px;
  padding-vertical: 5px;
  border-radius: ${borderRadius.full}px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  z-index: 10;
`;

const MatchText = styled.Text`
  font-size: 10px;
  font-weight: ${fontWeight.black};
  color: ${colors.brand[600]};
`;

// Rota (Origem -> Destino) sobre a imagem
const RouteOverlay = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const RouteText = styled.Text`
  color: ${colors.white};
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.bold};
  text-shadow: 0px 2px 4px rgba(0,0,0,0.5);
`;

// --- CORPO DO CARD ---

const CardBody = styled.View`
  padding: ${spacing[4]}px;
  flex: 1;
  justify-content: space-between;
`;

const TopInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const CompanyName = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.medium};
  margin-bottom: 2px;
`;

const TripTime = styled.Text`
  font-size: ${fontSize.lg}px;
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.black};
`;

const PriceTag = styled.View`
  align-items: flex-end;
`;

const PriceValue = styled.Text`
  font-size: ${fontSize.lg}px;
  color: ${colors.success[600]};
  font-weight: ${fontWeight.black};
`;

const PriceLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[400]};
  text-transform: uppercase;
  font-weight: ${fontWeight.bold};
`;

// --- FOOTER (AI REASON) ---

const AIReasonBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${colors.brand[50]};
  padding: 6px 10px;
  border-radius: ${borderRadius.md}px;
  align-self: flex-start;
  border-width: 1px;
  border-color: ${colors.brand[100]};
`;

const AIReasonText = styled.Text`
  font-size: 10px;
  color: ${colors.brand[700]};
  font-weight: ${fontWeight.bold};
  margin-left: 6px;
`;

// --- EMPTY STATE ---
const EmptyCard = styled.View`
  width: ${width - 48}px;
  padding: ${spacing[6]}px;
  background-color: ${colors.brand[50]};
  border-radius: ${borderRadius.xl}px;
  border-width: 1px;
  border-style: dashed;
  border-color: ${colors.brand[200]};
  align-items: center;
  justify-content: center;
`;

// ==========================================
// 2. COMPONENT LOGIC
// ==========================================

export function RecommendedFeed() {
  const router = useRouter();
  
  // Hook de Dados (Se não tiver backend ainda, ele usa mock interno ou array vazio)
  const { data: recommendations, isLoading } = useRecommendations();
  
  // Safeguard: Garante que é um array
  const data = recommendations || [];

  // 1. Loading State
  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="small" color={colors.brand[500]} />
          <Text style={{ marginTop: 12, fontSize: 10, color: colors.slate[400], fontWeight: 'bold', textTransform: 'uppercase' }}>
            Personalizando ofertas para si...
          </Text>
        </LoadingContainer>
      </Container>
    );
  }

  // 2. Empty State (Usuário novo sem histórico para a IA)
  if (data.length === 0) {
    return (
      <Container style={{ paddingHorizontal: spacing[6] }}>
        <EmptyCard>
          <Sparkles size={32} color={colors.brand[400]} />
          <Text style={{ marginTop: 12, fontWeight: 'bold', color: colors.brand[800], fontSize: 16 }}>
            A IA está a aprender...
          </Text>
          <Text style={{ marginTop: 6, textAlign: 'center', fontSize: 13, color: colors.brand[600], lineHeight: 20 }}>
            Realize a sua primeira viagem para receber recomendações exclusivas e personalizadas.
          </Text>
        </EmptyCard>
      </Container>
    );
  }

  // 3. Render Item
  const renderItem = ({ item, index }) => {
    // Formatações
    const price = Number(item.price || 0).toLocaleString('pt-AO');
    const time = new Date(item.departureTime || new Date()).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    const matchScore = item.aiScore || Math.floor(Math.random() * (99 - 85) + 85); // Mock score se não vier da API
    
    // Ícone dinâmico baseado no motivo da recomendação
    const getReasonIcon = () => {
      const reason = (item.aiReason || '').toLowerCase();
      if (reason.includes('rápido') || reason.includes('curta')) return <Zap size={12} color={colors.brand[600]} />;
      if (reason.includes('barato') || reason.includes('preço')) return <TrendingUp size={12} color={colors.brand[600]} />;
      if (reason.includes('seguro') || reason.includes('conforto')) return <ShieldCheck size={12} color={colors.brand[600]} />;
      return <Sparkles size={12} color={colors.brand[600]} />;
    };

    return (
      <Card 
        onPress={() => router.push(`/booking/${item.id}`)}
        style={{ marginLeft: index === 0 ? spacing[6] : 0 }} // Margem esquerda só no primeiro
      >
        {/* HEADER */}
        <CardHeader>
          {/* Fundo Abstrato (Fallback se não houver imagem) */}
          <LinearGradient
            colors={[colors.slate[700], colors.slate[800]]}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          
          {/* Imagem Real (Se existir) */}
          {item.company?.image ? (
            <Image 
              source={{ uri: item.company.image }} 
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.8 }}
              resizeMode="cover" 
            />
          ) : null}

          {/* Badge de Match */}
          <MatchBadge>
            <Sparkles size={10} color={colors.brand[600]} fill={colors.brand[600]} />
            <MatchText>{matchScore}% MATCH</MatchText>
          </MatchBadge>

          {/* Gradiente + Info Rota */}
          <HeaderGradient>
            <RouteOverlay>
              <MapPin size={16} color={colors.brand[300]} fill={colors.brand[300]} />
              <RouteText numberOfLines={1}>
                {item.origin} → {item.destination}
              </RouteText>
            </RouteOverlay>
          </HeaderGradient>
        </CardHeader>

        {/* BODY */}
        <CardBody>
          <TopInfo>
            <View>
              <CompanyName>{item.company?.name || 'Transportes'}</CompanyName>
              <TripTime>{time}</TripTime>
            </View>
            
            <PriceTag>
              <PriceLabel>A partir de</PriceLabel>
              <PriceValue>Kz {price}</PriceValue>
            </PriceTag>
          </TopInfo>

          {/* Footer Motivo IA */}
          <AIReasonBox>
            {getReasonIcon()}
            <AIReasonText numberOfLines={1}>
              {item.aiReason || 'Baseado no seu histórico'}
            </AIReasonText>
          </AIReasonBox>
        </CardBody>
      </Card>
    );
  };

  return (
    <Container>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id || Math.random())}
        renderItem={renderItem}
        contentContainerStyle={{ paddingRight: spacing[6] }} // Espaço final
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing[4]} // Efeito Snap carrossel
      />
    </Container>
  );
}