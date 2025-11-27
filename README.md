# CicloSmart | Plataforma de Estratégia de Estudos (Neuro-SRS)

![Status](https://img.shields.io/badge/Status-Estável%20(v1.1.0)-success)
![Versão](https://img.shields.io/badge/Versão-1.1.0-blue)
![Metodologia](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple)
![Arquitetura](https://img.shields.io/badge/Arquitetura-Decoupled%20(Core%2FApp)-orange)

> **Resumo:** Uma Aplicação Web (SPA) de alta performance que transcende a Repetição Espaçada tradicional. O CicloSmart gerencia matematicamente a capacidade cognitiva do estudante, impedindo o "Efeito Bola de Neve" através de travas de segurança (Regra 60/40) e integra gestão de logística de estudos (**Side-Quests**) para liberar a memória de trabalho.

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

### 3. Modulação Pendular (Ataque vs. Defesa)
Alternância estratégica entre dias de aquisição de conteúdo (Ataque) e dias de consolidação exclusiva (Defesa), respeitando o limite cognitivo de 90 minutos por sessão em alta performance.

---

## 🚀 Funcionalidades Chave (v1.1.0)

### 🔓 Planejamento Flexível (Agendamento Defensivo) **(NOVO)**
A partir da v1.1.0, o **Modo Defesa** evoluiu.
*   **Antes:** O botão "Novo Estudo" era bloqueado fisicamente.
*   **Agora:** O botão é liberado para permitir **planejamento futuro**.
*   **Regra:** O sistema continua bloqueando a inserção de estudos para "Hoje" (mantendo a disciplina de revisão), mas permite agendar estudos para "Amanhã" ou datas posteriores, facilitando a exportação para o Google Calendar.

### 📋 Gestão de Atividades Complementares (Side-Quests)
Um gerenciador Kanban simplificado para tarefas que não envolvem cronômetro de estudo.
*   **Contraste Adaptativo (YIQ):** Algoritmo que calcula a luminosidade da cor da matéria e define automaticamente se o texto deve ser Preto ou Branco.
*   **Alertas de Prazo:** Indicadores visuais pulsantes para tarefas atrasadas.

### 📅 Smart Export 2.0 (Integração de Agenda)
Exportação avançada para Google Calendar/Outlook/Apple (.ICS).
*   **Empilhamento Sequencial:** O algoritmo organiza os estudos sequencialmente na agenda.
*   **Modo Humano:** Opção para inserir intervalos automáticos de 10 minutos.

---

## 💾 Arquitetura Técnica & Segurança

Projeto desenvolvido com foco em **Performance**, **Privacidade** e **Manutenibilidade**. Na versão 1.1.0, a aplicação sofreu uma refatoração estrutural importante.

| Camada | Arquivo | Responsabilidade |
| :--- | :--- | :--- |
| **Dados (Core)** | `core.js` | Gerencia o Estado (Store), Regras de Negócio, Backup/Restore e Utilitários. Independente da UI. |
| **Aplicação (App)** | `app.js` | Controlador de Interface, Renderização de HTML, Manipulação de DOM e Eventos. |
| **Estilo** | `style.css` | Tailwind CSS via CDN + Customizações de Scroll e Animações. |
| **Histórico** | `changelog.js` | Fonte de verdade para o controle de versões. |

### Estrutura de Dados (JSON Backup)
O arquivo de backup contém:
*   `reviews`: O histórico de estudos e revisões agendadas.
*   `tasks`: O array de atividades complementares.
*   `subjects`: As matérias e suas cores.
*   `profile`: Configurações (Capacidade, Modo Pendular, Datas de Ciclo).

-----

## 📦 Guia de Uso Rápido

1.  **Configuração Inicial:**
      * Abra o menu "Radar" e defina sua capacidade diária.
      * Crie suas matérias no menu de Configurações.

2.  **Fluxo de Estudo (Timer & Planejamento):**
      * Clique em "Novo Estudo".
      * Se estiver em **Modo Defesa**, use esta janela para planejar o estudo de *Amanhã* (o sistema bloqueará a data de *Hoje* para proteger sua revisão).

3.  **Fluxo Logístico (Tarefas):**
      * Use o ícone de **Prancheta** para gerenciar pendências administrativas (inscrições, leituras extras).

4.  **Segurança:**
      * Faça **Backup** semanalmente. O arquivo gerado contém todo o seu progresso.

-----

## 📝 Histórico de Versões

### v1.1.0 - Flexibilidade & Robustez
*   **Core:** Refatoração completa (`logic.js` dividido em `core.js` e `app.js`).
*   **UX:** Desbloqueio do menu "Novo Estudo" no Modo Defesa para permitir agendamentos futuros (exportação de agenda).
*   **Feature:** Sugestão automática de data (D+1) ao abrir modal em dias de bloqueio.

### v1.0.9 - Gestão Holística
*   **Feature:** Side-Quests (Gerenciador de Tarefas Complementares).
*   **UX:** Algoritmo de Contraste YIQ.
*   **Core:** Backup expandido.

### v1.0.8 - Smart Export
*   **Feature:** Exportação .ICS com empilhamento sequencial.

### v1.0.7 - Refinamento Cognitivo
*   **UX:** Smart Grid e paleta Pastel.

### v1.0.6 - Organização Física
*   **Core:** Indexação sequencial de dias do ciclo (#1...#30).

### v1.0.0 a v1.0.5 - Fundação
*   Algoritmo SRS, Smart Cycle (IA), Travas de Segurança (60/40) e Modo Pendular.

-----

**Desenvolvido para máxima eficiência cognitiva.**
