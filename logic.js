/* --- START OF FILE logic.js --- */

/**
 * CICLOSMART CORE v1.3.0
 * Features: Neuro-SRS Engine, Capacity Lock (40/60 Rule), Compression, Backup System
 */

// ==========================================
// 1. CONFIGURAÇÃO & STORE (PERSISTÊNCIA)
// ==========================================

const CONFIG = {
    defaultCapacity: 240, // 4 horas (fallback)
    intervals: [1, 7, 30],     // Ebbinghaus
    storageKey: 'ciclosmart_db_v1'
};

const defaultSubjects = [
    { id: 's1', name: 'Direito Constitucional', color: '#3b82f6' }, // Blue
    { id: 's2', name: 'Português', color: '#ef4444' }, // Red
    { id: 's3', name: 'Raciocínio Lógico', color: '#10b981' }, // Green
    { id: 's4', name: 'Tecnologia da Informação', color: '#8b5cf6' } // Violet
];

// Utilitários de Data
const getRelativeDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
};

const formatDateDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}`;
};

// Utilitário de Notificação (Toast)
const toast = {
    show: (msg, type = 'info') => {
        const container = document.getElementById('toast-container');
        if(!container) return; // Segurança caso o container não exista no HTML ainda
        
        const el = document.createElement('div');
        const colors = type === 'error' ? 'bg-red-50 border-red-500 text-red-900' : 
                       type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                       'bg-slate-800 text-white';
        
        el.className = `toast show mb-2 p-4 rounded-lg shadow-xl border-l-4 text-sm font-medium flex items-center gap-3 min-w-[320px] max-w-md ${colors}`;
        el.innerHTML = msg; // Permite HTML na mensagem
        
        container.appendChild(el);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, 5000);
    }
};

const store = {
    reviews: [],
    subjects: [],
    capacity: 240, // Capacidade diária em minutos

    // Carrega dados do LocalStorage ou usa padrões
    load: () => {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                store.reviews = data.reviews || [];
                store.subjects = data.subjects && data.subjects.length > 0 ? data.subjects : defaultSubjects;
                store.capacity = data.capacity || CONFIG.defaultCapacity;
            } catch (e) {
                console.error("Erro ao ler dados", e);
                store.subjects = defaultSubjects;
                store.capacity = CONFIG.defaultCapacity;
            }
        } else {
            store.subjects = [...defaultSubjects];
            store.reviews = []; 
            store.capacity = CONFIG.defaultCapacity;
        }
    },

    // Salva estado atual
    save: () => {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
            reviews: store.reviews,
            subjects: store.subjects,
            capacity: store.capacity
        }));
    },

    // --- Métodos de Matérias ---
    addSubject: (name, color) => {
        store.subjects.push({ id: 'sub-' + Date.now(), name, color });
        store.save();
        ui.initSubjects(); // Atualiza UI
    },

    removeSubject: (id) => {
        if(confirm("Deseja remover esta matéria? (Cards existentes manterão a cor antiga)")) {
            store.subjects = store.subjects.filter(s => s.id !== id);
            store.save();
            ui.initSubjects();
        }
    },

    // --- Métodos de Reviews ---
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        store.save();
        ui.render();
    },

    toggleStatus: (id) => {
        const r = store.reviews.find(r => r.id === id);
        if (r) {
            r.status = r.status === 'PENDING' ? 'DONE' : 'PENDING';
            store.save();
            ui.render();
            // Se o heatmap estiver aberto, atualiza ele também
            if(!document.getElementById('modal-heatmap').classList.contains('hidden')) {
                ui.renderHeatmap();
            }
        }
    },

    updateReview: (id, newTopic, newTime) => {
        const r = store.reviews.find(r => r.id === id);
        if (r) {
            r.topic = newTopic;
            r.time = parseInt(newTime);
            store.save();
            ui.render();
        }
    },

    deleteReview: (id) => {
        if(confirm("Tem certeza que deseja excluir esta revisão?")) {
            store.reviews = store.reviews.filter(r => r.id !== id);
            store.save();
            ui.render();
        }
    }
};

// ==========================================
// 2. LÓGICA DO APP (CONTROLLER)
// ==========================================

const app = {
    init: () => {
        store.load();
        ui.initSubjects(); // Inicializa selects e listas
        ui.render();
        
        // Listeners
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        // Define aba inicial mobile
        ui.switchTab('today');
    },

    // --- NOVA LÓGICA DE ENTRADA COM TRAVA 40/60 E COMPRESSÃO ---
    handleNewEntry: (e) => {
        e.preventDefault();
        
        // Coleta dados
        const select = document.getElementById('input-subject');
        const subjectName = select.options[select.selectedIndex].text;
        const subjectColor = select.options[select.selectedIndex].dataset.color;
        const topic = document.getElementById('input-topic').value;
        
        // Captura o TEMPO DE ESTUDO (Matéria Nova), não a revisão
        const studyTimeInput = document.getElementById('input-study-time');
        const studyTime = studyTimeInput ? parseInt(studyTimeInput.value) : 60; // Fallback seguro

        // CONSTANTES DE REGRA DE NEGÓCIO (Neurociência)
        // Fatores de compressão: R1=20%, R2=10%, R3=5% do tempo original
        const COMPRESSION = { 1: 0.20, 7: 0.10, 30: 0.05 };
        
        // Teto máximo de revisão: 40% da capacidade total diária
        // Ex: Se Capacidade = 240min (4h), Teto de Revisão = 96min.
        const REVIEW_CEILING_RATIO = 0.40; 
        const reviewLimitMinutes = Math.floor(store.capacity * REVIEW_CEILING_RATIO);

        const today = new Date();
        const newReviews = [];
        let blocker = null;

        // SIMULAÇÃO: Verifica se adicionar estas revisões quebra a regra dos 40% no futuro
        for (let interval of CONFIG.intervals) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() + interval);
            const isoDate = targetDate.toISOString().split('T')[0];
            
            // Tempo estimado comprimido (mínimo de 2 min para ser viável)
            const estimatedTime = Math.max(2, Math.ceil(studyTime * COMPRESSION[interval]));

            // Carga já existente nesse dia futuro (apenas pendentes)
            const existingLoad = store.reviews
                .filter(r => r.date === isoDate && r.status !== 'DONE')
                .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
            const projectedLoad = existingLoad + estimatedTime;

            // A REGRA DE OURO: Se a projeção passar de 40% da capacidade total
            if (projectedLoad > reviewLimitMinutes) {
                blocker = {
                    date: formatDateDisplay(isoDate),
                    load: projectedLoad,
                    limit: reviewLimitMinutes,
                    interval: interval
                };
                break; // Encontrou um bloqueio, para a simulação imediatamente
            }

            // Prepara o objeto se passou no teste
            newReviews.push({
                id: Date.now() + interval, // ID único
                subject: subjectName,
                color: subjectColor,
                topic: topic,
                time: estimatedTime,
                date: isoDate,
                type: interval === 1 ? '24h' : interval === 7 ? '7d' : '30d',
                status: 'PENDING'
            });
        }

        // AÇÃO: Bloquear ou Salvar
        if (blocker) {
            // Encontrar sugestão de data simples (dia seguinte ao estudo atual)
            const suggestDate = new Date();
            suggestDate.setDate(today.getDate() + 1); 
            const suggestStr = formatDateDisplay(suggestDate.toISOString().split('T')[0]);

            toast.show(`
                <div>
                    <strong class="block text-red-700 mb-1"><i data-lucide="shield-alert" class="inline w-4 h-4"></i> Bloqueio de Segurança</strong>
                    <span class="block mb-2">Adicionar este estudo faria o dia <b>${blocker.date}</b> exceder o limite de revisões (40%).</span>
                    <span class="text-xs bg-white/50 px-2 py-1 rounded border border-red-200 block mb-1">
                        Carga Projetada: <b>${blocker.load}m</b> / Limite: <b>${blocker.limit}m</b>
                    </span>
                    <div class="mt-2 text-xs font-bold text-red-800">
                        💡 Sugestão: Dedique hoje apenas a revisões pendentes. Tente adicionar matéria nova a partir de ${suggestStr}.
                    </div>
                </div>
            `, 'error');
            
            if(window.lucide) lucide.createIcons(); // Atualiza ícones dentro do toast
            return; // ABORTA
        }

        // Se passou na validação, salva
        store.addReviews(newReviews);
        ui.toggleModal('modal-new', false);
        toast.show(`
            <div>
                <strong class="block text-emerald-400 mb-1">Sucesso!</strong>
                Estudo registrado. Revisões agendadas com compressão inteligente.
            </div>
        `);
        e.target.reset();
    },

    // --- SISTEMA DE BACKUP E RESTAURAÇÃO (NOVO v1.3.0) ---
    downloadBackup: () => {
        const data = {
            version: '1.3',
            timestamp: new Date().toISOString(),
            store: {
                reviews: store.reviews,
                subjects: store.subjects,
                capacity: store.capacity
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ciclosmart-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.show(`
            <div>
                <strong class="block text-emerald-500 mb-1">Backup Gerado!</strong>
                Salve o arquivo .json em local seguro.
            </div>
        `, 'success');
    },

    restoreData: (input) => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                
                // Validação básica de estrutura
                if (!json.store || !Array.isArray(json.store.reviews)) {
                    throw new Error("Formato de arquivo inválido.");
                }

                if (confirm(`Restaurar backup de ${formatDateDisplay(json.timestamp.split('T')[0])}? \nISSO SUBSTITUIRÁ OS DADOS ATUAIS.`)) {
                    // Atualiza a Store
                    store.reviews = json.store.reviews;
                    store.subjects = json.store.subjects || defaultSubjects;
                    store.capacity = json.store.capacity || 240;
                    store.save(); // Persiste
                    
                    // Recarrega UI
                    ui.initSubjects();
                    ui.render();
                    if(!document.getElementById('modal-heatmap').classList.contains('hidden')) {
                        ui.renderHeatmap();
                    }
                    
                    toast.show('Dados restaurados com sucesso!', 'success');
                    ui.toggleSubjectModal(false);
                }
            } catch (err) {
                console.error(err);
                toast.show('Erro ao ler arquivo de backup: ' + err.message, 'error');
            }
            // Limpa o input para permitir carregar o mesmo arquivo novamente
            input.value = '';
        };
        reader.readAsText(file);
    },

    // Atualiza a capacidade diária (chamado pelo input no Modal Heatmap)
    updateCapacitySetting: (val) => {
        const min = parseInt(val);
        if(min > 0) {
            store.capacity = min;
            store.save();
            ui.renderHeatmap(); // Atualiza visual do grid
            ui.render(); // Atualiza barra de progresso principal
        }
    },

    // Chamado pelo botão do modal de matérias
    addSubjectUI: () => {
        const nameInput = document.getElementById('new-subj-name');
        const colorInput = document.getElementById('new-subj-color');
        
        if (nameInput.value.trim()) {
            store.addSubject(nameInput.value.trim(), colorInput.value);
            nameInput.value = ''; // Limpar input
        } else {
            alert("Digite o nome da matéria.");
        }
    },

    // Trigger de Edição de Card
    promptEdit: (id) => {
        const r = store.reviews.find(x => x.id === id);
        if(!r) return;

        const newTopic = prompt("Editar Tópico:", r.topic);
        if (newTopic !== null) {
            const newTime = prompt("Editar Tempo (min):", r.time);
            if (newTime !== null && !isNaN(newTime)) {
                store.updateReview(id, newTopic, newTime);
            }
        }
    },

    // Exportação ICS
    exportICS: () => {
        const pendings = store.reviews.filter(r => r.status === 'PENDING');
        if (pendings.length === 0) return alert("Nada para exportar.");

        let icsLines = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CicloSmart//v1//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"
        ];

        pendings.forEach(r => {
            const dateStr = r.date.replace(/-/g, '');
            const startTime = `${dateStr}T090000`;
            const endTime = `${dateStr}T09${r.time < 10 ? '0' + r.time : r.time}00`; 

            icsLines.push(
                "BEGIN:VEVENT",
                `UID:${r.id}@ciclosmart.app`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${startTime}`,
                `DTEND:${endTime}`,
                `SUMMARY:${r.subject} - ${r.topic}`,
                `DESCRIPTION:Revisão ${r.type} (${r.time}min).`,
                "BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Estudar", "END:VALARM",
                "END:VEVENT"
            );
        });

        icsLines.push("END:VCALENDAR");
        const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'cronograma.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ==========================================
