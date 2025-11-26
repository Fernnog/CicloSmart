/* --- START OF FILE changelog.js --- */

const changelogData = [
    { 
        version: '1.0.4', 
        date: 'Hoje', 
        changes: [
            '⚔️ <strong>Modo Pendular (HUD):</strong> Novo indicador visual no topo (Espada/Escudo) para alternar entre dias de Ataque e Defesa.',
            '🛡️ <strong>Trava de Disciplina:</strong> O botão "Novo Estudo" agora é bloqueado fisicamente em dias de Defesa para forçar a consolidação da memória.',
            '🧠 <strong>Feedback Educativo:</strong> Alertas inteligentes explicam por que o bloqueio ocorreu, reforçando a metodologia.'
        ] 
    },
    { 
        version: '1.0.3', 
        date: 'Anterior', 
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
