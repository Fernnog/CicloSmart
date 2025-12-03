/* --- START OF FILE core.js --- */

/**
 * CICLOSMART CORE (v1.9 Batch Support - Edit & Delete)
 * Contém: Configurações, Utilitários, Store (Dados) e TaskManager.
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
// 2. STORE (ESTADO & PERSISTÊNCIA)
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
    
    // Novo: Armazena o usuário logado no Firebase
    currentUser: null,

    // Lógica de Load Atualizada (Suporta Dados da Nuvem)
    load: (fromCloudData = null) => {
        if (fromCloudData) {
            // Se vierem dados da nuvem, usamos eles
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
            // Fallback: Tenta carregar do LocalStorage
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
        
        // Atualiza a interface se ela estiver disponível
        if (typeof ui !== 'undefined' && ui.render) {
            ui.initSubjects(); 
            ui.render();
            if (typeof taskManager !== 'undefined') taskManager.render();
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

    // Lógica de Save Atualizada (Híbrido: Local + Nuvem)
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
            lastUpdate: new Date().toISOString() // Metadata útil para conflitos
        };

        // 1. Sempre salva localmente (Backup/Offline)
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));

        // 2. Se logado, salva no Firebase
        if (store.currentUser && window.fireMethods && window.fireDb) {
            const { ref, set } = window.fireMethods;
            set(ref(window.fireDb, 'users/' + store.currentUser.uid), dataToSave)
                .then(() => console.log('[Core] Sincronizado com nuvem.'))
                .catch(err => console.error("[Core] Erro na sincronização:", err));
        }
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

    // --- LÓGICA DE ATUALIZAÇÃO EM LOTE ---
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

    // --- LÓGICA DE EXCLUSÃO (BATCH & INDIVIDUAL) ---
    
    // 1. Deleta todo o lote
    deleteBatch: (batchId) => {
        const count = store.reviews.filter(r => r.batchId === batchId).length;
        if(count > 0) {
            store.reviews = store.reviews.filter(r => r.batchId !== batchId);
            store.save();
            if (typeof ui !== 'undefined' && ui.render) ui.render();
        }
    },

    // 2. Deleta apenas um
    deleteReview: (id) => {
        store.reviews = store.reviews.filter(r => r.id !== id);
        store.save();
        if (typeof ui !== 'undefined' && ui.render) ui.render();
    },
    // -----------------------------------------------

    // --- Métodos de Tarefas ---
    removeTask: (id) => {
        store.tasks = store.tasks.filter(t => t.id !== id);
        store.save();
        taskManager.render();
        taskManager.checkOverdue();
    }
};

// ==========================================
// 3. TASK MANAGER
// ==========================================

const taskManager = {
    openModal: () => {
        const select = document.getElementById('task-subject');
        if(select) {
            select.innerHTML = store.subjects.map(s => 
                `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
            ).join('');
        }
        const dateInput = document.getElementById('task-date');
        if(dateInput && !dateInput.value) dateInput.value = getLocalISODate();
        
        taskManager.render();
        if (typeof ui !== 'undefined') ui.toggleModal('modal-tasks', true);
    },

    addTask: (e) => {
        e.preventDefault();
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
        
        document.getElementById('task-subcategory').value = '';
        document.getElementById('task-obs').value = '';
        
        taskManager.render();
        taskManager.checkOverdue();
        toast.show('Menos uma pendência mental. Foco total agora.', 'success', 'Loop Aberto Fechado!');
    },

    checkOverdue: () => {
        const today = getLocalISODate();
        const hasOverdue = store.tasks.some(t => t.date < today);
        const badge = document.getElementById('task-alert-badge');
        const icon = document.getElementById('task-icon-main');
        
        if (badge && icon) {
            if (hasOverdue) {
                badge.classList.remove('hidden');
                icon.classList.add('text-red-500');
            } else {
                badge.classList.add('hidden');
                icon.classList.remove('text-red-500');
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

        const sortedTasks = [...store.tasks].sort((a, b) => a.date.localeCompare(b.date));
        const today = getLocalISODate();

        container.innerHTML = sortedTasks.map(t => {
            const subject = store.subjects.find(s => s.id === t.subjectId) || { name: 'Geral', color: '#cbd5e1' };
            const textColor = getContrastYIQ(subject.color);
            const isLate = t.date < today;
            
            const alertIcon = isLate 
                ? `<div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm animate-pulse" title="Atrasado!"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></div>` 
                : '';

            return `
            <div class="relative rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-3" 
                 style="background-color: ${subject.color}; color: ${textColor}">
                ${alertIcon}
                
                <div class="mt-1">
                    <input type="checkbox" onclick="store.removeTask(${t.id})" 
                           class="cursor-pointer w-4 h-4 rounded border-2 border-current opacity-60 hover:opacity-100 accent-current">
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <span class="text-[10px] uppercase font-bold opacity-80 tracking-wider border border-current px-1 rounded">
                            ${subject.name}
                        </span>
                        <span class="text-[10px] font-bold opacity-90 flex items-center gap-1 ${isLate ? 'underline decoration-wavy' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            ${formatDateDisplay(t.date)}
                        </span>
                    </div>
                    
                    <h4 class="font-bold text-sm leading-tight mt-1 truncate">${t.subCategory}</h4>
                    
                    ${t.obs ? `<p class="text-[11px] opacity-80 mt-1 leading-snug break-words">${t.obs}</p>` : ''}
                </div>
            </div>
            `;
        }).join('');
        
        if(window.lucide) lucide.createIcons();
    }
};
