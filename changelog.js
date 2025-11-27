/* --- START OF FILE changelog.js --- */

const changelogData = [
    { 
        version: '1.0.9', 
        date: 'Hoje', 
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
            '⏱️ <strong>Empilhamento Sequencial:</strong> O algoritmo agora organiza seus estudos um após o outro automaticamente, baseando-se na duração real de cada card.',
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
