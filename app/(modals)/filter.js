// File: app/(modals)/filter.js

import React, { useState } from 'react';
import { ScrollView, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { X, Check, Star } from 'lucide-react-native';
import { useCompaniesQuery } from '../../src/hooks/useCompanies';
import { useFilterStore } from '../../src/store/useFilterStore';
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

const ClearButton = styled.Text`
  color: ${colors.brand[600]};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.sm}px;
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${spacing[6]}px;
`;

const SectionTitle = styled.Text`
  color: ${colors.slate[400]};
  font-size: 12px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing[4]}px;
  margin-left: ${spacing[1]}px;
`;
const PriceRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[4]}px;
`;

const PriceInputContainer = styled.View`
  flex: 1;
`;

const InputLabel = styled.Text`
  font-size: 10px;
  color: ${colors.slate[500]};
  margin-bottom: 4px;
  font-weight: ${fontWeight.medium};
`;

const PriceInput = styled.TextInput`
  border-width: 1.5px;
  border-color: ${colors.slate[100]};
  border-radius: 12px;
  padding: ${spacing[3]}px;
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[900]};
  background-color: ${colors.slate[50]};
`;

const PriceSeparator = styled.View`
  height: 1px;
  width: 10px;
  background-color: ${colors.slate[300]};
  margin-top: 20px;
`;
const FilterRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[8]}px;
`;

const FilterChip = styled.Pressable`
  padding-horizontal: ${spacing[4]}px;
  padding-vertical: ${spacing[3]}px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${props => props.selected ? colors.brand[600] : colors.slate[200]};
  background-color: ${props => props.selected ? `${colors.brand[500]}15` : colors.white};
`;

const ChipText = styled.Text`
  color: ${props => props.selected ? colors.brand[700] : colors.slate[600]};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.sm}px;
`;

const ClassToggle = styled.View`
  flex-direction: row;
  background-color: ${colors.slate[100]};
  padding: 4px;
  border-radius: 12px;
  margin-bottom: ${spacing[8]}px;
`;

const ClassButton = styled.Pressable`
  flex: 1;
  paddingVertical: ${spacing[3]}px;
  borderRadius: 8px;
  alignItems: center;
  backgroundColor: ${props => props.selected ? colors.white : 'transparent'};
  shadowColor: ${props => props.selected ? '#000' : 'transparent'};
  shadowOpacity: ${props => props.selected ? 0.05 : 0};
  shadowRadius: 2;
`;

const ClassButtonText = styled.Text`
  font-weight: ${fontWeight.bold};
  font-size: 12px;
  color: ${props => props.selected ? colors.brand[600] : colors.slate[500]};
`;

const CompanyItem = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[3]}px;
  padding: ${spacing[4]}px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props => props.selected ? colors.brand[600] : colors.slate[200]};
  background-color: ${props => props.selected ? `${colors.brand[600]}15` : colors.slate[50]};
  margin-bottom: ${spacing[3]}px;
`;

const CompanyLogo = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${colors.white};
`;

const CompanyInfo = styled.View`
  flex: 1;
`;

const CompanyName = styled.Text`
  color: ${colors.slate[700]};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.sm}px;
`;

const CompanyRating = styled.Text`
  color: ${colors.slate[500]};
  font-size: 12px;
  margin-top: 4px;
`;

const SelectCheckbox = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.selected ? colors.brand[600] : colors.white};
  border-width: 1px;
  border-color: ${props => props.selected ? colors.brand[600] : colors.slate[300]};
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  color: ${colors.slate[400]};
  text-align: center;
  padding-vertical: ${spacing[4]}px;
  font-size: ${fontSize.sm}px;
`;

const Footer = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
  padding: ${spacing[6]}px;
  border-top-width: 1px;
  border-top-color: ${colors.slate[100]};
`;

const FooterButton = styled.Pressable`
  flex: 1;
  padding-vertical: ${spacing[3]}px;
  border-radius: 12px;
  align-items: center;
  background-color: ${props => props.primary ? colors.brand[600] : colors.slate[100]};
`;

