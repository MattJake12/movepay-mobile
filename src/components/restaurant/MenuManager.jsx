/**
 * 📋 MenuManager
 * 
 * Editar cardápio do restaurante
 * - Listar produtos
 * - Criar novo produto
 * - Editar produto
 * - Deletar produto
 * - Toggle ativo/inativo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView
} from 'react-native';
import styled from 'styled-components/native';
import { useRestaurantManagement } from '../../hooks';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 16px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: white;
`;

const AddButton = styled(TouchableOpacity)`
  background-color: white;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

const ProductCard = styled.View`
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  border-left-width: 4px;
  border-left-color: #4CAF50;
`;

const ProductInfo = styled.View`
  flex: 1;
`;

const ProductName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const ProductCategory = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const ProductPrice = styled.Text`
  font-size: 12px;
  color: #2196F3;
  font-weight: bold;
  margin-top: 4px;
`;

const ProductActions = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ActionButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #f0f0f0;
  align-items: center;
  justify-content: center;
`;

const StatusBadge = styled.View`
  background-color: ${props => props.active ? '#4CAF50' : '#ccc'};
  padding: 4px 8px;
  border-radius: 4px;
`;

const StatusText = styled.Text`
  font-size: 10px;
  color: white;
  font-weight: bold;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 20px;
`;

const ModalContent = styled.View`
  flex: 1;
  background-color: white;
`;

const FormGroup = styled.View`
  margin-bottom: 16px;
`;

const Label = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: bold;
`;

const Input = styled(TextInput)`
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #333;
`;

const Picker = styled(TouchableOpacity)`
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  justify-content: center;
`;

const PickerText = styled.Text`
  font-size: 14px;
  color: #333;
`;

const SaveButton = styled(TouchableOpacity)`
  background-color: #4CAF50;
  padding: 12px;
  border-radius: 6px;
  align-items: center;
  margin-top: 10px;
`;

const SaveButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const DeleteButton = styled(TouchableOpacity)`
  background-color: #f44336;
  padding: 12px;
  border-radius: 6px;
  align-items: center;
  margin-top: 10px;
`;

const DeleteButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

// ProductModal component
const ProductModal = ({ visible, product, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.category || 'SNACK');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Erro', 'Preencha nome e preço');
      return;
    }
    
    onSave({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category
    });
    
    setName('');
    setDescription('');
    setPrice('');
    setCategory('SNACK');
  };

  const categories = ['COMBO', 'DRINK', 'SNACK', 'MEAL', 'DESSERT'];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Container style={{ paddingTop: 40 }}>
        <Header style={{ marginBottom: 0 }}>
          <HeaderTitle>{product ? 'Editar Produto' : 'Novo Produto'}</HeaderTitle>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </Header>

        <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <FormGroup>
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Burger Deluxe"
              value={name}
              onChangeText={setName}
            />
          </FormGroup>

          <FormGroup>
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Hambúrguer com queijo e alface"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>Preço (AOA)</Label>
            <Input
              placeholder="Ex: 2500"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </FormGroup>

          <FormGroup>
            <Label>Categoria</Label>
            <Picker onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
              <PickerText>{category}</PickerText>
            </Picker>

            {showCategoryPicker && (
              <View style={{ marginTop: 8 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#eee'
                    }}
                  >
                    <Text style={{ color: cat === category ? '#4CAF50' : '#333' }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </FormGroup>

          <SaveButton onPress={handleSave}>
            <SaveButtonText>Salvar Produto</SaveButtonText>
          </SaveButton>

          {product && (
            <DeleteButton onPress={() => {
              Alert.alert('Confirmar', 'Deletar este produto?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Deletar',
                  onPress: () => onDelete(product.id),
                  style: 'destructive'
                }
              ]);
            }}>
              <DeleteButtonText>Deletar Produto</DeleteButtonText>
            </DeleteButton>
          )}
        </ScrollView>
      </Container>
    </Modal>
  );
};

// MenuManager main component
export default function MenuManager() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    menu,
    menuLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refetchMenu
  } = useRestaurantManagement();

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleSaveProduct = async (data) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
      } else {
        await createProduct(data);
      }
      setModalVisible(false);
      setSelectedProduct(null);
      Alert.alert('Sucesso', 'Produto salvo com sucesso');
      refetchMenu();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      Alert.alert('Sucesso', 'Produto deletado com sucesso');
      refetchMenu();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await toggleProductStatus(product.id, product.isActive);
      refetchMenu();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMenu();
    setRefreshing(false);
  };

  const renderProductCard = ({ item }) => (
    <ProductCard>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ProductName>{item.name}</ProductName>
          <StatusBadge active={item.isActive}>
            <StatusText>{item.isActive ? 'Ativo' : 'Inativo'}</StatusText>
          </StatusBadge>
        </View>
        <ProductCategory>{item.category}</ProductCategory>
        <ProductPrice>AOA {item.price?.toLocaleString('pt-AO')}</ProductPrice>
      </View>
      <ProductActions>
        <ActionButton onPress={() => handleToggleStatus(item)}>
          <Ionicons
            name={item.isActive ? 'eye-off' : 'eye'}
            size={16}
            color={item.isActive ? '#4CAF50' : '#ccc'}
          />
        </ActionButton>
        <ActionButton onPress={() => handleOpenModal(item)}>
          <Ionicons name="pencil" size={16} color="#2196F3" />
        </ActionButton>
        <ActionButton onPress={() => handleDeleteProduct(item.id)}>
          <Ionicons name="trash" size={16} color="#f44336" />
        </ActionButton>
      </ProductActions>
    </ProductCard>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>📋 Cardápio</HeaderTitle>
        <AddButton onPress={() => handleOpenModal()}>
          <Ionicons name="add" size={24} color="#4CAF50" />
        </AddButton>
      </Header>

      <Content
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {menu && menu.length > 0 ? (
          <FlatList
            data={menu}
            renderItem={renderProductCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <EmptyText>Nenhum produto no cardápio. Crie um novo!</EmptyText>
        )}
      </Content>

      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </Container>
  );
}
