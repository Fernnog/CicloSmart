# CicloSmart - Plataforma de Gestão de Estudos (SRS)

![Status do Projeto](https://img.shields.io/badge/Status-MVP%20Est%C3%A1vel-success)
![Versão](https://img.shields.io/badge/Versão-1.0.1-blue)
![Stack](https://img.shields.io/badge/Tech-JS%20%7C%20Tailwind%20%7C%20HTML5-orange)

> **Resumo:** Uma Aplicação Web (SPA) focada em otimização de aprendizado através da técnica de **Repetição Espaçada (SRS)**. O sistema automatiza o agendamento de revisões baseadas na Curva de Ebbinghaus, gerencia a capacidade diária de estudo através de mapas de calor (Heatmaps) e oferece feedback visual imediato de progresso.

---

## 🚀 Novidades da Versão 1.0.1
Esta versão foca em **Gestão de Carga** e **Refinamento de UX**:

*   **🌡️ Radar de Carga (Heatmap):** Um novo painel visual que exibe um calendário térmico dos próximos 30 dias.
    *   **Verde:** Dia leve/tranquilo.
    *   **Amarelo:** Carga moderada.
    *   **Preto/Vermelho:** Sobrecarga (alerta de estouro).
*   **⚙️ Capacidade Dinâmica:** O usuário agora pode configurar quantos minutos possui disponíveis por dia, e o sistema recalcula todos os indicadores de saúde do cronograma baseando-se nesse número.
*   **🎨 UI Refinada:** 
    *   Títulos das matérias agora herdam a cor da disciplina para escaneabilidade rápida.
    *   Feedback visual de conclusão: itens feitos ficam riscados (*line-through*) e com opacidade reduzida.
    *   Design de badges neutralizado para reduzir ruído visual.

---

## 🎯 Funcionalidades Core

### 1. 🧠 Motor de Agendamento SRS
Ao registrar um tópico, o sistema projeta automaticamente 3 revisões futuras baseadas na ciência cognitiva:
*   **R1 (24h):** Fixação Imediata.
*   **R2 (7 dias):** Memória de Curto Prazo.
*   **R3 (30 dias):** Consolidação de Longo Prazo.

### 2. 📊 Dashboard Kanban Temporal
Organização visual das tarefas em três colunas críticas (com adaptação Mobile/Desktop):
*   **Atrasados (Backlog):** Itens vencidos (Alerta Vermelho).
*   **Hoje (Foco):** Metas do dia corrente com barra de progresso em tempo real.
*   **Futuro (Forecast):** Visão dos próximos vencimentos.

### 3. 📅 Interoperabilidade (.ICS)
*   Gerador *Client-Side* de arquivos `iCalendar` (RFC 5545).
*   Permite exportar o cronograma para **Google Calendar**, **Outlook** ou **Apple Calendar**.

### 4. 💾 Persistência Local
*   Dados salvos no `LocalStorage` do navegador.
*   Não requer login ou banco de dados externo.

---

## 🛠 Arquitetura Técnica

O projeto segue uma arquitetura **Serverless Client-Side**. Toda a lógica de negócios reside no navegador do usuário.

### Stack Tecnológica
| Componente | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Markup** | **HTML5 Semântico** | Estrutura acessível e organizada. |
| **Estilização** | **Tailwind CSS (CDN)** | Produtividade e consistência visual sem build steps complexos. |
| **Lógica** | **Vanilla JavaScript (ES6+)** | Performance nativa. Zero dependências de frameworks pesados. |
| **Ícones** | **Lucide Icons** | SVG leves e modernos. |

### Estrutura de Arquivos
```text
/
│── index.html      # View: Layout, Modais e Componentes UI
│── logic.js        # Controller/Model: SRS Engine, Store, Heatmap Logic
│── style.css       # Assets: Customizações de Scrollbar e Animações
└── README.md       # Documentação
```

---

## 📦 Como Usar

Não é necessária instalação (npm/yarn). Como o projeto usa CDN para as bibliotecas, basta:

1.  Baixar ou clonar este repositório.
2.  Abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge).
3.  Começar a usar!

---

## 📝 Histórico de Versões (Changelog)

### v1.0.1 (Atual)
*   Implementação do **Modal Radar de Carga**.
*   Lógica de cálculo de porcentagem de ocupação diária.
*   Refinamento visual dos Cards (Cores de matéria e estado 'Checked').
*   Input de configuração de minutos diários.

### v1.0.0
*   Persistência de Dados (LocalStorage).
*   Gestão de Matérias (CRUD básico).
*   Navegação por Abas (Mobile First).

### v0.9.0 (MVP)
*   Lógica SRS (24h, 7d, 30d).
*   Exportação ICS.
*   Layout Básico.

---

**Desenvolvido com foco em produtividade e simplicidade.**
```
