# CicloSmart - Plataforma de Estratégia de Estudos (Neuro-SRS)

![Status](https://img.shields.io/badge/Status-Estável%20(v1.2)-success)
![Versão](https://img.shields.io/badge/Versão-1.2.0-blue)
![Metodologia](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple)

> **Resumo:** Uma Aplicação Web (SPA) que transcende a Repetição Espaçada tradicional. O CicloSmart não apenas agenda revisões, mas gerencia matematicamente a capacidade cognitiva do estudante, impedindo o "Efeito Bola de Neve" através de travas de segurança baseadas em carga horária (Regra 60/40) e compressão temporal de memória.

---

## 🧠 A Ciência por Trás (Neurolearning)

Diferente de sistemas que permitem adicionar conteúdo infinitamente até o colapso do estudante, o CicloSmart opera com dois princípios de neurociência aplicada:

### 1. Protocolo de Compressão Temporal
O sistema entende que **Revisar ≠ Reestudar**.
Ao registrar um tempo de estudo original (ex: 60 min), o algoritmo projeta revisões futuras com carga decrescente, exigindo maior eficiência de recuperação (*Active Recall*):
*   **Estudo Original:** 100% do tempo.
*   **R1 (24h):** 20% do tempo original (Fixação).
*   **R2 (7 dias):** 10% do tempo original (Manutenção).
*   **R3 (30 dias):** 5% do tempo original (Consolidação).

### 2. Guardião de Capacidade (Anti-Bola de Neve)
Para garantir sustentabilidade a longo prazo, o sistema aplica a **Regra 60/40**:
*   **60%** da sua capacidade diária é reservada para Matéria Nova (Aquisição).
*   **40%** é o teto máximo rígido para Revisões (Manutenção).

**O Bloqueio Inteligente:** Se você tentar adicionar uma matéria nova cuja projeção de revisões futuras faria um dia específico ultrapassar o teto de 40%, o sistema **bloqueia a ação** e sugere que você dedique o dia apenas a pagar sua "dívida técnica" de memória.

---

## 🚀 Funcionalidades Chave

### 🛡️ Gestão de Risco
*   **Input de Matéria Nova:** Você informa o tempo de estudo bruto, o sistema calcula a logística.
*   **Simulação Futura:** Antes de salvar, o algoritmo "viaja no tempo" (24h, 7d, 30d) para verificar se o cronograma aguenta a nova carga.
*   **Feedback Visual:** Notificações (Toasts) informam sucesso ou explicam matematicamente o motivo do bloqueio.

### 🌡️ Radar de Carga (Heatmap)
*   Visualização térmica dos próximos 30 dias.
*   Identificação visual de dias de "Gargalo" (onde a revisão está perigosamente alta).

### 📊 Dashboard Kanban Temporal
*   **Atrasados (Backlog):** O que deve ser priorizado antes de estudar coisas novas.
*   **Hoje (Foco):** Meta do dia com barra de progresso em tempo real.
*   **Futuro:** Previsão de vencimentos.

### 💾 Privacidade & Dados
*   **Offline-First:** Tudo é salvo no `LocalStorage` do navegador.
*   **Exportação .ICS:** Gera calendários compatíveis com Google Calendar/Outlook/Apple para levar seu cronograma no bolso.

---

## 🛠 Arquitetura Técnica

Projeto desenvolvido com foco em **Performance** e **Simplicidade de Manutenção**.

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Lógica** | **Vanilla JS (ES6+)** | Algoritmos de compressão e validação de carga. |
| **Estilo** | **Tailwind CSS** | Design responsivo e sistema de cores semântico. |
| **Ícones** | **Lucide Icons** | SVG leves renderizados via JS. |
| **Storage** | **LocalStorage API** | Persistência de dados sem Backend. |

### Estrutura de Arquivos
```text
/
│── index.html      # UI, Modais e Layout
│── logic.js        # Core: Store, Algoritmo SRS, Validação 40/60
│── style.css       # Animações (Toasts) e Scrollbars
└── README.md       # Documentação Estratégica
```

---

## 📦 Como Usar

1.  **Defina sua Capacidade:** No menu "Radar de Carga", configure quantos minutos líquidos você tem por dia (ex: 240 min).
2.  **Registre um Estudo:** Clique em "Novo Estudo".
    *   Selecione a matéria.
    *   Insira o tempo gasto aprendendo o conteúdo novo.
3.  **Aguarde a Análise:**
    *   ✅ **Sucesso:** O sistema agendará R1, R2 e R3 com tempos comprimidos.
    *   ⚠️ **Bloqueio:** O sistema avisará que o dia X está cheio e impedirá o agendamento para proteger seu futuro.
4.  **Execute:** Acompanhe o Kanban "Hoje". Marque como feito para liberar espaço na barra de capacidade.

---

## 📝 Histórico de Versões (Changelog)

### v1.2.0 (Atual) - O Salto Estratégico
*   **Novo:** Lógica de **Compressão de Tempo** (20%/10%/5%).
*   **Novo:** **Trava de Segurança 40%** (Impede sobrecarga de revisões).
*   **UX:** Mudança do input para "Tempo de Estudo" (Matéria Nova).
*   **UX:** Sistema de notificações "Toast" para feedback não intrusivo.

### v1.0.1 - Gestão Visual
*   Implementação do Radar de Carga (Heatmap).
*   Configuração dinâmica de minutos diários.

### v1.0.0 - MVP
*   Lógica SRS padrão (24h, 7d, 30d).
*   Persistência LocalStorage.
*   Exportação ICS.

---

**Desenvolvido com foco em eficiência cognitiva.**
```
