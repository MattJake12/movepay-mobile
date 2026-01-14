// File: app/(modals)/review.js

import React, { useState } from 'react';
import { ScrollView, TextInput, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Star, X, Send } from 'lucide-react-native';
import styled from 'styled-components/native';
import api from '../../src/lib/api';
import Toast from 'react-native-toast-message';
import { colors, spacing, fontSize, fontWeight } from '../../src/theme/theme';

// ===== STYLED COMPONENTS =====
const Container = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalView = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ModalCard = styled.View`
  background-color: ${colors.white};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding-top: ${spacing[6]}px;
  max-height: 96%;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${spacing[6]}px ${spacing[4]}px ${spacing[6]}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.slate[200]};
`;

const HeaderContent = styled.View``;

const HeaderTitle = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
  font-size: ${fontSize.lg}px;
`;

const HeaderSubtitle = styled.Text`
  color: ${colors.slate[500]};
  font-size: ${fontSize.sm}px;
`;

const CloseButton = styled.Pressable`
  width: 40px;
  height: 40px;
  background-color: ${colors.slate[100]};
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const ScrollContent = styled(ScrollView)`
  padding-bottom: ${spacing[6]}px;
  padding: 0 ${spacing[6]}px;
`;

const InstructionText = styled.Text`
  color: ${colors.slate[600]};
  text-align: center;
  font-size: ${fontSize.sm}px;
  margin-top: ${spacing[4]}px;
  margin-bottom: ${spacing[6]}px;
`;

const StarsContainer = styled.View`
  flex-direction: row;
  gap: ${spacing[4]}px;
  justify-content: center;
  margin-bottom: ${spacing[6]}px;
`;

const StarButton = styled.Pressable`
  padding: ${spacing[2]}px;
`;

const RatingDescriptionText = styled.Text`
  text-align: center;
  color: ${colors.slate[600]};
  font-size: ${fontSize.sm}px;
  margin-bottom: ${spacing[6]}px;
`;

const CommentSection = styled.View`
  margin-bottom: ${spacing[6]}px;
`;

const CommentLabel = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.sm}px;
  margin-bottom: ${spacing[3]}px;
`;

const CommentInput = styled(TextInput)`
  background-color: ${colors.slate[50]};
  border-width: 1px;
  border-color: ${colors.slate[200]};
  border-radius: 12px;
  padding: ${spacing[4]}px;
  color: ${colors.slate[900]};
  height: 96px;
  font-size: ${fontSize.sm}px;
`;

const CharacterCount = styled.Text`
  color: ${colors.slate[400]};
  font-size: 12px;
  text-align: right;
  margin-top: ${spacing[2]}px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${spacing[3]}px;
  margin-bottom: ${spacing[6]}px;
`;

const CancelButton = styled.Pressable`
  flex: 1;
  background-color: ${colors.slate[100]};
  padding: ${spacing[3]}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const CancelButtonText = styled.Text`
  color: ${colors.slate[900]};
  font-weight: ${fontWeight.bold};
`;

const SubmitButton = styled.Pressable`
  flex: 1;
  background-color: ${props => props.disabled ? colors.slate[300] : colors.purple[600]};
  padding: ${spacing[3]}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: ${spacing[2]}px;
`;

const SubmitButtonText = styled.Text`
  color: ${colors.white};
  font-weight: ${fontWeight.bold};
`;

export default function ReviewModal() {
  const router = useRouter();
  const { tripId, companyName } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/reviews', {
        tripId,
        rating,
        comment: comment.trim() || null
      });
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        position: 'top',
        text1: '⭐ Avaliação Enviada',
        text2: 'Obrigado pela sua contribuição!',
        duration: 3000
      });

      setTimeout(() => {
        router.back();
      }, 2000);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Erro ao enviar avaliação';
      Alert.alert('Erro', message);
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma classificação');
      return;
    }

    submitMutation.mutate();
  };

  const renderStars = () => {
    return (
      <StarsContainer>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            onPress={() => setRating(star)}
            onPressIn={() => setHoveredStar(star)}
            onPressOut={() => setHoveredStar(0)}
          >
            <Star
              size={48}
              color={star <= (hoveredStar || rating) ? colors.yellow[400] : colors.slate[200]}
              fill={star <= (hoveredStar || rating) ? colors.yellow[400] : 'none'}
            />
          </StarButton>
        ))}
      </StarsContainer>
    );
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" />

      <ModalView>
        {/* Modal Card */}
        <ModalCard>
          {/* Header */}
          <Header>
            <HeaderContent>
              <HeaderTitle>Avaliar Operadora</HeaderTitle>
              <HeaderSubtitle>{companyName}</HeaderSubtitle>
            </HeaderContent>
            <CloseButton onPress={() => router.back()}>
              <X size={20} color={colors.slate[500]} />
            </CloseButton>
          </Header>

          <ScrollContent contentContainerStyle={{ paddingBottom: spacing[6] }}>
            {/* Instruções */}
            <InstructionText>Como foi sua experiência? Sua avaliação nos ajuda a melhorar.</InstructionText>

            {/* Stars Rating */}
            {renderStars()}

            {/* Texto descritivo do rating */}
            {rating > 0 && (
              <RatingDescriptionText>
                {rating === 5 && '⭐ Excelente!'}
                {rating === 4 && '😊 Muito bom!'}
                {rating === 3 && '👌 Bom'}
                {rating === 2 && '😕 Poderia melhorar'}
                {rating === 1 && '😞 Ruim'}
              </RatingDescriptionText>
            )}

            {/* Comentário Opcional */}
            <CommentSection>
              <CommentLabel>Adicione um comentário (Opcional)</CommentLabel>
              <CommentInput
                placeholder="Conte-nos mais sobre sua experiência..."
                placeholderTextColor={colors.slate[400]}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />
              <CharacterCount>{comment.length}/500</CharacterCount>
            </CommentSection>

            {/* Botões */}
            <ButtonRow>
              <CancelButton onPress={() => router.back()} disabled={submitMutation.isPending}>
                <CancelButtonText>Cancelar</CancelButtonText>
              </CancelButton>

              <SubmitButton
                onPress={handleSubmit}
                disabled={submitMutation.isPending || rating === 0}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Send size={20} color={colors.white} />
                    <SubmitButtonText>Enviar</SubmitButtonText>
                  </>
                )}
              </SubmitButton>
            </ButtonRow>
          </ScrollContent>
        </ModalCard>
      </ModalView>

      <Toast />
    </Container>
  );
}
