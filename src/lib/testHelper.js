// File: src/lib/testHelper.js

/**
 * SCRIPT DE TESTES MANUAIS - MovePay App
 * 
 * Usar este script para testar funcionalidades rapidamente
 * Executar no console do Expo ou React Native Debugger
 */

// ============================================
// 1. TESTE DE AUTENTICAÇÃO
// ============================================

export async function testLogin() {
  console.log('🧪 Testando Login...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+244923456789',
      password: 'senha123'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Login bem-sucedido');
    console.log('Token:', data.data.token);
    console.log('Usuário:', data.data.user);
    return data.data;
  } else {
    console.error('❌ Login falhou:', data.message);
    return null;
  }
}

// ============================================
// 2. TESTE DE CARREGAMENTO DE VIAGENS
// ============================================

export async function testFetchTrips(token) {
  console.log('🧪 Testando Carregamento de Viagens...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/trips`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Viagens carregadas');
    console.log(`Total: ${data.data.length} viagens`);
    console.log('Primeira viagem:', data.data[0]);
    return data.data;
  } else {
    console.error('❌ Erro ao carregar viagens:', data.message);
    return [];
  }
}

// ============================================
// 3. TESTE DE BOOKING
// ============================================

export async function testCreateBooking(token, tripId) {
  console.log('🧪 Testando Booking...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      tripId: tripId,
      seatNumber: 1,
      paymentMethod: 'MULTICAIXA_EXPRESS'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Booking criado com sucesso');
    console.log('Bilhete:', data.data);
    return data.data;
  } else {
    console.error('❌ Erro ao criar booking:', data.message);
    return null;
  }
}

// ============================================
// 4. TESTE DE BILHETES DO USUÁRIO
// ============================================

export async function testFetchUserTickets(token) {
  console.log('🧪 Testando Carregamento de Bilhetes...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/bookings/my-tickets`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Bilhetes carregados');
    console.log(`Total: ${data.data.length} bilhetes`);
    data.data.forEach(ticket => {
      console.log(`  - ${ticket.trip.origin} → ${ticket.trip.destination} | Status: ${ticket.status}`);
    });
    return data.data;
  } else {
    console.error('❌ Erro ao carregar bilhetes:', data.message);
    return [];
  }
}

// ============================================
// 5. TESTE DE VALIDAÇÃO DE QR CODE
// ============================================

export async function testValidateQRCode(token, qrCode) {
  console.log('🧪 Testando Validação de QR Code...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/bookings/validate-qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ qrCode })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ QR Code validado');
    console.log('Bilhete:', data.data);
    return data.data;
  } else {
    console.error('❌ Erro ao validar QR:', data.message);
    return null;
  }
}

// ============================================
// 6. TESTE DE LOGOUT
// ============================================

export async function testLogout(token) {
  console.log('🧪 Testando Logout...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Logout bem-sucedido');
    return true;
  } else {
    console.error('❌ Erro no logout:', data.message);
    return false;
  }
}

// ============================================
// 7. TESTE DE REFRESH TOKEN
// ============================================

export async function testRefreshToken(token) {
  console.log('🧪 Testando Refresh Token...');
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://movepay-api.onrender.com/api';
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Token renovado com sucesso');
    console.log('Novo token:', data.data.token);
    return data.data.token;
  } else {
    console.error('❌ Erro ao renovar token:', data.message);
    return null;
  }
}

// ============================================
// 8. TESTE COMPLETO (Executar em Sequência)
// ============================================

export async function runFullTest() {
  console.log('\n🚀 INICIANDO TESTE COMPLETO DO SISTEMA\n');
  
  // 1. Login
  console.log('─'.repeat(50));
  const authData = await testLogin();
  if (!authData) return;
  
  const token = authData.token;
  const user = authData.user;
  
  // 2. Carregar viagens
  console.log('\n─'.repeat(50));
  const trips = await testFetchTrips(token);
  if (!trips.length) return;
  
  const tripId = trips[0].id;
  
  // 3. Fazer booking
  console.log('\n─'.repeat(50));
  const booking = await testCreateBooking(token, tripId);
  if (!booking) return;
  
  // 4. Carregar bilhetes
  console.log('\n─'.repeat(50));
  const tickets = await testFetchUserTickets(token);
  
  // 5. Validar QR Code (se tiver um bilhete válido)
  if (tickets.length > 0 && tickets[0].qrCode) {
    console.log('\n─'.repeat(50));
    await testValidateQRCode(token, tickets[0].qrCode);
  }
  
  // 6. Renovar token
  console.log('\n─'.repeat(50));
  const newToken = await testRefreshToken(token);
  
  // 7. Logout
  console.log('\n─'.repeat(50));
  await testLogout(newToken || token);
  
  console.log('\n✅ TESTE COMPLETO FINALIZADO\n');
}

// ============================================
// Como Usar:
// ============================================
/*
1. Abrir console do Expo (Pressionar 'j')
2. Importar este arquivo
3. Executar:

   runFullTest(); // Teste completo
   
   Ou individual:
   
   testLogin(); // Apenas login
   
   // Depois de pegar o token
   const token = "seu_token_aqui";
   testFetchTrips(token);
   testFetchUserTickets(token);
   etc.
*/

export default {
  testLogin,
  testFetchTrips,
  testCreateBooking,
  testFetchUserTickets,
  testValidateQRCode,
  testLogout,
  testRefreshToken,
  runFullTest
};
