# ♿ GUIA DE ACESSIBILIDADE A11y - MovePay Mobile

## 🎯 Implementação de Padrões de Acessibilidade

### 1. BUTTONS - Implementação Correta

#### ❌ ANTES (Sem Acessibilidade):
```javascript
export function Button({ children, disabled, onPress }) {
  return (
    <Container disabled={disabled} onPress={onPress}>
      <ButtonText>{children}</ButtonText>
    </Container>
  );
}
```

#### ✅ DEPOIS (Com Acessibilidade):
```javascript
export function Button({ 
  children, 
  disabled, 
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) {
  return (
    <Container 
      disabled={disabled} 
      onPress={onPress}
      // ===== ACESSIBILIDADE =====
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID || 'button'}
    >
      <ButtonText>{children}</ButtonText>
    </Container>
  );
}
```

---

### 2. INPUTS - Acessibilidade Completa

#### ❌ ANTES:
```javascript
export function Input({ label, icon: Icon, error, isPassword, placeholder }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <InputWrapper isFocused={isFocused} error={error}>
        {Icon && <Icon size={20} />}
        <Input
          placeholder={placeholder}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
}
```

#### ✅ DEPOIS:
```javascript
export function Input({ 
  label, 
  icon: Icon, 
  error, 
  isPassword, 
  placeholder,
  testID,
  accessibilityLabel,
  maxLength,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Container>
      {label && (
        <Label 
          nativeID={`${testID}-label`}
          accessible={true}
          accessibilityRole="header"
        >
          {label}
        </Label>
      )}
      <InputWrapper 
        isFocused={isFocused} 
        error={error}
        accessible={false}
      >
        {Icon && (
          <Icon 
            size={20} 
            accessible={false}
            accessibilityElementsHidden={true}
          />
        )}
        <Input
          placeholder={placeholder}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // ===== ACESSIBILIDADE =====
          accessible={true}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          accessibilityLabelledBy={`${testID}-label`}
          accessibilityRole="text"
          accessibilityState={{ 
            disabled: false,
            required: true,
          }}
          accessibilityHint={error ? `Erro: ${error}` : undefined}
          testID={testID || 'input'}
          maxLength={maxLength}
        />
      </InputWrapper>
      {error && (
        <ErrorText 
          role="alert"
          nativeID={`${testID}-error`}
          accessible={true}
          accessibilityRole="alert"
        >
          ⚠️ {error}
        </ErrorText>
      )}
    </Container>
  );
}
```

---

### 3. CARD COMPONENTS

#### ❌ ANTES:
```javascript
export function TripCard({ trip, onPress }) {
  return (
    <Container onPress={onPress}>
      <Logo source={{ uri: trip.logo }} />
      <CompanyName>{trip.company}</CompanyName>
      <Price>{formatKz(trip.price)}</Price>
      <Timeline>
        <StopTime>{trip.departureTime}</StopTime>
        <ConnectionLine />
        <StopTime>{trip.arrivalTime}</StopTime>
      </Timeline>
    </Container>
  );
}
```

#### ✅ DEPOIS:
```javascript
export function TripCard({ trip, onPress, testID }) {
  const tripDescription = `
    Viagem com ${trip.company} de ${trip.origin} para ${trip.destination}.
    Saída ${trip.departureTime}, chegada ${trip.arrivalTime}.
    Preço: ${formatKz(trip.price)}.
    ${trip.seats} assentos disponíveis.
  `;

  return (
    <Container 
      onPress={onPress}
      // ===== ACESSIBILIDADE =====
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Viagem ${trip.company}`}
      accessibilityHint={tripDescription}
      accessibilityState={{ disabled: !trip.available }}
      testID={testID || `trip-card-${trip.id}`}
    >
      <Logo 
        source={{ uri: trip.logo }} 
        accessible={false}
        accessibilityElementsHidden={true}
      />
      <CompanyName accessible={false}>{trip.company}</CompanyName>
      <Price accessible={false}>{formatKz(trip.price)}</Price>
      <Timeline accessible={false}>
        <StopTime>{trip.departureTime}</StopTime>
        <ConnectionLine />
        <StopTime>{trip.arrivalTime}</StopTime>
      </Timeline>
    </Container>
  );
}
```

---

### 4. MODAL/BOTTOM SHEET

#### ✅ CORRETO:
```javascript
export function BookingModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      // ===== ACESSIBILIDADE =====
      accessibilityViewIsModal={true}
      onDismiss={onClose}
    >
      <ModalOverlay>
        <ModalContent
          accessible={false}
          accessibilityElementsHidden={false}
        >
          <ModalHeader
            accessible={true}
            accessibilityRole="header"
          >
            Confirmar Reserva
          </ModalHeader>
          
          <ModalBody accessible={true}>
            <BookingDetails />
          </ModalBody>

          <ModalFooter>
            <Button
              onPress={onClose}
              testID="modal-cancel-btn"
              accessibilityLabel="Cancelar reserva"
            >
              Cancelar
            </Button>
            <Button
              onPress={onConfirm}
              testID="modal-confirm-btn"
              accessibilityLabel="Confirmar reserva"
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}
```

---

### 5. LISTS (FlatList)

#### ❌ ANTES:
```javascript
<FlatList
  data={trips}
  renderItem={({ item }) => <TripCard trip={item} />}
  keyExtractor={item => item.id}
