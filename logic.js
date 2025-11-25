/* --- START OF FILE logic.js --- */

/**
 * CICLOSMART CORE v1.0.0
 * Features: SRS Engine, ICS Export, LocalStorage Persistence, Mobile Tabs, Dynamic Subjects
 */

// ==========================================
// 1. CONFIGURAÇÃO & STORE (PERSISTÊNCIA)
// ==========================================

const CONFIG = {
    dailyCapacityMinutes: 240, // 4 horas
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
    { version: '1.0.0', date: 'Hoje', changes: ['Persistência de Dados (LocalStorage)', 'Gestão de Matérias Personalizadas', 'Edição de Revisões e Exclusão', 'Navegação por Abas no Mobile'] },
    { version: '0.9.0', date: 'Anterior', changes: ['MVP Inicial', 'Algoritmo SRS', 'Exportação ICS'] }
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

    // Carrega dados do LocalStorage ou usa padrões
    load: () => {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                store.reviews = data.reviews || [];
                store.subjects = data.subjects && data.subjects.length > 0 ? data.subjects : defaultSubjects;
            } catch (e) {
                console.error("Erro ao ler dados", e);
                store.subjects = defaultSubjects;
            }
        } else {
            store.subjects = [...defaultSubjects];
            store.reviews = []; 
        }
    },

    // Salva estado atual
    save: () => {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
            reviews: store.reviews,
            subjects: store.subjects
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

    // Exportação ICS (Mantida lógica original, adaptada para store)
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
        // 1. Atualiza botões
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // 2. Controla visibilidade das colunas (classe .flex vs .hidden)
        // Reset: esconde todas
        const cols = document.querySelectorAll('.kanban-column');
        cols.forEach(c => {
            c.classList.remove('flex');
            c.classList.add('hidden');
        });

        // Ativa a escolhida
        const activeCol = document.getElementById(`col-${tabName}`);
        activeCol.classList.remove('hidden');
        activeCol.classList.add('flex');
    },

    // --- Modais ---
    toggleModal: (id, show) => {
        const el = document.getElementById(id);
        if (show) {
            el.classList.remove('hidden');
            // Timeout pequeno para permitir transição de opacidade se houver CSS
            setTimeout(() => el.classList.remove('opacity-0'), 10);
        } else {
            el.classList.add('hidden');
        }
    },
    toggleSubjectModal: (show) => ui.toggleModal('modal-subjects', show),
    openNewStudyModal: () => ui.toggleModal('modal-new', true),
    
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
        // 1. Popula Select do Form
        const select = document.getElementById('input-subject');
        select.innerHTML = store.subjects.map(s => 
            `<option value="${s.id}" data-color="${s.color}">${s.name}</option>`
        ).join('');

        // 2. Popula Lista do Modal de Gestão
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

        // Limpa tudo
        Object.values(containers).forEach(el => el.innerHTML = '');

        // Ordena por data
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

        // Atualiza Badges (Desktop e Mobile)
        ['late', 'today', 'future'].forEach(key => {
            document.getElementById(`count-${key}`).innerText = counts[key];
            // Atualiza badge mobile se existir
            const mobileBadge = document.getElementById(`badge-${key}-mobile`);
            if(mobileBadge) mobileBadge.innerText = counts[key];
        });

        // Empty States
        if(!counts.late) containers.late.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Nenhum atraso! 🎉</div>`;
        if(!counts.today) containers.today.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Tudo limpo por hoje.</div>`;
        if(!counts.future) containers.future.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs italic">Sem previsões.</div>`;

        // Capacidade
        ui.updateCapacityStats(todayLoad);
        
        lucide.createIcons();
    },

    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        const opacity = isDone ? 'opacity-60 grayscale' : '';
        
        // COR NA FONTE DO NOME DA MATÉRIA
        return `
            <div class="bg-white p-3.5 rounded-lg border-l-[5px] shadow-sm hover:shadow-md transition-all mb-3 group relative ${opacity}" 
                 style="border-left-color: ${review.color}">
                
                <div class="flex justify-between items-start mb-1.5">
                    <div class="flex-1 pr-2">
                        <!-- Nome da Matéria Colorido -->
                        <span class="text-[10px] font-bold uppercase tracking-wider block mb-0.5" style="color: ${review.color}">
                            ${review.subject}
                        </span>
                        
                        <div class="flex items-start gap-2">
                            <span class="text-[10px] font-bold text-white px-1.5 py-0.5 rounded self-start mt-0.5" style="background-color: ${review.color}">
                                ${review.type}
                            </span>
                            <!-- Título Editável -->
                            <h4 class="text-sm font-bold text-slate-800 leading-snug cursor-pointer hover:text-indigo-600 transition-colors" 
                                title="Clique para editar" 
                                onclick="app.promptEdit(${review.id})">
                                ${review.topic}
                            </h4>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 pl-2">
                        <input type="checkbox" onclick="store.toggleStatus(${review.id})" ${isDone ? 'checked' : ''} 
                               class="appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors relative after:content-['✓'] after:absolute after:text-white after:text-xs after:left-1 after:top-0 after:hidden checked:after:block">
                        
                        <!-- Botão Excluir (Só aparece no Hover em Desktop, sempre visível se mobile ou ajustado via CSS se preferir) -->
                        <button onclick="store.deleteReview(${review.id})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir">
                            <i data-lucide="trash" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50 mt-1">
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
        const percentage = Math.min((todayMinutes / CONFIG.dailyCapacityMinutes) * 100, 100);
        const bar = document.getElementById('capacity-bar');
        const text = document.getElementById('capacity-text');
        
        bar.style.width = `${percentage}%`;
        const remaining = Math.max(0, CONFIG.dailyCapacityMinutes - todayMinutes);
        text.innerHTML = `Uso: <b>${todayMinutes}m</b> <span class="text-slate-300 mx-1">|</span> Resta: ${remaining}m`;

        bar.className = `h-full rounded-full transition-all duration-700 ease-out relative ${
            percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-amber-500' : 'bg-indigo-600'
        }`;
    }
};

// Iniciar Aplicação
app.init();