// 3. UI RENDERER (VIEW)
// ==========================================

const ui = {
    // --- Lógica de Abas (Mobile) ---
    switchTab: (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`tab-${tabName}`);
        if(btn) btn.classList.add('active');

        const cols = document.querySelectorAll('.kanban-column');
        cols.forEach(c => {
            c.classList.remove('flex');
            c.classList.add('hidden');
        });

        const activeCol = document.getElementById(`col-${tabName}`);
        if(activeCol) {
            activeCol.classList.remove('hidden');
            activeCol.classList.add('flex');
        }
    },

    // --- Modais ---
    toggleModal: (id, show) => {
        const el = document.getElementById(id);
        if(!el) return;
        if (show) {
            el.classList.remove('hidden');
            setTimeout(() => el.classList.remove('opacity-0'), 10);
        } else {
            el.classList.add('hidden');
        }
    },
    toggleSubjectModal: (show) => ui.toggleModal('modal-subjects', show),
    openNewStudyModal: () => ui.toggleModal('modal-new', true),
    
    // --- Heatmap (Radar de Carga) ---
    openHeatmapModal: () => {
        const input = document.getElementById('setting-capacity');
        if(input) input.value = store.capacity;
        
        ui.renderHeatmap();
        ui.toggleModal('modal-heatmap', true);
    },

    renderHeatmap: () => {
            const container = document.getElementById('heatmap-grid');
            if(!container) return;
            
            container.innerHTML = '';
            
            // Gerar próximos 30 dias
            for (let i = 0; i < 30; i++) {
                const isoDate = getRelativeDate(i);
                const displayDate = formatDateDisplay(isoDate);
                
                // Calcular carga do dia
                const dayLoad = store.reviews
                    .filter(r => r.date === isoDate && r.status !== 'DONE')
                    .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
                
                const capacity = store.capacity > 0 ? store.capacity : 240;
                const percentage = (dayLoad / capacity) * 100;
                
                // Lógica de Cores
                let colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
                if (dayLoad === 0) {
                    colorClass = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                } else if (percentage > 100) {
                    colorClass = 'bg-slate-800 border-slate-900 text-white'; 
                } else if (percentage > 80) {
                    colorClass = 'bg-red-50 border-red-200 text-red-700';
                } else if (percentage > 50) {
                    colorClass = 'bg-amber-50 border-amber-200 text-amber-700';
                }

                container.innerHTML += `
                    <div class="p-3 rounded-lg border ${colorClass} flex flex-col justify-between h-24 relative transition-all hover:scale-105">
                        <span class="text-xs font-bold opacity-70">${displayDate}</span>
                        <div class="text-center">
                            <span class="text-2xl font-bold block">${dayLoad}m</span>
                            <span class="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                                ${dayLoad > 0 ? percentage.toFixed(0) + '%' : 'Livre'}
                            </span>
                        </div>
                    </div>
                `;
            }
        },

    toggleChangelog: (show) => {
        if(show) {
            const container = document.getElementById('changelog-content');
            // AGORA USA A CONSTANTE GLOBAL changelogData
            container.innerHTML = changelogData.map(log => `
                <div class="mb-4 border-l-2 border-indigo-500 pl-3">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-slate-800 text-sm">v${log.version}</span>
                        <span class="text-xs text-slate-500">${log.date}</span>
                    </div>
                    <ul class="list-disc list-inside text-xs text-slate-600">
                        ${log.changes.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }
        ui.toggleModal('modal-changelog', show);
    },

    // --- Renderização de Matérias ---
    initSubjects: () => {
        const select = document.getElementById('input-subject');
        if(select) {
            select.innerHTML = store.subjects.map(s => 
                `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
            ).join('');
        }

        const list = document.getElementById('subject-list');
        if(list) {
            list.innerHTML = store.subjects.map(s => `
                <li class="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 rounded-full shadow-sm" style="background-color: ${s.color}"></div>
                        <span class="text-sm font-medium text-slate-700">${s.name}</span>
                    </div>
                    <button onclick="store.removeSubject('${s.id}')" class="text-slate-400 hover:text-red-500 transition-colors" title="Excluir">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </li>
            `).join('');
            if(window.lucide) lucide.createIcons();
        }
    },

    // --- Renderização Principal (Kanban) ---
    render: () => {
        const todayStr = getRelativeDate(0);
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };

        // Verifica se elementos existem antes de manipular
        if(!containers.late || !containers.today || !containers.future) return;

        Object.values(containers).forEach(el => el.innerHTML = '');

        const sorted = store.reviews.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let counts = { late: 0, today: 0, future: 0 };
        let todayLoad = 0;

        sorted.forEach(r => {
            const cardHTML = ui.createCardHTML(r);
            
            if (r.date < todayStr && r.status !== 'DONE') {
                containers.late.innerHTML += cardHTML;
                counts.late++;
            } else if (r.date === todayStr) {
                containers.today.innerHTML += cardHTML;
                counts.today++;
                if (r.status !== 'DONE') todayLoad += r.time;
            } else if (r.date > todayStr) {
                containers.future.innerHTML += cardHTML;
                counts.future++;
            }
        });

        // Atualiza Badges
        ['late', 'today', 'future'].forEach(key => {
            const countEl = document.getElementById(`count-${key}`);
            if(countEl) countEl.innerText = counts[key];
            
            const mobileBadge = document.getElementById(`badge-${key}-mobile`);
            if(mobileBadge) mobileBadge.innerText = counts[key];
        });

        // Empty States
        if(!counts.late) containers.late.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Nenhum atraso! 🎉</div>`;
        if(!counts.today) containers.today.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Tudo limpo por hoje.</div>`;
        if(!counts.future) containers.future.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Sem previsões.</div>`;

        ui.updateCapacityStats(todayLoad);
        if(window.lucide) lucide.createIcons();
    },

    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        const containerClasses = isDone 
            ? 'bg-slate-50 border-slate-200 opacity-60' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md';
            
        const textDecoration = isDone 
            ? 'line-through text-slate-400' 
            : 'text-slate-800';

        return `
            <div class="${containerClasses} p-3.5 rounded-lg border-l-[4px] transition-all mb-3 group relative" 
                 style="border-left-color: ${review.color}">
                
                <div class="flex justify-between items-start mb-1.5">
                    <div class="flex-1 pr-2">
                        <span class="text-[11px] font-black uppercase tracking-wider block mb-1" style="color: ${review.color}">
                            ${review.subject}
                        </span>
                        
                        <div class="flex flex-col gap-1">
                            <h4 class="text-sm font-bold leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${textDecoration}" 
                                title="Clique para editar" 
                                onclick="app.promptEdit(${review.id})">
                                ${review.topic}
                            </h4>

                            <div class="flex items-center mt-1">
                                <span class="text-[10px] font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded">
                                    ${review.type}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 pl-2">
                        <input type="checkbox" onclick="store.toggleStatus(${review.id})" ${isDone ? 'checked' : ''} 
                               class="appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors relative after:content-['✓'] after:absolute after:text-white after:text-xs after:left-1 after:top-0 after:hidden checked:after:block">
                        
                        <button onclick="store.deleteReview(${review.id})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir">
                            <i data-lucide="trash" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 mt-2">
                    <div class="flex items-center gap-1">
                        <i data-lucide="clock" class="w-3 h-3"></i> ${review.time} min
                    </div>
                    <div class="flex items-center gap-1">
                        <i data-lucide="calendar" class="w-3 h-3"></i> ${formatDateDisplay(review.date)}
                    </div>
                </div>
            </div>
        `;
    },

    updateCapacityStats: (todayMinutes) => {
        // Usa capacidade da store ou fallback
        const limit = store.capacity || CONFIG.defaultCapacity;
        
        const percentage = Math.min((todayMinutes / limit) * 100, 100);
        const bar = document.getElementById('capacity-bar');
        const text = document.getElementById('capacity-text');
        
        if(bar && text) {
            bar.style.width = `${percentage}%`;
            const remaining = Math.max(0, limit - todayMinutes);
            text.innerHTML = `Uso: <b>${todayMinutes}m</b> <span class="text-slate-300 mx-1">|</span> Resta: ${remaining}m`;

            bar.className = `h-full rounded-full transition-all duration-700 ease-out relative ${
                percentage > 100 ? 'bg-slate-800' : percentage > 80 ? 'bg-red-600' : percentage > 60 ? 'bg-amber-500' : 'bg-indigo-600'
            }`;
        }
    }
};

// Iniciar Aplicação
app.init();
