# ☕ Café Inteligente - Sistema de Pedidos por Gestos

Uma aplicação web inovadora que permite fazer pedidos de café usando **gestos com as mãos**! O sistema utiliza inteligência artificial para detectar de 1 a 5 dedos levantados, permitindo uma experiência de compra totalmente hands-free.

## 🚀 Funcionalidades Implementadas

### ✅ Recursos Principais
- **Detecção de Gestos em Tempo Real** usando MediaPipe Hands
- **Interface Otimizada** com opções sobrepostas à câmera para melhor visibilidade
- **Instruções de Gestos Claras** para guiar o usuário (Punho Fechado, 1-5 Dedos, Polegar para Baixo)
- **Navegação por Gestos Aprimorada** incluindo "Polegar para Baixo" para voltar
- **Interface Responsiva** otimizada para smartphones
- **Fluxo de Pedido Intuitivo** em 5 etapas simples
- **Sistema de Códigos de Retirada** com 4 caracteres alfanuméricos
- **Armazenamento de Pedidos** em banco de dados RESTful
- **Feedback Visual** com indicadores de gestos e progresso
- **Tema Moderno** com cores inspiradas em cafeteria

### 📱 Compatibilidade
- ✅ Smartphones (iOS/Android)
- ✅ Tablets
- ✅ Desktop com webcam
- ✅ Funciona offline após carregamento inicial
- ✅ Progressive Web App (PWA) ready

## 🎯 Fluxo de Uso

### Etapas do Pedido (1-5 dedos para cada escolha):

1. **Tipo de Café**
   - 1️⃣ Espresso (R$ 4,50)
   - 2️⃣ Americano (R$ 5,00)
   - 3️⃣ Latte (R$ 7,50)
   - 4️⃣ Cappuccino (R$ 8,00)
   - 5️⃣ Frappé (R$ 9,50)

2. **Tamanho**
   - 1️⃣ Pequeno (150ml) - Padrão
   - 2️⃣ Médio (250ml) - +R$ 1,50
   - 3️⃣ Grande (350ml) - +R$ 3,00
   - 4️⃣ Extra Grande (500ml) - +R$ 4,50
   - 5️⃣ Família (700ml) - +R$ 6,00

3. **Personalização** (varia por tipo de café)
   - **Espresso**: Tradicional, Duplo, Lungo, Ristretto, Com Açúcar
   - **Americano**: Tradicional, Forte, Suave, Quente, Com Leite
   - **Latte**: Tradicional, Baunilha, Caramelo, Canela, Sem Lactose
   - **Cappuccino**: Tradicional, Chocolate, Canela, Dry, Wet
   - **Frappé**: Natural, Baunilha, Chocolate, Caramelo, Mocha

4. **Meio de Pagamento**
   - 1️⃣ Cartão de Crédito/Débito
   - 2️⃣ PIX
   - 3️⃣ Dinheiro
   - 4️⃣ Google Pay
   - 5️⃣ Apple Pay

5. **Confirmação e Código de Retirada**
   - Resumo do pedido com preço total
   - Geração automática de código alfanumérico (ex: A1B2)
   - Tempo estimado: 8-12 minutos

## 🔧 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e moderno
- **JavaScript ES6+** - Lógica da aplicação
- **MediaPipe Hands** - Detecção de gestos
- **Font Awesome** - Ícones
- **Google Fonts (Inter)** - Tipografia

### APIs e Integração
- **MediaDevices API** - Acesso à câmera
- **RESTful Table API** - Armazenamento de pedidos
- **Canvas API** - Renderização de landmarks da mão

### Funcionalidades Técnicas
- **Detecção de Landmarks da Mão** - 21 pontos de referência
- **Algoritmo de Contagem de Dedos** - Análise geométrica precisa
- **Debounce de Gestos** - Evita seleções acidentais
- **Feedback Háptico Visual** - Indicadores de confirmação
- **Persistência Local** - Cache de configurações

## 📊 Estrutura de Dados

### Tabela: `pedidos`
```javascript
{
  id: "string",                    // ID único do pedido
  codigo_retirada: "string",       // Código de 4 caracteres (A1B2)
  tipo_cafe: "string",             // Nome do café selecionado
  tamanho: "string",               // Tamanho escolhido
  personalizacao: "string",        // Personalização aplicada
  meio_pagamento: "string",        // Método de pagamento
  preco_total: "number",           // Valor total em R$
  status: "string",                // processando|preparando|pronto|retirado
  timestamp: "datetime"            // Data/hora do pedido
}
```

## 🎮 Como Usar

