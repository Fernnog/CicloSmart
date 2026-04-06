/* --- START OF FILE changelog.js --- */

const changelogData = [
    {
        version: '1.3.8',
        date: '06/04/2026',
        changes: [
            '🌴 <b>Pausa Programada (Modo Férias):</b> Precisa de um descanso? Agora você pode congelar sua agenda! Informe a data de início e a duração da pausa, e o sistema empurrará todos os seus estudos para frente automaticamente. O motor inteligente (Waterfall) redistribui a carga para garantir que você não sofra com sobrecarga no dia do seu retorno.',
            '🐛 <b>Correção do Início de Ciclo (Dia #1):</b> O sistema agora respeita rigorosamente o comando de "Novo Ciclo". Resolvemos um comportamento onde revisões futuras projetadas interferiam na contagem matemática, garantindo que sua nova etapa recomece limpa e exatamente a partir do #1.'
        ]
    },
    {
        version: '1.3.7',
        date: '04/02/2025',
        changes: [
            '🛡️ <b>Trava de Qualidade Pedagógica:</b> Adeus revisões de 1 minuto! O sistema agora impõe um tempo mínimo de <b>5 minutos</b> para qualquer revisão. Isso evita a "ilusão de competência" e garante tempo hábil para uma leitura real.',
            '🤖 <b>Feedback Transparente:</b> Ao editar um estudo principal, o sistema agora confirma explicitamente: <i>"Tempos das revisões futuras foram recalculados automaticamente"</i>. Mais segurança para você saber que a matemática foi feita.'
        ]
    },
    {
        version: '1.3.6',
        date: '03/02/2025',
        changes: [
            '✏️ <b>Edição Completa de Estudos:</b> Adeus janelinhas simples! Agora, ao clicar para editar um estudo, um <b>novo painel completo</b> se abre. Você pode corrigir o tópico, ajustar o tempo e, finalmente, <b>trocar a matéria</b> do card. A cor e os metadados se atualizam automaticamente para todo o ciclo.',
            '📦 <b>Arquivamento de Matérias:</b> Limpe sua lista de seleção sem perder dados! Nas configurações, agora você pode clicar no ícone de "olho" para <b>arquivar disciplinas</b> que não está estudando no momento. Elas somem do menu de criação, mas seu histórico permanece intacto.',
            '🎨 <b>Feedback Visual:</b> Matérias arquivadas aparecem com visual diferenciado (riscado/opaco) na lista de configurações para fácil identificação.'
        ]
    },
    {
        version: '1.3.5',
        date: '31/01/2025',
        changes: [
            '✨ <b>Feedback Visual Suave:</b> Implementado um "respiro" intencional (delay de 300ms) ao concluir checklists de estudo. Agora você consegue ver a marcação de "feito" antes que a lista se reorganize, proporcionando uma sensação de conclusão mais satisfatória e natural.',
            '🧹 <b>Padronização Automática de Dados:</b> O motor de limpeza do sistema (Engine) agora normaliza silenciosamente IDs antigos para o novo padrão de texto. Isso garante que todo o histórico de tarefas "fale a mesma língua", prevenindo erros futuros e mantendo o banco de dados robusto.',
            '🛠️ <b>Refinamento de Código:</b> Atualização nos métodos de renderização para suportar interações assíncronas, melhorando a estabilidade da interface durante ações rápidas.'
        ]
    },
    {
        version: '1.3.4',
        date: '27/01/2025',
        changes: [
            '✨ <b>Hub de Conhecimento:</b> Novo campo para vincular links (Google Drive, Notion, PDF) diretamente no formulário de novos estudos.',
            '🔄 <b>Sincronização de Links:</b> Lógica inteligente que replica o link do material para todas as revisões do mesmo ciclo (Batch Update).',
            '📱 <b>UX Mobile:</b> O modal de cadastro agora possui rolagem interna automática para acomodar novos campos sem quebrar o layout em telas menores.',
            '🛠️ <b>Infraestrutura:</b> Atualização no Core para persistência e validação de URLs externas.'
        ]
    },
    {
        version: '1.3.3',
        date: '20/01/2025',
        changes: [
            '🧠 <strong>Fator de Complexidade Cognitiva:</strong> Novo seletor ao criar estudos! Escolha entre <strong>"Normal"</strong> (Fatos/Lei) ou <strong>"Alta"</strong> (Conceitual). O algoritmo SRS agora ajusta a compressão do tempo: tópicos complexos mantêm revisões mais longas (mínimo de 15% do tempo original) para garantir a reconsolidação neural profunda.',
            '🛡️ <strong>Prevenção de Ilusão de Competência:</strong> Seguindo diretrizes neurocientíficas, evitamos que revisões de assuntos difíceis se tornem curtas demais (ex: 3 min), o que gerava falsa sensação de domínio sobre o conteúdo.',
            '✨ <strong>Interface de Decisão Rápida:</strong> Adicionado controle visual simples no formulário de registro para classificar a complexidade do tópico sem atrito.'
        ]
    },
    {
        version: '1.3.2',
        date: 'Anterior',
        changes: [
            '🧹 <strong>Higiene Visual Automática:</strong> A Central de Tarefas agora foca no presente! Checklists de estudos passados ou já concluídos são ocultados automaticamente para reduzir a poluição visual.',
            '🕰️ <strong>Histórico sob Demanda:</strong> Precisa auditar o que já passou? Adicionamos um interruptor <strong>"Mostrar Histórico"</strong> na aba de Checklists para revelar itens antigos quando necessário.',
            '⬇️ <strong>Gravidade de Conclusão:</strong> Organização automática na meta diária! Ao marcar um cartão como "Feito", ele desliza para o final da lista, mantendo o topo do painel focado apenas no que ainda requer atenção.',
            '✨ <strong>Smart Transitions:</strong> Nova tecnologia de animação fluida aplicada à reordenação. Os cartões agora trocam de posição suavemente em vez de pular, proporcionando uma experiência visual mais confortável.'
        ]
    },
    {
        version: '1.3.1',
        date: 'Anterior',
        changes: [
            '📱 <strong>Modo Tablet Otimizado:</strong> Ajuste fino de responsividade! Tablets agora carregam a interface mobile (com <strong>Navegação por Abas</strong> na parte inferior) em vez de forçar o layout de desktop. Isso elimina ícones desalinhados e textos espremidos em telas médias.',
            '🔔 <strong>Guardião de Início (Auto-Alert):</strong> O sistema agora faz uma varredura silenciosa ao abrir. Se houver tarefas gerais ou checklists de estudo atrasados, a <strong>Central de Tarefas</strong> se abre automaticamente para garantir que nada fique esquecido.',
            '🧠 <strong>Sessão Inteligente:</strong> Para não atrapalhar seu fluxo, o alerta automático só é disparado na <strong>primeira vez</strong> que você abre o app na sessão atual. Recarregar a página não fará o alerta aparecer novamente.'
        ]
    },
    {
        version: '1.3.0',
        date: 'Anterior',
        changes: [
            '🌤️ <strong>Previsão do Tempo Cognitivo:</strong> O painel "Próximos" agora agrupa seus estudos por data. Ícones de clima (☀️ Sol / ☁️ Nuvem / ⚡ Tempestade) indicam instantaneamente se a carga do dia está leve ou pesada em relação à sua capacidade.',
            '🔒 <strong>Trava de Qualidade (Hard Dependency):</strong> O checkbox de conclusão agora fica <strong>bloqueado visualmente</strong> se houver itens de checklist pendentes. É obrigatório resolver as micro-quests internas antes de dar o estudo como finalizado.',
            '🔍 <strong>Busca Rápida:</strong> Adicionado um campo de pesquisa no topo da coluna "Próximos". Filtre instantaneamente revisões futuras por Matéria ou Tópico sem precisar rolar a tela infinitamente.'
        ]
    },
    // --- VERSÃO 1.2.9 (Organização & Nuvem) ---
    {
        version: '1.2.9',
        date: 'Anterior',
        changes: [
            '🗂️ <strong>Configurações Organizadas:</strong> O menu de Estratégia foi dividido! Agora existe uma aba exclusiva de <strong>"Ajustes"</strong> para ferramentas de manutenção (como a Zona de Perigo e Modo Férias), deixando a aba de Estratégia limpa para sua rotina.',
            '☁️ <strong>Sincronização Explícita:</strong> Adicionado um botão <strong>"Salvar Alterações"</strong> na aba de Estratégia. Agora você tem confirmação visual e feedback instantâneo (Toast) de que seus ajustes de capacidade e ciclo foram salvos na nuvem.',
            '✨ <strong>Interface Mais Limpa:</strong> A navegação entre Matérias, Estratégia e Ajustes ficou mais fluida e intuitiva, reduzindo a carga cognitiva na hora de configurar seu plano de estudos.'
        ]
    },
    // --- VERSÃO 1.2.8 (Prioridades UX & Deep Linking) ---
    {
        version: '1.2.8',
        date: 'Anterior',
        changes: [
            '🚀 <strong>Navegação Direta (Deep Linking):</strong> Agora os títulos na aba "Checklists de Estudo" são clicáveis! Ao tocar neles, o sistema fecha o modal e te leva direto para o cartão original no quadro Kanban com um destaque visual.',
            '🔔 <strong>Notificação Real Unificada:</strong> O badge vermelho do menu agora soma TUDO: pendências administrativas + micro-quests de estudo atrasadas. Chega de falsa sensação de dever cumprido.',
            '📱 <strong>Smart Switch (Mobile):</strong> Ao navegar para um cartão via checklist, o sistema troca automaticamente a aba (Hoje/Atrasados/Futuro) se necessário, garantindo que você encontre o estudo mesmo no celular.',
            'ℹ️ <strong>Raio-X de Pendências:</strong> Passe o mouse sobre o contador de tarefas para ver o detalhe (ex: "X Gerais + Y Checklists").'
        ]
    },
    // --- VERSÃO 1.2.7 (Central de Comando & Raio-X) ---
    {
        version: '1.2.7',
        date: 'Anterior',
        changes: [
            '🎛️ <strong>Central de Comando:</strong> O modal de Tarefas foi reestruturado! Agora dividido em abas: <strong>"Geral"</strong> para burocracias e <strong>"Checklists de Estudo"</strong> para o conteúdo pedagógico.',
            '🔍 <strong>Raio-X de Micro-Quests:</strong> A nova aba "Checklists" varre automaticamente todo o seu quadro de estudos e reúne todas as subtarefas pendentes em uma única lista unificada.',
            '✨ <strong>Interface Limpa (Progressive Disclosure):</strong> O formulário de nova tarefa agora fica oculto por padrão para reduzir a poluição visual, aparecendo apenas quando você clica em "Adicionar".'
        ]
    },
    // --- VERSÃO 1.2.6 (Trava de Segurança - Micro-Quests) ---
    {
        version: '1.2.6',
        date: 'Anterior',
        changes: [
            '🛡️ <strong>Guardião de Integridade:</strong> Nova trava de segurança ao concluir ou excluir estudos! O sistema agora verifica se você deixou alguma "micro-quest" (subtarefa) pendente.',
            '⚠️ <strong>Alertas Inteligentes:</strong> Caso tente marcar um estudo como "Feito" com itens não checados, um alerta perguntará se deseja prosseguir ou revisar o que faltou.',
            '🗑️ <strong>Exclusão Segura:</strong> A proteção também se aplica ao botão de lixeira, evitando que você apague acidentalmente um estudo que ainda tinha pendências importantes não resolvidas.'
        ]
    },
    // --- VERSÃO 1.2.5 (Micro-Quests & Checklists) ---
    {
        version: '1.2.5',
        date: 'Anterior',
        changes: [
            '📝 <strong>Micro-Quests (Checklists):</strong> Agora cada cartão de estudo é uma prancheta interativa! Adicione listas de tarefas específicas (ex: "Ler PDF", "Resolver Questões") diretamente dentro de cada estudo.',
            '📊 <strong>Progresso Visual:</strong> Acompanhe seu avanço com novas <strong>Barras de Progresso</strong> nos cartões, que se preenchem automaticamente e mudam de cor conforme você completa os itens da lista.',
            '✨ <strong>Modal de Detalhamento:</strong> Uma nova interface limpa e focada para gerenciar o "passo a passo" da sua sessão de estudo sem perder o contexto da matéria.'
        ]
    },
    // --- VERSÃO 1.2.4 (Fix: Drag-and-Drop & UX Boost) ---
    {
        version: '1.2.4',
        date: 'Anterior',
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
    }     
];
