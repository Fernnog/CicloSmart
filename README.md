# CicloSmart | Plataforma de Estratégia de Estudos (Neuro-SRS)

![Status](https://img.shields.io/badge/Status-Estável%20(v1.0.9)-success)
![Versão](https://img.shields.io/badge/Versão-1.0.9-blue)
![Metodologia](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple)
![UX](https://img.shields.io/badge/UX-Cognitive%20Offloading-orange)

> **Resumo:** Uma Aplicação Web (SPA) de alta performance que transcende a Repetição Espaçada tradicional. O CicloSmart gerencia matematicamente a capacidade cognitiva do estudante, impedindo o "Efeito Bola de Neve" através de travas de segurança (Regra 60/40) e, a partir da v1.0.9, integra a gestão de logística de estudos (**Side-Quests**) para liberar a memória de trabalho do estudante.

---

## 🧠 A Ciência por Trás (Neurolearning)

O CicloSmart opera com princípios de neurociência e ergonomia cognitiva para maximizar a retenção e minimizar a ansiedade.

### 1. Protocolo de Compressão Temporal (SRS)
O sistema entende que **Revisar ≠ Reestudar**. Ao registrar um tempo de estudo original, o algoritmo projeta revisões futuras com carga decrescente (20% → 10% → 5%), garantindo a fixação sem sobrecarga.

### 2. Guardião de Capacidade (Anti-Bola de Neve)
Para garantir sustentabilidade a longo prazo, o sistema aplica a **Regra 60/40**:
* **60%** da capacidade diária para Matéria Nova (Aquisição).
* **40%** teto rígido para Revisões (Manutenção).
* **Bloqueio:** O sistema impede a adição de novos conteúdos se eles forem estourar sua agenda futura.

### 3. Descarrego Cognitivo (Novo na v1.0.9)
O cérebro humano tem dificuldade em processar retenção de memória (estudo) e gestão de pendências (logística) simultaneamente. 
* **Side-Quests:** O novo módulo de tarefas retira da sua cabeça preocupações como "Ler edital" ou "Comprar caneta", armazenando-as em um sistema externo confiável para que seu foco mental fique 100% no conteúdo.

---

## 🚀 Funcionalidades Chave (v1.0.9)

### 📋 Gestão de Atividades Complementares (Side-Quests) **(NOVO)**
Um gerenciador Kanban simplificado para tarefas que não envolvem cronômetro de estudo.
*   **Contexto Visual:** As tarefas herdam a cor da matéria vinculada para rápida associação mental.
*   **Contraste Adaptativo (YIQ):** Um algoritmo matemático calcula a luminosidade da cor de fundo e define automaticamente se o texto deve ser **Preto** ou **Branco** para leitura perfeita.
*   **Alertas de Prazo:** O ícone no menu principal pulsa sutilmente em vermelho caso haja tarefas atrasadas.

### 📅 Smart Export 2.0 (Integração de Agenda)
Exportação avançada para Google Calendar/Outlook/Apple (.ICS).
*   **Empilhamento Sequencial:** O algoritmo lê a duração de cada card pendente e os agenda um após o outro no seu calendário.
*   **Modo Humano:** Opção para inserir automaticamente intervalos de 10 minutos (pausas cognitivas) entre as sessões geradas.
*   **Filtros Temporais:** Exporte apenas "Hoje", "Amanhã" ou "Tudo".

### 🎨 UX & Design Cognitivo
*   **Smart Grid (Modo Zen):** A interface "respira". Se não houver pendências na coluna "Atrasados", o painel se recolhe automaticamente.
*   **Modo Pendular (Ataque/Defesa):** Perfil estratégico que alterna dias de estudo puro (Ataque) e dias de revisão (Defesa) com teto de 90min.
*   **Indexação de Ciclo:** Numeração sequencial (#1, #2...) relativa ao ciclo de 30 dias para organização de cadernos físicos.

---

## 💾 Segurança de Dados & Arquitetura

Projeto desenvolvido com foco em **Performance**, **Privacidade** e **Zero Dependências de Backend**.

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Store (Estado)** | **Vanilla JS + LocalStorage** | Persistência local criptografada pelo navegador. |
| **Lógica Core** | **JavaScript ES6+** | Algoritmos SRS, Validação 40/60, Smart Cycle, YIQ Contrast. |
| **Interface** | **HTML5 + Tailwind CSS** | Layout responsivo, Grid System dinâmico. |
| **Integração** | **Blob API** | Geração de arquivos .JSON (Backup) e .ICS (Calendário) no cliente. |

### Estrutura de Dados (Backup v1.8)
O sistema de backup foi atualizado na v1.0.9 para garantir integridade total. O arquivo JSON agora contém:
*   `reviews`: O histórico de estudos e revisões agendadas.
*   `tasks`: O array de atividades complementares (Side-Quests).
*   `subjects`: As matérias e suas cores personalizadas.
*   `profile`: Configurações do usuário (Capacidade, Modo Pendular, etc).

-----

## 📦 Guia de Uso Rápido

1.  **Configuração Inicial:**
      * Abra o menu "Radar" (ícone de gráfico) e defina sua capacidade diária.
      * Crie suas matérias no menu de Configurações (ícone de engrenagem).

2.  **Fluxo de Estudo (Timer):**
      * Clique em "Novo Estudo" para registrar sessões focadas. O sistema agendará as revisões.

3.  **Fluxo Logístico (Tarefas):**
      * Clique no ícone de **Prancheta** no topo.
      * Adicione pendências como "Ler PDF Extra" ou "Pagar Inscrição".
      * Defina a data limite. Se vencer, o sistema avisará.

4.  **Segurança:**
      * Faça **Backup** semanalmente no menu de Configurações. O arquivo gerado contém todo o seu progresso.

-----

## 📝 Histórico de Versões

### v1.0.9 - Gestão Holística
*   **Feature:** Side-Quests (Gerenciador de Tarefas Complementares).
*   **UX:** Algoritmo de Contraste de Cores (YIQ) para acessibilidade visual.
*   **Core:** Backup expandido para incluir tarefas no arquivo JSON.

### v1.0.8 - Smart Export
*   **Feature:** Exportação .ICS com empilhamento sequencial de horários.
*   **UX:** Opção de inserir pausas automáticas na agenda.

### v1.0.7 - Refinamento Cognitivo
*   **UX:** Smart Grid (colapso automático de colunas vazias) e paleta Pastel.

### v1.0.6 - Organização Física
*   **Core:** Indexação sequencial de dias do ciclo (#1...#30).

### v1.0.5 - Inteligência Temporal
*   **AI:** Smart Cycle (detecção automática de descanso e reset de ciclo).

### v1.0.0 a v1.0.4 - Fundação
*   Algoritmo SRS, Modais, Backup System e Travas de Segurança (60/40).

-----

**Desenvolvido para máxima eficiência cognitiva.**
```

### 2. Próximos Passos

Agora que a documentação está alinhada com o código, seu projeto está profissional e pronto para ser usado (e entendido) por qualquer pessoa, técnica ou não. A adição das seções sobre "Descarrego Cognitivo" e a explicação do "YIQ" elevam a percepção de qualidade do produto.
