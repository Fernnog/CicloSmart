/**
 * CICLOSMART FILE MANAGER
 * Responsabilidade: Upload seguro e Leitura de Resumos HTML
 */
const fileManager = {
    // Ação 1: Gatilho para selecionar e ler o arquivo
    triggerUpload: (reviewId) => {
        // Cria um input invisível dinamicamente
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html, .htm'; // Aceita apenas arquivos web
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validação de Segurança: Limite de 2MB
            // Isso evita travamento do LocalStorage ou estouro de cota do Firebase no modo JSON
            if (file.size > 2 * 1024 * 1024) {
                alert('O arquivo é muito grande para sincronização (Max: 2MB). Tente um resumo menor ou use Link Externo.');
                return;
            }

            const reader = new FileReader();
            
            // Quando terminar de ler o texto do arquivo
            reader.onload = (event) => {
                // Chama o Core atualizado para salvar e propagar em lote
                store.attachSummary(reviewId, event.target.result);
            };

            reader.readAsText(file); // Lê como string pura
        };

        input.click(); // Abre a janela do sistema
    },

    // Ação 2: Reconstrói o arquivo e abre em nova aba
    openSummary: (reviewId) => {
        // Busca o conteúdo no Store
        const htmlContent = store.getSummary(reviewId);
        
        if (!htmlContent) {
            alert("Resumo não encontrado ou corrompido.");
            return;
        }

        // Cria um Blob (arquivo virtual na memória do navegador)
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abre em nova aba
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            alert("Habilite pop-ups para visualizar o resumo.");
        }
    },
    
    // Ação 3: Roteador de Ação
    handleAction: (reviewId, hasSummary) => {
        if (hasSummary) {
            fileManager.openSummary(reviewId);
        } else {
            fileManager.triggerUpload(reviewId);
        }
    }
};

// Expõe globalmente
window.fileManager = fileManager;