### Para Consumidores:
1. **Acesse a aplicação** no smartphone
2. **Permita acesso à câmera** quando solicitado
3. **Posicione a mão** em frente à câmera
4. **Siga as instruções de gestos na tela:**
   - **Punho Fechado (✊):** Posição neutra para iniciar.
   - **1-5 Dedos (✋):** Selecione as opções.
   - **Polegar para Baixo (👎):** Volte para a etapa anterior.
5. **Aguarde a confirmação visual** de cada seleção
6. **Anote o código de retirada** ao final
7. **Apresente o código** no balcão quando pronto

### Para Desenvolvedores:
```bash
# Clone e acesse o projeto
git clone [repo-url]
cd cafe-inteligente

# Abra o index.html no navegador
# Ou use um servidor local
python -m http.server 8000
# Acesse: http://localhost:8000
```

## 🔧 Configuração e Personalização

### Alteração de Preços:
Edite o objeto `coffeeData` no arquivo `js/app.js`:
```javascript
tipos: [
    { id: 1, name: 'Espresso', price: 4.50, icon: 'fas fa-coffee' },
    // Ajuste os preços conforme necessário
]
```

### Personalização de Opções:
Modifique as personalizações por tipo de café:
```javascript
personalizacoes: {
    1: [  // Espresso
        { id: 1, name: 'Tradicional', desc: 'Clássico italiano' },
        // Adicione suas opções personalizadas
    ]
}
```

### Ajuste de Sensibilidade:
Configure a detecção de gestos em `js/app.js`:
```javascript
// Sensibilidade de detecção
minDetectionConfidence: 0.7,  // 0.5 - 0.9
minTrackingConfidence: 0.5,   // 0.5 - 0.9
stableGestureCount: 15        // Frames necessários para confirmação
```

## 🚦 Status do Projeto

### ✅ Funcionalidades Completadas
- [x] Interface responsiva completa
- [x] Detecção de gestos com MediaPipe
- [x] Fluxo de 5 etapas funcionais
- [x] Sistema de códigos de retirada
- [x] Armazenamento de pedidos
- [x] Cálculo automático de preços
- [x] Feedback visual em tempo real
- [x] Compatibilidade mobile/desktop

### 🔄 Próximas Melhorias Sugeridas
- [ ] **Sistema de Autenticação** para lojistas
- [ ] **Dashboard Administrativo** para gerenciar pedidos
- [ ] **Notificações Push** quando pedido estiver pronto
- [ ] **Integração com Gateways de Pagamento** reais
- [ ] **Sistema de Fidelidade** com pontos
- [ ] **Múltiplas Linguagens** (i18n)
- [ ] **Analytics de Vendas** e relatórios
- [ ] **API de Status de Pedidos** em tempo real
- [ ] **Impressão Automática** de comprovantes
- [ ] **Integração com Hardware** de cafeteiras

### 🎯 Melhorias Técnicas Futuras
- [ ] **Service Workers** para funcionamento offline completo
- [ ] **WebAssembly** para performance otimizada
- [ ] **WebRTC** para streaming de vídeo otimizado
- [ ] **Machine Learning Local** para gestos personalizados
- [ ] **Biometria** para identificação de clientes
- [ ] **Realidade Aumentada** para preview dos cafés

## 🌟 Diferenciais Competitivos

### ✨ Inovação
- **Primeira aplicação** de pedidos por gestos no Brasil
- **Zero Contato** - higiene máxima pós-COVID
- **Experiência Futurística** - atrai e fideliza clientes
- **Acessibilidade** - funciona para pessoas com dificuldades de fala

### 📈 Benefícios de Negócio
- **Redução de Filas** - pedidos mais rápidos
- **Maior Throughput** - atendimento simultâneo
- **Marketing Viral** - clientes compartilham a experiência
- **Diferenciação** - destaque da concorrência
- **Coleta de Dados** - analytics de comportamento

## 📞 Suporte e Deployment

### Para Produção:
1. **Configure HTTPS** (necessário para câmera)
2. **Otimize Assets** (minify CSS/JS)
3. **Configure CDN** para MediaPipe
4. **Monitore Performance** com analytics
5. **Configure Backup** do banco de dados

### URLs Funcionais:
- **Aplicação Principal**: `index.html`
- **API de Pedidos**: `tables/pedidos`
- **Assets**: `css/style.css`, `js/app.js`

### Requisitos do Sistema:
- **Navegador moderno** com suporte à câmera
- **HTTPS** em produção
- **Conexão estável** para MediaPipe CDN
- **Iluminação adequada** para detecção de gestos

---

**Desenvolvido com ☕ e ❤️ para revolucionar a experiência de compra de café!**

*Para dúvidas técnicas ou sugestões, consulte a documentação ou entre em contato.*
