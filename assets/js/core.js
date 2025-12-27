/* --- START OF FILE core.js --- */

/**
 * CICLOSMART CORE (v1.2.1 - UX & Architecture Update)
 * Contém: Configurações, Utilitários, CycleValidator (NOVO), Store e TaskManager.
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
    const date = new Date(dateStr + 'T00:00:00');
    const todayStr = getLocalISODate();
    
    const diffTime = date - new Date(todayStr + 'T00:00:00');
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    
    return formatDateDisplay(dateStr);
};

// Utilitário de Contraste (YIQ)
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

    show: (message, type = 'info', title = null) => {
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
            </div>
        `;
        
        container.appendChild(el);
        if(window.lucide) lucide.createIcons({ root: el });
        
        requestAnimationFrame(() => el.classList.add('show'));
        
        setTimeout(() => {
            el.classList.remove('show');
            el.classList.add('opacity-0', 'translate-x-full'); 
            setTimeout(() => el.remove(), 400); 
        }, 5000);
    }
};

// ==========================================
// 2. CYCLE VALIDATOR (NOVO v1.2.1)
// ==========================================

const CycleValidator = {
    /**
     * Verifica se um estudo pode ser movido para uma nova data.
     * Centraliza regras de Capacidade e Cronologia (SRS).
     * @param {number} reviewId - ID do estudo.
     * @param {string} targetDateStr - Data alvo (YYYY-MM-DD).
     * @returns {Object} { valid: boolean, msg: string|null, review: Object }
     */
    validateMove: (reviewId, targetDateStr) => {
        const review = store.reviews.find(r => r.id === reviewId);
        
        // Validações Básicas
        if (!review) return { valid: false, msg: 'Estudo não localizado.' };
        if (review.date === targetDateStr) return { valid: false, msg: null }; // Movimento neutro (mesmo dia)
        
        // 1. Validação de Capacidade (Burnout Protection)
        const capacity = store.capacity || 240;
        const targetDayLoad = store.reviews
            .filter(r => r.date === targetDateStr && r.id !== reviewId)
            .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
        
        const newTotal = targetDayLoad + parseInt(review.time);

        if (newTotal > capacity) {
            return { 
                valid: false, 
                msg: `Sobrecarga: O dia ficaria com ${newTotal}min (Máx: ${capacity}min).` 
            };
        }

        // 2. Validação Cronológica (Pedagógica)
        if (review.batchId) {
            const siblings = store.reviews
                .filter(r => r.batchId === review.batchId)
                .sort((a, b) => a.date.localeCompare(b.date));
            
            const currentIndex = siblings.findIndex(r => r.id === reviewId);
            
            // Trava Futura: Não pode cruzar com a próxima revisão
            const nextReview = siblings[currentIndex + 1];
            if (nextReview && targetDateStr >= nextReview.date) {
                return { valid: false, msg: `Cronologia: Deve ser antes de ${formatDateDisplay(nextReview.date)}.` };
            }
            
            // Trava Passada: Não pode cruzar com a revisão anterior
            const prevReview = siblings[currentIndex - 1];
            if (prevReview && targetDateStr <= prevReview.date) {
                return { valid: false, msg: `Cronologia: Deve ser depois de ${formatDateDisplay(prevReview.date)}.` };
            }
        }

        return { valid: true, review: review };
    }
};

// Exportação para uso global
window.CycleValidator = CycleValidator;


// ==========================================
// 3. STORE (ESTADO & PERSISTÊNCIA REATIVA)
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
    
    // --- SISTEMA DE OBSERVER ---
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

        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));

        if (store.currentUser && window.fireMethods && window.fireDb) {
            const { ref, set } = window.fireMethods;
            set(ref(window.fireDb, 'users/' + store.currentUser.uid), dataToSave)
                .then(() => console.log('[Core] Sincronizado com nuvem.'))
                .catch(err => console.error("[Core] Erro na sincronização:", err));
        }

        store.notify();
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

    // --- Métodos de Reviews ---
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        store.save();
        if (typeof ui !== 'undefined' && ui.render) ui.render();
    },

    toggleStatus: (id) => {
        const r = store.reviews.find(r => r.id === id);
        if (r) {
            r.status = r.status === 'PENDING' ? 'DONE' : 'PENDING';
            store.save();
            if (typeof ui !== 'undefined') {
                ui.render();
                if(!document.getElementById('modal-heatmap').classList.contains('hidden')) {
                    ui.renderHeatmap();
                }
            }
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

    // --- Métodos de Tarefas ---
    removeTask: (id) => {
        store.tasks = store.tasks.filter(t => t.id !== id);
        store.save();
    }
};

// ==========================================
// 4. TASK MANAGER
// ==========================================

const taskManager = {
    openModal: () => {
        const select = document.getElementById('task-subject');
        if(select) {
            select.innerHTML = store.subjects.map(s => 
                `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
            ).join('');
        }
        
        taskManager.cancelEdit();
        taskManager.render();
        
        if (typeof ui !== 'undefined') ui.toggleModal('modal-tasks', true);
    },

    handleFormSubmit: (e) => {
        e.preventDefault();
        const idEditing = document.getElementById('task-id-editing')?.value;
        
        if (idEditing) {
            taskManager.updateTask(parseInt(idEditing));
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
            id: Date.now(),
            subjectId,
            subCategory,
            date,
            obs
        });
        
        store.save();
        taskManager.cancelEdit();
        toast.show('Menos uma pendência mental. Foco total agora.', 'success', 'Loop Aberto Fechado!');
    },

    updateTask: (id) => {
        const taskIndex = store.tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            store.tasks[taskIndex].subjectId = document.getElementById('task-subject').value;
            store.tasks[taskIndex].subCategory = document.getElementById('task-subcategory').value;
            store.tasks[taskIndex].date = document.getElementById('task-date').value;
            store.tasks[taskIndex].obs = document.getElementById('task-obs').value;
            
            store.save(); 
            taskManager.cancelEdit(); 
            toast.show('Tarefa atualizada com sucesso!', 'success', 'Edição Concluída');
        }
    },

    startEdit: (id) => {
        const task = store.tasks.find(t => t.id === id);
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

        const form = document.getElementById('form-task');
        if(form) form.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('task-date').focus();
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
        const lateCount = store.tasks.filter(t => t.date < today).length;
        const okCount = store.tasks.filter(t => t.date >= today).length;
    
        const badgeLate = document.getElementById('badge-task-late');
        const badgeOk = document.getElementById('badge-task-ok');
        const icon = document.getElementById('task-icon-main');
        
        if (badgeLate) {
            if (lateCount > 0) {
                badgeLate.innerText = lateCount > 9 ? '9+' : lateCount;
                badgeLate.classList.remove('hidden');
                if(icon) {
                    icon.classList.add('text-red-500');
                    icon.classList.remove('text-slate-400');
                }
            } else {
                badgeLate.classList.add('hidden');
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
                        <input type="checkbox" onclick="store.removeTask(${t.id})" 
                               class="cursor-pointer w-4 h-4 rounded border-2 border-current opacity-60 hover:opacity-100 accent-current">
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <span class="text-[10px] uppercase font-bold opacity-80 tracking-wider border border-current px-1 rounded">
                                ${subject.name}
                            </span>
                            <button onclick="taskManager.startEdit(${t.id})" class="opacity-70 hover:opacity-100 transition-all ml-2" title="Editar">
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
