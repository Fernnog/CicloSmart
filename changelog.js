/* --- START OF FILE changelog.js --- */

const changelogData = [
    { 
        version: '1.3.0', 
        date: 'Hoje', 
        changes: [
            '💾 <strong>Backup & Restore:</strong> Funcionalidade de exportar e importar dados (JSON) para segurança.',
            '📦 <strong>Refatoração:</strong> Separação do histórico de versões em arquivo dedicado.'
        ] 
    },
    { 
        version: '1.2.0', 
        date: 'Anterior', 
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
