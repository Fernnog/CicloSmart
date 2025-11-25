/**
 * ARQUITETURA DE PRODUTO FRONT-END | CICLOSMART CORE
 * 
 * Este arquivo orquestra toda a lógica de negócios client-side.
 * Arquitetura: MV (Model-View) simplificada.
 * 
 * 1. Store: Gerencia o estado dos dados (In-Memory DB).
 * 2. SRS Engine: Aplica a Curva de Ebbinghaus (24h, 7d, 30d).
 * 3. ICS Generator: Serializa objetos JS para formato iCalendar.
 * 4. UI Controller: Manipula o DOM de forma reativa.
 */

// ==========================================
// 1. CONFIGURAÇÃO & UTILITÁRIOS
// ==========================================

const CONFIG = {
    dailyCapacityMinutes: 240, // Meta: 4 horas de estudo
    intervals: [1, 7, 30],     // Regra de Negócio: Ebbinghaus (1 dia, 1 semana, 1 mês)
    locale: 'pt-BR'
};

/**
 * Utilitário de Datas: Retorna uma data relativa a "Hoje" formatada como YYYY-MM-DD
 * @param {number} daysOffset - Dias a somar/subtrair
 */
const getRelativeDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
};

/**
 * Formata data para exibição amigável (dd/mm)
 */
