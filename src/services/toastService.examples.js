// File: src/services/toastService.examples.js

// mobile/src/services/toastService.examples.js

/**
 * 📋 Exemplos de Uso do Toast Service
 * 
 * Import no seu componente:
 * import Toast from '../services/toastService';
 */

// ✅ Notificação de Sucesso
// Toast.success('Bilhete comprado com sucesso!');

// ❌ Notificação de Erro  
// Toast.error('Erro ao processar pagamento');

// ⚠️ Notificação de Aviso
// Toast.warning('Conectando ao servidor...');

// ℹ️ Notificação de Informação
// Toast.info('Sua localização foi compartilhada');

// 📍 Em um componente real:
/*
import Toast from '../services/toastService';

export function CheckoutButton() {
  const handleCheckout = async () => {
    try {
      const response = await api.post('/tickets/purchase', ticketData);
      Toast.success('✅ Bilhete comprado com sucesso!');
      
      // Navegar
      navigation.navigate('tickets', { ticketId: response.data.id });
    } catch (error) {
      Toast.error('❌ Erro ao comprar bilhete: ' + error.message);
    }
  };

  return (
    <Button 
      title="Comprar" 
      onPress={handleCheckout}
    />
  );
}
*/

// ⏱️ Customizar duração (em milisegundos):
// Toast.success('Rápido!', 1000);      // 1 segundo
// Toast.success('Padrão', 3000);       // 3 segundos
// Toast.success('Longo', 5000);        // 5 segundos

// 🎯 Usar Alert (mais intrusivo, requer confirmação):
// Toast.alert(
//   'Confirmação',
//   'Você tem certeza que deseja cancelar?',
//   () => console.log('Cancelado!')
// );

export {};
