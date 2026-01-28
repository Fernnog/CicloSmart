/**
 * CICLOSMART FILE MANAGER (Novo Módulo)
 * Responsabilidade: Upload, Leitura e Exibição de Resumos HTML
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

            // Validação simples de tamanho (evitar travar o banco, ex: max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('O arquivo é muito grande para sincronização (Max: 2MB).');
                return;
            }

            const reader = new FileReader();
            
            // Quando terminar de ler o texto do arquivo
            reader.onload = (event) => {
                const content = event.target.result;
                // Chama o Core para salvar na nuvem/store
                store.attachSummary(reviewId, content);
            };

            reader.readAsText(file); // Lê como string pura
        };

        input.click(); // Abre a janela do sistema
    },

    // Ação 2: Reconstrói o arquivo e abre em nova aba
    openSummary: (reviewId) => {
        // Busca o conteúdo no Store
        const review = store.reviews.find(r => r.id.toString() === reviewId.toString());
        
        if (!review || !review.htmlSummary) {
            alert("Resumo não encontrado.");
            return;
        }

        // Cria um Blob (arquivo virtual na memória do navegador)
        const blob = new Blob([review.htmlSummary], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abre em nova aba
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            alert("Habilite pop-ups para visualizar o resumo.");
        }
    },
    
    // Ação 3: Decidir qual ação tomar ao clicar no botão (Roteador)
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
