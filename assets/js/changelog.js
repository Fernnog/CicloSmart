/* --- START OF FILE assets/js/changelog.js --- */

const changelogData = [
    // --- VERSÃO 1.2.4 (Fix: Drag-and-Drop & UX Boost) ---
    {
        version: '1.2.4',
        date: 'Hoje',
        changes: [
            '🐛 <strong>Correção Crítica de Drag-and-Drop:</strong> Resolvido o problema onde arrastar um cartão para a coluna "Hoje" mostrava um ícone de bloqueio e falhava. O sistema agora reconhece corretamente todos os cartões.',
            '✨ <strong>Feedback Visual (Hover):</strong> Agora, ao segurar um cartão sobre uma coluna, ela se ilumina em verde (drag-hover), confirmando visualmente que você pode soltar o item ali.',
            '↩️ <strong>Desfazer Ação (Undo):</strong> Arrastou errado? Sem pânico. Uma nova opção "Desfazer" aparece na notificação de sucesso, permitindo reverter a mudança instantaneamente.',
            '🛡️ <strong>Arquitetura Robusta (UUID):</strong> Atualizamos a geração de IDs de novos estudos para o padrão universal UUID, prevenindo erros matemáticos de identificação no futuro.'
        ]
    },
    // --- VERSÃO 1.2.3 (Agendamento Elástico & Drag-and-Drop) ---
    {
        version: '1.2.3',
        date: 'Anterior',
        changes: [
            '🧲 <strong>Agendamento Elástico (Elastic Scheduling):</strong> Agora você pode arrastar estudos de "Futuro" ou "Atrasados" para "Hoje" como uma tentativa bônus.',
            '🛡️ <strong>Proteção de Retorno Automático:</strong> Se você puxar um estudo para hoje (marcado como "⏳ Extra") e não concluí-lo, o sistema devolve ele automaticamente para a data original no dia seguinte. Sem bagunça na agenda!',
            '🖱️ <strong>Kanban Drag-and-Drop:</strong> Interação completa de arrastar e soltar entre as colunas do quadro principal.',
            '✨ <strong>Indicadores Visuais:</strong> Novos badges nos cartões identificam itens emprestados temporariamente.'
        ]
    },
    // --- VERSÃO 1.2.2 (Gamificação & UX) ---
    { 
        version: '1.2.2', 
        date: 'Anterior', 
        changes: [
            '🔥 <strong>Gamificação (Streak):</strong> Novo contador de constância no topo da tela! Uma chama acesa indica quantos dias consecutivos você estudou. O sistema verifica automaticamente seu histórico para manter a chama viva.',
            '✨ <strong>Smart Empty States:</strong> Adeus telas vazias inúteis. As colunas do Kanban agora exibem <strong>Botões de Ação Rápida (CTAs)</strong> quando vazias, permitindo planejar o futuro ou visualizar conquistas com um clique.',
            '🏆 <strong>Feedback de Vitória:</strong> Reforço positivo imediato! Ao completar sua meta diária (zerar a coluna "Hoje"), o sistema exibe uma confirmação visual de sucesso para consolidar a sensação de dever cumprido.'
        ] 
    },
    // --- VERSÃO 1.2.1 (Atualização de Usabilidade) ---
    { 
        version: '1.2.1', 
        date: 'Anterior', 
        changes: [
            '📂 <strong>Organização por Abas:</strong> O menu de Configurações Gerais foi reestruturado. Agora, "Matérias" e "Estratégia" ficam em abas separadas, limpando a visualização e facilitando o acesso rápido ao que importa.',
            '✨ <strong>Feedback Visual no Radar:</strong> A experiência de Drag & Drop ficou mais intuitiva. Ao arrastar um estudo, os dias no gráfico agora "acendem" (iluminam-se) ao passar o mouse, confirmando visualmente o destino antes de soltar.',
            '🖱️ <strong>Estabilidade de Interface:</strong> Refinamento na lógica de arrasto (Drag End) para garantir que os efeitos visuais sejam limpos instantaneamente, mesmo se o usuário cancelar a ação ou soltar o item fora da área válida.'
        ] 
    },
    // --- VERSÃO 1.2.0 ---
    { 
        version: '1.2.0', 
        date: 'Anterior', 
        changes: [
            '🎯 <strong>Feedback Visual de Tarefas (Botão):</strong> O botão "Tarefas" agora exibe dois contadores na base: 🔴 Vermelho para atrasados e 🟢 Verde para pendências em dia. Mais clareza, menos ansiedade!',
            '🖐️ <strong>Reagendamento Interativo (Radar):</strong> Implementada funcionalidade Drag-and-Drop no Heatmap. Arraste um estudo para outra data diretamente no gráfico!',
            '✅ <strong>Validação Inteligente de Reagendamento:</strong> Ao arrastar um estudo, o sistema agora verifica automaticamente:',
            '  * <strong>Cronologia Pedagógica:</strong> Impede que um estudo "ultrapasse" sua próxima revisão programada.',
            '  * <strong>Limite de Capacidade Diária:</strong> Bloqueia o reagendamento se o dia de destino ficar sobrecarregado.',
            '🎨 <strong>Melhorias de UX no Drag & Drop:</strong> O feedback visual foi aprimorado com cursores indicativos e destaque nas zonas de soltura válidas no Heatmap (a ser ativado futuramente).',
            '🐛 <strong>Correção:</strong> Tratamento de casos onde `batchId` ou `cycleIndex` podiam estar ausentes em estudos legados para evitar erros no Drag & Drop e nas validações.'
        ] 
    },
    // --- VERSÕES ANTERIORES ---
    { 
        version: '1.1.9', 
        date: 'Anterior', 
        changes: [
            '🔍 <strong>Radar de Carga HD:</strong> O Heatmap agora é muito mais informativo. Além do número do ciclo (#1), cada cartão exibe o <strong>Tipo de Revisão</strong> (NEW, DEF, 8D, 30D), permitindo antecipar se o dia será de ataque ou defesa.',
            '🖱️ <strong>Tooltip de Raio-X:</strong> Passe o mouse sobre qualquer bloquinho do radar para ver instantaneamente a <strong>Matéria</strong> e o <strong>Tópico</strong> daquele estudo. Zero cliques necessários para lembrar o que está agendado.',
            '🎨 <strong>Micro-Layout:</strong> Ajustes de tipografia e espaçamento para garantir que todas essas informações caibam nos cartões sem poluição visual.'
        ] 
    },
    { 
        version: '1.1.8', 
        date: 'Anterior', 
        changes: [
            '📂 <strong>Reestruturação de Diretórios:</strong> "Faxina" completa na estrutura do projeto. Scripts e imagens foram movidos para pastas dedicadas (`assets/js` e `assets/img`), deixando a raiz da aplicação mais limpa e organizada.',
            '⚙️ <strong>Painel de Configurações Unificado:</strong> O antigo menu de "Matérias" evoluiu. Agora ele é a central de <strong>Configurações Gerais</strong>, onde você gerencia disciplinas, define sua Capacidade Diária, escolhe a Estratégia (Pendular/Integrado) e ajusta o Ciclo.',
            '🎯 <strong>Radar Focado:</strong> O modal de Heatmap (Radar) foi limpo. Removemos os inputs de configuração que poluiam a tela, tornando-o uma ferramenta visual pura para análise de carga e desempenho.',
            '📅 <strong>Acesso Rápido ao Reagendamento:</strong> A ferramenta de "Modo Férias" (Reagendamento em Lote) foi movida para as Configurações Gerais, facilitando o acesso para correções de cronograma.'
        ] 
    },
    { 
        version: '1.1.7', 
        date: 'Anterior', 
        changes: [
            '🗓️ <strong>Raio-X do Calendário (Heatmap Badges):</strong> O Radar deixou de ser apenas visual. Agora, cada dia exibe etiquetas detalhadas com o <strong>número do ciclo (#1, #2...)</strong> e a cor da matéria agendada.',
            '🎨 <strong>Identificação Visual Rápida:</strong> Badges com bordas coloridas permitem saber instantaneamente qual disciplina domina o dia, sem precisar abrir menus.',
            '📜 <strong>Micro-Scroll:</strong> A altura dos cards do calendário foi ajustada e recebeu uma barra de rolagem ultra-fina para acomodar dias com alta carga de estudos sem quebrar o layout.'
        ] 
    },
    { 
        version: '1.1.6', 
        date: 'Anterior', 
        changes: [
            '🌊 <strong>Nivelamento em Cascata (Waterfall):</strong> O sistema de reagendamento agora possui inteligência anti-sobrecarga. Se mover seus atrasados lotar um dia específico, o excedente "transborda" automaticamente para o dia seguinte, criando uma agenda equilibrada.',
            '🔗 <strong>Integridade SRS (Macro Shift):</strong> Agora, ao reagendar um estudo atrasado, o sistema move junto <strong>todas as revisões futuras</strong> conectadas a ele. Isso preserva a distância matemática entre as revisões (Curva de Esquecimento), garantindo que a metodologia não seja quebrada pelo atraso.',
            '🛡️ <strong>Drift Protection:</strong> A lógica foi refinada para tratar grupos de estudo como "vagões de trem": se a locomotiva (estudo base) atrasa, todos os vagões (revisões) mantêm a distância relativa original.'
        ] 
    },
    { 
        version: '1.1.5', 
        date: 'Anterior', 
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
            '🧹 <strong>Limpeza de Interface (Legacy):</strong> A seção de Backup/Restore manual foi removida do menu de Matérias. Com a sincronização automática em Nuvem (Firebase) operando 100%, esses botões antigos tornaram-se desnecessários.'
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
        changes: ['✨ Novo Radar de Carga (Heatmap).', '🎨 Refinamento Visual e Feedback de Conclusão.'] 
    },
    { 
        version: '1.0.0', 
        date: 'Legacy', 
        changes: ['Persistência LocalStorage', 'Algoritmo SRS Básico'] 
    }
];
