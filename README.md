# CicloSmart | Plataforma de Estratégia de Estudos (Neuro-SRS)

![Status](https://img.shields.io/badge/Status-Estável%20(v1.0.7)-success)
![Versão](https://img.shields.io/badge/Versão-1.0.7-blue)
![Metodologia](https://img.shields.io/badge/Método-Fluxo%20Anti--Bola%20de%20Neve-purple)
![UX](https://img.shields.io/badge/UX-Smart%20Grid-orange)

> **Resumo:** Uma Aplicação Web (SPA) de alta performance que transcende a Repetição Espaçada tradicional. O CicloSmart gerencia matematicamente a capacidade cognitiva do estudante, impedindo o "Efeito Bola de Neve" através de travas de segurança (Regra 60/40) e adapta a interface dinamicamente para reduzir a carga visual (**Modo Zen**).

---

## 🧠 A Ciência por Trás (Neurolearning)

Diferente de sistemas que permitem adicionar conteúdo infinitamente até o colapso do estudante, o CicloSmart opera com princípios de neurociência e ergonomia cognitiva:

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
* **Bloqueio:** Se uma nova matéria projetar uma carga futura que estoure esse teto, o sistema bloqueia a ação.

---

## 🚀 Funcionalidades Chave (v1.0.7)

### 🎨 UX & Design Cognitivo (Novo)
* **Smart Grid (Modo Zen):** A interface "respira" com você. Se não houver pendências na coluna "Atrasados", o painel se recolhe automaticamente, expandindo a área de "Meta de Hoje" para maximizar seu foco e reduzir a ansiedade.
* **Contexto Visual Semântico:** Cores de fundo ultra-suaves (tons pastéis) diferenciam as zonas temporais instintivamente:
    * 🟥 **Atrasados:** Vermelho suave (Alerta/Ação necessária).
    * ⬜ **Hoje:** Branco puro (Foco total/Zona de Trabalho).
    * 🟦 **Futuro:** Azul suave (Planejamento/Visão fria).

### 🛡️ Gestão de Estratégia
* **Modo Pendular (Ataque/Defesa):** Perfil opcional que alterna dias de estudo puro (Ataque) e dias exclusivos de revisão (Defesa), com teto de 90min para sessões intensas.
* **Indexação de Ciclo:** Cada estudo recebe um ID sequencial (Dia #1, Dia #2...) relativo ao seu ciclo de 30 dias, facilitando a organização de cadernos físicos.

### 💾 Segurança de Dados & Conectividade
* **Backup & Restore (JSON):** Exportação completa do banco de dados local para segurança. A restauração substitui inteligentemente os dados atuais.
* **Exportação .ICS:** Integração nativa com Google Calendar, Outlook e Apple Calendar.
* **Offline-First:** Dados operam 100% no navegador (LocalStorage), garantindo privacidade e velocidade instantânea.

### 📊 Dashboard Kanban Temporal
* **Atrasados (Backlog):** O que deve ser priorizado.
* **Hoje (Foco):** Meta do dia com barra de progresso em tempo real.
* **Futuro:** Previsão de vencimentos.
* **Radar de Carga (Heatmap):** Visualização térmica dos próximos 30 dias para identificar gargalos.

---

## 🛠 Arquitetura Técnica

Projeto desenvolvido com foco em **Performance**, **Manutenibilidade** e **Zero Dependências de Backend**.

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Lógica Core** | **Vanilla JS (ES6+)** | Algoritmos SRS, Validação 40/60, Smart Cycle e Manipulação de DOM. |
| **Interface** | **HTML5 + Tailwind CSS** | Layout responsivo, Grid System dinâmico e Animações CSS. |
| **Dados** | **JSON / LocalStorage** | Persistência local e versionamento de esquema. |
| **Ícones** | **Lucide Icons** | Biblioteca leve de ícones vetoriais. |

### Estrutura de Arquivos
```text
/
│── index.html      # UI: Estrutura, Modais e Layout Smart Grid
│── logic.js        # Controller: Lógica de SRS, Gestão de Estado (Store) e Renderização
│── changelog.js    # Dados: Histórico de Versões e Notas de Atualização
│── style.css       # Estilo: Animações, Cores Customizadas e Scrollbars
└── README.md       # Documentação Técnica e Estratégica
````

-----

## 📦 Guia de Uso Rápido

1.  **Configuração Inicial:**

      * Abra o menu "Radar" (ícone de gráfico).
      * Defina sua **Capacidade Diária** (minutos líquidos).
      * Escolha seu **Perfil** (Integrado ou Pendular).

2.  **Fluxo Diário:**

      * Verifique a coluna **"Atrasados"**. Se estiver vazia, o painel estará recolhido (Modo Zen).
      * Concentre-se na coluna **"Meta de Hoje"**.
      * Para adicionar matéria nova, clique em **"Novo Estudo"**. O sistema calculará automaticamente as revisões (24h/7d/30d).

3.  **Segurança:**

      * Acesse o menu de **Matérias** (ícone de engrenagem).
      * Clique em **Backup** semanalmente para baixar seu arquivo `.json`.

-----

## 📝 Histórico de Versões Recentes

### v1.0.7 - Refinamento Cognitivo

  * **Smart Grid:** Colapso automático de colunas vazias.
  * **UI:** Aplicação de paleta de cores contextual (Pastel Tones).

### v1.0.6 - Organização Física

  * **Indexação:** Numeração sequencial de dias do ciclo (\#1...\#30).

### v1.0.5 - Inteligência Temporal

  * **Smart Cycle:** Detecção automática de dias de descanso para resetar o modo Ataque/Defesa.

### v1.0.0 a v1.0.4 - Fundação

  * Algoritmo SRS, Modais, Backup System e Travas de Segurança.

-----

**Desenvolvido para máxima eficiência cognitiva.**
