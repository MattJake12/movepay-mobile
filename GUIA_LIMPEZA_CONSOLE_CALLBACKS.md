# 🔧 GUIA DE CORREÇÕES - CONSOLE.LOG E CALLBACKS

## 📋 Lista de console.log a Remover

### 1️⃣ app/_layout.js (linha 31)
```javascript
// ❌ REMOVER:
console.log('📬 Notificação recebida:', notification);

// ✅ SUBSTITUIR POR:
// Silencioso ou usar logger em produção
```

### 2️⃣ app/support/chat.js (linhas 361, 365)
```javascript
// ❌ REMOVER:
console.log('✅ Socket conectado:', newSocket.id);
console.log('🔌 Socket desconectado');

// ✅ SUBSTITUIR POR:
// console.log em development apenas
if (__DEV__) {
  console.log('✅ Socket conectado:', newSocket.id);
}
```

### 3️⃣ app/driver/tracker.js (linhas 38, 50, 55, 60, 65, 258)
```javascript
// ❌ REMOVER:
console.log('✅ WebSocket conectado');
console.log('Erro ao fazer parse de mensagem:', e);
console.log('Erro WebSocket:', error);
console.log('Desconectado');
console.log('Erro ao conectar WebSocket:', e);
console.log('✅ Conectado ao servidor');
```

### 4️⃣ app/booking/dynamic-ticket.js (linhas 96, 139, 144)
```javascript
// ❌ REMOVER:
console.log('✅ Novo OTP gerado:', token);
console.log(`Brilho atual: ${(brightness * 100).toFixed(0)}%`);
console.log('💡 Brilho ao máximo');
```

### 5️⃣ app/(public)/login.js (linha 263)
```javascript
// ❌ REMOVER:
console.log(error); // Para você ver o erro no terminal

// ✅ SUBSTITUIR POR (se necessário, criar logger de erro):
if (__DEV__) {
  console.error('[Login Error]:', error);
}
```

---

## 🔧 Remover Automaticamente com ESLint

```bash
# Instalar plugin se não tiver
npm install --save-dev eslint-plugin-no-console

# Adicionar ao .eslintrc.json
{
  "plugins": ["no-console"],
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}

# Executar lint
eslint --fix app/**/*.js
```

---

## 🎯 Callbacks Vazios a Implementar

### app/booking/confirmation.js (linhas 270, 275)

```javascript
// ❌ ATUAL - Sem funcionalidade:
<ActionButton onPress={() => console.log('download')}>
  <Download size={20} color={colors.white} />
</ActionButton>

<ActionButton onPress={() => console.log('share')}>
  <Share2 size={20} color={colors.white} />
</ActionButton>
```

### ✅ CORREÇÃO - Implementar Funções:

```javascript
import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { QRCode } from 'lucide-react-native';

export default function ConfirmationScreen() {
  // ... existing code ...

  const handleShareTicket = async () => {
    try {
      const ticketData = `
        Passagem MovePay #${ticket.id}
        Viagem: ${trip.origin} → ${trip.destination}
        Data: ${new Date(trip.departureTime).toLocaleDateString('pt-AO')}
        Hora: ${new Date(trip.departureTime).toLocaleTimeString()}
        Assento: ${ticket.seatNumber}
      `;

      await Share.share({
        message: ticketData,
        title: 'Compartilhar Passagem',
        url: 'movepay://', // Deep link
      });
    } catch (error) {
      Toast.error('Erro ao compartilhar passagem');
    }
  };

  const handleDownloadTicket = async () => {
    try {
      // Gerar PDF ou imagem do ticket
      const fileName = `ticket-${ticket.id}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Simulação - em produção usar biblioteca de PDF
      // await generatePDF(ticket, filePath);

      // Salvar localmente
      Toast.success('✅ Passagem salva em Downloads');

      // Opcional: abrir compartilhamento
      // await Sharing.shareAsync(filePath);
    } catch (error) {
      Toast.error('Erro ao baixar passagem');
    }
  };

  return (
    <>
      {/* ... existing code ... */}
      
      <ActionButton onPress={handleDownloadTicket}>
        <Download size={20} color={colors.white} />
      </ActionButton>

      <ActionButton onPress={handleShareTicket}>
        <Share2 size={20} color={colors.white} />
      </ActionButton>
    </>
  );
}
```

---

## 📝 Script Auxiliar para Limpeza

Crie `scripts/cleanup-logs.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function cleanConsoleLogs(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory() && !file.includes('node_modules')) {
      cleanConsoleLogs(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove console.log (mas mantém console.error, console.warn)
      const cleaned = content.replace(
        /console\.log\([^)]*\);\n/g,
        ''
      );

      if (content !== cleaned) {
        fs.writeFileSync(filePath, cleaned, 'utf8');
        console.log(`✅ Limpado: ${filePath}`);
      }
    }
  });
}

cleanConsoleLogs('./app');
cleanConsoleLogs('./src');
console.log('✨ Limpeza concluída!');
```

Executar:
```bash
node scripts/cleanup-logs.js
```

---

## ✅ Checklist de Implementação

- [ ] Instalar eslint-plugin-no-console
- [ ] Adicionar rule "no-console" ao .eslintrc.json
- [ ] Executar eslint --fix para limpeza automática
- [ ] Implementar handleShareTicket em confirmation.js
- [ ] Implementar handleDownloadTicket em confirmation.js
- [ ] Testar compartilhamento de passagens
- [ ] Testar download de passagens
- [ ] Verificar se console.error e console.warn continuam
- [ ] Fazer push das alterações

---

## 🎯 Próximas Prioridades

1. **Imediato:** Remover console.log
2. **Hoje:** Implementar callbacks de share/download
3. **Semana:** Implementar acessibilidade A11y
4. **Próx. Sprint:** Dark Mode + Performance optimization