const formatDateDisplay = (isoDate) => {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}`;
};

// ==========================================
// 2. STATE MANAGEMENT (MOCK DB)
// ==========================================

const store = {
    // Dados iniciais para demonstração (Seed Data)
    reviews: [
        { 
            id: 101, 
            subject: 'Direito Constitucional', 
            topic: 'Art. 5º - Direitos e Deveres', 
            color: '#3b82f6', // Blue
            date: getRelativeDate(-1), // Ontem (Atrasado)
            time: 45, 
            type: '24h', 
            status: 'PENDING' 
        },
        { 
            id: 102, 
            subject: 'Português', 
            topic: 'Regência Verbal e Nominal', 
            color: '#ef4444', // Red
            date: getRelativeDate(0), // Hoje
            time: 30, 
            type: '7d', 
            status: 'PENDING' 
        },
        { 
            id: 103, 
            subject: 'Raciocínio Lógico', 
            topic: 'Tabelas Verdade', 
            color: '#10b981', // Green
            date: getRelativeDate(2), // Daqui a 2 dias
            time: 60, 
            type: '30d', 
            status: 'PENDING' 
        }
    ],

    // Métodos de acesso aos dados
    addReviews: (newReviews) => {
        store.reviews = [...store.reviews, ...newReviews];
        ui.render(); // Reatividade simples: mudou dados, pinta tela
    },

    toggleStatus: (id) => {
        const review = store.reviews.find(r => r.id === id);
        if (review) {
            review.status = review.status === 'PENDING' ? 'DONE' : 'PENDING';
            ui.render();
        }
    },

    getReviewsByDate: (dateStr) => store.reviews.filter(r => r.date === dateStr),
    getLateReviews: (dateStr) => store.reviews.filter(r => r.date < dateStr && r.status !== 'DONE'),
    getFutureReviews: (dateStr) => store.reviews.filter(r => r.date > dateStr)
};

// ==========================================
// 3. LOGIC CONTROLLER (APP)
// ==========================================

const app = {
    init: () => {
        console.log("CicloSmart v1.2 Initializing...");
        ui.render();
        
        // Setup de Event Listeners
        document.getElementById('form-study').addEventListener('submit', app.handleNewEntry);
    },

    /**
     * SRS ENGINE: Trigger disparado ao criar novo estudo.
     * Gera automaticamente as 3 entradas de revisão.
     */
    handleNewEntry: (e) => {
        e.preventDefault();

        // Extração de dados do form
        const subjectEl = document.getElementById('input-subject');
        const topic = document.getElementById('input-topic').value;
        const time = parseInt(document.getElementById('input-time').value);

        const subjectName = subjectEl.options[subjectEl.selectedIndex].text;
        const color = subjectEl.options[subjectEl.selectedIndex].getAttribute('data-color');
        
        const today = new Date();
        const newReviews = [];

        // Loop de geração baseado nos intervalos configurados
        CONFIG.intervals.forEach((interval, index) => {
            const rDate = new Date();
            rDate.setDate(today.getDate() + interval);
            
            const reviewType = interval === 1 ? '24h' : interval === 7 ? '7d' : '30d';

            newReviews.push({
                id: Date.now() + index, // Simple UID generation
                subject: subjectName,
                topic: topic,
                color: color,
                date: rDate.toISOString().split('T')[0],
                time: time,
                type: reviewType,
                status: 'PENDING'
            });
        });

        store.addReviews(newReviews);
        ui.toggleModal(false);
        e.target.reset(); // Limpa form
        
        // Feedback visual simples
        alert(`Sucesso! 3 revisões agendadas para: ${topic}`);
    },

    /**
     * ICS EXPORTER: Converte dados em arquivo .ics (RFC 5545)
     * Não depende de backend. Roda 100% no browser.
     */
    exportICS: () => {
        const pendings = store.reviews.filter(r => r.status === 'PENDING');
        
        if (pendings.length === 0) {
            alert("Nenhuma revisão pendente para exportar.");
            return;
        }

        // Construção do arquivo linha a linha
        let icsLines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//CicloSmart//EdTech MVP//PT-BR",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        ];

        pendings.forEach(r => {
            // Formatar data: YYYYMMDD
            const dateStr = r.date.replace(/-/g, '');
            
            // Define horário fixo fictício para o calendário (09:00 AM)
            // Em uma v2.0, isso seria customizável pelo usuário
            const startTime = `${dateStr}T090000`;
            
            // Calcula horário de fim somando minutos (Simples para MVP)
            // Nota: Para precisão real de tempo, usaríamos objeto Date, aqui é string manipulation simples
            const endTime = `${dateStr}T09${r.time < 10 ? '0' + r.time : r.time}00`; 

            icsLines.push(
                "BEGIN:VEVENT",
                `UID:${r.id}@ciclosmart.app`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${startTime}`,
                `DTEND:${endTime}`,
                `SUMMARY:Revisar ${r.subject}: ${r.topic}`,
                `DESCRIPTION:Ciclo SRS (${r.type}). Tempo estimado: ${r.time} min.`,
                `CATEGORIES:${r.subject}`,
                "BEGIN:VALARM",
                "TRIGGER:-PT15M", // Notificar 15 min antes
                "ACTION:DISPLAY",
                "DESCRIPTION:Hora de Estudar!",
                "END:VALARM",
                "END:VEVENT"
            );
        });

        icsLines.push("END:VCALENDAR");

        // Criação do Blob (Arquivo Virtual)
        const fileContent = icsLines.join("\r\n");
        const blob = new Blob([fileContent], { type: 'text/calendar;charset=utf-8' });
        
        // Trigger de Download
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'meu_cronograma_estudos.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ==========================================
// 4. UI RENDERER (VIEW)
// ==========================================