const FooterButtonText = styled.Text`
  color: ${props => props.primary ? colors.white : colors.slate[700]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

export default function FilterScreen() {
  const router = useRouter();
  const currentFilters = useFilterStore();
  const setGlobalFilters = useFilterStore(state => state.setFilters);

  // Estado Local dos Filtros
  const [timeOfDay, setTimeOfDay] = useState(currentFilters.timeOfDay);
  const [busClass, setBusClass] = useState(currentFilters.busClass);
  const [companies, setCompanies] = useState(currentFilters.companies);
  
  // ✅ SOLUÇÃO REQ 12 & 13: Novos filtros
  const [minRating, setMinRating] = useState(currentFilters.minRating);
  const [maxDuration, setMaxDuration] = useState(currentFilters.maxDuration); // null = sem limite
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice > 0 ? currentFilters.minPrice.toString() : '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice < 1000000 ? currentFilters.maxPrice.toString() : '');

  // Buscar operadoras reais da API
  const { data: allCompanies, isLoading } = useCompaniesQuery();

  const toggleTime = (time) => {
    if (timeOfDay.includes(time)) {
      setTimeOfDay(timeOfDay.filter((t) => t !== time));
    } else {
      setTimeOfDay([...timeOfDay, time]);
    }
  };

  const toggleCompany = (compId) => {
    if (companies.includes(compId)) {
      setCompanies(companies.filter((c) => c !== compId));
    } else {
      setCompanies([...companies, compId]);
    }
  };

  const handleApply = () => {
    setGlobalFilters({
      timeOfDay,
      busClass,
      companies,
      minRating,
      maxDuration,
      minPrice: minPrice ? parseInt(minPrice) : 0,
      maxPrice: maxPrice ? parseInt(maxPrice) : 1000000
    });
    router.back();
  };

  return (
    <Container>
      {/* HEADER */}
      <Header>
        <FilterChip onPress={() => router.back()} style={{ flex: 0 }}>
          <X size={24} color={colors.slate[500]} />
        </FilterChip>
        <HeaderTitle>Filtros</HeaderTitle>
        <FilterChip
          onPress={() => {
            setTimeOfDay([]);
            setBusClass('ALL');
            setCompanies([]);
            setMinRating(0);
            setMaxDuration(null);
            setMinPrice('');
            setMaxPrice('');
          }}
          style={{ flex: 0, borderWidth: 0, backgroundColor: 'transparent' }}
        >
          <ClearButton>Limpar</ClearButton>
        </FilterChip>
      </Header>

      <Content contentContainerStyle={{ paddingBottom: spacing[8] }}>
        {/* FILTRO 1: HORÁRIO */}
        <SectionTitle>Horário de Partida</SectionTitle>
        <FilterRow>
          <FilterChip
            selected={timeOfDay.includes('morning')}
            onPress={() => toggleTime('morning')}
          >
            <ChipText selected={timeOfDay.includes('morning')}>Manhã (06h - 12h)</ChipText>
          </FilterChip>
          <FilterChip
            selected={timeOfDay.includes('afternoon')}
            onPress={() => toggleTime('afternoon')}
          >
            <ChipText selected={timeOfDay.includes('afternoon')}>Tarde (12h - 18h)</ChipText>
          </FilterChip>
          <FilterChip
            selected={timeOfDay.includes('night')}
            onPress={() => toggleTime('night')}
          >
            <ChipText selected={timeOfDay.includes('night')}>Noite (18h - 00h)</ChipText>
          </FilterChip>
        </FilterRow>

        {/* FILTRO 2: CLASSE */}
        <SectionTitle>Classe do Autocarro</SectionTitle>
        <ClassToggle>
          {['ALL', 'EXECUTIVE', 'VIP'].map((type) => (
            <ClassButton
              key={type}
              selected={busClass === type}
              onPress={() => setBusClass(type)}
            >
              <ClassButtonText selected={busClass === type}>
                {type === 'ALL' ? 'Todos' : type}
              </ClassButtonText>
            </ClassButton>
          ))}
        </ClassToggle>

        {/* ✅ FILTRO DE PREÇO */}
        <SectionTitle>Faixa de Preço (Kz)</SectionTitle>
        <PriceRow>
          <PriceInputContainer>
            <InputLabel>Mínimo</InputLabel>
            <PriceInput
              placeholder="0"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
              placeholderTextColor={colors.slate[400]}
            />
          </PriceInputContainer>
          
          <PriceSeparator />

          <PriceInputContainer>
            <InputLabel>Máximo</InputLabel>
            <PriceInput
              placeholder="1.000.000"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
              placeholderTextColor={colors.slate[400]}
            />
          </PriceInputContainer>
        </PriceRow>

        {/* ✅ SOLUÇÃO REQ 12: Filtro por Duração */}
        <SectionTitle>Duração Máxima</SectionTitle>
        <FilterRow>
          {[4, 6, 8, 12].map((hours) => (
            <FilterChip
              key={hours}
              selected={maxDuration === hours}
              onPress={() => setMaxDuration(maxDuration === hours ? null : hours)}
            >
              <ChipText selected={maxDuration === hours}>Até {hours}h</ChipText>
            </FilterChip>
          ))}
        </FilterRow>

        {/* ✅ SOLUÇÃO REQ 13: Filtro por Avaliação */}
        <SectionTitle>Avaliação da Operadora</SectionTitle>
        <FilterRow>
          {[3, 4, 5].map((star) => (
            <FilterChip
              key={star}
              selected={minRating === star}
              onPress={() => setMinRating(minRating === star ? 0 : star)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Star size={14} color={minRating === star ? colors.brand[700] : colors.slate[400]} fill={minRating === star ? colors.brand[700] : 'transparent'} />
              <ChipText selected={minRating === star}>{star}+ Estrelas</ChipText>
            </FilterChip>
          ))}
        </FilterRow>

        {/* FILTRO 3: OPERADORAS */}
        <SectionTitle>Operadoras</SectionTitle>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.brand[600]} style={{ marginVertical: spacing[6] }} />
        ) : allCompanies && allCompanies.length > 0 ? (
          allCompanies.map((comp) => (
            <CompanyItem
              key={comp.id}
              selected={companies.includes(comp.id)}
              onPress={() => toggleCompany(comp.id)}
            >
              <CompanyLogo source={{ uri: comp.logoUrl || 'https://via.placeholder.com/40' }} />
              <CompanyInfo>
                <CompanyName>{comp.name}</CompanyName>
                <CompanyRating>⭐ {comp.rating?.toFixed(1) || 'N/A'} • {comp.tripCount || 0} viagens</CompanyRating>
              </CompanyInfo>
              <SelectCheckbox selected={companies.includes(comp.id)}>
                {companies.includes(comp.id) && <Check size={12} color={colors.white} />}
              </SelectCheckbox>
            </CompanyItem>
          ))
        ) : (
          <EmptyText>Nenhuma operadora disponível</EmptyText>
        )}
      </Content>

      {/* FOOTER */}
      <Footer>
        <FooterButton onPress={() => router.back()}>
          <FooterButtonText>Cancelar</FooterButtonText>
        </FooterButton>
        <FooterButton primary onPress={handleApply}>
          <FooterButtonText primary>Aplicar Filtros</FooterButtonText>
        </FooterButton>
      </Footer>
    </Container>
  );
}
