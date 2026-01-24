# 🧠 CicloSmart | Plataforma de Estratégia de Estudos (Neuro-SRS)

![Version](https://img.shields.io/badge/Versão-1.3.4-blue?style=for-the-badge&logo=git)
![Status](https://img.shields.io/badge/Status-Produção-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-VanillaJS%20%7C%20Tailwind%20%7C%20Firebase-orange?style=for-the-badge)
![Methodology](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple?style=for-the-badge)

> **CicloSmart** é uma Aplicação Web Progressiva (PWA) de alta performance projetada para estudantes de alto rendimento. Diferente de agendas comuns, ela gerencia matematicamente a **capacidade cognitiva**, impedindo o acúmulo de revisões ("Efeito Bola de Neve") e otimizando a memória de longo prazo através de algoritmos de Repetição Espaçada (SRS) com compressão temporal.

---

## 📚 Sumário
1. [Filosofia e Metodologia](#-filosofia-e-metodologia)
2. [Funcionalidades Principais](#-funcionalidades-principais)
3. [Arquitetura Técnica](#-arquitetura-técnica)
4. [Instalação e Configuração](#-instalação-e-configuração)
5. [Guia de Uso (Fluxo de Trabalho)](#-guia-de-uso-fluxo-de-trabalho)
6. [Histórico de Versões](#-histórico-de-versões)

---

## 🧬 Filosofia e Metodologia

O sistema opera baseando-se em três pilares da neurociência aplicada ao aprendizado:

### 1. Protocolo de Compressão Temporal (SRS)
O sistema entende que **Revisar ≠ Reestudar**.
- O tempo alocado para revisões decai exponencialmente (20% → 10% → 5% do tempo original).
- Isso permite encaixar centenas de tópicos ativos em uma agenda finita.

### 2. Guardião de Capacidade (Anti-Bola de Neve)
Para garantir sustentabilidade a longo prazo, aplicamos a **Regra 60/40**:
- **60%** da capacidade diária focada em Matéria Nova (Ataque).
- **40%** é o teto rígido para Revisões (Defesa).
- **Bloqueio Ativo:** O algoritmo proíbe a adição de novos conteúdos se detectar que isso quebrará sua agenda futura (Burnout Prevention).

### 3. Modulação Pendular (Ataque vs. Defesa)
Alternância estratégica baseada no **Ciclo Circadiano de Aprendizado**:
- **Dias de Ataque:** Foco em aquisição.
- **Dias de Defesa:** Bloqueio de novos conteúdos para consolidação neural (revisões exclusivas).
- **Teto Cognitivo:** Limite de 90min por sessão em modo pendular para manter a plasticidade sináptica.

---

## 🚀 Funcionalidades Principais

### ✅ Gestão de Estudos (Core)
*   **Kanban Temporal:** Visualização dividida em "Atrasados", "Meta de Hoje" e "Futuro".
*   **Smart Cycle:** Identificação automática do dia do ciclo (#1, #2...) e alternância automática entre modos de Ataque/Defesa baseada na constância do usuário.
*   **Controle de Integridade:** Algoritmo que detecta e repara "ciclos quebrados" ou numerações duplicadas.

### 📊 Radar de Carga (Heatmap Interativo) **(NOVO v1.2.0)**
*   **Visualização de Densidade:** Cores indicam o nível de ocupação de cada dia futuro (Leve, Moderado, Pesado).
*   **Reagendamento Tático (Drag-and-Drop):** Arraste estudos visualmente para remanejar sua agenda.
    *   *Travas de Segurança:* O sistema impede que você arraste um estudo para uma data posterior à sua próxima revisão (preservando a cronologia pedagógica) ou para um dia já lotado.

### 📋 Side-Quests (Gestão Logística) **(ATUALIZADO v1.2.0)**
*   **Badges de Status:** Feedback visual imediato no botão principal mostrando separadamente pendências (Vermelho) e tarefas em dia (Verde).
*   **Contraste Adaptativo (YIQ):** Cálculo automático de cor da fonte (preto/branco) baseado na cor da matéria.

### 📅 Integração e Exportação
*   **Smart Export (.ICS):** Gera arquivos de calendário compatíveis com Google/Outlook/Apple, com empilhamento sequencial e pausas automáticas (Modo Humano).
*   **Cloud Sync:** Sincronização em tempo real via Firebase Realtime Database.

---

## 🛠 Arquitetura Técnica

O projeto segue uma arquitetura **MVC Desacoplada** com **Observer Pattern** para reatividade, garantindo manutenção e escalabilidade.

### Estrutura de Arquivos

| Camada | Arquivo | Responsabilidade |
| :--- | :--- | :--- |
| **Model / Store** | `assets/js/core.js` | Fonte da verdade. Gerencia o Estado Global (`store`), Regras de Negócio, Persistência (Local/Cloud) e Sistema de Eventos (Observer). |
| **Controller** | `assets/js/controller.js` | Cérebro da aplicação. Intercepta ações do usuário, valida regras complexas (ex: validação de Drag-and-Drop) e orquestra atualizações. |
| **View** | `assets/js/view.js` | Manipulação pura do DOM. Renderiza HTML, gerencia modais e atualiza a UI baseada nos dados do Store. |
| **Styles** | `style.css` | Customizações sobre Tailwind CSS, animações e lógica de responsividade avançada. |
| **Entry Point** | `index.html` | Estrutura semântica, importação de módulos e Configuração do Firebase. |

### Fluxo de Dados (Reatividade)
1.  O usuário interage (ex: Marca uma tarefa como feita).
2.  O `Controller` chama um método no `Core` (`store.toggleStatus`).
3.  O `Core` atualiza o estado e salva (Local + Nuvem).
4.  O `Core` dispara um evento `notify()`.
5.  A `View` (inscrita como ouvinte) re-renderiza automaticamente as listas e os badges afetados.

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
*   Um servidor web simples (ex: Live Server do VSCode, Python SimpleHTTP ou hospedagem estática como Vercel/Netlify).
*   Uma conta no Google Firebase (para sincronização em nuvem).

### Passo a Passo

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/seu-usuario/ciclosmart.git
    cd ciclosmart
    ```

2.  **Configurar Firebase:**
    *   Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
    *   Habilite o **Authentication** (Email/Password).
    *   Habilite o **Realtime Database**.
    *   Copie suas chaves de configuração.
    *   Abra o arquivo `index.html` e substitua o objeto `firebaseConfig`:
    ```javascript
    const firebaseConfig = {
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_PROJECT.firebaseapp.com",
      databaseURL: "SEU_REALTIME_DB_URL",
      projectId: "SEU_PROJECT_ID",
      // ...
    };
    ```

3.  **Executar:**
    *   Abra o arquivo `index.html` através do seu servidor local.
    *   **Nota:** Devido aos módulos ES6 e CORS, abrir o arquivo diretamente (file://) **não funcionará**.

---

## 🎮 Guia de Uso (Fluxo de Trabalho)

1.  **Setup Inicial (Radar):**
    *   Defina sua **Capacidade Diária** (ex: 240 min).
    *   Cadastre suas Matérias e cores nas Configurações.

2.  **Registro de Estudo (Input):**
    *   Clique em "Novo Estudo".
    *   Se estiver em **Modo Ataque**, registre o que estudou hoje.
    *   Se estiver em **Modo Defesa**, planeje o estudo de amanhã (o sistema protege o dia atual para revisões).

3.  **Gestão Diária (Kanban):**
    *   Foque na coluna **"Meta de Hoje"**.
    *   Use o **Radar** para visualizar dias futuros. Se um dia estiver vermelho (sobrecarregado), arraste cartões para dias vizinhos mais leves.

4.  **Logística (Tarefas):**
    *   Fique de olho nos **Badges** do botão de Tarefas.
    *   🔴 Vermelho = Atraso (Resolva imediatamente).
    *   🟢 Verde = Em dia (Planejamento futuro).

---

## 📜 Histórico de Versões

### v1.2.0 - Tactical Update (Atual)
*   **Feat:** Reagendamento Drag-and-Drop no Radar com validação de cronologia e capacidade.
*   **UX:** Novos Badges Duplos (Atraso/Ok) no botão de Tarefas.
*   **Core:** Refinamento da validação de integridade de ciclos.

### v1.1.0 - Architecture Update
*   **Core:** Refatoração completa para arquitetura MVC desacoplada.
*   **Feat:** Flexibilização do Modo Defesa para planejamento futuro.

### v1.0.0 - MVP
*   Lançamento com algoritmo SRS, Travas de Segurança e Integração Firebase.

---

**Desenvolvido para Performance Cognitiva.**