const ui = {
    // Controla visibilidade do Modal
    toggleModal: (isOpen) => {
        const modal = document.getElementById('modal-new');
        if (isOpen) {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.add('opacity-100'), 10); // Fade in
        } else {
            modal.classList.remove('opacity-100');
            setTimeout(() => modal.classList.add('hidden'), 300); // Wait for transition
        }
    },

    // Gera o HTML de um Card de Revisão
    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        const opacityClass = isDone ? 'opacity-50 grayscale' : 'opacity-100';
        const lineThrough = isDone ? 'line-through text-slate-400' : 'text-slate-800';
        
        return `
            <div class="bg-white p-4 rounded-lg border-l-[6px] shadow-sm hover:shadow-md transition-all duration-200 fade-in group relative" 
                 style="border-left-color: ${review.color};" class="${opacityClass}">
                
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-1" style="background-color: ${review.color}">
                            ${review.type}
                        </span>
                        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide ml-1">
                            ${review.subject}
                        </span>
                        <h4 class="text-sm font-bold mt-0.5 ${lineThrough}">
                            ${review.topic}
                        </h4>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" onclick="store.toggleStatus(${review.id})" ${isDone ? 'checked' : ''} class="sr-only peer">
                        <div class="w-5 h-5 bg-slate-200 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center">
                            <svg class="w-3 h-3 text-white ${isDone ? 'block' : 'hidden'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </label>
                </div>
                
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50 mt-2">
                    <div class="flex items-center gap-1.5">
                        <i data-lucide="clock" class="w-3 h-3"></i> 
                        <span class="font-medium">${review.time} min</span>
                    </div>
                    <div class="flex items-center gap-1.5 font-medium ${review.date < getRelativeDate(0) ? 'text-red-500' : 'text-slate-400'}">
                        <i data-lucide="calendar" class="w-3 h-3"></i>
                        ${formatDateDisplay(review.date)}
                    </div>
                </div>
            </div>
        `;
    },

    // Atualiza a Barra de Capacidade (Capacity Planning)
    updateCapacityStats: (todayMinutes) => {
        const percentage = Math.min((todayMinutes / CONFIG.dailyCapacityMinutes) * 100, 100);
        const bar = document.getElementById('capacity-bar');
        const text = document.getElementById('capacity-text');
        
        // Atualiza Width
        bar.style.width = `${percentage}%`;
        
        // Atualiza Texto
        const remaining = CONFIG.dailyCapacityMinutes - todayMinutes;
        text.innerHTML = `Utilizado: <b>${todayMinutes}m</b> <span class="text-slate-400">|</span> Restante: ${remaining}m`;

        // Lógica Semântica de Cores (Verde -> Amarelo -> Vermelho)
        bar.className = `h-full rounded-full transition-all duration-700 ease-out relative ${
            percentage > 100 ? 'bg-red-600' : 
            percentage > 80 ? 'bg-amber-500' : 
            'bg-indigo-600'
        }`;
    },

    // Renderiza toda a tela (Pipeline de Renderização)
    render: () => {
        const todayStr = getRelativeDate(0);
        
        // Seletores
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };
        
        // Limpa containers
        Object.values(containers).forEach(el => el.innerHTML = '');

        // Ordena dados cronologicamente
        const sortedData = store.reviews.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let todayLoad = 0;
        let counts = { late: 0, today: 0, future: 0 };

        sortedData.forEach(item => {
            const cardHTML = ui.createCardHTML(item);
            
            // Lógica de Distribuição nas Colunas (Kanban Logic)
            if (item.date < todayStr && item.status !== 'DONE') {
                containers.late.innerHTML += cardHTML;
                counts.late++;
            } else if (item.date === todayStr) {
                containers.today.innerHTML += cardHTML;
                counts.today++;
                if (item.status !== 'DONE') todayLoad += item.time;
            } else if (item.date > todayStr) {
                containers.future.innerHTML += cardHTML;
                counts.future++;
            }
        });

        // Atualiza Contadores (Badges)
        document.getElementById('count-late').innerText = counts.late;
        document.getElementById('count-today').innerText = counts.today;
        document.getElementById('count-future').innerText = counts.future;

        // Empty States (Feedback quando não há itens)
        if (!counts.late) containers.late.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm italic">Nenhum atraso.<br>Você está em dia! 🚀</div>`;
        if (!counts.today) containers.today.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm italic">Nada agendado para hoje.</div>`;

        // Atualiza Barra de Capacidade
        ui.updateCapacityStats(todayLoad);

        // Re-renderizar ícones do Lucide
        lucide.createIcons();
    }
};

// Start App
app.init();
