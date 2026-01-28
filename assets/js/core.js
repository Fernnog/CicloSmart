/* --- START OF FILE core.js --- */

/**
 * CICLOSMART CORE (v1.4.0 - Smart Attachments Update)
 * Contém: Configurações, Utilitários, Store (Dados) e TaskManager.
 * ATUALIZADO: Suporte a Anexos HTML, Gerenciamento de Resumos e Persistência de Arquivos.
 */

// ==========================================
// 1. CONFIGURAÇÃO & UTILITÁRIOS
// ==========================================

const CONFIG = {
    defaultCapacity: 240, // 4 horas (fallback)
    intervals: [1, 7, 30],     // Ebbinghaus
    storageKey: 'ciclosmart_db_v1',
    profiles: {
        STANDARD: 'standard', // Modo Integrado
        PENDULAR: 'pendular'  // Modo Ataque/Defesa
    }
};

const defaultSubjects = [
    { id: 's1', name: 'Direito Constitucional', color: '#3b82f6' }, // Blue
    { id: 's2', name: 'Português', color: '#ef4444' }, // Red
    { id: 's3', name: 'Raciocínio Lógico', color: '#10b981' }, // Green
    { id: 's4', name: 'Tecnologia da Informação', color: '#8b5cf6' } // Violet
];

// Utilitário de Data Robusto
const getLocalISODate = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getRelativeDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return getLocalISODate(date);
};

const formatDateDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}`;
};

// Utilitário de Data Amigável (UX)
const getFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    // Ajuste de fuso horário para comparação precisa
    const date = new Date(dateStr + 'T00:00:00');
    const todayStr = getLocalISODate();
    const today = new Date(todayStr + 'T00:00:00');
    
    // Diferença em dias
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    
    return formatDateDisplay(dateStr); // Retorna dd/mm se não for data próxima
};

// Utilitário de Contraste (YIQ) para Legibilidade dos Cards de Tarefa
const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return 'black';
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
};

// --- SYSTEM: SMART FEEDBACK (TOASTS) ---
const toast = {
    config: {
        success: { icon: 'check-circle-2', classes: 'bg-emerald-50 border-emerald-500 text-emerald-900' },
        info:    { icon: 'info',           classes: 'bg-slate-800 border-slate-700 text-white shadow-slate-900/20' },
        neuro:   { icon: 'brain-circuit',  classes: 'bg-purple-50 border-purple-500 text-purple-900' },
        warning: { icon: 'alert-triangle', classes: 'bg-amber-50 border-amber-500 text-amber-900' },
        error:   { icon: 'shield-alert',   classes: 'bg-red-50 border-red-500 text-red-900' }
    },

    show: (message, type = 'info', title = null, action = null) => {
        const container = document.getElementById('toast-container');
        if(!container) return; 

        if (container.childElementCount >= 3) {
            const oldest = container.firstChild;
            if (oldest) oldest.remove();
        }
        
        const theme = toast.config[type] || toast.config.info;
        
        const el = document.createElement('div');
        el.className = `toast mb-3 p-4 rounded-lg shadow-xl border-l-4 text-sm flex items-start gap-3 min-w-[300px] max-w-md transition-all ${theme.classes}`;
        
        el.innerHTML = `
            <i data-lucide="${theme.icon}" class="w-5 h-5 shrink-0 mt-0.5"></i>
            <div class="flex-1 min-w-0">
                ${title ? `<h4 class="font-bold text-sm leading-tight">${title}</h4>` : ''}
                <p class="text-xs font-medium leading-snug break-words">${message}</p>
                
                ${action ? `
                <button onclick="${action.onClick}" class="mt-2 text-xs font-bold underline hover:text-slate-900 cursor-pointer text-current opacity-90 hover:opacity-100">
                    ↩ ${action.label}
                </button>
                ` : ''}
            </div>
        `;
        
        container.appendChild(el);
        if(window.lucide) lucide.createIcons({ root: el });
        
        requestAnimationFrame(() => el.classList.add('show'));
        
        const duration = action ? 8000 : 5000;

        setTimeout(() => {
            el.classList.remove('show');
            el.classList.add('opacity-0', 'translate-x-full'); 
            setTimeout(() => el.remove(), 400); 
        }, duration);
    }
};

// ==========================================
// 2. STORE (ESTADO & PERSISTÊNCIA REATIVA)
// ==========================================

const store = {
    reviews: [],
    subjects: [],
    tasks: [], 
    capacity: 240, 
    profile: 'standard', 
    cycleState: 'ATTACK', 
    lastAttackDate: null, 
    cycleStartDate: null,
    currentUser: null,
    
    // Controle de Sessão
    sessionState: {
        hasCelebrated: false
    },
    
    // Sistema de Observer (Reatividade)
    listeners: [],

    subscribe: (fn) => {
        if (typeof fn === 'function' && !store.listeners.includes(fn)) {
            store.listeners.push(fn);
        }
    },

    notify: () => {
        store.listeners.forEach(fn => fn());
    },

    // Lógica de Load
    load: (fromCloudData = null) => {
        if (fromCloudData) {
            const data = fromCloudData;
            store.reviews = data.reviews || [];
            store.subjects = data.subjects && data.subjects.length > 0 ? data.subjects : defaultSubjects;
            store.tasks = data.tasks || []; 
            store.capacity = data.capacity || CONFIG.defaultCapacity;
            store.profile = data.profile || CONFIG.profiles.STANDARD;
            store.cycleState = data.cycleState || 'ATTACK';
            store.lastAttackDate = data.lastAttackDate || null;
            store.cycleStartDate = data.cycleStartDate || null;
            console.log('[Core] Dados carregados via Firebase Cloud.');
        } else {
            const raw = localStorage.getItem(CONFIG.storageKey);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    store.reviews = data.reviews || [];
                    store.subjects = data.subjects && data.subjects.length > 0 ? data.subjects : defaultSubjects;
                    store.tasks = data.tasks || []; 
                    store.capacity = data.capacity || CONFIG.defaultCapacity;
                    store.profile = data.profile || CONFIG.profiles.STANDARD;
                    store.cycleState = data.cycleState || 'ATTACK';
                    store.lastAttackDate = data.lastAttackDate || null;
                    store.cycleStartDate = data.cycleStartDate || null; 
                } catch (e) {
                    console.error("Erro ao ler dados locais", e);
                    store.resetDefaults();
                }
            } else {
                store.resetDefaults();
            }
        }
        
        // Renderização inicial
        if (typeof ui !== 'undefined' && ui.render) {
            ui.initSubjects(); 
            ui.render();
            if (typeof taskManager !== 'undefined') {
                taskManager.render();
                store.notify(); 
            }
        }
    },

    resetDefaults: () => {
        store.subjects = [...defaultSubjects];
        store.reviews = []; 
        store.tasks = [];
        store.capacity = CONFIG.defaultCapacity;
        store.profile = CONFIG.profiles.STANDARD;
        store.cycleState = 'ATTACK';
        store.lastAttackDate = null;
        store.cycleStartDate = null; 
    },

    // Lógica de Save
    save: () => {
        const dataToSave = {
            reviews: store.reviews,
            subjects: store.subjects,
            tasks: store.tasks,
            capacity: store.capacity,
            profile: store.profile,
            cycleState: store.cycleState,
            lastAttackDate: store.lastAttackDate,
            cycleStartDate: store.cycleStartDate,
            lastUpdate: new Date().toISOString()
        };

        // Salva Local
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                toast.show('Espaço local cheio. O armazenamento depende do Cloud agora.', 'warning');
            }
        }

        // Salva Cloud (Firebase)
        if (store.currentUser && window.fireMethods && window.fireDb) {
            const { ref, set } = window.fireMethods;
            set(ref(window.fireDb, 'users/' + store.currentUser.uid), dataToSave)
                .then(() => console.log('[Core] Sincronizado com nuvem.'))
                .catch(err => {
                    console.error("[Core] Erro na sincronização:", err);
                    toast.show('Erro ao sincronizar dados.', 'error');
                });
        }

        store.notify();
    },

    // --- Lógica de Gamificação (Streak) ---
    calculateStreak: () => {
        const doneDates = [...new Set(store.reviews
            .filter(r => r.status === 'DONE')
            .map(r => r.date)
        )].sort((a, b) => b.localeCompare(a));

        if (doneDates.length === 0) return 0;

        let streak = 0;
        const today = getLocalISODate();
        const yesterday = getRelativeDate(-1);

        if (doneDates[0] !== today && doneDates[0] !== yesterday) return 0;

        let checkDate = new Date();
        if (doneDates[0] !== today) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (let i = 0; i < doneDates.length; i++) {
            const dateStr = getLocalISODate(checkDate);
            if (doneDates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1); 
            } else {
                break;
            }
        }
        return streak;
    },

    // --- Métodos de Matérias ---
    addSubject: (name, color) => {
        store.subjects.push({ id: 'sub-' + Date.now(), name, color });
        store.save();
        if (typeof ui !== 'undefined' && ui.initSubjects) ui.initSubjects(); 
    },

    removeSubject: (id) => {
        if(confirm("Deseja remover esta matéria? (Cards existentes manterão a cor antiga)")) {
            store.subjects = store.subjects.filter(s => s.id !== id);
            store.save();
            if (typeof ui !== 'undefined' && ui.initSubjects) ui.initSubjects();
        }
    },

    toggleSubjectArchived: (id) => {
        const sub = store.subjects.find(s => s.id === id);
        if (sub) {
            sub.archived = !sub.archived;
            store.save();
            if (typeof ui !== 'undefined') ui.initSubjects();
        }
    },

    // --- Métodos de Reviews ---
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        store.save();
        if (typeof ui !== 'undefined' && ui.render) ui.render();
    },

    toggleStatus: (id) => {
        const r = store.reviews.find(r => r.id.toString() === id.toString());
        if (r) {
            r.status = r.status === 'PENDING' ? 'DONE' : 'PENDING';
            store.save(); 
            if (typeof ui !== 'undefined') {
                ui.render();
                if(!document.getElementById('modal-heatmap').classList.contains('hidden')) {
                    ui.renderHeatmap();
                }
            }
        } else {
            console.error(`[Core Error] Tentativa de alternar status falhou. ID não encontrado: ${id}`);
        }
    },

    updateReview: (id, newTopic, newTime) => {
        const r = store.reviews.find(r => r.id === id);
        if (r) {
            r.topic = newTopic;
            r.time = parseInt(newTime);
            store.save();
            if (typeof ui !== 'undefined' && ui.render) ui.render();
        }
    },

    updateReviewFull: (id, data) => {
        const { newSubjectId, newTopic, newTime, newLink } = data;
        const COMPRESSION_RATIOS = {
            '24h': 0.20, 'Defesa': 0.20,
            '7d': 0.10,  '8d': 0.10,
            '30d': 0.05, '31d': 0.05
        };

        const subjectObj = store.subjects.find(s => s.id === newSubjectId);
        if (!subjectObj) return;

        const targetReview = store.reviews.find(r => r.id === id);
        if (!targetReview) return;

        const isEditingParent = (targetReview.type === 'NOVO' || targetReview.type === 'NEW');

        const applyChanges = (r) => {
            r.topic = newTopic;
            r.subject = subjectObj.name;
            r.color = subjectObj.color;
            if (newLink !== undefined) r.link = newLink;

            if (isEditingParent) {
                if (r.type === 'NOVO' || r.type === 'NEW') {
                    r.time = parseInt(newTime); 
                } else {
                    const ratio = COMPRESSION_RATIOS[r.type] || 0.10;
                    r.time = Math.max(5, Math.ceil(parseInt(newTime) * ratio));
                }
            } else {
                if (r.id === id) {
                    r.time = parseInt(newTime);
                }
            }
        };

        if (targetReview.batchId) {
            store.reviews.forEach(r => {
                if (r.batchId === targetReview.batchId) {
                    applyChanges(r);
                }
            });
            
            const msg = isEditingParent 
                ? 'Tempos das revisões futuras foram recalculados automaticamente.' 
                : 'Revisão específica ajustada manualmente.';
                
            toast.show(msg, 'success', 'Ciclo Sincronizado');
        } else {
            applyChanges(targetReview);
            toast.show('Estudo atualizado.', 'success');
        }

        store.save();
        if (typeof ui !== 'undefined') {
            ui.render();
            ui.renderHeatmap();
        }
    },

    updateReviewLink: (id, link) => {
        const r = store.reviews.find(item => item.id === id);
        if (r) {
            if (r.batchId) {
                store.reviews.forEach(item => {
                    if (item.batchId === r.batchId) item.link = link;
                });
                toast.show('Link atualizado para todo o ciclo!', 'success');
            } else {
                r.link = link;
                toast.show('Link salvo.', 'success');
            }
            store.save();
            if (typeof ui !== 'undefined') ui.render();
        }
    },

    // ----------------------------------------------
    // ATUALIZAÇÃO: Gerenciamento de Anexos com Propagação em Lote (Batch)
    // ----------------------------------------------
    attachSummary: (id, htmlContent) => {
        const targetReview = store.reviews.find(r => r.id.toString() === id.toString());
        
        if (targetReview) {
            let updateCount = 0;

            // Função auxiliar para aplicar o anexo
            const apply = (r) => {
                r.htmlSummary = htmlContent;
                updateCount++;
            };

            // Lógica de Propagação: Se tem batchId, atualiza todos os irmãos
            if (targetReview.batchId) {
                store.reviews.forEach(r => {
                    if (r.batchId === targetReview.batchId) apply(r);
                });
            } else {
                // Se é um estudo órfão, atualiza só ele
                apply(targetReview);
            }

            store.save(); // Persistência
            
            console.log(`[Core] Resumo anexado e propagado para ${updateCount} cartões.`);
            
            // Atualização visual imediata
            if (typeof ui !== 'undefined' && ui.render) ui.render();
            toast.show(`Resumo sincronizado em ${updateCount} cartões do ciclo.`, 'success', 'Mochila Digital Atualizada');
        } else {
            console.error('[Core Error] Card não encontrado:', id);
            toast.show('Erro ao encontrar card.', 'error');
        }
    },

    getSummary: (id) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        return review ? review.htmlSummary : null;
    },

    deleteSummary: (id) => {
        const targetReview = store.reviews.find(r => r.id.toString() === id.toString());
        
        if (targetReview) {
            if (!confirm("Tem certeza que deseja remover este resumo? Isso afetará todas as revisões deste ciclo.")) return;

            let deleteCount = 0;

            const remove = (r) => {
                if (r.htmlSummary) {
                    delete r.htmlSummary;
                    deleteCount++;
                }
            };

            if (targetReview.batchId) {
                store.reviews.forEach(r => {
                    if (r.batchId === targetReview.batchId) remove(r);
                });
            } else {
                remove(targetReview);
            }

            store.save();
            if (typeof ui !== 'undefined' && ui.render) ui.render();
            toast.show(`Resumo removido de ${deleteCount} cartões.`, 'info', 'Limpeza Concluída');
        }
    },
    // ----------------------------------------------

    updateBatchTopic: (batchId, newTopic) => {
        let count = 0;
        store.reviews.forEach(r => {
            if (r.batchId === batchId) {
                r.topic = newTopic;
                count++;
            }
        });
        if (count > 0) {
            store.save();
            if (typeof ui !== 'undefined' && ui.render) ui.render();
        }
    },

    deleteBatch: (batchId) => {
        const count = store.reviews.filter(r => r.batchId === batchId).length;
        if(count > 0) {
            store.reviews = store.reviews.filter(r => r.batchId !== batchId);
            store.save();
            if (typeof ui !== 'undefined' && ui.render) ui.render();
        }
    },

    deleteReview: (id) => {
        store.reviews = store.reviews.filter(r => r.id !== id);
        store.save();
        if (typeof ui !== 'undefined' && ui.render) ui.render();
    },

    // --- Métodos de Subtarefas ---
    _getReviewById: (id) => {
        if (!id) return undefined;
        return store.reviews.find(r => r.id.toString() === id.toString());
    },

    addSubtask: (reviewId, text, options = {}) => {
        const r = store._getReviewById(reviewId); 
        if (r) {
            if (!r.subtasks) r.subtasks = []; 
            const newTask = { 
                id: (Date.now() + Math.random()).toString().replace('.',''), 
                text, 
                done: false,
                isRecurrent: options.isRecurrent || false 
            };
            r.subtasks.push(newTask);
            store.save(); 
        } else {
            console.error(`[Core Error] Review não encontrada para ID: ${reviewId}`);
        }
    },

    updateSubtask: (reviewId, subtaskId, newText) => {
        const r = store._getReviewById(reviewId);
        if (r && r.subtasks) {
            const task = r.subtasks.find(t => t.id === subtaskId);
            if (task) {
                task.text = newText;
                store.save();
            }
        }
    },

    toggleSubtask: (reviewId, subtaskId) => {
        const r = store._getReviewById(reviewId); 
        if (r && r.subtasks) {
            const task = r.subtasks.find(t => t.id.toString() === subtaskId.toString());
            if (task) {
                task.done = !task.done;
                store.save();
            }
        }
    },

    removeSubtask: (reviewId, subtaskId) => {
        const r = store._getReviewById(reviewId); 
        if (r && r.subtasks) {
            r.subtasks = r.subtasks.filter(t => t.id.toString() !== subtaskId.toString());
            store.save();
        }
    },

    // --- Métodos de Tarefas ---
    removeTask: (id) => {
        store.tasks = store.tasks.filter(t => t.id !== id);
        store.save();
    }
};

// ==========================================
// 3. TASK MANAGER (ATUALIZADO)
// ==========================================

const taskManager = {
    showHistory: false,

    toggleHistory: () => {
        taskManager.showHistory = !taskManager.showHistory;
        taskManager.renderLinkedTasks();
    },

    openModal: () => {
        const select = document.getElementById('task-subject');
        if(select) {
            select.innerHTML = store.subjects.map(s => 
                `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
            ).join('');
        }
        
        taskManager.cancelEdit();
        taskManager.switchTab('general');
        taskManager.toggleForm(false);
        taskManager.render();

        if (typeof ui !== 'undefined') {
            requestAnimationFrame(() => {
                ui.toggleModal('modal-tasks', true);
            });
        }
    },

    handleFormSubmit: (e) => {
        e.preventDefault();
        const idEditing = document.getElementById('task-id-editing')?.value;
        if (idEditing) {
            taskManager.updateTask(idEditing);
        } else {
            taskManager.addTask();
        }
    },

    addTask: () => {
        const select = document.getElementById('task-subject');
        const subjectId = select.value;
        const subCategory = document.getElementById('task-subcategory').value;
        const date = document.getElementById('task-date').value;
        const obs = document.getElementById('task-obs').value;

        store.tasks.push({
            id: Date.now().toString(),
            subjectId,
            subCategory,
            date,
            obs
        });
        
        store.save();
        taskManager.cancelEdit();
        taskManager.toggleForm(false);
        toast.show('Menos uma pendência mental. Foco total agora.', 'success', 'Loop Aberto Fechado!');
    },

    updateTask: (id) => {
        const taskIndex = store.tasks.findIndex(t => t.id.toString() === id.toString());
        if (taskIndex > -1) {
            store.tasks[taskIndex].subjectId = document.getElementById('task-subject').value;
            store.tasks[taskIndex].subCategory = document.getElementById('task-subcategory').value;
            store.tasks[taskIndex].date = document.getElementById('task-date').value;
            store.tasks[taskIndex].obs = document.getElementById('task-obs').value;
            
            store.save(); 
            taskManager.cancelEdit(); 
            taskManager.toggleForm(false);
            toast.show('Tarefa atualizada com sucesso!', 'success', 'Edição Concluída');
        } else {
            console.error("[TaskManager] Erro: ID não encontrado para atualização:", id);
        }
    },

    startEdit: (id) => {
        const task = store.tasks.find(t => t.id.toString() === id.toString());
        if (!task) return;

        const hiddenId = document.getElementById('task-id-editing');
        if(hiddenId) hiddenId.value = task.id;
        
        document.getElementById('task-subject').value = task.subjectId;
        document.getElementById('task-subcategory').value = task.subCategory;
        document.getElementById('task-date').value = task.date;
        document.getElementById('task-obs').value = task.obs || '';

        const btnCancel = document.getElementById('btn-cancel-task');
        if(btnCancel) btnCancel.classList.remove('hidden');
        
        const btnText = document.getElementById('btn-task-text');
        if(btnText) btnText.innerText = 'Salvar Alterações';

        taskManager.toggleForm(true);
    },

    cancelEdit: () => {
        const form = document.getElementById('form-task');
        if(form) form.reset();
        
        const hiddenId = document.getElementById('task-id-editing');
        if(hiddenId) hiddenId.value = '';
        
        const btnCancel = document.getElementById('btn-cancel-task');
        if(btnCancel) btnCancel.classList.add('hidden');
        
        const btnText = document.getElementById('btn-task-text');
        if(btnText) btnText.innerText = 'Adicionar Tarefa';
        
        const dateInput = document.getElementById('task-date');
        if(dateInput) dateInput.value = getLocalISODate();
    },

    checkOverdue: () => {
        const today = getLocalISODate();
        const generalLateCount = store.tasks.filter(t => t.date < today).length;
        const studyPendingCount = store.reviews.reduce((total, review) => {
            if (!review.subtasks) return total;
            return total + review.subtasks.filter(t => !t.done).length;
        }, 0);

        const totalAlerts = generalLateCount + studyPendingCount;
        const okCount = store.tasks.filter(t => t.date >= today).length;
    
        const badgeLate = document.getElementById('badge-task-late');
        const badgeOk = document.getElementById('badge-task-ok');
        const icon = document.getElementById('task-icon-main');
        
        if (badgeLate) {
            if (totalAlerts > 0) {
                badgeLate.innerText = totalAlerts > 99 ? '99+' : totalAlerts;
                badgeLate.classList.remove('hidden');
                badgeLate.title = `${generalLateCount} Gerais + ${studyPendingCount} Checklists`;
                if(icon) {
                    icon.classList.add('text-red-500');
                    icon.classList.remove('text-slate-400');
                }
            } else {
                badgeLate.classList.add('hidden');
                badgeLate.title = '';
                if(icon) {
                    icon.classList.remove('text-red-500');
                    icon.classList.add('text-slate-400');
                }
            }
        }
    
        if (badgeOk) {
            if (okCount > 0) {
                badgeOk.innerText = okCount > 9 ? '9+' : okCount;
                badgeOk.classList.remove('hidden');
            } else {
                badgeOk.classList.add('hidden');
            }
        }
    },

    toggleForm: (show) => {
        const btn = document.getElementById('btn-show-task-form');
        const form = document.getElementById('form-task');
        if (show) {
            if(btn) btn.classList.add('hidden');
            if(form) form.classList.remove('hidden');
            const subInput = document.getElementById('task-subcategory');
            if(subInput) subInput.focus();
        } else {
            if(btn) btn.classList.remove('hidden');
            if(form) form.classList.add('hidden');
            taskManager.cancelEdit(); 
        }
    },

    switchTab: (tabName) => {
        const activeClass = ['border-indigo-600', 'text-indigo-600', 'border-b-2', 'font-bold'];
        const inactiveClass = ['border-transparent', 'text-slate-500', 'font-medium'];

        ['general', 'linked'].forEach(t => {
            const btn = document.getElementById(`tab-task-${t}`);
            const view = document.getElementById(`view-task-${t}`);
            
            if(btn && view) {
                btn.classList.remove(...activeClass);
                btn.classList.add(...inactiveClass);
                view.classList.add('hidden');
                view.classList.remove('flex', 'flex-col');
            }
        });

        const btnActive = document.getElementById(`tab-task-${tabName}`);
        const viewActive = document.getElementById(`view-task-${tabName}`);
        
        if(btnActive && viewActive) {
            btnActive.classList.remove(...inactiveClass);
            btnActive.classList.add(...activeClass);
            viewActive.classList.remove('hidden');
            if (tabName === 'general') viewActive.classList.add('flex', 'flex-col');
            
            const toggleWrapper = document.getElementById('history-toggle-wrapper');
            if (toggleWrapper) {
                tabName === 'linked' ? toggleWrapper.classList.remove('hidden') : toggleWrapper.classList.add('hidden');
            }

            if (tabName === 'linked') taskManager.renderLinkedTasks();
        }
    },

    renderLinkedTasks: () => {
        const container = document.getElementById('linked-task-list');
        if (!container) return;
        
        const toggleWrapper = document.getElementById('history-toggle-wrapper');
        if (toggleWrapper) toggleWrapper.classList.remove('hidden');

        const today = getLocalISODate();

        const reviewsWithTasks = store.reviews.filter(r => {
            if (!r.subtasks || r.subtasks.length === 0) return false;
            if (taskManager.showHistory) return true;
            const isPast = r.date < today;
            const isDone = r.status === 'DONE';
            return !isPast && !isDone;
        });
        
        if (reviewsWithTasks.length === 0) {
            container.innerHTML = `<div class="text-center py-10 text-slate-400 text-xs italic">
                <i data-lucide="check-circle" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                ${taskManager.showHistory ? 'Nenhuma checklist encontrada no histórico.' : 'Tudo limpo! Ative "Histórico" para ver itens antigos.'}
            </div>`;
            if(window.lucide) lucide.createIcons();
            return;
        }

        reviewsWithTasks.sort((a, b) => a.date.localeCompare(b.date));

        container.innerHTML = reviewsWithTasks.map(r => {
            const tasksHtml = r.subtasks.map(t => `
                <div class="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded transition-colors">
                    <input type="checkbox" onchange="app.handleLinkedTaskToggle('${r.id}', '${t.id}')" 
                           ${t.done ? 'checked' : ''} 
                           class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                    <span class="text-xs text-slate-600 ${t.done ? 'line-through text-slate-300' : ''}">${t.text}</span>
                </div>
            `).join('');

            return `
                <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-3">
                    <div onclick="app.locateAndHighlight('${r.id}')" 
                         class="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-indigo-50 transition-colors group">
                        
                        <div class="flex items-center gap-2 overflow-hidden">
                            <div class="w-2 h-2 rounded-full shrink-0" style="background-color: ${r.color}"></div>
                            <div class="min-w-0">
                                <p class="text-[10px] font-bold uppercase text-slate-500 truncate leading-none group-hover:text-indigo-600 transition-colors">${r.subject}</p>
                                <p class="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5 group-hover:text-indigo-900 transition-colors" title="${r.topic}">${r.topic}</p>
                            </div>
                        </div>
                        <i data-lucide="external-link" class="w-3 h-3 text-slate-300 group-hover:text-indigo-500"></i>
                    </div>
                    <div class="p-3">
                        ${tasksHtml}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    render: () => {
        const container = document.getElementById('task-list-container');
        if (!container) return;

        if (store.tasks.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Nenhuma tarefa pendente.</div>`;
            return;
        }

        const today = getLocalISODate();

        const late = store.tasks.filter(t => t.date < today).sort((a,b) => a.date.localeCompare(b.date));
        const present = store.tasks.filter(t => t.date === today);
        const future = store.tasks.filter(t => t.date > today).sort((a,b) => a.date.localeCompare(b.date));

        const renderGroup = (title, tasks, headerClass) => {
            if (tasks.length === 0) return '';
            
            const cards = tasks.map(t => {
                const subject = store.subjects.find(s => s.id === t.subjectId) || { name: 'Geral', color: '#cbd5e1' };
                const textColor = getContrastYIQ(subject.color);
                const isLate = t.date < today;
                
                return `
                <div class="relative rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-3 mb-2" 
                     style="background-color: ${subject.color}; color: ${textColor}">
                    
                    <div class="mt-1">
                        <input type="checkbox" onclick="store.removeTask('${t.id}')" 
                               class="cursor-pointer w-4 h-4 rounded border-2 border-current opacity-60 hover:opacity-100 accent-current">
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <span class="text-[10px] uppercase font-bold opacity-80 tracking-wider border border-current px-1 rounded">
                                ${subject.name}
                            </span>
                            <button onclick="taskManager.startEdit('${t.id}')" class="opacity-70 hover:opacity-100 transition-all ml-2" title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            </button>
                        </div>
                        
                        <div class="flex items-center gap-1 mt-1">
                            <span class="text-[10px] font-bold opacity-90 flex items-center gap-1 ${isLate ? 'text-red-600' : ''}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                ${getFriendlyDate(t.date)}
                            </span>
                        </div>
                        
                        <h4 class="font-bold text-sm leading-tight mt-1 truncate">${t.subCategory}</h4>
                        ${t.obs ? `<p class="text-[11px] opacity-80 mt-1 leading-snug break-words">${t.obs}</p>` : ''}
                    </div>
                </div>`;
            }).join('');

            return `
                <div class="mb-5 animate-fade-in">
                    <h4 class="text-xs font-bold uppercase tracking-wide mb-2 border-b border-slate-200 pb-1 ${headerClass}">
                        ${title} <span class="ml-1 opacity-60 text-[10px]">(${tasks.length})</span>
                    </h4>
                    <div class="space-y-2">${cards}</div>
                </div>
            `;
        };

        let html = '';
        html += renderGroup('🚨 Atrasados', late, 'text-red-600 border-red-100');
        html += renderGroup('⭐ Foco Hoje', present, 'text-indigo-600 border-indigo-100');
        html += renderGroup('📅 Próximos', future, 'text-slate-500 border-slate-200');

        container.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    }
};

/* --- END OF FILE core.js --- */
