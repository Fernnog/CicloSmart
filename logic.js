/* --- START OF FILE logic.js --- */

/**
 * CICLOSMART CORE v1.0.5
 * Features: Neuro-SRS Engine, Capacity Lock, Backup System, Pendular Profile (Attack/Defense Modes)
 */

// ==========================================
// 1. CONFIGURAÇÃO & STORE (PERSISTÊNCIA)
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
        if(!container) return; 
        
        const el = document.createElement('div');
        const colors = type === 'error' ? 'bg-red-50 border-red-500 text-red-900' : 
                       type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                       'bg-slate-800 text-white';
        
        el.className = `toast show mb-2 p-4 rounded-lg shadow-xl border-l-4 text-sm font-medium flex items-center gap-3 min-w-[320px] max-w-md ${colors}`;
        el.innerHTML = msg; 
        
        container.appendChild(el);
        
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
    profile: 'standard', // 'standard' ou 'pendular'
    cycleState: 'ATTACK', // 'ATTACK' (Ataque) ou 'DEFENSE' (Defesa) - Novo v1.5

    load: () => {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                store.reviews = data.reviews || [];
                store.subjects = data.subjects && data.subjects.length > 0 ? data.subjects : defaultSubjects;
                store.capacity = data.capacity || CONFIG.defaultCapacity;
                store.profile = data.profile || CONFIG.profiles.STANDARD;
                store.cycleState = data.cycleState || 'ATTACK';
            } catch (e) {
                console.error("Erro ao ler dados", e);
                store.subjects = defaultSubjects;
                store.capacity = CONFIG.defaultCapacity;
                store.profile = CONFIG.profiles.STANDARD;
                store.cycleState = 'ATTACK';
            }
        } else {
            store.subjects = [...defaultSubjects];
            store.reviews = []; 
            store.capacity = CONFIG.defaultCapacity;
            store.profile = CONFIG.profiles.STANDARD;
            store.cycleState = 'ATTACK';
        }
    },

    save: () => {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({
            reviews: store.reviews,
            subjects: store.subjects,
            capacity: store.capacity,
            profile: store.profile,
            cycleState: store.cycleState
        }));
    },

    // --- Métodos de Matérias ---
    addSubject: (name, color) => {
        store.subjects.push({ id: 'sub-' + Date.now(), name, color });
        store.save();
        ui.initSubjects(); 
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
        ui.initSubjects(); 
        ui.render();
        
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        // Inicializar UI do perfil
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;
        
        // Listener para o botão Novo Estudo (Interceptação v1.5)
        const btnNew = document.getElementById('btn-new-study');
        if(btnNew) btnNew.onclick = app.handleNewStudyClick;

        app.updateProfileUI(store.profile); 
        ui.updateModeUI(); // Atualiza HUD v1.5

        ui.switchTab('today');
    },

    setProfile: (mode) => {
        store.profile = mode;
        store.save();
        app.updateProfileUI(mode);
        ui.updateModeUI(); // Atualiza visibilidade do HUD
        
        const msg = mode === 'pendular' 
            ? 'Modo Pendular Ativado: Teto de 90min e Ciclo Ataque/Defesa.' 
            : 'Modo Integrado Ativado: Sem limites rígidos.';
        
        toast.show(msg, 'success');
    },

    // --- NOVA LÓGICA v1.5: Alternância de Ciclo ---
    toggleMode: () => {
        // Só permite troca se estiver no perfil Pendular
        if (store.profile !== 'pendular') {
            toast.show('Alterne para o perfil Pendular nas configurações para usar este modo.', 'info');
            return;
        }

        store.cycleState = store.cycleState === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
        store.save();
        ui.updateModeUI();
        
        const msg = store.cycleState === 'ATTACK' 
            ? '⚔️ Modo ATAQUE: Matéria nova liberada!' 
            : '🛡️ Modo DEFESA: Apenas revisões hoje.';
        
        // 'error' usa cor vermelha (agressiva/ataque), 'info' azul (defesa)
        toast.show(msg, store.cycleState === 'ATTACK' ? 'error' : 'info'); 
    },

    // --- NOVA LÓGICA v1.5: Gatekeeper (Bloqueio) ---
    handleNewStudyClick: () => {
        if (store.profile === 'pendular' && store.cycleState === 'DEFENSE') {
            toast.show(`
                <div>
                    <strong class="block text-indigo-700 mb-1">🛡️ Bloqueio de Disciplina</strong>
                    Hoje é dia de <b>Defesa</b>. Seu foco deve ser zerar as revisões pendentes.<br>
                    <span class="text-xs opacity-75 mt-1 block">Dica: Se errou o dia, clique no ícone de Escudo no topo para trocar.</span>
                </div>
            `, 'info');
            return;
        }
        ui.openNewStudyModal();
    },

    updateProfileUI: (mode) => {
        const timeInput = document.getElementById('input-study-time');
        const warning = document.getElementById('time-warning');
        
        if(!timeInput) return;

        if (mode === 'pendular') {
            timeInput.max = 90;
            if(parseInt(timeInput.value) > 90) timeInput.value = 90;
            if(warning) warning.classList.remove('hidden');
        } else {
            timeInput.max = 300;
            if(warning) warning.classList.add('hidden');
        }
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        
        // Coleta dados
        const select = document.getElementById('input-subject');
        const subjectName = select.options[select.selectedIndex].text;
        const subjectColor = select.options[select.selectedIndex].dataset.color;
        const topic = document.getElementById('input-topic').value;
        const studyTimeInput = document.getElementById('input-study-time');
        const studyTime = studyTimeInput ? parseInt(studyTimeInput.value) : 60; 

        // VALIDAÇÃO DO MODO PENDULAR (Tempo)
        if (store.profile === 'pendular' && studyTime > 90) {
            return toast.show(`
                <div>
                    <strong class="block text-red-700 mb-1">Atenção: Modo Pendular</strong>
                    O tempo limite para estudo de qualidade neste modo é <b>90 minutos</b>.
                </div>
            `, 'error');
        }

        // --- NOVA CAPTURA DA DATA ---
        const dateInput = document.getElementById('input-study-date');
        const selectedDateStr = dateInput.value; // Formato YYYY-MM-DD
        const baseDate = new Date(selectedDateStr + 'T12:00:00');

        // CONSTANTES DE REGRA DE NEGÓCIO
        const COMPRESSION = { 1: 0.20, 7: 0.10, 30: 0.05 };
        const REVIEW_CEILING_RATIO = 0.40; 
        const reviewLimitMinutes = Math.floor(store.capacity * REVIEW_CEILING_RATIO);

        const newReviews = [];
        let blocker = null;

        // 1. REGISTRO DO ESTUDO ORIGINAL (AQUISIÇÃO)
        const acquisitionEntry = {
            id: Date.now() + Math.random(), 
            subject: subjectName,
            color: subjectColor,
            topic: topic,
            time: studyTime,
            date: selectedDateStr, 
            type: 'NOVO', 
            status: 'PENDING'
        };
        newReviews.push(acquisitionEntry);

        // 2. SIMULAÇÃO E GERAÇÃO DAS REVISÕES FUTURAS
        for (let interval of CONFIG.intervals) {
            // LÓGICA DO MODO PENDULAR: AJUSTE DE DATAS
            // Se intervalo for 7 ou 30 dias, somamos +1 para cair no dia de "Defesa" (alternado)
            let effectiveInterval = interval;
            if (store.profile === 'pendular') {
                if (interval === 7) effectiveInterval = 8;
                if (interval === 30) effectiveInterval = 31;
            }

            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + effectiveInterval);
            const isoDate = targetDate.toISOString().split('T')[0];
            
            const estimatedTime = Math.max(2, Math.ceil(studyTime * COMPRESSION[interval]));

            // Carga já existente nesse dia futuro
            const existingLoad = store.reviews
                .filter(r => r.date === isoDate && r.status !== 'DONE')
                .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
            const projectedLoad = existingLoad + estimatedTime;

            // Bloqueio de segurança
            if (projectedLoad > reviewLimitMinutes) {
                blocker = {
                    date: formatDateDisplay(isoDate),
                    load: projectedLoad,
                    limit: reviewLimitMinutes,
                    interval: effectiveInterval
                };
                break; 
            }

            // Define o rótulo do tipo de revisão
            let typeLabel = interval === 1 ? '24h' : interval + 'd';
            if (store.profile === 'pendular') {
                typeLabel = interval === 1 ? 'Defesa' : effectiveInterval + 'd+'; 
            }

            // Prepara o objeto se passou no teste
            newReviews.push({
                id: Date.now() + Math.random() + effectiveInterval,
                subject: subjectName,
                color: subjectColor,
                topic: topic,
                time: estimatedTime,
                date: isoDate,
                type: typeLabel,
                status: 'PENDING'
            });
        }

        // AÇÃO: Bloquear ou Salvar
        if (blocker) {
            toast.show(`
                <div>
                    <strong class="block text-red-700 mb-1"><i data-lucide="shield-alert" class="inline w-4 h-4"></i> Bloqueio de Segurança</strong>
                    <span class="block mb-2">Adicionar este estudo faria o dia <b>${blocker.date}</b> exceder o limite de revisões (40%).</span>
                    <span class="text-xs bg-white/50 px-2 py-1 rounded border border-red-200 block mb-1">
                        Carga Projetada: <b>${blocker.load}m</b> / Limite: <b>${blocker.limit}m</b>
                    </span>
                    <div class="mt-2 text-xs font-bold text-red-800">
                        💡 Sugestão: Tente reduzir o tempo de estudo inicial ou agendar para outra data.
                    </div>
                </div>
            `, 'error');
            
            if(window.lucide) lucide.createIcons();
            return; 
        }

        store.addReviews(newReviews);
        ui.toggleModal('modal-new', false);
        
        // Feedback diferenciado para registro retroativo
        const todayStr = new Date().toISOString().split('T')[0];
        const msg = selectedDateStr < todayStr 
            ? 'Estudo retroativo registrado. Verifique a lista de "Atrasados".'
            : 'Estudo registrado e revisões agendadas com sucesso.';

        toast.show(`
            <div>
                <strong class="block text-emerald-400 mb-1">Sucesso!</strong>
                ${msg}
            </div>
        `, 'success');
        
        e.target.reset();
        // Reset manual para garantir visual do profile
        app.updateProfileUI(store.profile);
    },

    downloadBackup: () => {
        const data = {
            version: '1.5',
            timestamp: new Date().toISOString(),
            store: {
                reviews: store.reviews,
                subjects: store.subjects,
                capacity: store.capacity,
                profile: store.profile,
                cycleState: store.cycleState
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
                
                if (!json.store || !Array.isArray(json.store.reviews)) {
                    throw new Error("Formato de arquivo inválido.");
                }

                if (confirm(`Restaurar backup de ${formatDateDisplay(json.timestamp.split('T')[0])}? \nISSO SUBSTITUIRÁ OS DADOS ATUAIS.`)) {
                    store.reviews = json.store.reviews;
                    store.subjects = json.store.subjects || defaultSubjects;
                    store.capacity = json.store.capacity || 240;
                    store.profile = json.store.profile || 'standard';
                    store.cycleState = json.store.cycleState || 'ATTACK';
                    store.save(); 
                    
                    ui.initSubjects();
                    ui.render();
                    app.init(); // Re-init para pegar UI do profile e HUD
                    
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
            input.value = '';
        };
        reader.readAsText(file);
    },

    updateCapacitySetting: (val) => {
        const min = parseInt(val);
        if(min > 0) {
            store.capacity = min;
            store.save();
            ui.renderHeatmap(); 
            ui.render(); 
        }
    },

    addSubjectUI: () => {
        const nameInput = document.getElementById('new-subj-name');
        const colorInput = document.getElementById('new-subj-color');
        
        if (nameInput.value.trim()) {
            store.addSubject(nameInput.value.trim(), colorInput.value);
            nameInput.value = ''; 
        } else {
            alert("Digite o nome da matéria.");
        }
    },

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

    // --- NOVA LÓGICA UI v1.5: Atualiza HUD e Botões ---
    updateModeUI: () => {
        const btnMode = document.getElementById('mode-toggle');
        const iconMode = document.getElementById('mode-icon');
        const textMode = document.getElementById('mode-text');
        const btnNew = document.getElementById('btn-new-study');
        const iconNew = document.getElementById('icon-new-study');

        if (!btnMode || !btnNew) return;

        // 1. Visibilidade do Toggle (Apenas Pendular)
        if (store.profile !== 'pendular') {
            btnMode.classList.add('hidden');
            btnNew.disabled = false;
            btnNew.classList.remove('opacity-50', 'cursor-not-allowed');
            if(iconNew) iconNew.setAttribute('data-lucide', 'plus');
            if(window.lucide) lucide.createIcons();
            return;
        }

        btnMode.classList.remove('hidden');

        // 2. Atualiza Estilo do HUD e Botão Principal
        if (store.cycleState === 'ATTACK') {
            btnMode.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-md ml-4 mode-attack';
            textMode.innerText = 'Dia de Ataque';
            iconMode.setAttribute('data-lucide', 'sword');
            
            // Libera botão
            btnNew.disabled = false;
            iconNew.setAttribute('data-lucide', 'plus');
        } else {
            btnMode.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-md ml-4 mode-defense';
            textMode.innerText = 'Dia de Defesa';
            iconMode.setAttribute('data-lucide', 'shield');
            
            // Bloqueia visualmente botão
            // Nota: O bloqueio lógico está no handleNewStudyClick, mas aqui mudamos o ícone
            iconNew.setAttribute('data-lucide', 'lock');
        }
        
        if (window.lucide) lucide.createIcons();
    },

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
    
    openNewStudyModal: () => {
        const dateInput = document.getElementById('input-study-date');
        if(dateInput) {
            // Garante o formato YYYY-MM-DD com base no fuso local
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        // Garante que o input de tempo respeite o perfil atual
        app.updateProfileUI(store.profile);
        ui.toggleModal('modal-new', true);
    },
    
    openHeatmapModal: () => {
        const input = document.getElementById('setting-capacity');
        if(input) input.value = store.capacity;
        
        // Sincroniza radio button
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;

        ui.renderHeatmap();
        ui.toggleModal('modal-heatmap', true);
    },

    renderHeatmap: () => {
            const container = document.getElementById('heatmap-grid');
            if(!container) return;
            
            container.innerHTML = '';
            
            for (let i = 0; i < 30; i++) {
                const isoDate = getRelativeDate(i);
                const displayDate = formatDateDisplay(isoDate);
                
                const dayLoad = store.reviews
                    .filter(r => r.date === isoDate && r.status !== 'DONE')
                    .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
                
                const capacity = store.capacity > 0 ? store.capacity : 240;
                const percentage = (dayLoad / capacity) * 100;
                
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

    render: () => {
        const todayStr = getRelativeDate(0);
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };

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

        ['late', 'today', 'future'].forEach(key => {
            const countEl = document.getElementById(`count-${key}`);
            if(countEl) countEl.innerText = counts[key];
            
            const mobileBadge = document.getElementById(`badge-${key}-mobile`);
            if(mobileBadge) mobileBadge.innerText = counts[key];
        });

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

app.init();
