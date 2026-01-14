// File: app/(tabs)/profile.js

import React, { useState } from 'react';
import { 
  ScrollView, 
  Switch, 
  Alert, 
  TouchableOpacity, 
  View, 
  Text, 
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  ChevronRight,
  CreditCard,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  User,
  Settings,
  Utensils,
  Wallet,
  Trash2,
  Globe
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { useUserStore } from '../../src/store/useUserStore';
import * as sessionManager from '../../src/services/sessionManager';
import { colors, spacing, fontSize, fontWeight, shadows, borderRadius } from '../../src/theme/theme';

// ============================================================================
// 1. STYLED COMPONENTS (PREMIUM UI)
// ============================================================================

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

// --- HEADER ---
const Header = styled.View`
  padding: ${spacing[6]}px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[100]};
  margin-bottom: ${spacing[6]}px;
`;

const ProfileRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing[4]}px;
`;

const Avatar = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${colors.brand[600]};
  align-items: center;
  justify-content: center;
  ${shadows.sm}
`;

const AvatarText = styled.Text`
  font-size: 24px;
  font-weight: ${fontWeight.bold};
  color: ${colors.white};
`;

const UserInfo = styled.View`
  flex: 1;
`;

const UserName = styled.Text`
  font-size: ${fontSize.xl}px;
  font-weight: ${fontWeight.bold};
  color: ${colors.slate[900]};
  margin-bottom: 4px;
`;

const UserRoleBadge = styled.View`
  background-color: ${colors.brand[50]};
  padding-horizontal: 8px;
  padding-vertical: 2px;
  border-radius: 6px;
  align-self: flex-start;
  border-width: 1px;
  border-color: ${colors.brand[100]};
`;

const RoleText = styled.Text`
  color: ${colors.brand[700]};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
`;

// --- MENU SECTIONS ---
const SectionTitle = styled.Text`
  margin-left: ${spacing[6]}px;
  margin-bottom: ${spacing[2]}px;
  margin-top: ${spacing[6]}px; /* Espaço entre seções */
  font-size: ${fontSize.xs}px;
  color: ${colors.slate[500]};
  font-weight: ${fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MenuGroup = styled.View`
  background-color: ${colors.white};
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${colors.slate[200]};
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${spacing[4]}px;
  background-color: ${colors.white};
`;

const Separator = styled.View`
  height: 1px;
  background-color: ${colors.slate[100]};
  margin-left: 64px; /* Indentação para alinhar com texto */
`;

const IconContainer = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.color || colors.slate[100]};
  align-items: center;
  justify-content: center;
  margin-right: ${spacing[4]}px;
`;

const MenuText = styled.Text`
  flex: 1;
  font-size: ${fontSize.base}px;
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.medium};
`;

const MenuDetail = styled.Text`
  font-size: ${fontSize.sm}px;
  color: ${colors.slate[400]};
  margin-right: ${spacing[2]}px;
`;

const LogoutButton = styled.TouchableOpacity`
  margin-top: ${spacing[8]}px;
  margin-bottom: ${spacing[12]}px;
  margin-horizontal: ${spacing[6]}px;
  align-items: center;
  justify-content: center;
  padding: ${spacing[4]}px;
  background-color: ${colors.red[50]};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${colors.red[100]};
`;

const LogoutText = styled.Text`
  color: ${colors.red[600]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.base}px;
`;

const VersionText = styled.Text`
  text-align: center;
  color: ${colors.slate[400]};
  font-size: ${fontSize.xs}px;
  margin-bottom: ${spacing[8]}px;
`;

