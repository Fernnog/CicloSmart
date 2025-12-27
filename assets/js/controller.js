/* --- ASSETS/JS/CONTROLLER.JS --- */
/**
 * CICLOSMART APP CONTROLLER (v1.1.4 - Logic Layer)
 * Contém: Lógica de Negócio, Auth, Batch Logic e Inicialização.
 */

// Variável de Estado para o Modal de Decisão de Ciclo
let pendingStudyData = null;

const app = {
    init: () => {
        store.load();
        
        // --- ARQUITETURA REATIVA (OBSERVER) ---
        store.subscribe(taskManager.checkOverdue); 
        store.subscribe(taskManager.render);       
        store.subscribe(ui.render); // UI agora reage a mudanças no Store
        
        // --- AUTO-REPARO LEGADO ---
        app.runLegacyMigration();

        app.initVersionControl();
        app.checkSmartCycle();

        if (typeof app.initAuth === 'function') {
            app.initAuth(); 
        }

        // Inicialização Visual Inicial
        ui.initSubjects(); 
        ui.render();
        taskManager.checkOverdue(); 
        
        app.setupEventListeners();

        app.updateProfileUI(store.profile); 
        ui.updateModeUI(); 
        ui.switchTab('today');

        // --- VERIFICAÇÃO DE INTEGRIDADE ---
        setTimeout(() => app.checkCycleIntegrity(), 1000);
    },

    setupEventListeners: () => {
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;
        
        const btnNew = document.getElementById('btn-new-study');
        if(btnNew) btnNew.onclick = app.handleNewStudyClick;
    },

    runLegacyMigration: () => {
        let migrationCount = 0;
        if (store.reviews && store.reviews.length > 0) {
            store.reviews.forEach(r => {
                if (!r.batchId) {
                    r.batchId = 'legacy-' + r.id + '-' + Math.floor(Math.random() * 1000); 
                    migrationCount++;
                }
            });
            if (migrationCount > 0) {
                console.log(`Migrado: ${migrationCount} estudos antigos.`);
                store.save();
                setTimeout(() => toast.show('Sistema atualizado para suporte em Lote.', 'info', 'Upgrade Realizado'), 2000);
            }
        }
    },

    initAuth: () => {
        const startFirebaseLogic = () => {
            console.log("[CicloSmart Auth] Iniciando ouvintes...");
            
            if (!window.fireMethods || !window.fireAuth) {
                console.error("[CicloSmart Auth] Erro crítico: Firebase indefinido.");
                return;
            }

            const { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, ref, onValue, get } = window.fireMethods;
            const auth = window.fireAuth;
            const db = window.fireDb;

            const btnUser = document.getElementById('user-menu-btn');
            const popover = document.getElementById('auth-popover');
            
            const txtEmail = document.getElementById('popover-email');
            const txtPass = document.getElementById('popover-pass');

            if(btnUser) {
                btnUser.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    popover.classList.toggle('hidden');
                });
            }

            document.addEventListener('click', (e) => {
                if(popover && !popover.classList.contains('hidden') && !popover.contains(e.target) && e.target !== btnUser) {
                    popover.classList.add('hidden');
                }
            });

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    store.currentUser = user;
                    
                    // --- ATUALIZAÇÃO VIA UI (Refinamento MVC) ---
                    ui.updateAuthUI(user);

                    const userRef = ref(db, 'users/' + user.uid);
                    get(userRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            store.load(snapshot.val());
                            toast.show('Sincronizado.', 'success');
                            setTimeout(() => app.checkCycleIntegrity(), 1500);
                        } else {
                            store.save(); 
                        }
                        onValue(userRef, (snap) => {
                            const val = snap.val();
                            if(val) store.load(val); 
                        });
                    });

                } else {
                    store.currentUser = null;
                    
                    // --- ATUALIZAÇÃO VIA UI (Refinamento MVC) ---
                    ui.updateAuthUI(null);

                    store.load(null); 
                }
            });

            const formPopover = document.getElementById('auth-form-popover');
            if(formPopover) {
                formPopover.addEventListener('submit', (e) => {
                    e.preventDefault();
                    signInWithEmailAndPassword(auth, txtEmail.value, txtPass.value)
                        .then(() => popover.classList.add('hidden'))
                        .catch((error) => toast.show('Erro: ' + error.message, 'error'));
                });
            }
            
            const btnLogout = document.getElementById('btn-logout-popover');
            if(btnLogout) {
                btnLogout.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        popover.classList.add('hidden'); 
                        toast.show('Desconectado.', 'info');
                    });
                });
            }
                
            const btnSignup = document.getElementById('btn-signup-popover');
            if(btnSignup) {
                btnSignup.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    if(txtEmail.value && txtPass.value) {
                        createUserWithEmailAndPassword(auth, txtEmail.value, txtPass.value)
                            .then(() => {
                                popover.classList.add('hidden');
                                toast.show('Conta criada!', 'success');
                            })
                            .catch((error) => toast.show('Erro: ' + error.message, 'error'));
                    } else {
                        toast.show('Preencha e-mail e senha acima para cadastrar.', 'warning');
                    }
                });
            }
        };

        if (window.fireMethods && window.fireAuth) {
            startFirebaseLogic();
        } else {
            console.log("[CicloSmart Auth] Aguardando Firebase carregar...");
            window.addEventListener('firebase-ready', startFirebaseLogic);
        }
    },

    initVersionControl: () => {
        if (typeof changelogData !== 'undefined' && changelogData.length > 0) {
            const latest = changelogData[0].version;
            const btn = document.getElementById('app-version-btn');
            if (btn) btn.innerText = `v${latest}`;
            document.title = `CicloSmart v${latest} | Plataforma de Estudos`;
        }
    },

    checkSmartCycle: () => {
        if (store.profile !== 'pendular' || !store.lastAttackDate) return;
        
        const todayStr = getLocalISODate();
        const dateLast = new Date(store.lastAttackDate + 'T00:00:00');
        const dateToday = new Date(todayStr + 'T00:00:00');
        
        const diffTime = dateToday - dateLast;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            if (store.cycleState !== 'DEFENSE') {
                store.cycleState = 'DEFENSE';
                store.save();
                setTimeout(() => toast.show('Modo Defesa ativado para consolidação.', 'neuro', '🔄 Smart Cycle: Defesa Ativa'), 800);
            }
        } 
        else if (diffDays >= 2) {
            if (store.cycleState !== 'ATTACK') {
                store.cycleState = 'ATTACK';
                store.save();
                setTimeout(() => toast.show('Ciclo reiniciado. Modo Ataque liberado!', 'neuro', '⚔️ Bateria Recarregada'), 800);
            }
        }
    },

    setProfile: (mode) => {
        store.profile = mode;
        if (mode === 'pendular') app.checkSmartCycle();
        store.save();
        app.updateProfileUI(mode);
        ui.updateModeUI();
        
        const msg = mode === 'pendular' ? 'Teto de 90min e Ciclo Inteligente ativados.' : 'Modo Integrado sem limites rígidos.';
        toast.show(msg, 'info', 'Perfil Atualizado');
    },

    toggleMode: () => {
        if (store.profile !== 'pendular') {
            toast.show('Alterne para o perfil Pendular nas configurações.', 'warning', 'Ação Inválida');
            return;
        }
        store.cycleState = store.cycleState === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
        store.save();
        ui.updateModeUI();
        
        const msg = store.cycleState === 'ATTACK' ? 'Matéria nova liberada manualmente!' : 'Planejamento futuro habilitado manualmente.';
        const title = store.cycleState === 'ATTACK' ? '⚔️ Modo ATAQUE' : '🛡️ Modo DEFESA';
        toast.show(msg, 'warning', title); 
    },

    updateCycleStart: (dateStr) => {
        if(dateStr) {
            store.cycleStartDate = dateStr;
            store.save();
            toast.show('Seus novos cards seguirão esta referência.', 'success', '📅 Ciclo Ancorado');
            setTimeout(() => app.checkCycleIntegrity(), 500);
        }
    },

    handleNewStudyClick: () => {
        ui.openNewStudyModal();
        // --- ATUALIZAÇÃO LÓGICA (Refinamento MVC) ---
        // O Controller aplica as regras de UI (ex: teto 90min) logo após a View abrir o modal
        app.updateProfileUI(store.profile);
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

 // --- Lógica de Numeração Blindada (v1.2.0 Hotfix) ---
    calculateCycleIndex: (targetDateStr) => {
        // 1. Segurança: Se não há ciclo definido, começa do 1
        if (!store.cycleStartDate) {
            console.log('[CicloSmart] Sem data de início definida. Retornando índice 1.');
            return 1;
        }

        // 2. Deep Scan: Busca TODOS os cards a partir da data de início que possuam algum índice definido.
        // Removemos o filtro 'r.type === NOVO' para garantir que não percamos a contagem 
        // caso o card original tenha sido deletado mas as revisões existam.
        const relevantItems = store.reviews.filter(r => 
            r.date >= store.cycleStartDate && 
            r.cycleIndex !== undefined && 
            r.cycleIndex !== null
        );

        if (relevantItems.length === 0) {
            console.log('[CicloSmart] Nenhum estudo anterior encontrado neste ciclo. Retornando índice 1.');
            return 1;
        }

        // 3. Sanitização: Converte tudo para Inteiro para evitar erros de String ("10" < "2")
        const indices = relevantItems.map(r => parseInt(r.cycleIndex));

        // 4. Busca o Maior Número Absoluto
        const maxIndex = Math.max(...indices);
        
        console.log(`[CicloSmart] Último índice encontrado: #${maxIndex}. Próximo será: #${maxIndex + 1}`);
        
        return maxIndex + 1;
    },

    checkCycleIntegrity: () => {
        if (!store.cycleStartDate) return;
        const cycleStudies = store.reviews
            .filter(r => r.type === 'NOVO' && r.date >= store.cycleStartDate)
            .sort((a, b) => a.cycleIndex - b.cycleIndex);

        let isBroken = false;
        let conflictListHtml = '';
        const seenIndices = new Set();
        let lastDate = null;

        cycleStudies.forEach(study => {
            let conflictDetected = false;
            if (seenIndices.has(study.cycleIndex)) conflictDetected = true;
            else seenIndices.add(study.cycleIndex);
            lastDate = study.date;

            if (conflictDetected) {
                isBroken = true;
                conflictListHtml += `
                    <div class="p-3 flex justify-between items-center bg-white border-b border-slate-50 last:border-0">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${formatDateDisplay(study.date)}</div>
                            <div class="text-xs font-bold text-slate-800">${study.subject}</div>
                            <div class="text-[10px] text-slate-500 truncate w-40 italic">${study.topic}</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-200">#${study.cycleIndex} (Conflito)</span>
                        </div>
                    </div>`;
            }
        });

        if (isBroken) {
            const listEl = document.getElementById('repair-list');
            if(listEl) listEl.innerHTML = conflictListHtml;
            ui.toggleModal('modal-repair', true);
            if(window.lucide) lucide.createIcons();
        }
    },

    runCycleRepair: (mode) => {
        if (!store.cycleStartDate) return;
        const cycleStudies = store.reviews.filter(r => r.type === 'NOVO' && r.date >= store.cycleStartDate);
        let changesCount = 0;

        if (mode === 'chronological') {
            cycleStudies.sort((a, b) => a.date.localeCompare(b.date));
            cycleStudies.forEach((study, index) => {
                const newIndex = index + 1; 
                if (study.cycleIndex !== newIndex) {
                    store.reviews.forEach(r => { if (r.batchId === study.batchId) r.cycleIndex = newIndex; });
                    changesCount++;
                }
            });
        } else if (mode === 'append') {
            let maxIndex = 0;
            cycleStudies.forEach(s => { if ((s.cycleIndex || 0) > maxIndex) maxIndex = s.cycleIndex; });
            const seenIndices = new Set();
            cycleStudies.sort((a, b) => a.id - b.id);
            cycleStudies.forEach(study => {
                if (seenIndices.has(study.cycleIndex)) {
                    maxIndex++;
                    const newIndex = maxIndex;
                    store.reviews.forEach(r => { if (r.batchId === study.batchId) r.cycleIndex = newIndex; });
                    changesCount++;
                    seenIndices.add(newIndex);
                } else seenIndices.add(study.cycleIndex);
            });
        }

        if (changesCount > 0) {
            store.save();
            ui.render(); 
            ui.toggleModal('modal-repair', false);
            toast.show(`Ciclo reparado! ${changesCount} estudos ajustados.`, 'success', 'Integridade Restaurada');
        } else {
            ui.toggleModal('modal-repair', false);
            toast.show('Nenhuma alteração necessária.', 'info');
        }
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        const select = document.getElementById('input-subject');
        const subjectName = select.options[select.selectedIndex].text;
        const subjectColor = select.options[select.selectedIndex].dataset.color;
        const topic = document.getElementById('input-topic').value;
        const studyTimeInput = document.getElementById('input-study-time');
        const studyTime = studyTimeInput ? parseInt(studyTimeInput.value) : 60; 
        const dateInput = document.getElementById('input-study-date');
        const selectedDateStr = dateInput.value; 
        const todayStr = getLocalISODate();

        if (store.profile === 'pendular' && studyTime > 90) {
            return toast.show('O tempo limite para estudo neste modo é 90 minutos.', 'warning', '⚠️ Teto Cognitivo');
        }
        if (store.profile === 'pendular' && store.cycleState === 'DEFENSE' && selectedDateStr === todayStr) {
            return toast.show('Hoje é consolidação. Agende novos conteúdos a partir de amanhã.', 'error', '🛡️ Escudo Ativo');
        }

        pendingStudyData = { subjectName, subjectColor, topic, studyTime, selectedDateStr, eTarget: e.target };
        let projectedDay = 1;
        if (store.cycleStartDate) projectedDay = app.calculateCycleIndex(selectedDateStr);

        const descEl = document.getElementById('cycle-option-keep-desc');
        if(descEl) descEl.innerText = `Será registrado como Dia #${projectedDay}`;
        ui.toggleModal('modal-cycle-confirm', true);
    },

    resolveCycle: (startNew) => {
        if (!pendingStudyData) return;
        if (startNew) {
            store.cycleStartDate = pendingStudyData.selectedDateStr;
            store.save();
            toast.show('Ciclo reiniciado! Dia #1 definido.', 'neuro', '🚩 Novo Ciclo');
        }
        app.processStudyEntry(pendingStudyData);
        ui.toggleModal('modal-cycle-confirm', false);
        ui.toggleModal('modal-new', false);
        pendingStudyData.eTarget.reset(); 
        pendingStudyData = null;
        app.updateProfileUI(store.profile);
    },

    processStudyEntry: (data) => {
        const { subjectName, subjectColor, topic, studyTime, selectedDateStr } = data;
        const baseDate = new Date(selectedDateStr + 'T12:00:00'); 
        const batchId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        if (!store.cycleStartDate) { store.cycleStartDate = selectedDateStr; store.save(); }

        const COMPRESSION = { 1: 0.20, 7: 0.10, 30: 0.05 };
        const REVIEW_CEILING_RATIO = 0.40; 
        const reviewLimitMinutes = Math.floor(store.capacity * REVIEW_CEILING_RATIO);
        const finalCycleIndex = app.calculateCycleIndex(selectedDateStr);
        const newReviews = [];
        let blocker = null;

        const acquisitionEntry = {
            id: Date.now() + Math.random(), 
            subject: subjectName, color: subjectColor, topic: topic, time: studyTime,
            date: selectedDateStr, type: 'NOVO', status: 'PENDING',
            cycleIndex: finalCycleIndex, batchId: batchId 
        };
        newReviews.push(acquisitionEntry);

        for (let interval of CONFIG.intervals) {
            let effectiveInterval = interval;
            if (store.profile === 'pendular') {
                if (interval === 7) effectiveInterval = 8;
                if (interval === 30) effectiveInterval = 31;
            }
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + effectiveInterval);
            const isoDate = getLocalISODate(targetDate); 
            const estimatedTime = Math.max(2, Math.ceil(studyTime * COMPRESSION[interval]));

            const existingLoad = store.reviews
                .filter(r => r.date === isoDate) 
                .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
            if (existingLoad + estimatedTime > reviewLimitMinutes) {
                blocker = { date: formatDateDisplay(isoDate), load: existingLoad + estimatedTime, limit: reviewLimitMinutes };
                break; 
            }
            
            let typeLabel = interval === 1 ? '24h' : interval + 'd';
            if (store.profile === 'pendular') typeLabel = interval === 1 ? 'Defesa' : effectiveInterval + 'd+'; 

            newReviews.push({
                id: Date.now() + Math.random() + effectiveInterval,
                subject: subjectName, color: subjectColor, topic: topic, time: estimatedTime,
                date: isoDate, type: typeLabel, status: 'PENDING',
                cycleIndex: finalCycleIndex, batchId: batchId 
            });
        }

        if (blocker) {
            toast.show(`Bloqueio: O dia ${blocker.date} excederia o limite de 40% de revisões.`, 'error', '🚫 Bloqueio de Segurança');
            return; 
        }

        const todayStr = getLocalISODate();
        if (store.profile === 'pendular' && selectedDateStr <= todayStr) store.lastAttackDate = selectedDateStr;

        store.addReviews(newReviews);
        const indexMsg = finalCycleIndex > 0 ? `#${finalCycleIndex}` : `(Pré-Ciclo)`;
        toast.show('Estudo registrado.', 'neuro', `🧠 Trilha Criada (Dia ${indexMsg})`);
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
        } else alert("Digite o nome da matéria.");
    },

    promptEdit: (id) => {
        const r = store.reviews.find(x => x.id === id);
        if(!r) return;
        const newTopic = prompt("Editar Tópico (Nome):", r.topic);
        
        if (newTopic !== null && newTopic !== r.topic) {
            const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];
            const updateAll = siblings.length > 1 && confirm(`Deseja renomear todos os ${siblings.length} cards conectados?`);
            if (updateAll) { store.updateBatchTopic(r.batchId, newTopic); toast.show('Tópico corrigido em lote.', 'success'); } 
            else store.updateReview(id, newTopic, r.time);
        } else if (newTopic === r.topic) {
            const newTime = prompt("Editar Tempo (min):", r.time);
            if (newTime !== null && !isNaN(newTime) && newTime !== r.time) store.updateReview(id, r.topic, newTime);
        }
    },

    confirmDelete: (id) => {
        const r = store.reviews.find(x => x.id === id);
        if(!r) return;
        const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];

        if (siblings.length > 1) {
            if (confirm(`🗑️ Excluir CICLO COMPLETO (${siblings.length} itens)?\n[OK] Sim, apagar tudo.\n[Cancelar] Não, apagar só este.`)) {
                store.deleteBatch(r.batchId);
                toast.show('Ciclo removido.', 'error');
            } else if(confirm("Excluir apenas este card?")) {
                store.deleteReview(id);
                toast.show('Card removido.', 'info');
            }
        } else {
            if(confirm("Excluir esta revisão?")) {
                store.deleteReview(id);
                toast.show('Removido.', 'info');
            }
        }
    },

    openExportUI: () => {
        const today = getLocalISODate();
        const startInput = document.getElementById('export-start');
        const endInput = document.getElementById('export-end');
        if(startInput) startInput.value = today;
        if(endInput) {
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            endInput.value = getLocalISODate(nextMonth);
        }
        ui.toggleModal('modal-export', true);
    },

    setExportFilter: (type) => {
        const today = new Date();
        const startInput = document.getElementById('export-start');
        const endInput = document.getElementById('export-end');
        if(!startInput || !endInput) return;
        let str;
        if (type === 'today') { str = getLocalISODate(today); startInput.value = str; endInput.value = str; } 
        else if (type === 'tomorrow') { today.setDate(today.getDate() + 1); str = getLocalISODate(today); startInput.value = str; endInput.value = str; } 
        else if (type === 'all') {
            startInput.value = getLocalISODate(new Date()); 
            const lastReview = store.reviews.reduce((max, r) => r.date > max ? r.date : max, getLocalISODate());
            endInput.value = lastReview;
        }
    },

    generateICS: () => {
        const startStr = document.getElementById('export-start').value;
        const endStr = document.getElementById('export-end').value;
        const startTimeStr = document.getElementById('export-time').value;
        const breakCheckbox = document.getElementById('export-break'); 
        if (!startStr || !endStr || !startTimeStr) return alert("Preencha todos os campos.");

        const validReviews = store.reviews.filter(r => r.status === 'PENDING' && r.date >= startStr && r.date <= endStr).sort((a, b) => a.date.localeCompare(b.date));
        if (validReviews.length === 0) return alert("Nenhuma revisão encontrada.");

        let icsLines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CicloSmart//v2//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
        let currentProcessDate = null;
        let accumulatedMinutes = 0;
        const [baseHour, baseMinute] = startTimeStr.split(':').map(Number);
        const breakTime = (breakCheckbox && breakCheckbox.checked) ? 10 : 0; 

        validReviews.forEach(r => {
            if (r.date !== currentProcessDate) { currentProcessDate = r.date; accumulatedMinutes = 0; }
            const [y, m, d] = r.date.split('-').map(Number);
            const eventStartObj = new Date(y, m - 1, d, baseHour, baseMinute + accumulatedMinutes);
            const eventEndObj = new Date(eventStartObj.getTime() + (r.time * 60000));
            accumulatedMinutes += r.time + breakTime;

            const formatICSDate = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '00';
            icsLines.push("BEGIN:VEVENT", `UID:${r.id}-${Date.now()}@ciclosmart.app`, `DTSTAMP:${formatICSDate(new Date())}`, `DTSTART:${formatICSDate(eventStartObj)}`, `DTEND:${formatICSDate(eventEndObj)}`, `SUMMARY:[#${r.cycleIndex || '?'}] ${r.subject}`, `DESCRIPTION:Tópico: ${r.topic}\\nTipo: ${r.type}`, "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Estudar", "END:VALARM", "END:VEVENT");
        });

        icsLines.push("END:VCALENDAR");
        const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `cronograma-${startStr}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ui.toggleModal('modal-export', false);
        toast.show('Arquivo ICS gerado.', 'info', '📅 Agenda Sincronizada');
    },

    handleReschedule: () => {
        const dateInput = document.getElementById('input-reschedule-date');
        const targetDateStr = dateInput.value;
        const todayStr = getLocalISODate();
        if (!targetDateStr) return toast.show('Selecione uma data.', 'warning');

        const overdueReviews = store.reviews.filter(r => r.status === 'PENDING' && r.date < todayStr);
        if (overdueReviews.length === 0) return toast.show('Sem atrasos.', 'success');
        
        overdueReviews.sort((a, b) => a.date.localeCompare(b.date));
        if (targetDateStr < overdueReviews[0].date) return toast.show('Data inválida.', 'warning');

        const diffDays = Math.ceil((new Date(targetDateStr + 'T00:00:00') - new Date(overdueReviews[0].date + 'T00:00:00')) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return toast.show('Datas coincidem.', 'info');
        if (!confirm(`Mover atrasados +${diffDays} dias para frente?`)) return;

        const affectedBatches = new Set(overdueReviews.map(r => r.batchId));
        let shiftCount = 0;
        
        store.reviews.forEach(r => {
            if (r.status === 'PENDING' && ((r.batchId && affectedBatches.has(r.batchId)) || (!r.batchId && r.date < todayStr))) {
                const current = new Date(r.date + 'T00:00:00');
                current.setDate(current.getDate() + diffDays);
                r.date = getLocalISODate(current);
                shiftCount++;
            }
        });

        // Lógica Waterfall (Redistribuição)
        let dateCursor = new Date(targetDateStr + 'T00:00:00');
        let waterfallCount = 0;
        let hasChanges = true;
        let daysProcessed = 0;
        
        while (hasChanges && daysProcessed < 90) {
            hasChanges = false;
            const cursorStr = getLocalISODate(dateCursor);
            const dayLoad = store.reviews.filter(r => r.date === cursorStr && r.status === 'PENDING').reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            let overflowNeeded = dayLoad - (store.capacity || 240);

            if (overflowNeeded > 0) {
                const itemsOnDay = store.reviews.filter(r => r.date === cursorStr && r.status === 'PENDING').sort((a, b) => b.cycleIndex - a.cycleIndex); 
                const nextDay = new Date(dateCursor); nextDay.setDate(nextDay.getDate() + 1); const nextDayStr = getLocalISODate(nextDay);
                for (let item of itemsOnDay) {
                    if (overflowNeeded <= 0) break;
                    item.date = nextDayStr;
                    overflowNeeded -= item.time;
                    waterfallCount++;
                    hasChanges = true; 
                }
            }
            dateCursor.setDate(dateCursor.getDate() + 1);
            daysProcessed++;
        }

        store.save(); 
        ui.toggleModal('modal-heatmap', false);
        toast.show(`Cronograma realinhado! ${shiftCount} cartões movidos.`, 'neuro', 'SRS Preservado');
    }
};

// Inicialização Automática
app.init();

// Garante acesso global para os onclicks do HTML
window.app = app;
