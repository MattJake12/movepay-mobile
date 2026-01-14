// File: app/support/chat.js

/**
 * 💬 SupportChatScreen - Mobile Support Chat com Contexto
 * 
 * Características:
 * - Socket.io real-time messaging
 * - Context card com info do ticket (se contextual thread)
 * - Bubble style Messenger
 * - Typing indicators
 * - Read receipts
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useChatStore } from '../../src/store/useChatStore';
import api from '../../src/services/api';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

const { height } = Dimensions.get('window');

// ===== STYLED COMPONENTS =====
const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.slate[50]};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 12px;
  font-size: ${fontSize.base}px;
  color: ${colors.slate[600]};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 12px;
  padding-vertical: 12px;
  background-color: ${colors.white};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[200]};
`;

const BackButton = styled.Pressable`
  padding: 8px;
`;

const HeaderContent = styled.View`
  flex: 1;
  margin-left: 8px;
`;

const HeaderTitle = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[900]};
`;

const HeaderSubtitle = styled.Text`
  font-size: 12px;
  color: ${colors.slate[600]};
  margin-top: 2px;
`;

const HeaderAction = styled.Pressable`
  padding: 8px;
`;

const ContextCard = styled.View`
  background-color: ${colors.brand[50]};
  border-left-width: 4px;
  border-left-color: ${colors.brand[600]};
  padding: 12px;
  margin-horizontal: 12px;
  margin-top: 8px;
  border-radius: 8px;
`;

const ContextHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const ContextTitle = styled.Text`
  margin-left: 8px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.brand[600]};
  font-size: 14px;
`;

const ContextContent = styled(ScrollView)`
  flex-direction: row;
`;

const ContextSection = styled.View`
  margin-right: 16px;
  min-width: 120px;
`;

const ContextLabel = styled.Text`
  font-size: 11px;
  color: ${colors.slate[600]};
  font-weight: ${fontWeight.semibold};
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const ContextValue = styled.Text`
  font-size: 13px;
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.medium};
  margin-bottom: 8px;
`;

const ActionButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 8px;
  padding-vertical: 6px;
  background-color: ${colors.white};
  border-radius: 6px;
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${colors.slate[300]};
`;

const ActionButtonText = styled.Text`
  font-size: 12px;
  color: ${colors.slate[700]};
  margin-left: 4px;
  font-weight: ${fontWeight.medium};
`;

const MessagesList = styled.View`
  padding-horizontal: 12px;
  padding-vertical: 8px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-vertical: 40px;
`;

const EmptyText = styled.Text`
  font-size: ${fontSize.base}px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[400]};
  margin-top: 12px;
`;

const EmptySubtext = styled.Text`
  font-size: 13px;
  color: ${colors.slate[300]};
  margin-top: 4px;
`;

const MessageContainer = styled.View`
  margin-vertical: 4px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const AgentAvatar = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${colors.brand[600]};
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

const MessageBubble = styled.View`
  max-width: 75%;
  padding-horizontal: 12px;
  padding-vertical: 8px;
  border-radius: 12px;
  background-color: ${props => 
    props.isUser ? colors.brand[600] : 
    props.isSystem ? colors.yellow[100] : 
    colors.white};
  border-width: ${props => props.isAgent ? 1 : 0}px;
  border-color: ${colors.slate[200]};
  border-bottom-left-radius: ${props => props.isAgent ? 4 : 12}px;
  border-bottom-right-radius: ${props => props.isUser ? 4 : 12}px;
`;

const SenderName = styled.Text`
  font-size: 12px;
  font-weight: ${fontWeight.semibold};
  color: ${colors.slate[600]};
  margin-bottom: 2px;
`;

const MessageText = styled.Text`
  font-size: 15px;
  line-height: 20px;
  color: ${props => 
    props.isUser ? colors.white :
    props.isSystem ? colors.yellow[800] :
    colors.slate[900]};
`;

const MessageFooter = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  justify-content: flex-end;
`;

const Timestamp = styled.Text`
  font-size: 11px;
  color: ${props => 
    props.isUser ? 'rgba(255, 255, 255, 0.7)' :
    colors.slate[500]};
`;

const TypingIndicator = styled.View`
  padding-horizontal: 12px;
  padding-vertical: 8px;
  flex-direction: row;
  align-items: center;
`;

const TypingText = styled.Text`
  font-size: 13px;
  color: ${colors.slate[600]};
  margin-right: 8px;
`;

const TypingDots = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TypingDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${colors.slate[600]};
  margin-horizontal: 3px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  padding-horizontal: 12px;
  padding-vertical: 8px;
  background-color: ${colors.white};
  border-top-width: 1px;
  border-top-color: ${colors.slate[200]};
`;

const Input = styled(TextInput)`
  flex: 1;
  background-color: ${colors.slate[50]};
  border-radius: 20px;
  padding-horizontal: 16px;
  padding-vertical: 10px;
  margin-right: 8px;
  font-size: 14px;
  max-height: 100px;
  color: ${colors.slate[900]};
`;

const SendButton = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.disabled ? colors.slate[300] : colors.brand[600]};
  justify-content: center;
  align-items: center;
`;

const SupportChatScreen = () => {
  const router = useRouter(); // Expo Router hook
  const { ticketId } = useLocalSearchParams();  // Expo Router hook for params

  // 🎯 Estado
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState(null);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatStore = useChatStore();

  // 📱 Obter dados do usuário
  const getUserData = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('movepay_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }, []);

  // 📱 Obter token
  const getAuthToken = useCallback(async () => {
    try {
      return await AsyncStorage.getItem('movepay_token');
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  }, []);

  // 🔌 Inicializar Socket.io
  const initializeSocket = useCallback(async () => {
    try {
      const token = await getAuthToken();
      // Ensure user data is loaded before init socket
      const existingUser = await getUserData();
      setUser(existingUser); // Keep local state updated

      if (!token || !existingUser) {
        console.error('Token ou usuário não disponível');
        return null;
      }

      const baseUrl = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com';
      const socketUrl = baseUrl.endsWith('/') ? `${baseUrl}chat` : `${baseUrl}/chat`;

      const newSocket = io(socketUrl, {
        auth: {
          token,
          userId: existingUser.id,
          userName: existingUser.name,
          userRole: existingUser.role || 'CUSTOMER'
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket conectado:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket desconectado');
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error('❌ Erro ao inicializar socket:', error);
      return null;
    }
  }, [getAuthToken, getUserData]);

  // 🎯 Buscar ou criar sessão
  const initializeSession = useCallback(async (newSocket) => {
    try {
      setLoading(true);

      const response = await api.get('/chat/my-session', {
        params: ticketId ? { ticketId } : {}
      });

      const { sessionId: sId, messages: msgs, context: ctx } = response.data;

      setSessionId(sId);
      setMessages(msgs || []);
      setContext(ctx);

      // Conectar ao Socket.io com a sessão
      if (newSocket) {
        newSocket.emit('join_session', {
          sessionId: sId
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao buscar sessão:', error);
      setLoading(false);
    }
  }, [ticketId]);

  // 🔌 Setup Socket.io listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Nova mensagem
    const handleNewMessage = (data) => {
      if (data.sessionId === sessionId) {
        setMessages(prev => [...prev, {
          id: data.messageId,
          senderType: data.senderType,
          senderName: data.senderName,
          content: data.content,
          timestamp: new Date(data.timestamp),
          isRead: data.isRead
        }]);
      }
    };

    // Alguém digitando
    const handleUserTyping = (data) => {
      // Ignorar se for o próprio usuário
      if (data.userId === user?.id) return;

      if (data.sessionId === sessionId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    // Ação completada
    const handleActionCompleted = (data) => {
      if (data.sessionId === sessionId) {
        // Adicionar mensagem de confirmação
        setMessages(prev => [...prev, {
          id: `action_${Date.now()}`,
          senderType: 'SYSTEM',
          senderName: 'Sistema',
          content: `✅ ${data.result.message}`,
          timestamp: new Date(),
          isRead: true
        }]);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('action_completed', handleActionCompleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('action_completed', handleActionCompleted);
    };
  }, [socket, sessionId, user]);

  // 🔌 Inicializar na montagem
  useFocusEffect(
    useCallback(() => {
      let newSocket = null;

      (async () => {
        newSocket = await initializeSocket();
        if (newSocket) {
          await initializeSession(newSocket);
        }
      })();

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }, [initializeSocket, initializeSession])
  );

  // 📤 Enviar mensagem
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !socket || !sessionId) return;

    setSending(true);
    const content = messageInput;
    setMessageInput('');

    try {
      // Emitir via Socket.io
      socket.emit('send_message', {
        sessionId,
        content
      });

      // Parar indicador de digitação
      socket.emit('stop_typing', { sessionId });
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setMessageInput(content); // Restaurar se erro
    } finally {
      setSending(false);
    }
  };

  // ✍️ Typing indicator
  const handleTyping = () => {
    if (!socket || !sessionId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { sessionId });
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { sessionId });
    }, 1000);
  };

  // 📍 Scroll para última mensagem
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 📱 Renderizar bubble de mensagem
  const renderMessage = ({ item }) => {
    // 🛡️ Segurança contra objetos inválidos
    if (!item || typeof item !== 'object') return null;

    const isUserMessage = item.senderType === 'USER';
    const isSystemMessage = item.senderType === 'SYSTEM';
    
    // Garantir que content é string
    let messageContent = '';
    if (typeof item.content === 'string') {
      messageContent = item.content;
    } else if (item.content && typeof item.content === 'object') {
       // Se o backend enviar um objeto (ex: rich message), tentar extrair texto ou JSON
       messageContent = item.content.text || JSON.stringify(item.content);
    }

    // Garantir que timestamp é válido
    const timeDisplay = (item.timestamp && !isNaN(new Date(item.timestamp).getTime())) 
      ? new Date(item.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <MessageContainer isUser={isUserMessage}>
        {!isUserMessage && !isSystemMessage && <AgentAvatar><MaterialCommunityIcons name="headset" size={16} color={colors.white} /></AgentAvatar>}
        
        <MessageBubble isUser={isUserMessage} isAgent={!isUserMessage && !isSystemMessage} isSystem={isSystemMessage}>
          {!isUserMessage && !isSystemMessage && <SenderName>{item.senderName || 'Suporte'}</SenderName>}
          <MessageText isUser={isUserMessage} isSystem={isSystemMessage}>
            {messageContent}
          </MessageText>
          <MessageFooter>
            <Timestamp isUser={isUserMessage}>{timeDisplay}</Timestamp>
            {isUserMessage && item.isRead && <MaterialCommunityIcons name="check-all" size={12} color={colors.white} style={{ marginLeft: 4 }} />}
          </MessageFooter>
        </MessageBubble>
      </MessageContainer>
    );
  };

  // 📍 Renderizar context card (ticket info)
  const renderContextCard = () => {
    if (!context) return null;

    return (
      <ContextCard>
        <ContextHeader>
          <MaterialCommunityIcons name="information-circle" size={20} color={colors.brand[600]} />
          <ContextTitle>Contexto da Viagem</ContextTitle>
        </ContextHeader>

        <ScrollView horizontal style={{ paddingHorizontal: spacing[3] }}>
          {/* Viagem */}
          <ContextSection>
            <ContextLabel>Origem</ContextLabel>
            <ContextValue>{context.trip.origin}</ContextValue>

            <ContextLabel>Destino</ContextLabel>
            <ContextValue>{context.trip.destination}</ContextValue>

            <ContextLabel>Assento</ContextLabel>
            <ContextValue>#{context.seatNumber}</ContextValue>
          </ContextSection>

          {/* Autocarro */}
          <ContextSection>
            <ContextLabel>Matrícula</ContextLabel>
            <ContextValue>{context.trip.bus.licensePlate}</ContextValue>

            <ContextLabel>Operadora</ContextLabel>
            <ContextValue>{context.trip.bus.company.name}</ContextValue>
          </ContextSection>

          {/* Ações rápidas */}
          <ContextSection>
            <ActionButton
              onPress={() => {
                if (socket && sessionId && context.ticketId) {
                  socket.emit('perform_action', {
                    sessionId,
                    actionType: 'REFUND',
                    ticketId: context.ticketId
                  });
                }
              }}
            >
              <MaterialCommunityIcons name="cash" size={16} color={colors.red[600]} />
              <ActionButtonText>Reembolsar</ActionButtonText>
            </ActionButton>

            <ActionButton
              onPress={() => {
                if (socket && sessionId && context.ticketId) {
                  socket.emit('perform_action', {
                    sessionId,
                    actionType: 'REISSUE_RECEIPT',
                    ticketId: context.ticketId
                  });
                }
              }}
            >
              <MaterialCommunityIcons name="document" size={16} color={colors.emerald[600]} />
              <ActionButtonText>Recibo</ActionButtonText>
            </ActionButton>
          </ContextSection>
        </ScrollView>
      </ContextCard>
    );
  };

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <Header>
          <BackButton onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate[900]} />
          </BackButton>

          <HeaderContent>
            <HeaderTitle>Suporte MovePay</HeaderTitle>
            <HeaderSubtitle>{socket ? '🟢 Conectado ao servidor' : '🔴 Desconectado'}</HeaderSubtitle>
          </HeaderContent>

          <HeaderAction>
            <MaterialCommunityIcons name="information-outline" size={24} color={colors.brand[600]} />
          </HeaderAction>
        </Header>

        {/* Context Card */}
        {renderContextCard()}

        {/* Mensagens */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          scrollEnabled={true}
          onContentSizeChange={() => scrollToBottom()}
          ListEmptyComponent={
            <EmptyContainer>
              <MaterialCommunityIcons name="forum-outline" size={40} color={colors.slate[300]} />
              <EmptyText>Nenhuma mensagem ainda</EmptyText>
              <EmptySubtext>Comece a conversa com nosso suporte</EmptySubtext>
            </EmptyContainer>
          }
        />

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <TypingIndicator>
            <TypingText>✏️ Agente está digitando</TypingText>
            <TypingDots>
              <TypingDot />
              <TypingDot />
              <TypingDot />
            </TypingDots>
          </TypingIndicator>
        )}

        {/* Input area */}
        <InputContainer>
          <Input
            placeholder="Descreva seu problema..."
            value={messageInput}
            onChangeText={(text) => {
              setMessageInput(text);
              handleTyping();
            }}
            placeholderTextColor={colors.slate[500]}
            multiline
            maxLength={500}
            editable={!sending}
          />

          <SendButton
            onPress={handleSendMessage}
            disabled={!messageInput.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color={colors.white} />
            )}
          </SendButton>
        </InputContainer>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default SupportChatScreen;