// ============================================================================
// 2. COMPONENT LOGIC
// ============================================================================

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  
  // Estados para Toggles (Configurações)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🚪 Handler de Logout
  const handleLogout = async () => {
    Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            if (typeof logout === 'function') {
              await logout();
              router.replace('/(public)/login');
            }
          } catch (error) {
            console.error('Erro ao sair:', error);
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          } finally {
            setIsLoggingOut(false);
          }
        }
      }
    ]);
  };

  // 🧹 Handler de Limpeza de Cache
  const handleClearCache = async () => {
    Alert.alert(
      'Limpar Cache', 
      'Isso pode resolver problemas de carregamento, mas terá de recarregar os dados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar', 
          onPress: async () => {
            await sessionManager.clearCache();
            Alert.alert('Sucesso', 'Cache limpo com sucesso.');
          }
        }
      ]
    );
  };

  // 🚨 Estado de Erro / Loading Inicial
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.slate[50] }}>
        <Text style={{ color: colors.slate[600], fontSize: 16 }}>Usuário não carregado.</Text>
        <TouchableOpacity onPress={() => router.replace('/(public)/login')}>
          <Text style={{ color: colors.brand[600], fontSize: 14, marginTop: 12, fontWeight: 'bold' }}>
            Fazer Login Novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Label amigável para a role
  const getRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrador';
      case 'OPERATOR_STAFF': return 'Operador';
      case 'RESTAURANT_MANAGER': return 'Gerente Restaurante';
      case 'DRIVER': return 'Motorista';
      default: return 'Cliente'; // CUSTOMER
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* === HEADER PERFIL === */}
        <Header>
          <ProfileRow>
            <Avatar>
              <AvatarText>{user?.name?.charAt(0) || '?'}</AvatarText>
            </Avatar>
            <UserInfo>
              <UserName>{user?.name || 'Utilizador'}</UserName>
              <UserRoleBadge>
                <RoleText>{getRoleLabel(user?.role)}</RoleText>
              </UserRoleBadge>
            </UserInfo>
          </ProfileRow>
        </Header>

        {/* === SECÇÃO: CONTA === */}
        <SectionTitle>Conta</SectionTitle>
        <MenuGroup>
          <MenuItem onPress={() => Alert.alert('Em breve', 'Edição de perfil será lançada na próxima versão.')}>
            <IconContainer color={colors.blue[50]}>
              <User size={20} color={colors.blue[600]} />
            </IconContainer>
            <MenuText>Dados Pessoais</MenuText>
            <MenuDetail>Editar</MenuDetail>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>
          
          <Separator />
          
          <MenuItem onPress={() => router.push('/wallet')}>
            <IconContainer color={colors.purple[50]}>
              <Wallet size={20} color={colors.purple[600]} />
            </IconContainer>
            <MenuText>Carteira & Pontos</MenuText>
            <MenuDetail>Ver Saldo</MenuDetail>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>

          <Separator />

          <MenuItem onPress={() => router.push('/food-orders')}>
            <IconContainer color={colors.orange[50]}>
              <Utensils size={20} color={colors.orange[600]} />
            </IconContainer>
            <MenuText>Meus Pedidos de Comida</MenuText>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>
        </MenuGroup>

        {/* === SECÇÃO: CONFIGURAÇÕES === */}
        <SectionTitle>Preferências</SectionTitle>
        <MenuGroup>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white }}>
            <IconContainer color={colors.amber[50]}>
              <Bell size={20} color={colors.amber[600]} />
            </IconContainer>
            <MenuText>Notificações</MenuText>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.slate[200], true: colors.brand[500] }}
            />
          </View>
          
          <Separator />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white }}>
            <IconContainer color={colors.emerald[50]}>
              <ShieldCheck size={20} color={colors.emerald[600]} />
            </IconContainer>
            <MenuText>Face ID / Biometria</MenuText>
            <Switch 
              value={biometricEnabled} 
              onValueChange={setBiometricEnabled}
              trackColor={{ false: colors.slate[200], true: colors.brand[500] }}
            />
          </View>

          <Separator />

          <MenuItem onPress={() => Alert.alert('Idioma', 'Português (AO) é o idioma padrão.')}>
            <IconContainer color={colors.cyan[50]}>
              <Globe size={20} color={colors.cyan[600]} />
            </IconContainer>
            <MenuText>Idioma</MenuText>
            <MenuDetail>Português</MenuDetail>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>
        </MenuGroup>

        {/* === SECÇÃO: SUPORTE & LEGAL === */}
        <SectionTitle>Suporte</SectionTitle>
        <MenuGroup>
          <MenuItem onPress={() => router.push('/support/chat')}>
            <IconContainer color={colors.indigo[50]}>
              <HelpCircle size={20} color={colors.indigo[600]} />
            </IconContainer>
            <MenuText>Central de Ajuda</MenuText>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>
          
          <Separator />
          
          <MenuItem onPress={() => Alert.alert('Legal', 'Termos de uso e privacidade abrem no navegador.')}>
            <IconContainer color={colors.slate[100]}>
              <FileText size={20} color={colors.slate[600]} />
            </IconContainer>
            <MenuText>Termos e Privacidade</MenuText>
            <ChevronRight size={20} color={colors.slate[300]} />
          </MenuItem>
        </MenuGroup>

        {/* === SECÇÃO: AVANÇADO (CACHE) === */}
        <SectionTitle>Sistema</SectionTitle>
        <MenuGroup>
          <MenuItem onPress={handleClearCache}>
            <IconContainer color={colors.slate[100]}>
              <Settings size={20} color={colors.slate[600]} />
            </IconContainer>
            <MenuText>Limpar Cache da App</MenuText>
            <Trash2 size={16} color={colors.slate[400]} />
          </MenuItem>
        </MenuGroup>

        {/* === LOGOUT === */}
        <LogoutButton onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color={colors.red[600]} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LogOut size={20} color={colors.red[600]} />
              <LogoutText>Sair da Conta</LogoutText>
            </View>
          )}
        </LogoutButton>

        <VersionText>MovePay App v1.0.2 (Build 2026)</VersionText>

      </ScrollView>
    </Container>
  );
}