/>
```

#### ✅ DEPOIS:
```javascript
<FlatList
  data={trips}
  renderItem={({ item, index }) => (
    <View
      // ===== ACESSIBILIDADE =====
      accessible={true}
      accessibilityRole="list"
    >
      <TripCard 
        trip={item}
        testID={`trip-item-${index}`}
      />
    </View>
  )}
  keyExtractor={item => item.id}
  // ===== ACESSIBILIDADE =====
  accessibilityLabel="Lista de viagens disponíveis"
  accessibilityRole="list"
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
/>
```

---

### 6. IMAGENS

#### ✅ CORRETO:
```javascript
// ❌ ANTES:
<Logo source={{ uri: trip.logo }} />

// ✅ DEPOIS:
<Logo 
  source={{ uri: trip.logo }}
  accessible={true}
  accessibilityRole="image"
  accessibilityLabel="Logo da empresa ${trip.company}"
  testID={`logo-${trip.id}`}
/>
```

---

### 7. TEXTO COM STATUSICON

#### ✅ CORRETO:
```javascript
export function StatusBadge({ status }) {
  const statusInfo = {
    CONFIRMED: { label: 'Confirmado', icon: '✅', color: 'green' },
    PENDING: { label: 'Pendente', icon: '⏳', color: 'orange' },
    CANCELLED: { label: 'Cancelado', icon: '❌', color: 'red' },
  };

  const info = statusInfo[status] || statusInfo.PENDING;

  return (
    <Badge
      accessible={true}
      accessibilityRole="status"
      accessibilityLabel={info.label}
      testID={`status-badge-${status}`}
    >
      <StatusIcon>{info.icon}</StatusIcon>
      <StatusText>{info.label}</StatusText>
    </Badge>
  );
}
```

---

## 📋 Checklist de Implementação

### Fase 1: Componentes Core (5 componentes - 3-4h)
- [ ] Button.js - Adicionar accessible, accessibilityLabel, testID
- [ ] Input.js - Adicionar labels linkedBy, role, hint
- [ ] Badge.js - Adicionar role, label
- [ ] TripCard.js - Adicionar accessible interaction hint
- [ ] TicketCard.js - Adicionar accessible interaction hint

### Fase 2: Telas Principais (4 telas - 4-5h)
- [ ] home.js - Adicionar labels nas seções
- [ ] booking/[id].js - Adicionar labels interativos
- [ ] booking/select-seats.js - Adicionar accessible seat grid
- [ ] wallet.js - Adicionar labels de tier badge

### Fase 3: Testing & Validation (2-3h)
- [ ] Testar com Android TalkBack
- [ ] Testar com iOS VoiceOver
- [ ] Validar testIDs em todos componentes
- [ ] Executar accessibility audit

### Fase 4: Documentação (1h)
- [ ] Criar guia de a11y para novos componentes
- [ ] Adicionar comments no código

---

## 🔍 Como Testar Acessibilidade

### iOS - VoiceOver:
```
1. Settings → Accessibility → VoiceOver
2. Enable VoiceOver
3. Testar navigação com gestos
4. Verificar labels corretos
```

### Android - TalkBack:
```
1. Settings → Accessibility → TalkBack
2. Enable TalkBack
3. Testar com gestos e teclado
4. Verificar announcements
```

### Ferramenta ESLint:
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

Adicionar ao `.eslintrc.json`:
```json
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

---

## 📚 Referências

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Android Accessibility Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [Apple VoiceOver](https://www.apple.com/accessibility/voiceover/)

---

## 💡 Best Practices

1. **Sempre teste com leitores de tela** - Não assuma que funciona
2. **Use labels descritivas** - Evite "Clique aqui", use "Comprar Passagem"
3. **testID em tudo** - Facilita testes automatizados
4. **Contraste adequado** - WCAG AA mínimo (4.5:1)
5. **Fontes legíveis** - Mínimo 14pt, boa hierarchy

---

## 🎯 Score Esperado Após Implementação

| Antes | Depois |
|-------|--------|
| 3/10  | 8/10   |
| ❌ Faltando | ✅ Premium |
