export const MOCK_WALLET = {
  balance: 15450,
  tier: 'GOLD',
  lifetimePts: 24500,
  history: [
    {
      id: 'tx-123',
      type: 'earned',
      amount: 120,
      description: 'Viagem Luanda -> Benguela',
      date: new Date().toISOString(),
    },
    {
      id: 'tx-124',
      type: 'redeemed',
      amount: 500,
      description: 'Desconto em Passagem',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'tx-125',
      type: 'earned',
      amount: 5000,
      description: 'Top-up Multicaixa',
      date: new Date(Date.now() - 172800000).toISOString(),
    }
  ]
};
