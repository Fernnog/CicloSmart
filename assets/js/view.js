/* --- ASSETS/JS/VIEW.JS --- */
/**
 * UI RENDERER (View Layer) - v1.2.2 Modified
 * Responsável exclusivamente por: Manipulação de DOM, Templates HTML e Feedback Visual.
 * ATUALIZADO: Badges Semânticos Coloridos & Ordenação Tática & Drag-and-Drop Attributes.
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
        const inactiveBtnClass = 'pb-2 px-4 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors focus:outline-none';
        
        const btnSubj = document.getElementById('tab-btn-subjects');
        const btnStrat = document.getElementById('tab-btn-strategy');
        
        if (btnSubj) btnSubj.className = inactiveBtnClass;
        if (btnStrat) btnStrat.className = inactiveBtnClass;
        
        const contentSubj = document.getElementById('tab-content-subjects');
        const contentStrat = document.getElementById('tab-content-strategy');
        
        if (contentSubj) contentSubj.classList.add('hidden');
        if (contentStrat) contentStrat.classList.add('hidden');

        const activeBtnClass = 'pb-2 px-4 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 transition-colors focus:outline-none';
        const activeBtn = document.getElementById(`tab-btn-${tabName}`);
        const activeContent = document.getElementById(`tab-content-${tabName}`);
        
        if (activeBtn) activeBtn.className = activeBtnClass;
        if (activeContent) activeContent.classList.remove('hidden');
    },

    toggleSubjectModal: (show) => {
        if(show) ui.switchSettingsTab('subjects');
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
                         ondragstart="app.handleDragStart(event, ${s.id})"
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

    // --- RENDERIZAÇÃO PRINCIPAL (ATUALIZADA) ---
    render: () => {
        const todayStr = getLocalISODate();
        const containers = {
            late: document.getElementById('list-late'),
            today: document.getElementById('list-today'),
            future: document.getElementById('list-future')
        };

        if(!containers.late || !containers.today || !containers.future) return;

        // Limpa containers
        Object.values(containers).forEach(el => el.innerHTML = '');

        // Ordenação Primária: Data
        // Ordenação Secundária (Sugerida): Tipo (Defesa antes de Novo)
        const sorted = store.reviews.sort((a, b) => {
            // 1. Compara datas
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }
            // 2. Se datas iguais, prioriza Defesa/Revisão sobre Matéria Nova (Ataque)
            // Lógica: Se 'a' é defesa e 'b' é novo, 'a' vem primeiro (-1)
            const typeScore = (type) => {
                const t = type ? type.toUpperCase() : '';
                if (['DEFESA', 'DEFENSE', 'DEF'].includes(t)) return 1; // Prioridade Alta
                if (['NOVO', 'NEW'].includes(t)) return 3; // Prioridade Baixa
                return 2; // Revisões normais no meio
            };
            return typeScore(a.type) - typeScore(b.type);
        });
        
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
                todayLoad += r.time;
            } else if (r.date > todayStr) {
                containers.future.innerHTML += cardHTML;
                counts.future++;
            }
        });

        const mainEl = document.getElementById('main-kanban');
        const colLate = document.getElementById('col-late');

        if (mainEl && colLate) {
            mainEl.classList.remove('md:grid-cols-3', 'md:grid-cols-2');

            if (counts.late === 0) {
                colLate.classList.remove('md:flex');
                colLate.classList.add('md:hidden');
                mainEl.classList.add('md:grid-cols-2');
            } else {
                colLate.classList.remove('md:hidden');
                colLate.classList.add('md:flex');
                mainEl.classList.add('md:grid-cols-3');
            }
        }

        ['late', 'today', 'future'].forEach(key => {
            const countEl = document.getElementById(`count-${key}`);
            if(countEl) countEl.innerText = counts[key];
            
            const mobileBadge = document.getElementById(`badge-${key}-mobile`);
            if(mobileBadge) mobileBadge.innerText = counts[key];
        });

        // --- EMPTY STATES & CELEBRAÇÃO ---
        
        if(!counts.late) {
            containers.late.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-emerald-500/80">
                    <div class="bg-emerald-50 p-2 rounded-full mb-2">
                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xs font-bold">Sem Atrasos</span>
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

        if(!counts.future) {
            containers.future.innerHTML = `
                <button onclick="ui.openNewStudyModal()" class="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all group cursor-pointer my-2">
                    <i data-lucide="calendar-plus" class="w-8 h-8 mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold">Planejar Futuro</span>
                    <span class="text-[10px] mt-1 text-center">Clique para agendar revisões<br>ou novos estudos.</span>
                </button>
            `;
        }

        ui.updateCapacityStats(todayLoad);
        ui.updateStreak();

        if(window.lucide) lucide.createIcons();
    },

    // --- CRIAÇÃO DO CARTÃO (ATUALIZADO COM DRAG & DROP) ---
    createCardHTML: (review) => {
        const isDone = review.status === 'DONE';
        
        const containerClasses = isDone 
            ? 'bg-slate-50 border-slate-200 opacity-60' 
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md';
            
        const textDecoration = isDone 
            ? 'line-through text-slate-400' 
            : 'text-slate-800';

        // Cores semânticas para os badges
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
        
        // Indicador visual se for temporário
        const tempIndicator = review.isTemporary 
            ? `<span class="text-[9px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded font-bold ml-2" title="Item emprestado. Voltará à origem amanhã se não for feito.">⏳ Extra</span>` 
            : '';

        // Adicionamos draggable="true" e ondragstart
        return `
            <div draggable="true" 
                ondragstart="app.handleKanbanDragStart(event, ${review.id})"
                class="${containerClasses} p-3.5 rounded-lg border-l-[4px] transition-all mb-3 group relative cursor-grab active:cursor-grabbing" 
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

                            <!-- Badge Semântico + Badge Extra -->
                            <div class="flex items-center mt-1 gap-2 flex-wrap">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${styleConfig.class}">
                                    <i data-lucide="${styleConfig.icon}" class="w-3 h-3"></i>
                                    ${review.type}
                                </span>
                                ${cycleHtml}
                                ${tempIndicator}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 pl-2">
                        <input type="checkbox" onclick="store.toggleStatus(${review.id})" ${isDone ? 'checked' : ''} 
                            class="appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors relative after:content-['✓'] after:absolute after:text-white after:text-xs after:left-1 after:top-0 after:hidden checked:after:block">
                        
                        <button onclick="app.confirmDelete(${review.id})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir">
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

        popover.innerHTML = `
            <div class="mb-3 border-b border-slate-100 pb-2">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-[10px] uppercase font-bold text-slate-400">Ciclo #${family[0].cycleIndex}</div>
                        <div class="text-sm font-bold text-indigo-700 leading-tight">${subjectName}</div>
                    </div>
                    <button onclick="document.getElementById('cycle-popover').classList.remove('visible'); document.getElementById('cycle-popover-backdrop').classList.remove('visible');" 
                        class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
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
