# CicloSmart - Plataforma de Gestão de Estudos (MVP)

![Status do Projeto](https://img.shields.io/badge/Status-MVP%20Concluído-success)
![Versão](https://img.shields.io/badge/Versão-1.2-blue)
![Stack](https://img.shields.io/badge/Tech-JS%20%7C%20Tailwind%20%7C%20HTML5-orange)

> **Resumo:** Uma Aplicação Web (SPA) focada em otimização de aprendizado através da técnica de **Repetição Espaçada (SRS)**. O sistema automatiza o agendamento de revisões baseadas na Curva de Ebbinghaus e gerencia a capacidade diária de estudo do aluno, com suporte a exportação para calendários externos.

---

## 🎯 Proposta de Valor e Funcionalidades

Este repositório contém a implementação do **Relatório de Arquitetura de Solução (SAR v1.2)**. O objetivo é validar a lógica de agendamento e a experiência do usuário (UX) antes de escalar para um backend complexo.

### Funcionalidades Core (Implementadas)

1.  **🧠 Motor de Agendamento SRS (Spaced Repetition System)**
    *   Ao registrar um tópico estudado, o sistema calcula automaticamente 3 revisões futuras:
        *   **R1:** +24 horas (Fixação Imediata).
        *   **R2:** +7 dias (Memória de Curto Prazo).
        *   **R3:** +30 dias (Consolidação de Longo Prazo).

2.  **📅 Gestão de Capacidade (Capacity Planning)**
    *   Algoritmo visual que soma os minutos de todas as tarefas pendentes do dia "Hoje".
    *   **Barra de Progresso Reativa:** Muda de cor (Azul -> Amarelo -> Vermelho) conforme o usuário se aproxima ou excede o limite de 4 horas/dia.

3.  **📊 Dashboard Kanban Temporal**
    *   Organização visual das tarefas em três colunas críticas:
        *   **Atrasados (Backlog):** Itens não cumpridos (Alerta Vermelho).
        *   **Hoje (Foco):** Metas do dia corrente.
        *   **Futuro (Forecast):** Visão dos próximos 7 dias.

4.  **🔄 Interoperabilidade (.ICS Export)**
    *   Gerador *Client-Side* de arquivos `iCalendar` (RFC 5545).
    *   Permite exportar o cronograma para **Google Calendar**, **Outlook** ou **Apple Calendar** com um clique.
    *   Inclui alarmes configurados para 15 minutos antes da tarefa.

---

## 🛠 Arquitetura Técnica

Para este MVP, optou-se por uma arquitetura **Serverless Client-Side**. Isso significa que toda a lógica de negócios roda no navegador do usuário, eliminando a necessidade de configuração de servidores backend para a validação inicial.

### Stack Tecnológica
| Componente | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Markup** | **HTML5 Semântico** | Acessibilidade e estrutura sólida. |
| **Estilização** | **Tailwind CSS (CDN)** | Desenvolvimento rápido de UI moderna sem *build steps* complexos. |
| **Lógica** | **Vanilla JavaScript (ES6+)** | Performance nativa e facilidade de manutenção. Sem frameworks pesados (React/Vue) nesta fase. |
| **Ícones** | **Lucide Icons** | Biblioteca leve e consistente de ícones SVG. |

### Estrutura de Arquivos
```text
/
│── index.html      # Camada de Apresentação (View) - Layout e Componentes UI
│── logic.js        # Camada de Negócio (Controller/Model) - SRS Engine e Store
└── README.md       # Documentação do Projeto
