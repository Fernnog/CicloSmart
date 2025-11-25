/* --- START OF FILE logic.js --- */

/**
 * CICLOSMART CORE v1.2.0
 * Features: SRS Engine, ICS Export, LocalStorage Persistence, Heatmap & Visual Refinements
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

const changelogData = [
    { 
        version: '1.0.1', 
        date: 'Hoje', 
        changes: [
            '✨ <strong>Novo Radar de Carga:</strong> Visualize sua ocupação futura em um calendário térmico (Heatmap).',
            '🎨 <strong>Refinamento Visual:</strong> Nome da matéria agora segue a cor da disciplina; Badges de tempo com visual neutro.',
            '✅ <strong>Feedback de Conclusão:</strong> Cards marcados como feitos ficam riscados e com menor opacidade.',
            '⚙️ <strong>Configuração Dinâmica:</strong> Defina sua capacidade de minutos por dia diretamente no Radar.'
        ] 
    },
    { 
        version: '1.0.0', 
        date: 'Anterior', 
        changes: [
            'Persistência de Dados (LocalStorage)', 
            'Gestão de Matérias Personalizadas', 
            'Edição de Revisões e Exclusão', 
            'Navegação por Abas no Mobile'
        ] 
    },
    { 
        version: '0.9.0', 
        date: 'Alpha', 
        changes: [
            'MVP Inicial', 
            'Algoritmo SRS', 
            'Exportação ICS'
        ] 
    }
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
        document.getElementById('form-study').addEventListener('submit', app.handleNewEntry);
        
        // Define aba inicial mobile
        ui.switchTab('today');
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        
        // Coleta dados do Select de Matéria
        const select = document.getElementById('input-subject');
        const selectedOption = select.options[select.selectedIndex];
        const subjectName = selectedOption.text;
        const subjectColor = selectedOption.dataset.color;

        const topic = document.getElementById('input-topic').value;
        const time = parseInt(document.getElementById('input-time').value);

        const today = new Date();
        const newReviews = [];

        // Gera 3 revisões (24h, 7d, 30d)
        CONFIG.intervals.forEach((interval) => {
            const rDate = new Date();
            rDate.setDate(today.getDate() + interval);
            const rType = interval === 1 ? '24h' : interval === 7 ? '7d' : '30d';

            newReviews.push({
                id: Date.now() + interval, // Simple ID gen
                subject: subjectName,
                color: subjectColor,
                topic: topic,
                time: time,
                date: rDate.toISOString().split('T')[0],
                type: rType,
                status: 'PENDING'
            });
        });

        store.addReviews(newReviews);
        ui.toggleModal('modal-new', false);
        e.target.reset();
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
        document.getElementById(`tab-${tabName}`).classList.add('active');

        const cols = document.querySelectorAll('.kanban-column');
        cols.forEach(c => {
            c.classList.remove('flex');
            c.classList.add('hidden');
        });

        const activeCol = document.getElementById(`col-${tabName}`);
        activeCol.classList.remove('hidden');
        activeCol.classList.add('flex');
    },

    // --- Modais ---
    toggleModal: (id, show) => {
        const el = document.getElementById(id);
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
        // Popula o input com a capacidade atual salva
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
            const date = new Date();
            date.setDate(date.getDate() + i);
            const isoDate = date.toISOString().split('T')[0];
            const displayDate = formatDateDisplay(isoDate);
            
            // Calcular carga do dia
            const dayLoad = store.reviews
                .filter(r => r.date === isoDate && r.status !== 'PENDING' && r.status !== 'DONE') // Conta tudo que não for lixo, mas aqui queremos carga pendente.
                // Ajuste: Queremos ver a carga TOTAL agendada (Pendente + Feito no dia? Geralmente carga futura é pendente)
                // Vamos somar apenas o que está agendado para o futuro ou pendente hoje.
                .filter(r => r.date === isoDate && r.status !== 'DONE') 
                .reduce((acc, curr) => acc + curr.time, 0);
            
            const percentage = (dayLoad / store.capacity) * 100;
            
            // Definição de Cores do Heatmap
            let colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700'; // Verde (Leve)
            if (percentage > 100) colorClass = 'bg-slate-800 border-slate-900 text-white'; // Estouro Crítico
            else if (percentage > 80) colorClass = 'bg-red-50 border-red-200 text-red-700'; // Pesado
            else if (percentage > 50) colorClass = 'bg-amber-50 border-amber-200 text-amber-700'; // Moderado

            container.innerHTML += `
                <div class="p-3 rounded-lg border ${colorClass} flex flex-col justify-between h-24 relative transition-all hover:scale-105 cursor-default">
                    <span class="text-xs font-bold opacity-70">${displayDate}</span>
                    <div class="text-center">
                        <span class="text-2xl font-bold block leading-none mb-1">${dayLoad}m</span>
                        <span class="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                            ${percentage > 100 ? '!!!' : percentage.toFixed(0) + '%'}
                        </span>
                    </div>
                </div>
            `;
        }
    },

    toggleChangelog: (show) => {
        if(show) {
            const container = document.getElementById('changelog-content');
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
        select.innerHTML = store.subjects.map(s => 
            `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
        ).join('');

        const list = document.getElementById('subject-list');
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
        lucide.createIcons();
    },

    // --- Renderização Principal (Kanban) ---
    render: () => {
        const todayStr = getRelativeDate(0);
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };

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
        lucide.createIcons();
    },

    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        // Estilos Condicionais
        // Se concluído: Fundo cinza claro, opacidade reduzida, sem sombra forte
        const containerClasses = isDone 
            ? 'bg-slate-50 border-slate-200 opacity-60' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md';
            
        // Se concluído: Texto riscado (line-through) e cinza
        const textDecoration = isDone 
            ? 'line-through text-slate-400' 
            : 'text-slate-800';

        return `
            <div class="${containerClasses} p-3.5 rounded-lg border-l-[4px] transition-all mb-3 group relative" 
                 style="border-left-color: ${review.color}">
                
                <div class="flex justify-between items-start mb-1.5">
                    <div class="flex-1 pr-2">
                        <!-- Nome da Matéria: AGORA COM A COR DA DISCIPLINA -->
                        <span class="text-[11px] font-black uppercase tracking-wider block mb-1" style="color: ${review.color}">
                            ${review.subject}
                        </span>
                        
                        <div class="flex flex-col gap-1">
                            <!-- Tópico: Riscado se concluído -->
                            <h4 class="text-sm font-bold leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${textDecoration}" 
                                title="Clique para editar" 
                                onclick="app.promptEdit(${review.id})">
                                ${review.topic}
                            </h4>

                            <!-- Badge de Tempo: FUNDO ESCURO PADRÃO (PRETO/CINZA ESCURO) E FONTE BRANCA -->
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
