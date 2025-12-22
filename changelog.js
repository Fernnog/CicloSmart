/* --- START OF FILE changelog.js --- */

const changelogData = [
    { 
        version: '1.1.5', 
        date: 'Hoje', 
        changes: [
            '🗓️ <strong>Reagendamento Inteligente (Modo Férias):</strong> Nova ferramenta localizada no menu Radar/Configurações. Ideal para retomar os estudos após dias parados ou imprevistos.',
            '⏩ <strong>Cálculo de Delta (Ajuste em Lote):</strong> O sistema detecta automaticamente seu estudo mais atrasado e empurra todas as pendências passadas para a data de retomada escolhida, preservando matematicamente os intervalos originais entre as revisões.',
            '🛡️ <strong>Proteção de Escopo:</strong> A lógica foi refinada para afetar <strong>apenas o passivo (atrasados)</strong>. Seus estudos agendados para "Hoje" e para o futuro permanecem intocados, evitando bagunçar seu planejamento atual.'
        ] 
    },
    { 
        version: '1.1.4', 
        date: 'Anterior', 
        changes: [
            '🧠 <strong>Arquitetura Reativa (Observer):</strong> O núcleo do sistema agora é "autociente". Qualquer alteração nos dados atualiza automaticamente a interface (ícones e listas) sem recarregamentos manuais.',
            '📂 <strong>Ordenação Inteligente:</strong> O painel de Tarefas agora agrupa itens em <strong>🚨 Atrasados</strong>, <strong>⭐ Foco Hoje</strong> e <strong>📅 Futuro</strong>, facilitando a priorização.',
            '🗣️ <strong>Datas em Linguagem Natural:</strong> O sistema agora exibe "Hoje", "Amanhã" ou "Ontem" nas datas das tarefas para reduzir a carga cognitiva.'
        ] 
    },
    { 
        version: '1.1.3', 
        date: 'Anterior', 
        changes: [
            '🔴 <strong>Feedback Visual em Tempo Real (Observer):</strong> O ícone de alerta de tarefas (ponto vermelho) foi reescrito usando arquitetura reativa. Agora ele apaga ou acende instantaneamente ao editar uma tarefa, sem precisar recarregar.',
            '🗓️ <strong>Datas Humanizadas:</strong> A lista de tarefas ficou mais inteligente. Em vez de apenas datas numéricas, o sistema agora exibe <strong>"Hoje"</strong>, <strong>"Amanhã"</strong> ou <strong>"Ontem"</strong> para facilitar seu planejamento.',
            '🧹 <strong>Limpeza de Interface (Legacy):</strong> A seção de Backup/Restaurar manual foi removida do menu de Matérias. Com a sincronização automática em Nuvem (Firebase) operando 100%, esses botões antigos tornaram-se desnecessários.'
        ] 
    },
    { 
        version: '1.1.2', 
        date: 'Anterior', 
        changes: [
            '👤 <strong>Menu de Usuário Unificado:</strong> O formulário de login antigo foi substituído por um <strong>Botão de Perfil Inteligente</strong>. Ele economiza espaço no cabeçalho e resolve definitivamente os problemas de clique em dispositivos móveis.',
            '🎨 <strong>Feedback Visual de Status:</strong> Agora o ícone do usuário muda de cor! <strong>Borda Verde</strong> indica que você está conectado e sincronizando; <strong>Cinza</strong> indica que você está offline/deslogado.',
            '🔥 <strong>Correção Crítica de Nuvem:</strong> Solução definitiva para o erro de conexão com o <strong>Firebase Realtime Database</strong>. A persistência dos seus estudos na nuvem agora está 100% operacional.'
        ] 
    },
    { 
        version: '1.1.1', 
        date: 'Anterior', 
        changes: [
            '☁️ <strong>Cloud Sync (Sincronização em Nuvem):</strong> Adeus, perda de dados! Integração completa com <strong>Firebase Realtime Database</strong>. Seus estudos agora ficam salvos na nuvem, permitindo acesso simultâneo via celular e computador.',
            '🔐 <strong>Autenticação Integrada:</strong> Novo painel de login minimalista no cabeçalho. Crie sua conta com e-mail e senha para garantir que seu progresso sobreviva à limpeza de cache do navegador.',
            '⚡ <strong>Arquitetura Híbrida & Event-Driven:</strong> O núcleo do sistema foi reescrito para eliminar "Race Conditions" (erros de carregamento). O App agora gerencia inteligentemente o estado offline (Local Storage) e online (Firebase) sem travamentos.'
        ] 
    },
    { 
        version: '1.1.0', 
        date: 'Anterior', 
        changes: [
            '🔓 <strong>Planejamento no Modo Defesa:</strong> A "trava" evoluiu. Agora você pode abrir o menu de Novo Estudo em dias de Defesa para <strong>agendar datas futuras</strong>. A proteção continua ativa: o sistema bloqueia apenas registros para "Hoje", garantindo o foco na revisão.',
            '⚡ <strong>Refatoração de Arquitetura:</strong> O código principal (`logic.js`) foi desacoplado em camadas de Dados (`core.js`) e Aplicação (`app.js`). Isso aumenta a robustez do sistema e facilita a manutenção futura.',
            '📅 <strong>UX Inteligente:</strong> Ao abrir um novo estudo em dia de Defesa, o sistema sugere automaticamente a data de amanhã para agilizar seu fluxo de exportação de calendário.'
        ] 
    },
    { 
        version: '1.0.9', 
        date: 'Anterior', 
        changes: [
            '📋 <strong>Side-Quests (Tarefas Extras):</strong> Novo gerenciador para atividades de apoio (ex: ler edital, fazer inscrição). Organize pendências que não exigem cronômetro direto no app.',
            '🎨 <strong>Contraste Adaptativo:</strong> Inteligência visual que calcula matematicamente se o texto do card deve ser Preto ou Branco, garantindo leitura perfeita em qualquer cor de matéria.',
            '💾 <strong>Backup Expandido:</strong> A arquitetura de dados foi atualizada. Ao baixar seu backup .JSON, suas tarefas complementares agora são salvas junto com seus estudos.'
        ] 
    },
    { 
        version: '1.0.8', 
        date: 'Anterior', 
        changes: [
            '📅 <strong>Smart Export (Exportação 2.0):</strong> Nova central de agendamento. Defina datas (Hoje/Amanhã) e horário de início antes de exportar.',
            '⏱️ <strong>Empilhamento Sequencial:</strong> O algoritmo organiza seus estudos um após o outro automaticamente, baseando-se na duração real de cada card.',
            '☕ <strong>Modo Humano (Pausas):</strong> Nova opção para inserir automaticamente 10min de intervalo entre sessões de estudo no seu calendário.'
        ] 
    },
    { 
        version: '1.0.7', 
        date: 'Anterior', 
        changes: [
            '✨ <strong>Smart Grid (Modo Zen):</strong> O painel de "Atrasados" agora se recolhe automaticamente quando você zera as pendências, liberando 50% da tela para suas metas do dia.',
            '🎨 <strong>Contexto Visual Sutil:</strong> Aplicação de cores de fundo ultra-leves (Pastel) para diferenciar instintivamente os contextos: Alerta (Atrasos), Foco (Branco) e Planejamento (Azul).'
        ] 
    },
    { 
        version: '1.0.6', 
        date: 'Anterior', 
        changes: [
            '🔢 <strong>Indexação de Ciclo (1-30):</strong> Cada novo estudo agora recebe um número (#1, #2...) baseado no dia do seu ciclo de 30 dias. Ideal para organizar anotações físicas.',
            '⚙️ <strong>Controle de Versão Dinâmico:</strong> O número da versão no topo e no título da página agora é atualizado automaticamente por este arquivo.',
            '📅 <strong>Configuração de Ciclo:</strong> Novo campo nas configurações (Radar) para definir ou resetar a data de início do seu ciclo pessoal.'
        ] 
    },
    { 
        version: '1.0.5', 
        date: 'Legacy', 
        changes: [
            '🧠 <strong>Smart Cycle (IA):</strong> O sistema agora tem memória! Se você estudou matéria nova ontem, o app inicia automaticamente em 🛡️ <strong>Modo Defesa</strong> hoje.',
            '🔄 <strong>Auto-Recuperação:</strong> Se você ficar 2 dias ou mais sem estudar, o sistema entende o descanso e libera o ⚔️ <strong>Modo Ataque</strong> automaticamente.',
            '💾 <strong>Persistência Avançada:</strong> Ocorrências de estudo (ataque) agora são salvas separadamente para alimentar a inteligência do ciclo.'
        ] 
    },
    { 
        version: '1.0.4', 
        date: 'Legacy', 
        changes: [
            '⚔️ <strong>Modo Pendular (HUD):</strong> Novo indicador visual no topo (Espada/Escudo) para alternar entre dias de Ataque e Defesa.',
            '🛡️ <strong>Trava de Disciplina:</strong> O botão "Novo Estudo" agora é bloqueado fisicamente em dias de Defesa para forçar a consolidação da memória.',
            '🧠 <strong>Feedback Educativo:</strong> Alertas inteligentes explicam por que o bloqueio ocorreu, reforçando a metodologia.'
        ] 
    },
    { 
        version: '1.0.3', 
        date: 'Legacy', 
        changes: [
            '💾 <strong>Backup & Restore:</strong> Funcionalidade de exportar e importar dados (JSON) para segurança.',
            '📦 <strong>Refatoração:</strong> Separação do histórico de versões em arquivo dedicado.'
        ] 
    },
    { 
        version: '1.0.2', 
        date: 'Legacy', 
        changes: [
            '🛡️ <strong>Trava de Segurança (40/60):</strong> Bloqueio automático de novos estudos se a carga de revisão futura exceder 40% da capacidade.',
            '📉 <strong>Compressão Temporal:</strong> Tempo de revisão calculado automaticamente (20%/10%/5%) baseado no tempo de estudo original.',
            '🔔 <strong>Notificações Inteligentes:</strong> Feedback visual (Toasts) para ações e bloqueios.'
        ] 
    },
    { 
        version: '1.0.1', 
        date: 'Legacy', 
        changes: [
            '✨ Novo Radar de Carga (Heatmap).',
            '🎨 Refinamento Visual e Feedback de Conclusão.'
        ] 
    },
    { 
        version: '1.0.0', 
        date: 'Legacy', 
        changes: ['Persistência LocalStorage', 'Algoritmo SRS Básico'] 
    }
];
