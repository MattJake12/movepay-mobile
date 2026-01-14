// File: src/services/paymentMethods.js

/**
 * Payment Methods Configuration - Carteiras Angolanas Reais
 * Fonte: Sistema bancário de Moçambique
 * Logo URLs: Logos oficiais das instituições
 */

export const PAYMENT_METHODS = [
  {
    id: 'WALLET',
    name: 'Carteira MovePay',
    description: 'Use seu saldo de pontos/dinheiro',
    icon: 'crown', // Lucide icon
    logo: require('../../assets/images/icon.png'), // Logo do App
    logoUrl: 'https://movepay.ao/logo.png',
    recommended: true,
    color: '#7c3aed', // Brand Purple
    placeholder: 'Saldo atual',
    isWallet: true // Flag especial
  },
  {
    id: 'MULTICAIXA_EXPRESS',
    name: 'Multicaixa Express',
    description: 'Débito imediato da sua conta',
    icon: 'smartphone', // Lucide icon
    logo: require('../../assets/payment-logos/multicaixa-express.png'),
    logoUrl: 'https://www.multicaixa.ao/assets/logo.png', // Fallback URL real
    recommended: true,
    color: '#0066CC',
    placeholder: '923 000 000'
  },
  {
    id: 'UNITEL_MONEY',
    name: 'Unitel Money',
    description: 'Dinheiro móvel do Unitel',
    icon: 'phone',
    logo: require('../../assets/payment-logos/unitel-money.png'),
    logoUrl: 'https://www.uniletmoney.ao/logo.png',
    recommended: false,
    color: '#FF6600',
    placeholder: '923 000 000'
  },
  {
    id: 'BAI_EXPRESS',
    name: 'BAI Express',
    description: 'Serviço de mobile banking do BAI',
    icon: 'creditcard',
    logo: require('../../assets/payment-logos/bai-express.png'),
    logoUrl: 'https://www.bai.ao/assets/express-logo.png',
    recommended: false,
    color: '#003366',
    placeholder: '923 000 000'
  },
  {
    id: 'E_KWANZA',
    name: 'E-Kwanza',
    description: 'Carteira digital angolana',
    icon: 'wallet',
    logo: require('../../assets/payment-logos/e-kwanza.png'),
    logoUrl: 'https://www.ekwanza.ao/logo.png',
    recommended: false,
    color: '#228B22',
    placeholder: '923 000 000'
  }
];

/**
 * Retorna método de pagamento por ID
 */
export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find(m => m.id === id);
}

/**
 * Retorna método recomendado
 */
export function getRecommendedMethod() {
  return PAYMENT_METHODS.find(m => m.recommended);
}

/**
 * Validação de telefone por operadora
 */
export function validatePhoneForMethod(methodId, phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Mozambique numbers: 84, 85, 87, 88 (Vodacom), 82, 86 (TMcel), 83 (Unitel), 80, 81 (other)
  const validPrefixes = {
    MULTICAIXA_EXPRESS: ['82', '83', '84', '85', '86', '87', '88'],
    UNITEL_MONEY: ['83'],
    BAI_EXPRESS: ['82', '84', '85'],
    E_KWANZA: ['82', '83', '84', '85', '86', '87', '88']
  };
  
  const prefixes = validPrefixes[methodId] || [];
  const twoDigitPrefix = cleanPhone.substring(0, 2);
  
  return cleanPhone.length === 9 && prefixes.includes(twoDigitPrefix);
}

/**
 * Formatar número de telefone para exibição
 */
export function formatPhoneForDisplay(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  return phone;
}

/**
 * Mapear PaymentMethod enum do backend para objeto local
 */
export function mapBackendMethod(backendMethod) {
  return getPaymentMethod(backendMethod) || getRecommendedMethod();
}
