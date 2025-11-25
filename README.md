# CicloSmart - Plataforma de Estratégia de Estudos (Neuro-SRS)

![Status](https://img.shields.io/badge/Status-Estável%20(v1.3)-success)
![Versão](https://img.shields.io/badge/Versão-1.3.0-blue)
![Metodologia](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple)

> **Resumo:** Uma Aplicação Web (SPA) que transcende a Repetição Espaçada tradicional. O CicloSmart gerencia matematicamente a capacidade cognitiva do estudante, impedindo o "Efeito Bola de Neve" através de travas de segurança (Regra 60/40), compressão temporal de memória e **agora conta com sistema completo de Backup e Restauração de dados**.

---

## 🧠 A Ciência por Trás (Neurolearning)

Diferente de sistemas que permitem adicionar conteúdo infinitamente até o colapso do estudante, o CicloSmart opera com dois princípios de neurociência aplicada:

### 1. Protocolo de Compressão Temporal
O sistema entende que **Revisar ≠ Reestudar**.
Ao registrar um tempo de estudo original (ex: 60 min), o algoritmo projeta revisões futuras com carga decrescente:
* **Estudo Original:** 100% do tempo.
* **R1 (24h):** 20% do tempo original (Fixação).
* **R2 (7 dias):** 10% do tempo original (Manutenção).
* **R3 (30 dias):** 5% do tempo original (Consolidação).

### 2. Guardião de Capacidade (Anti-Bola de Neve)
Para garantir sustentabilidade a longo prazo, o sistema aplica a **Regra 60/40**:
* **60%** da sua capacidade diária é reservada para Matéria Nova (Aquisição).
* **40%** é o teto máximo rígido para Revisões (Manutenção).

**O Bloqueio Inteligente:** Se você tentar adicionar uma matéria nova cuja projeção de revisões futuras faria um dia específico ultrapassar o teto de 40%, o sistema **bloqueia a ação** e sugere estratégias alternativas.

---

## 🚀 Funcionalidades Chave

### 🛡️ Gestão de Risco & Carga
* **Input de Matéria Nova:** Você informa o tempo de estudo bruto, o sistema calcula a logística.
* **Simulação Futura:** O algoritmo "viaja no tempo" (24h, 7d, 30d) para verificar a viabilidade da nova carga.
* **Radar de Carga (Heatmap):** Visualização térmica dos próximos 30 dias para identificar gargalos.

### 💾 Segurança de Dados (Novo na v1.3)
* **Backup (Exportar JSON):** Baixe um arquivo completo com todo seu histórico e configurações. Ideal para prevenir perda de dados ao limpar o navegador.
* **Restauração:** Importe seu arquivo de backup para retomar os estudos exatamente de onde parou.
* **Offline-First:** Dados operam localmente no navegador, garantindo privacidade total.

### 📊 Dashboard Kanban Temporal
* **Atrasados (Backlog):** O que deve ser priorizado.
* **Hoje (Foco):** Meta do dia com barra de progresso em tempo real.
* **Futuro:** Previsão de vencimentos.

### 🗓️ Conectividade
* **Exportação .ICS:** Gera calendários compatíveis com Google Calendar/Outlook/Apple.

---

## 🛠 Arquitetura Técnica

Projeto desenvolvido com foco em **Performance** e **Simplicidade de Manutenção**.

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Lógica Core** | **Vanilla JS (ES6+)** | Algoritmos SRS, Validação 40/60 e Gestão de Store. |
| **Dados Estáticos** | **JSON / JS Object** | Histórico de versões desacoplado da lógica. |
| **Estilo** | **Tailwind CSS** | Design responsivo e sistema de cores semântico. |
| **Storage** | **LocalStorage API** | Persistência de dados sem Backend + Import/Export JSON. |

### Estrutura de Arquivos
```text
/
│── index.html      # UI, Modais, Layout e Scripts
│── logic.js        # Core: Store, Algoritmo SRS, Backup System
│── changelog.js    # Dados: Histórico de Versões (Separado na v1.3)
│── style.css       # Animações (Toasts) e Scrollbars
└── README.md       # Documentação Estratégica
````

-----

## 📦 Como Usar

1.  **Defina sua Capacidade:** No menu "Radar de Carga", configure quantos minutos líquidos você tem por dia.
2.  **Registre um Estudo:** Clique em "Novo Estudo", insira a matéria e o tempo gasto.
      * ✅ **Sucesso:** O sistema agenda as revisões comprimidas.
      * ⚠️ **Bloqueio:** O sistema avisa se a ação criar uma "bola de neve" futura.
3.  **Backup Regular:** No menu de Configurações (ícone de engrenagem/matérias), clique em "Backup" semanalmente para salvar seu progresso.

-----

## 📝 Histórico de Versões (Changelog)

### v1.3.0 (Atual) - Segurança e Organização

  * **Novo:** Sistema de **Backup e Restauração** (JSON).
  * **Refatoração:** Separação da lógica de histórico (`changelog.js`) para limpeza de código.

### v1.2.0 - O Salto Estratégico

  * **Novo:** Lógica de **Compressão de Tempo** (20%/10%/5%).
  * **Novo:** **Trava de Segurança 40%** (Impede sobrecarga de revisões).
  * **UX:** Sistema de notificações "Toast".

### v1.0.1 - Gestão Visual

  * Implementação do Radar de Carga (Heatmap).

### v1.0.0 - MVP

  * Lógica SRS padrão e Persistência LocalStorage.

-----

**Desenvolvido com foco em eficiência cognitiva.**

```
```
