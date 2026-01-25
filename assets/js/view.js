/* --- ASSETS/JS/VIEW.JS --- */
/**
 * UI RENDERER (View Layer) - v1.3.4 Updated
 * Responsável exclusivamente por: Manipulação de DOM, Templates HTML e Feedback Visual.
 * ATUALIZADO: Correção de Layout Grid (Desktop Fix) + UX Improvements + Smart Copy & Links.
 */

const ui = {
    // Navegação e Layout
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

    updateModeUI: () => {
        const btnMode = document.getElementById('mode-toggle');
        const iconMode = document.getElementById('mode-icon');
        const textMode = document.getElementById('mode-text');
        const btnNew = document.getElementById('btn-new-study');
        const iconNew = document.getElementById('icon-new-study');

        if (!btnMode || !btnNew) return;

        if (store.profile !== 'pendular') {
            btnMode.classList.add('hidden');
            btnNew.disabled = false;
            btnNew.classList.remove('opacity-50', 'cursor-not-allowed');
            if(iconNew) iconNew.setAttribute('data-lucide', 'plus');
            if(window.lucide) lucide.createIcons();
            return;
        }

        btnMode.classList.remove('hidden');

        if (store.cycleState === 'ATTACK') {
            btnMode.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-md ml-4 mode-attack';
            textMode.innerText = 'Dia de Ataque';
            iconMode.setAttribute('data-lucide', 'sword');
            btnNew.disabled = false;
            iconNew.setAttribute('data-lucide', 'plus');
        } else {
            btnMode.className = 'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-md ml-4 mode-defense';
            textMode.innerText = 'Dia de Defesa';
            iconMode.setAttribute('data-lucide', 'shield');
            
            btnNew.disabled = false; 
            iconNew.setAttribute('data-lucide', 'calendar-plus'); 
            btnNew.classList.remove('opacity-50', 'cursor-not-allowed'); 
        }
        
        if (window.lucide) lucide.createIcons();
    },

    // --- Gerenciamento Visual da Autenticação ---
    updateAuthUI: (user) => {
        const btnUser = document.getElementById('user-menu-btn');
        const viewLogin = document.getElementById('auth-view-login');
        const viewUser = document.getElementById('auth-view-user');
        const lblUserEmail = document.getElementById('popover-user-email');
        const dot = document.getElementById('user-status-dot');

        if (user) {
            // Estado: Logado
            if(btnUser) {
                btnUser.classList.remove('border-slate-300', 'text-slate-400');
                btnUser.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
            }
            if(dot) {
                dot.classList.remove('hidden', 'bg-slate-400');
                dot.classList.add('bg-emerald-500');
            }
            if(viewLogin) viewLogin.classList.add('hidden');
            if(viewUser) viewUser.classList.remove('hidden');
            if(lblUserEmail) lblUserEmail.innerText = user.email;
        } else {
            // Estado: Deslogado
            if(btnUser) {
                btnUser.classList.add('border-slate-300', 'text-slate-400');
                btnUser.classList.remove('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
            }
            if(dot) dot.classList.add('hidden');
            if(viewLogin) viewLogin.classList.remove('hidden');
            if(viewUser) viewUser.classList.add('hidden');
        }
    },

    // --- Atualização do Streak (Constância) ---
    updateStreak: () => {
        const streakCount = (store.calculateStreak && typeof store.calculateStreak === 'function') 
            ? store.calculateStreak() 
            : 0;

        const container = document.getElementById('streak-container');
        const label = document.getElementById('streak-count');

        if (container && label) {
            label.innerText = streakCount;
        }
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
    
    // Controle de Abas de Configuração
    switchSettingsTab: (tabName) => {
        // Classes de estilo
        const inactiveBtnClass = 'pb-2 px-4 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none whitespace-nowrap';
        const activeBtnClass = 'pb-2 px-4 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 transition-colors focus:outline-none whitespace-nowrap';

        // Array com os IDs das abas
        const tabs = ['subjects', 'strategy', 'adjustments'];

        tabs.forEach(t => {
            // Manipula os Botões
            const btn = document.getElementById(`tab-btn-${t}`);
            if (btn) {
                btn.className = (t === tabName) ? activeBtnClass : inactiveBtnClass;
            }

            // Manipula o Conteúdo
            const content = document.getElementById(`tab-content-${t}`);
            if (content) {
                if (t === tabName) {
                    content.classList.remove('hidden');
                } else {
                    content.classList.add('hidden');
                }
            }
        });
    },

    toggleSubjectModal: (show) => {
        if(show) {
            ui.switchSettingsTab('subjects');
        }
        ui.toggleModal('modal-subjects', show);
    },
    
    openNewStudyModal: () => {
        const dateInput = document.getElementById('input-study-date');
        const today = getLocalISODate();

        if(dateInput) {
            if (store.profile === 'pendular' && store.cycleState === 'DEFENSE') {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateInput.value = getLocalISODate(tomorrow);
                
                toast.show(
                    'Data sugerida para amanhã. Planeje seus próximos passos!', 
                    'neuro', 
                    '🛡️ Modo Defesa: Planejamento'
                );
            } else {
                dateInput.value = today; 
            }
        }
        
        ui.toggleModal('modal-new', true);
    },
    
    openHeatmapModal: () => {
        const input = document.getElementById('setting-capacity');
        if(input) input.value = store.capacity;

        const cycleInput = document.getElementById('setting-cycle-start');
        if(cycleInput) cycleInput.value = store.cycleStartDate || getLocalISODate();
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;

        const rescheduleInput = document.getElementById('input-reschedule-date');
        if(rescheduleInput) rescheduleInput.value = getLocalISODate();

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
            
            const dayStudies = store.reviews
                .filter(r => r.date === isoDate)
                .sort((a, b) => (a.cycleIndex || 0) - (b.cycleIndex || 0));

            const dayLoad = dayStudies.reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
            const capacity = store.capacity > 0 ? store.capacity : 240;
            const percentage = (dayLoad / capacity) * 100;
            
            let colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            if (dayLoad === 0) {
                colorClass = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
            } else if (percentage > 100) {
                colorClass = 'bg-slate-800 border-slate-900 text-white'; 
            } else if (percentage > 80) {
                colorClass = 'bg-red-50 border-red-200 text-red-900';
            } else if (percentage > 50) {
                colorClass = 'bg-amber-50 border-amber-200 text-amber-900';
            }

            const isDarkBg = percentage > 100;
            
            const listHtml = dayStudies.map(s => {
                const cycleNum = s.cycleIndex ? `#${s.cycleIndex}` : 'N/A';
                
                let typeShort = s.type;
                if (s.type === 'Defesa') typeShort = 'DEF';
                else if (s.type === 'NOVO') typeShort = 'NEW';
                else typeShort = s.type.toUpperCase();

                const borderStyle = `border-left: 3px solid ${s.color};`; 
                const bgStyle = isDarkBg ? 'background-color: rgba(255,255,255,0.1);' : 'background-color: rgba(255,255,255,0.6);';
                const statusIcon = s.status === 'DONE' ? '✓' : '';
                
                const tooltipText = `Matéria: ${s.subject}\nTópico: ${s.topic}\nTipo: ${s.type}`;
                
                return `
                    <div draggable="true" 
                         ondragstart="app.handleDragStart(event, '${s.id}')"
                         ondragend="app.handleDragEnd(event)"
                         title="${tooltipText}" 
                         class="text-[9px] flex items-center justify-between px-1.5 py-1 rounded mb-1 border border-slate-100/20 truncate cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-indigo-300 transition-all" 
                         style="${borderStyle} ${bgStyle}">
                        
                        <div class="flex items-baseline gap-1.5 overflow-hidden pointer-events-none">
                            <span class="font-bold text-slate-700">${cycleNum}</span>
                            <span class="text-[7px] uppercase font-bold text-slate-500 bg-slate-200/50 px-0.5 rounded tracking-tighter">${typeShort}</span>
                        </div>
                        
                        <span class="opacity-70 text-[8px] ml-1 shrink-0 pointer-events-none">${statusIcon}</span>
                    </div>
                `;
            }).join('');

            container.innerHTML += `
                <div ondragover="app.handleDragOver(event)" 
                     ondrop="app.handleDrop(event, '${isoDate}')"
                     class="heatmap-day-cell p-2 rounded-lg border ${colorClass} flex flex-col h-32 relative transition-all group">
                    
                    <div class="flex justify-between items-center mb-1 pb-1 border-b border-black/5 pointer-events-none">
                        <span class="text-xs font-bold opacity-80">${displayDate}</span>
                        <span class="text-[9px] font-bold opacity-60">${dayLoad > 0 ? Math.round(percentage) + '%' : ''}</span>
                    </div>

                    <div class="flex-1 overflow-y-auto custom-scroll pr-0.5 space-y-0.5">
                        ${listHtml || '<span class="text-[9px] italic opacity-50 block text-center mt-2 pointer-events-none">- Livre -</span>'}
                    </div>

                    <div class="text-[9px] text-right font-bold opacity-60 mt-1 pt-1 border-t border-black/5 pointer-events-none">
                        ${dayLoad}m
                    </div>
                </div>
            `;
        }
    },

    toggleChangelog: (show) => {
        if(show && typeof changelogData !== 'undefined') {
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

    // --- RENDERIZAÇÃO PRINCIPAL (ATUALIZADO: Correção de Layout Grid) ---
    render: () => {
        const executeRender = () => {
            const todayStr = getLocalISODate();
            const containers = {
                late: document.getElementById('list-late'),
                today: document.getElementById('list-today'),
                future: document.getElementById('list-future')
            };
    
            if(!containers.late || !containers.today || !containers.future) return;
    
            // Limpa containers
            Object.values(containers).forEach(el => el.innerHTML = '');
    
            const sorted = store.reviews.sort((a, b) => {
                // 1. Data Cronológica
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }

                // 2. Prioridade: Status (Pendentes no topo, Feitos no fundo)
                const statusA = a.status === 'DONE' ? 1 : 0;
                const statusB = b.status === 'DONE' ? 1 : 0;
                if (statusA !== statusB) {
                    return statusA - statusB;
                }

                // 3. Tipo de Estudo
                const typeScore = (type) => {
                    const t = type ? type.toUpperCase() : '';
                    if (['DEFESA', 'DEFENSE', 'DEF'].includes(t)) return 1;
                    if (['NOVO', 'NEW'].includes(t)) return 3;
                    return 2;
                };
                return typeScore(a.type) - typeScore(b.type);
            });
            
            let counts = { late: 0, today: 0, future: 0 };
            let todayLoad = 0;
    
            // --- Renderização Padrão (Late & Today) ---
            sorted.forEach(r => {
                if (r.date < todayStr && r.status !== 'DONE') {
                    containers.late.innerHTML += ui.createCardHTML(r);
                    counts.late++;
                } else if (r.date === todayStr) {
                    containers.today.innerHTML += ui.createCardHTML(r);
                    counts.today++;
                    todayLoad += r.time;
                }
            });
    
            // --- Renderização Avançada (Future: Weather + Busca) ---
            const filterTerm = window.app && window.app.futureFilterTerm ? window.app.futureFilterTerm : '';
            
            const futureItems = sorted.filter(r => {
                if (r.date <= todayStr) return false;
                if (filterTerm) {
                    const term = filterTerm.toLowerCase();
                    const matchSubject = r.subject.toLowerCase().includes(term);
                    const matchTopic = r.topic.toLowerCase().includes(term);
                    if (!matchSubject && !matchTopic) return false;
                }
                return true;
            });
    
            // Agrupamento por Data (Weather Forecast)
            if (futureItems.length > 0) {
                const groupedFuture = {};
                futureItems.forEach(r => {
                    if (!groupedFuture[r.date]) groupedFuture[r.date] = [];
                    groupedFuture[r.date].push(r);
                });
    
                let futureHtml = '';
                Object.keys(groupedFuture).sort().forEach(date => {
                    const dayStudies = groupedFuture[date];
                    const dayTotalMinutes = dayStudies.reduce((acc, cur) => acc + (parseInt(cur.time) || 0), 0);
                    
                    const capacity = store.capacity || 240;
                    let weatherIcon = 'sun'; 
                    let weatherColor = 'text-amber-500';
                    
                    if (dayTotalMinutes > capacity) { 
                        weatherIcon = 'cloud-lightning'; 
                        weatherColor = 'text-purple-600'; 
                    } else if (dayTotalMinutes > (capacity * 0.6)) { 
                        weatherIcon = 'cloud'; 
                        weatherColor = 'text-slate-500'; 
                    }
    
                    futureHtml += `
                        <div class="day-weather-header">
                            <span class="flex items-center gap-1.5" title="Previsão de Carga">
                                <i data-lucide="${weatherIcon}" class="w-3.5 h-3.5 ${weatherColor}"></i>
                                ${formatDateDisplay(date)}
                            </span>
                            <span class="${dayTotalMinutes > capacity ? 'text-red-500 font-bold' : ''}">${dayTotalMinutes} min</span>
                        </div>
                    `;
    
                    dayStudies.forEach(r => {
                        futureHtml += ui.createCardHTML(r);
                    });
                });
                
                containers.future.innerHTML = futureHtml;
                counts.future = futureItems.length;
            }
    
            // --- Atualização de Layout & Contadores ---
            
            // CORREÇÃO: Removemos a lógica antiga que alterava classes do "mainEl" via JS.
            // O layout agora é controlado exclusivamente pelo HTML (lg:grid-cols-3).
         
            ['late', 'today', 'future'].forEach(key => {
                const countEl = document.getElementById(`count-${key}`);
                if(countEl) countEl.innerText = counts[key];
                
                const mobileBadge = document.getElementById(`badge-${key}-mobile`);
                if(mobileBadge) mobileBadge.innerText = counts[key];
            });
    
            // --- EMPTY STATES & CELEBRAÇÃO ---
            
            if(!counts.late) {
                // UX Improvement: Botão de ação útil
                containers.late.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-8 text-emerald-500/80">
                        <div class="bg-emerald-50 p-2 rounded-full mb-2">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                        </div>
                        <span class="text-xs font-bold mb-2">Sem Atrasos</span>
                        
                        <button onclick="ui.openHeatmapModal()" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 hover:bg-emerald-100 transition-colors">
                            Ver Histórico no Radar
                        </button>
                    </div>`;
            }
    
            if(!counts.today) {
                const hasCompletedWorkToday = store.reviews.some(r => r.date === todayStr && r.status === 'DONE');
                
                if (hasCompletedWorkToday) {
                    containers.today.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full py-10 animate-fade-in opacity-80">
                            <div class="bg-emerald-100 p-4 rounded-full mb-3 shadow-sm ring-4 ring-emerald-50">
                                <i data-lucide="trophy" class="w-8 h-8 text-emerald-600"></i>
                            </div>
                            <p class="text-sm font-bold text-slate-700">Meta Batida!</p>
                            <p class="text-[10px] text-slate-500">Aproveite o descanso.</p>
                        </div>
                    `;
                } else {
                    containers.today.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-8 h-full">
                             <button onclick="ui.openNewStudyModal()" class="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                                <i data-lucide="target" class="w-8 h-8 mb-2 group-hover:scale-110 transition-transform"></i>
                                <span class="text-xs font-bold">Definir Meta de Hoje</span>
                            </button>
                        </div>`;
                }
            }
    
            if(!counts.future && !filterTerm) { 
                containers.future.innerHTML = `
                    <button onclick="ui.openNewStudyModal()" class="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all group cursor-pointer my-2">
                        <i data-lucide="calendar-plus" class="w-8 h-8 mb-2 group-hover:scale-110 transition-transform"></i>
                        <span class="text-xs font-bold">Planejar Futuro</span>
                        <span class="text-[10px] mt-1 text-center">Clique para agendar revisões<br>ou novos estudos.</span>
                    </button>
                `;
            } else if (counts.future === 0 && filterTerm) {
                containers.future.innerHTML = `
                    <div class="text-center py-10 text-slate-400 text-xs italic">
                        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                        Nenhum estudo encontrado para "${filterTerm}".
                    </div>
                `;
            }
    
            ui.updateCapacityStats(todayLoad);
            ui.updateStreak();
        }; // fim executeRender

        // Wrapper para View Transitions API
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                executeRender();
                if(window.lucide) lucide.createIcons();
            });
        } else {
            // Fallback
            executeRender();
            if(window.lucide) lucide.createIcons();
        }
    },

    // --- CRIAÇÃO DO CARTÃO (ATUALIZADO: Hard Dependency / Trava de Qualidade / View Transition ID) ---
    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        // 1. Verificação de Hard Dependency (Bloqueio)
        const pendingSubtasks = (review.subtasks || []).filter(t => !t.done).length;
        const isBlocked = !isDone && pendingSubtasks > 0; // Só bloqueia se não estiver feito E tiver pendências

        // Estilos Condicionais para o Checkbox
        const checkboxClass = isBlocked 
            ? "checkbox-blocked appearance-none w-5 h-5 border-2 border-slate-300 rounded bg-slate-100 disabled:opacity-50" // Bloqueado
            : "appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors relative after:content-['✓'] after:absolute after:text-white after:text-xs after:left-1 after:top-0 after:hidden checked:after:block"; // Normal

        // Wrapper para Tooltip CSS (se necessário no futuro)
        const checkboxWrapperClass = isBlocked ? "checkbox-wrapper-blocked" : "";

        const containerClasses = isDone 
            ? 'bg-slate-50 border-slate-200 opacity-60' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md';
            
        const textDecoration = isDone 
            ? 'line-through text-slate-400' 
            : 'text-slate-800';

        const getTypeStyles = (type) => {
            const t = type ? type.toUpperCase() : '';
            if (['NOVO', 'NEW'].includes(t)) {
                return {
                    class: 'bg-purple-100 text-purple-700 border border-purple-200',
                    icon: 'sword'
                };
            } 
            else if (['DEFESA', 'DEFENSE', 'DEF'].includes(t)) {
                return {
                    class: 'bg-amber-100 text-amber-700 border border-amber-200',
                    icon: 'shield'
                };
            } 
            else {
                return {
                    class: 'bg-sky-50 text-sky-600 border border-sky-100',
                    icon: 'refresh-cw'
                };
            }
        };

        const styleConfig = getTypeStyles(review.type);

       const cycleHtml = review.batchId && review.cycleIndex 
        ? `<span onclick="ui.showCycleInfo('${review.batchId}', event)" class="cycle-badge ml-2" title="Ver Família de Estudos">#${review.cycleIndex}</span>` 
        : '';
        
        // UX Aprimorada: Tooltip com contexto de origem
        const originText = review.originalDate 
            ? `Original: ${formatDateDisplay(review.originalDate)}` 
            : 'Item emprestado';

        const tempIndicator = review.isTemporary 
            ? `<span class="text-[9px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded font-bold ml-2 cursor-help" title="${originText}. Voltará à origem amanhã se não for feito.">⏳ Extra</span>` 
            : '';

        // Botão Checklist
        const hasSubtasks = review.subtasks && review.subtasks.length > 0;
        let checkBtnStyle = "";
        let checkBtnClass = "transition-all p-1 rounded";
        
        if (hasSubtasks) {
            checkBtnStyle = `border: 1px solid ${review.color}; color: ${review.color}; background-color: rgba(255,255,255,0.8);`;
            checkBtnClass += " font-bold shadow-sm hover:opacity-80 bg-white"; 
        } else {
            checkBtnClass += " text-slate-300 hover:text-indigo-600 border border-transparent";
        }

        // Barra de Progresso
        const subtasks = review.subtasks || [];
        const totalSub = subtasks.length;
        const doneSub = subtasks.filter(t => t.done).length;
        const progressPercent = totalSub === 0 ? 0 : Math.round((doneSub / totalSub) * 100);
        
        let barColor = 'bg-indigo-500';
        if (totalSub > 0 && totalSub === doneSub) barColor = 'bg-emerald-500';

        const progressHtml = totalSub > 0 ? `
            <div class="mt-2 flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="${barColor} h-full transition-all" style="width: ${progressPercent}%"></div>
                </div>
                <span class="text-[9px] font-bold text-slate-400">${doneSub}/${totalSub}</span>
            </div>
        ` : '';

        // --- NOVA LÓGICA DE BOTÃO LINK/DRIVE ---
        const hasLink = review.link && review.link.length > 5;
        const driveIconClass = hasLink 
            ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" // Tem link (Ativo)
            : "text-slate-300 bg-slate-50 border-transparent hover:text-blue-500 hover:border-blue-200"; // Sem link (Inativo/Add)
        
        const driveIcon = hasLink ? 'hard-drive' : 'plus-circle'; // Ícone muda visualmente (embora ambos usem lucide icons)
        // Nota: O ícone é definido no data-lucide abaixo
        const driveTitle = hasLink ? 'Abrir Material' : 'Vincular Material (Drive)';

        // Adicionado style para View Transitions
        return `
            <div id="card-${review.id}" draggable="true" 
                ondragstart="app.handleKanbanDragStart(event, '${review.id}')"
                class="${containerClasses} p-3.5 rounded-lg border-l-[4px] transition-all mb-3 group relative cursor-grab active:cursor-grabbing" 
                style="border-left-color: ${review.color}; view-transition-name: card-${review.id}">
                
                <div class="flex justify-between items-start mb-1.5">
                    <div class="flex-1 pr-2">
                        <span class="text-[11px] font-black uppercase tracking-wider block mb-1" style="color: ${review.color}">
                            ${review.subject}
                        </span>
                        
                        <div class="flex flex-col gap-1">
                            <h4 class="text-sm font-bold leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${textDecoration}" 
                                title="Clique para editar" 
                                onclick="app.promptEdit('${review.id}')">
                                ${review.topic}
                            </h4>

                            <div class="flex items-center mt-1 gap-2 flex-wrap">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${styleConfig.class}">
                                    <i data-lucide="${styleConfig.icon}" class="w-3 h-3"></i>
                                    ${review.type}
                                </span>
                                ${cycleHtml}
                                ${tempIndicator}

                                <!-- BOTÃO DRIVE/LINK -->
                                <button onclick="app.handleLinkAction('${review.id}', '${review.link || ''}')"
                                        class="w-6 h-6 flex items-center justify-center rounded-full border text-[10px] transition-all ${driveIconClass}" 
                                        title="${driveTitle}">
                                    <i data-lucide="${hasLink ? 'hard-drive' : 'link'}" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 pl-2 ${checkboxWrapperClass}">
                        <input type="checkbox" 
                            onclick="app.handleStatusToggle('${review.id}', this)" 
                            ${isDone ? 'checked' : ''} 
                            class="${checkboxClass}"
                            ${isBlocked ? 'disabled' : ''}>
                        
                        <button onclick="app.openSubtasks('${review.id}')" 
                                class="${checkBtnClass}" 
                                style="${checkBtnStyle}"
                                title="${hasSubtasks ? `Ver ${review.subtasks.length} Subtarefas` : 'Adicionar Checklist'}">
                            <i data-lucide="list-todo" class="w-4 h-4"></i>
                        </button>

                        <button onclick="app.confirmDelete('${review.id}')" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir">
                            <i data-lucide="trash" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>

                ${progressHtml}

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

    // --- RENDERIZAÇÃO DE LISTA DE SUBTAREFAS ---
    renderSubtaskList: (review) => {
        const container = document.getElementById('subtask-list');
        if (!container) return;

        if (!review) {
            container.innerHTML = `<div class="text-red-500 text-xs p-4">Erro: Dados do cartão não carregados. Tente reabrir.</div>`;
            return;
        }

        const tasks = review.subtasks || [];
        
        if (tasks.length === 0) {
            container.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs italic">Nenhuma micro-quest ativa.<br>Adicione passos acima.</div>`;
        } else {
            container.innerHTML = tasks.map(t => {
                const recurrentIcon = t.isRecurrent 
                    ? `<i data-lucide="repeat" class="w-3 h-3 text-indigo-400 ml-1.5 shrink-0" title="Tarefa Recorrente (Ciclo)"></i>` 
                    : '';

                return `
                <div class="subtask-item flex items-center gap-3 p-2 rounded border border-slate-100 bg-white shadow-sm transition-colors hover:bg-slate-50">
                    <!-- CORREÇÃO PRIORIDADE 1: Aspas adicionadas em '${t.id}' para proteger o ID numérico grande -->
                    <input type="checkbox" onchange="app.handleToggleSubtask('${t.id}')" ${t.done ? 'checked' : ''} class="subtask-checkbox w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0">
                    
                    <span class="flex-1 text-xs text-slate-700 font-medium break-words flex items-center ${t.done ? 'line-through text-slate-400' : ''}">
                        ${t.text}
                        ${recurrentIcon}
                    </span>
                    
                    <!-- CORREÇÃO PRIORIDADE 1: Aspas adicionadas em '${t.id}' -->
                    <!-- MELHORIA UX: Atributo title adicionado -->
                    <button onclick="app.handleDeleteSubtask('${t.id}')" class="text-slate-300 hover:text-red-500 p-1 shrink-0" title="Excluir item"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
            `}).join('');
        }
        
        const total = tasks.length;
        const done = tasks.filter(t => t.done).length;
        const pct = total === 0 ? 0 : Math.round((done/total)*100);
        
        const bar = document.getElementById('modal-progress-bar');
        const txt = document.getElementById('modal-progress-text');
        
        if(bar) bar.style.width = `${pct}%`;
        if(txt) txt.innerText = `${pct}% Concluído`;
        
        if(window.lucide) lucide.createIcons();
    },

    renderSubtaskTemplates: (containerId) => {
        const container = document.getElementById(containerId);
        if(!container) return;

        const templates = [
            "Ler Lei Seca",
            "Fazer 10 Questões",
            "Revisar Mapa Mental"
        ];

        container.innerHTML = templates.map(text => `
            <button type="button" onclick="document.getElementById('input-subtask').value = '${text}'; document.getElementById('input-subtask').focus();" 
                    class="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[10px] font-bold text-slate-500 rounded border border-slate-200 transition-colors">
                ${text}
            </button>
        `).join('');
    },

    showCycleInfo: (batchId, event) => {
        if(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        let backdrop = document.getElementById('cycle-popover-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'cycle-popover-backdrop';
            backdrop.onclick = () => {
                document.getElementById('cycle-popover')?.classList.remove('visible');
                backdrop.classList.remove('visible');
            };
            document.body.appendChild(backdrop);
        }

        let popover = document.getElementById('cycle-popover');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'cycle-popover';
            document.body.appendChild(popover);
        }

        const family = store.reviews
            .filter(r => r.batchId === batchId)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (family.length === 0) return toast.show('Erro: Nenhum dado vinculado.', 'error');

        const subjectName = family[0].subject;

        const listHtml = family.map(f => {
            const isDone = f.status === 'DONE';
            const icon = isDone ? '✅' : '⭕';
            const rowClass = isDone ? 'opacity-50' : 'font-bold text-slate-800';
            
            return `
                <div class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 ${rowClass}">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-slate-500 uppercase">${f.type}</span>
                        <span class="text-xs">${formatDateDisplay(f.date)}</span>
                    </div>
                    <div class="text-sm">${icon}</div>
                </div>
            `;
        }).join('');

        // --- ATUALIZAÇÃO: CABEÇALHO COM BOTÃO DE COPIAR ---
        popover.innerHTML = `
            <div class="mb-3 border-b border-slate-100 pb-2">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-400">Ciclo #${family[0].cycleIndex}</div>
                        <div class="text-sm font-bold text-indigo-700 leading-tight pr-2">${subjectName}</div>
                    </div>
                    
                    <div class="flex items-center gap-1">
                        <!-- BOTÃO DE COPIAR (NOVO) -->
                        <button onclick="app.copyStudyInfo('${family[0].cycleIndex}', '${family[0].topic.replace(/'/g, "\\'")}')" 
                                class="p-1.5 bg-slate-100 text-slate-500 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors flex items-center justify-center h-8 w-8" 
                                title="Copiar: #${family[0].cycleIndex} - Tópico">
                            <i data-lucide="copy" class="w-4 h-4"></i>
                        </button>
                        
                        <!-- BOTÃO FECHAR -->
                        <button onclick="document.getElementById('cycle-popover').classList.remove('visible'); document.getElementById('cycle-popover-backdrop').classList.remove('visible');" 
                            class="text-slate-300 hover:text-red-500 font-bold p-1.5 h-8 w-8 flex items-center justify-center transition-colors">✕</button>
                    </div>
                </div>
                <div class="text-xs text-slate-500 truncate mt-1 italic">"${family[0].topic}"</div>
            </div>
            
            <div class="max-h-60 overflow-y-auto custom-scroll pr-1">
                ${listHtml}
            </div>
            
            <button onclick="document.getElementById('cycle-popover').classList.remove('visible'); document.getElementById('cycle-popover-backdrop').classList.remove('visible');" 
                class="mt-4 w-full py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 active:scale-95 transition-all">
                FECHAR
            </button>
        `;

        backdrop.classList.add('visible');
        popover.classList.add('visible');
        
        // Garante que o ícone de copiar (lucide) seja renderizado
        if(window.lucide) lucide.createIcons();
    },

    updateCapacityStats: (todayMinutes) => {
        const limit = store.capacity || CONFIG.defaultCapacity;
        
        const percentage = Math.min((todayMinutes / limit) * 100, 100);
        const bar = document.getElementById('capacity-bar');
        const text = document.getElementById('capacity-text');
        
        if(bar && text) {
            bar.style.width = `${percentage}%`;
            
            text.innerHTML = `Planejado: <b>${todayMinutes}m</b> <span class="text-slate-300 mx-1">|</span> Meta: ${limit}m`;

            bar.className = `h-full rounded-full transition-all duration-700 ease-out relative ${
                percentage > 100 ? 'bg-slate-800' : percentage > 80 ? 'bg-red-600' : percentage > 60 ? 'bg-amber-500' : 'bg-indigo-600'
            }`;
        }
    }
};
