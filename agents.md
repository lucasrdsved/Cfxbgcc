
# Arquitetura de Agentes: HapticBeat Pro 🧠

O HapticBeat Pro não utiliza apenas uma chamada de API comum; ele implementa uma persona de **Agente Especialista** para garantir que os padrões rítmicos gerados sejam musicalmente precisos e fisicamente perceptíveis.

## 🤖 O Agente: Engenheiro de Haptics & Teórico Musical

Este agente é definido através de `systemInstructions` rigorosas no serviço `geminiService.ts`. Sua função é atuar como uma ponte entre a teoria musical abstrata e a engenharia de hardware tátil.

### Perfil do Agente
- **Especialidade**: Teoria Musical, Percussão e Engenharia de Interface Humano-Computador (HCI).
- **Objetivo**: Traduzir o "hook" rítmico mais icônico de uma música para um padrão de vibração (array de milissegundos).
- **Capacidades**:
  - Identificação de padrões de bateria (Kick, Snare, Hi-Hat).
  - Tradução de BPM e groove para intervalos de tempo.
  - Geração de alternativas plausíveis (distratores) para o jogo.

### Regras de Operação (Prompt System)
O agente opera sob um conjunto de regras fixas para garantir a consistência:
1. **KICK (Bumbo)**: Traduzido para 400ms-600ms (sensação de peso).
2. **SNARE (Caixa)**: Traduzido para 150ms-250ms (impacto médio).
3. **HI-HAT (Pratos)**: Traduzido para 50ms-100ms (toques rápidos).
4. **SILÊNCIO**: Intervalos de 200ms-800ms para manter o "groove".

## 🔄 Fluxo de Trabalho do Agente

1. **Recebimento da Query**: O usuário solicita uma música ou a IA escolhe uma aleatoriamente.
2. **Raciocínio Rítmico (Reasoning)**: 
   - Se o modo `useThinking` estiver ativo, o agente utiliza o modelo `gemini-2.0-flash-thinking`.
   - Ele analisa a estrutura da música, identifica o padrão de bateria mais famoso (ex: o "boom-boom-clap" de We Will Rock You) e calcula os milissegundos necessários.
3. **Estruturação de Dados**: O agente formata a resposta seguindo um JSON Schema estrito, garantindo que o frontend receba exatamente o que precisa para o `navigator.vibrate()`.
4. **Validação**: O serviço verifica se o padrão termina em uma pausa para permitir um loop suave durante a experiência do usuário.

## 🛠️ Modelos Utilizados

| Modelo | Uso | Vantagem |
| :--- | :--- | :--- |
| **Gemini 2.0 Flash** | Modo Padrão | Resposta instantânea e baixo custo. |
| **Gemini 2.0 Flash Thinking** | Modo Reasoning | Análise profunda de estruturas rítmicas complexas. |

---

*Este documento detalha como a inteligência artificial é integrada como um componente ativo e especializado dentro do ecossistema do HapticBeat Pro.*
