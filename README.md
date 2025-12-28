
# HapticBeat Pro 🎵📳

**HapticBeat Pro** é uma aplicação experimental que combina inteligência artificial, teoria musical e feedback tátil para criar uma experiência de jogo única. O objetivo é identificar músicas famosas apenas através de seus padrões rítmicos traduzidos para o motor de vibração do dispositivo.

## 🚀 Funcionalidades

- **Motor de Ritmo IA**: Utiliza o Google Gemini (incluindo modelos de raciocínio avançado) para traduzir hooks musicais em padrões de vibração milimétricos.
- **Acessibilidade Sensorial**: Focado em como sentimos a música, permitindo que usuários experimentem o ritmo de uma forma puramente física.
- **Sintetizador de Impacto**: Integra Web Audio API para simular impactos de bumbo (Kick) e caixa (Snare) que complementam a vibração.
- **Modos de Jogo**:
  - **Solo**: A IA gera desafios baseados em sucessos mundiais.
  - **Duelo Local**: Desafie amigos criando padrões personalizados.
- **Controle de Intensidade**: Ajuste a potência hática para se adequar a diferentes dispositivos.

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Vite.
- **Estilização**: Tailwind CSS.
- **IA**: Google Generative AI (Gemini 2.0 Flash & Thinking).
- **Efeitos**: Canvas Confetti, Web Audio API, Vibration API.

## 📦 Instalação e Uso

1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasrdsved/Cfxbgcc.git
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure sua chave de API do Gemini:
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧠 Arquitetura de Agentes

Este projeto utiliza uma abordagem de "Agente Especialista" para a geração de conteúdo. Para mais detalhes sobre como a IA é instruída e como os agentes operam, veja o arquivo [agents.md](./agents.md).

## 📄 Licença

Este projeto está sob a licença MIT.
