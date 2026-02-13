/* --- ASSETS/JS/CONTROLLER.JS --- */
/**
 * CICLOSMART APP CONTROLLER (v1.4.0 - Logic Layer)
 * Contém: Orquestração de UI, Auth e Eventos.
 * ATUALIZAÇÃO: Implementação de Kanban Flexível com Validação Inteligente (Soft Block).
 */

// Variável de Estado para o Modal de Decisão de Ciclo
let pendingStudyData = null;
// Variável temporária para armazenar o estado do movimento pendente (Soft Block)
let pendingDragAction = null;

const app = {
    // Variável de Estado para Busca na Coluna Futuro
    futureFilterTerm: '',

    init: () => {
        store.load();
        
        // --- ARQUITETURA REATIVA (OBSERVER) ---
        store.subscribe(taskManager.checkOverdue); 
        store.subscribe(taskManager.render);       
        store.subscribe(ui.render); 
        
        // --- AUTO-REPARO LEGADO ---
        app.runLegacyMigration();

        // --- NOVO: Verifica e devolve itens emprestados não concluídos ---
        app.checkTemporaryReversions();

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

        // --- [NOVO] VARREDURA DE INÍCIO DE SESSÃO ---
        setTimeout(() => app.checkPendingTasksOnStartup(), 800);

        // --- VERIFICAÇÃO DE INTEGRIDADE ---
        setTimeout(() => app.checkCycleIntegrity(), 1000);

        // --- MANUTENÇÃO AUTOMÁTICA DE DADOS ---
        if (window.engine && engine.runDataSanitation) {
            setTimeout(() => engine.runDataSanitation(), 2500);
        }

        // --- SETUP DE DRAG & DROP DO RADAR ---
        console.log("⏳ [DEBUG] Agendando setup do Drag & Drop em 500ms...");
        setTimeout(() => {
            app.setupUnifiedDragDrop();
        }, 500);
    },

    // --- [DIAGNÓSTICO] GERENTE DE ARRASTE (RADAR) ---
    setupUnifiedDragDrop: () => {
        console.group("🕵️‍♂️ [DEBUG] Setup Drag & Drop");
        const grid = document.getElementById('heatmap-grid');
        
        if (!grid) {
            console.error("❌ ERRO CRÍTICO: Elemento #heatmap-grid não encontrado.");
            console.groupEnd();
            return;
        }
        
        const newGrid = grid.cloneNode(true);
        grid.parentNode.replaceChild(newGrid, grid);

        newGrid.addEventListener('mousedown', (e) => {
            const card = e.target.closest('[draggable="true"]');
            if (card) console.log("🖱️ Alvo válido identificado:", card.id);
        });

        newGrid.addEventListener('dragstart', (e) => {
            const card = e.target.closest('[draggable="true"]');
            if (!card) return;

            let id = card.dataset.id; 
            if (!id && card.id) id = card.id.replace('card-', '');

            if (id) {
                app.handleDragStart(e, id);
            }
        });

        newGrid.addEventListener('dragover', (e) => {
            const cell = e.target.closest('.heatmap-day-cell');
            if (cell) {
                e.preventDefault();
                app.handleDragEnter(e, cell);
            }
        });

        newGrid.addEventListener('drop', (e) => {
            const cell = e.target.closest('.heatmap-day-cell');
            if (cell && cell.dataset.date) {
                app.handleDrop(e, cell.dataset.date);
                document.querySelectorAll('.heatmap-day-cell').forEach(el => el.classList.remove('drag-hover'));
            }
        });

        console.log("✅ Listeners anexados com sucesso.");
        console.groupEnd();
    },

    checkPendingTasksOnStartup: () => {
        const hasChecked = sessionStorage.getItem('ciclo_startup_check');
        if (!hasChecked) {
            const today = getLocalISODate();
            const lateTasks = store.tasks.filter(t => t.date < today).length;
            const lateChecklists = store.reviews.reduce((total, review) => {
                if (!review.subtasks) return total;
                return total + review.subtasks.filter(t => !t.done).length;
            }, 0);
            
            const totalPending = lateTasks + lateChecklists;
            if (totalPending > 0) {
                taskManager.openModal();
                toast.show(`Detectamos ${totalPending} pendências.`, 'warning', '🔔 Lembrete de Início');
            }
            sessionStorage.setItem('ciclo_startup_check', 'true');
        }
    },

    setupEventListeners: () => {
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        const formEdit = document.getElementById('form-edit-study');
        if(formEdit) formEdit.addEventListener('submit', app.handleEditSubmit);
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;
        
        const btnNew = document.getElementById('btn-new-study');
        if(btnNew) btnNew.onclick = app.handleNewStudyClick;

        const formSubtask = document.getElementById('form-subtask');
        if (formSubtask) {
            formSubtask.addEventListener('submit', app.handleAddSubtask);
        }
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
                store.save();
                setTimeout(() => toast.show('Sistema atualizado para Lote.', 'info', 'Upgrade Realizado'), 2000);
            }
        }
    },

    initAuth: () => {
        const startFirebaseLogic = () => {
            if (!window.fireMethods || !window.fireAuth) return;
            const { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, ref, onValue, get } = window.fireMethods;
            const auth = window.fireAuth;
            const db = window.fireDb;

            const btnUser = document.getElementById('user-menu-btn');
            const popover = document.getElementById('auth-popover');
            
            if(btnUser) {
                btnUser.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    popover.classList.toggle('hidden');
                });
            }

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    store.currentUser = user;
                    ui.updateAuthUI(user);
                    const userRef = ref(db, 'users/' + user.uid);
                    get(userRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            store.load(snapshot.val());
                            toast.show('Sincronizado.', 'success');
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
                    ui.updateAuthUI(null);
                    store.load(null); 
                }
            });

            const btnLogout = document.getElementById('btn-logout-popover');
            if(btnLogout) {
                btnLogout.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        popover.classList.add('hidden'); 
                        toast.show('Desconectado.', 'info');
                    });
                });
            }
        };

        if (window.fireMethods && window.fireAuth) startFirebaseLogic();
        else window.addEventListener('firebase-ready', startFirebaseLogic);
    },

    initVersionControl: () => {
        if (typeof changelogData !== 'undefined' && changelogData.length > 0) {
            const latest = changelogData[0].version;
            const btn = document.getElementById('app-version-btn');
            if (btn) btn.innerText = `v${latest}`;
            document.title = `CicloSmart v${latest}`;
        }
    },

    checkSmartCycle: () => {
        if (store.profile !== 'pendular' || !store.lastAttackDate) return;
        const todayStr = getLocalISODate();
        const dateLast = new Date(store.lastAttackDate + 'T00:00:00');
        const dateToday = new Date(todayStr + 'T00:00:00');
        const diffDays = Math.ceil((dateToday - dateLast) / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1 && store.cycleState !== 'DEFENSE') {
            store.cycleState = 'DEFENSE';
            store.save();
        } else if (diffDays >= 2 && store.cycleState !== 'ATTACK') {
            store.cycleState = 'ATTACK';
            store.save();
        }
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        const select = document.getElementById('input-subject');
        const subjectName = select.options[select.selectedIndex].text;
        const subjectColor = select.options[select.selectedIndex].dataset.color;
        const topic = document.getElementById('input-topic').value;
        const studyTime = parseInt(document.getElementById('input-study-time')?.value || 60);
        const selectedDateStr = document.getElementById('input-study-date').value;
        const complexity = document.querySelector('input[name="complexity"]:checked')?.value || 'normal';
        const link = document.getElementById('input-study-link')?.value || '';

        if (store.profile === 'pendular' && studyTime > 90) {
            return toast.show('Limite de 90 min excedido.', 'warning');
        }

        pendingStudyData = { subjectName, subjectColor, topic, studyTime, selectedDateStr, eTarget: e.target, complexity, link };
        ui.toggleModal('modal-cycle-confirm', true);
    },

    resolveCycle: (startNew) => {
        if (!pendingStudyData) return;
        if (startNew) {
            store.cycleStartDate = pendingStudyData.selectedDateStr;
            store.save();
        }
        if(window.engine) engine.processStudyEntry(pendingStudyData);
        ui.toggleModal('modal-cycle-confirm', false);
        ui.toggleModal('modal-new', false);
        pendingStudyData.eTarget.reset(); 
        pendingStudyData = null;
    },

    // --- LOGICA DE DRAG AND DROP (KANBAN) REFINADA ---

    handleKanbanDragStart: (e, id) => {
        try {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
            document.body.classList.add('is-dragging');
        } catch (err) {
            console.error('[DragStart Error]', err);
        }
    },

    handleKanbanDrop: (e, targetColType) => {
        e.preventDefault();
        document.body.classList.remove('is-dragging');
        document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-hover', 'drag-warning'));

        const idRaw = e.dataTransfer.getData("text/plain");
        const review = store.reviews.find(r => r.id.toString() === idRaw.toString());

        if (!review) return toast.show('Erro: Item não localizado.', 'error');

        // Mapeamento de colunas para datas
        const today = getLocalISODate();
        let targetDate = review.date;

        if (targetColType === 'today') {
            targetDate = today;
        } else if (targetColType === 'late') {
            const yesterday = new Date(); 
            yesterday.setDate(yesterday.getDate() - 1);
            if (review.date >= today) targetDate = getLocalISODate(yesterday);
        } else if (targetColType === 'future') {
             if (review.date <= today) {
                 const tomorrow = new Date(); 
                 tomorrow.setDate(tomorrow.getDate() + 1);
                 targetDate = getLocalISODate(tomorrow);
             }
        }

        if (review.date === targetDate) return; 

        // --- ANÁLISE DE RESTRIÇÕES ---
        const warnings = app.checkDropConstraints(review, targetDate);

        if (warnings.length > 0) {
            const msg = warnings.join('<br><br>');
            const warningTextEl = document.getElementById('drag-warning-text');
            if (warningTextEl) warningTextEl.innerHTML = msg;
            
            document.getElementById('btn-confirm-drag').onclick = () => {
                app.executeMove(review, targetDate, targetColType);
                ui.toggleModal('modal-drag-warning', false);
            };
            
            ui.toggleModal('modal-drag-warning', true);
        } else {
            app.executeMove(review, targetDate, targetColType);
        }
    },

    checkDropConstraints: (review, targetDate) => {
        const warnings = [];
        const capacity = store.capacity || 240;
        
        // 1. Verificação de Sobrecarga
        const dayLoad = store.reviews
            .filter(r => r.date === targetDate && r.id.toString() !== review.id.toString() && r.status !== 'DONE')
            .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
        
        const newLoad = dayLoad + (parseInt(review.time) || 0);
        
        if (newLoad > capacity) {
            const excess = newLoad - capacity;
            warnings.push(`<strong>⚠️ Sobrecarga Detectada:</strong><br>O dia ficará com ${newLoad}min (Meta: ${capacity}min). Excede o limite em ${excess}min.`);
        }

        // 2. Verificação Cronológica (SRS)
        if (review.batchId) {
            const siblings = store.reviews
                .filter(r => r.batchId === review.batchId && r.id.toString() !== review.id.toString())
                .sort((a, b) => (a.cycleIndex || 0) - (b.cycleIndex || 0));
            
            const brokenOrder = siblings.find(s => 
                s.cycleIndex < review.cycleIndex && s.date > targetDate
            );

            if (brokenOrder) {
                warnings.push(`<strong>⚠️ Quebra Lógica:</strong><br>Você está movendo a revisão #${review.cycleIndex} para antes da revisão #${brokenOrder.cycleIndex} (${formatDateDisplay(brokenOrder.date)}).`);
            }
        }
        return warnings;
    },

    executeMove: (review, targetDate, colType) => {
        const previousState = { 
            date: review.date, 
            isTemporary: review.isTemporary || false,
            originalDate: review.originalDate || null
        };

        review.date = targetDate;
        
        // Lógica de "Empréstimo" (Se mover Futuro -> Hoje)
        if (colType === 'today' && !review.isTemporary && previousState.date > getLocalISODate()) {
            review.originalDate = previousState.date;
            review.isTemporary = true;
        } else if (colType !== 'today') {
            delete review.isTemporary;
            delete review.originalDate;
        }

        store.save();
        ui.render();
        ui.renderHeatmap();
        
        toast.show(
            'Revisão remanejada.', 
            'success', 
            'Agenda Atualizada', 
            {
                label: 'Desfazer',
                onClick: `app.undoMove('${review.id}', '${previousState.date}', ${previousState.isTemporary}, '${previousState.originalDate || ''}')`
            }
        );
    },

    undoMove: (id, prevDate, prevIsTemp, prevOriginalDate) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (review) {
            review.date = prevDate;
            if (prevIsTemp) {
                review.isTemporary = true;
                review.originalDate = prevOriginalDate;
            } else {
                delete review.isTemporary;
                delete review.originalDate;
            }
            store.save();
            ui.render();
            ui.renderHeatmap();
            toast.show('Ação desfeita.', 'info');
        }
    },

    // --- DEMAIS MÉTODOS DE CONTROLE ---

    currentReviewId: null,

    openSubtasks: (id) => {
        app.currentReviewId = id;
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if(!review) return;

        const titleEl = document.getElementById('subtask-title');
        const subEl = document.getElementById('subtask-subtitle');
        if(titleEl) titleEl.innerText = review.subject;
        if(subEl) subEl.innerText = review.topic;

        ui.renderSubtaskList(review);
        ui.toggleModal('modal-subtasks', true);
        setTimeout(() => document.getElementById('input-subtask')?.focus(), 100);
    },

    handleAddSubtask: (e) => {
        e.preventDefault();
        const input = document.getElementById('input-subtask');
        const recurrenceSelect = document.getElementById('input-subtask-recurrence');
        const text = input.value.trim();
        const recurrenceMode = recurrenceSelect ? recurrenceSelect.value : 'today';
        
        if (text && app.currentReviewId) {
            const isRecurrent = recurrenceMode !== 'today';
            store.addSubtask(app.currentReviewId, text, { isRecurrent });

            if (isRecurrent) {
                const currentReview = store.reviews.find(r => r.id.toString() === app.currentReviewId.toString());
                if (currentReview && currentReview.batchId) {
                    const siblings = store.reviews.filter(r => 
                        r.batchId === currentReview.batchId && 
                        r.id.toString() !== currentReview.id.toString() && 
                        r.date >= currentReview.date 
                    );

                    siblings.forEach(sibling => {
                        let shouldAdd = false;
                        if (recurrenceMode === 'cycle') shouldAdd = true;
                        else if (recurrenceMode === '24h') {
                            const diff = (new Date(sibling.date) - new Date(currentReview.date)) / 86400000;
                            if (sibling.type === '24h' || (diff >= 0.5 && diff <= 1.5)) shouldAdd = true;
                        }
                        if (shouldAdd) store.addSubtask(sibling.id, text, { isRecurrent: true });
                    });
                }
            }
            input.value = '';
            const updatedReview = store.reviews.find(r => r.id.toString() === app.currentReviewId.toString());
            if (updatedReview) ui.renderSubtaskList(updatedReview);
        }
    },

    handleToggleSubtask: (subId) => {
        if(app.currentReviewId) {
            store.toggleSubtask(app.currentReviewId, subId);
            const r = store.reviews.find(x => x.id.toString() === app.currentReviewId.toString());
            if(r) ui.renderSubtaskList(r);
        }
    },

    handleStatusToggle: (id, checkboxEl) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (!review) return;

        if (checkboxEl.checked) {
            const pending = (review.subtasks || []).filter(t => !t.done).length;
            if (pending > 0) {
                checkboxEl.checked = false; 
                return toast.show(`Finalize as ${pending} tarefas pendentes.`, 'error', 'Trava de Qualidade');
            }
        }
        store.toggleStatus(id);
    },

    handleFutureSearch: (term) => {
        app.futureFilterTerm = term.toLowerCase().trim();
        const btn = document.getElementById('btn-clear-search');
        if (btn) term.length > 0 ? btn.classList.remove('hidden') : btn.classList.add('hidden');
        ui.render();
    },

    clearSearch: () => {
        const input = document.getElementById('future-search');
        if (input) {
            input.value = '';
            app.handleFutureSearch('');
            input.focus();
        }
    },

    handleLinkAction: (id, currentLink) => {
        if (currentLink && currentLink.length > 5) window.open(currentLink, '_blank');
        else {
            const newLink = prompt("Link do material:");
            if (newLink) store.updateReviewLink(id, newLink.trim());
        }
    },

    checkCycleIntegrity: () => { if(window.engine) engine.checkCycleIntegrity(); },
    
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
    }
};

app.init();
window.app = app;
