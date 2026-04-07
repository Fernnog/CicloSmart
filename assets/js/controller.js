/* --- ASSETS/JS/CONTROLLER.JS --- */
/**
 * CICLOSMART APP CONTROLLER (v1.3.8 - Logic Layer)
 * Contém: Orquestração de UI, Auth e Eventos.
 * ATUALIZAÇÃO: Unificação Drag & Drop e Suporte a Dropzones Kanban.
 * EVOLUÇÃO: Implementação de Remanejamento Inteligente e Trava de Cultura.
 */

// Variável de Estado para o Modal de Decisão de Ciclo
let pendingStudyData = null;

const app = {
    // Variável de Estado para Busca na Coluna Futuro (Movida para o escopo do app)
    futureFilterTerm: '',

    init: () => {
        store.load();
        
        // --- ARQUITETURA REATIVA (OBSERVER) ---
        store.subscribe(taskManager.checkOverdue); 
        store.subscribe(taskManager.render);       
        store.subscribe(ui.render); // UI agora reage a mudanças no Store
        
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

        // --- [NOVO] VARREDURA DE INÍCIO DE SESSÃO (PRIORIDADE 1) ---
        // Verifica pendências silenciosamente e abre o modal se necessário
        setTimeout(() => app.checkPendingTasksOnStartup(), 800);

        // --- VERIFICAÇÃO DE INTEGRIDADE ---
        // Delegado para o Engine
        setTimeout(() => app.checkCycleIntegrity(), 1000);

        // --- MANUTENÇÃO AUTOMÁTICA DE DADOS (Data Sanitation) ---
        // Executa limpeza silenciosa de tarefas antigas e checklists obsoletos
        if (window.engine && engine.runDataSanitation) {
            setTimeout(() => engine.runDataSanitation(), 2500);
        }

        // --- [DIAGNÓSTICO] AGENDAMENTO DO SETUP DE DRAG & DROP ---
        // Delay seguro para garantir que o HTML do Radar existe antes de ligar os sensores
        console.log("⏳ [DEBUG] Agendando setup do Drag & Drop em 500ms...");
        setTimeout(() => {
            app.setupUnifiedDragDrop();
        }, 500);
    },

    // --- [DIAGNÓSTICO] GERENTE DE ARRASTE COM LOGS DETALHADOS ---
    setupUnifiedDragDrop: () => {
        console.group("🕵️‍♂️ [DEBUG] Setup Drag & Drop");
        const grid = document.getElementById('heatmap-grid');
        
        if (!grid) {
            console.error("❌ ERRO CRÍTICO: Elemento #heatmap-grid não foi encontrado no DOM. O script rodou cedo demais?");
            console.groupEnd();
            return;
        }
        
        console.log("✅ Elemento #heatmap-grid localizado. Reiniciando listeners...");

        // Clona para limpar listeners antigos (Garbage Collection de eventos)
        const newGrid = grid.cloneNode(true);
        grid.parentNode.replaceChild(newGrid, grid);
        console.log("♻️ Grid clonado e limpo.");

        // 1. MONITOR DE CLICK (Para verificar se o elemento é clicável e não bloqueado por CSS)
        newGrid.addEventListener('mousedown', (e) => {
            console.log("🖱️ [DEBUG] Click detectado em:", e.target);
            const card = e.target.closest('[draggable="true"]');
            if (card) {
                console.log("   ↳ Alvo válido identificado (draggable=true):", card.id);
            } else {
                console.warn("   ↳ Clique fora de um card arrastável ou pointer-events bloqueado.");
            }
        });

        // 2. DRAG START (O momento crítico onde costuma falhar)
        newGrid.addEventListener('dragstart', (e) => {
            console.log("🚀 [DEBUG] Evento 'dragstart' disparado!");
            
            const card = e.target.closest('[draggable="true"]');
            if (!card) {
                console.error("❌ [DEBUG] 'dragstart' ocorreu, mas não achei o elemento pai com draggable='true'.");
                return;
            }

            // Tenta extrair o ID de várias formas (blindagem)
            let id = card.dataset.id; 
            if (!id && card.id) id = card.id.replace('card-', '');

            console.log(`✅ [DEBUG] Card capturado. ID: ${id} | HTML:`, card);

            if (id) {
                app.handleDragStart(e, id);
            } else {
                console.error("❌ [DEBUG] ID não encontrado no elemento.");
            }
        });

        // 3. DRAG OVER (Permite soltar)
        newGrid.addEventListener('dragover', (e) => {
            // console.log("... dragover ..."); // Comentado para evitar spam no console
            const cell = e.target.closest('.heatmap-day-cell');
            if (cell) {
                e.preventDefault(); // OBRIGATÓRIO para permitir o drop
                app.handleDragEnter(e, cell);
            }
        });

        // 4. DROP (Finalização)
        newGrid.addEventListener('drop', (e) => {
            console.log("🎯 [DEBUG] Evento 'drop' disparado.");
            const cell = e.target.closest('.heatmap-day-cell');
            
            if (cell && cell.dataset.date) {
                console.log(`✅ [DEBUG] Soltando na data: ${cell.dataset.date}`);
                app.handleDrop(e, cell.dataset.date);
                
                // Limpeza visual manual para garantir
                document.querySelectorAll('.heatmap-day-cell').forEach(el => el.classList.remove('drag-hover'));
            } else {
                console.warn("⚠️ [DEBUG] Drop ocorreu fora de uma célula válida.");
            }
        });

        console.log("✅ Listeners anexados com sucesso.");
        console.groupEnd();
    },

    checkPendingTasksOnStartup: () => {
        const hasChecked = sessionStorage.getItem('ciclo_startup_check');
        
        if (!hasChecked) {
            console.log("[CicloSmart] Executando varredura inicial de pendências...");
            
            const today = getLocalISODate();
            
            const lateTasks = store.tasks.filter(t => t.date < today).length;
            
            const lateChecklists = store.reviews.reduce((total, review) => {
                if (!review.subtasks) return total;
                return total + review.subtasks.filter(t => !t.done).length;
            }, 0);
            
            const totalPending = lateTasks + lateChecklists;

            if (totalPending > 0) {
                taskManager.openModal();
                toast.show(
                    `Detectamos ${totalPending} pendências não resolvidas.`, 
                    'warning', 
                    '🔔 Lembrete de Início'
                );
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
            console.log("[DEBUG] Listener do FORM-SUBTASK conectado com sucesso!");
            formSubtask.addEventListener('submit', app.handleAddSubtask);
        } else {
            console.error("[ERRO CRÍTICO] Formulário 'form-subtask' não encontrado no HTML!");
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

    checkCycleIntegrity: () => {
        if(window.engine) engine.checkCycleIntegrity();
    },

    runCycleRepair: (mode) => {
        if(window.engine) engine.runCycleRepair(mode);
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

        const complexityInput = document.querySelector('input[name="complexity"]:checked');
        const complexity = complexityInput ? complexityInput.value : 'normal';

        const link = document.getElementById('input-study-link')?.value || '';

        if (store.profile === 'pendular' && studyTime > 90) {
            return toast.show('O tempo limite para estudo neste modo é 90 minutos.', 'warning', '⚠️ Teto Cognitivo');
        }
        if (store.profile === 'pendular' && store.cycleState === 'DEFENSE' && selectedDateStr === todayStr) {
            return toast.show('Hoje é consolidação. Agende novos conteúdos a partir de amanhã.', 'error', '🛡️ Escudo Ativo');
        }

        pendingStudyData = { subjectName, subjectColor, topic, studyTime, selectedDateStr, eTarget: e.target, complexity, link };
        
        let projectedDay = 1;
        
        if (window.engine) {
            projectedDay = engine.calculateCycleIndex();
        }

        const descEl = document.getElementById('cycle-option-keep-desc');
        if(descEl) {
            descEl.innerHTML = `Continuar sequência: <b>Dia #${projectedDay}</b>`;
        }
        
        ui.toggleModal('modal-cycle-confirm', true);
    },

    resolveCycle: (startNew) => {
        if (!pendingStudyData) return;
        if (startNew) {
            store.cycleStartDate = pendingStudyData.selectedDateStr;
            store.save();
            toast.show('Ciclo reiniciado! Dia #1 definido.', 'neuro', '🚩 Novo Ciclo');
        }
        
        // MODIFICADO: Passamos a variável 'startNew' para o Engine saber se deve forçar o #1
        if(window.engine) engine.processStudyEntry(pendingStudyData, startNew);
        
        ui.toggleModal('modal-cycle-confirm', false);
        ui.toggleModal('modal-new', false);
        pendingStudyData.eTarget.reset(); 
        pendingStudyData = null;
        app.updateProfileUI(store.profile);
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

    saveStrategySettingsManual: () => {
        const capInput = document.getElementById('setting-capacity');
        const cycleInput = document.getElementById('setting-cycle-start');
        
        if (capInput) {
            const newCap = parseInt(capInput.value);
            if (newCap > 0 && newCap !== store.capacity) {
                store.capacity = newCap;
            }
        }

        if (cycleInput) {
            const newDate = cycleInput.value;
            if (newDate && newDate !== store.cycleStartDate) {
                store.cycleStartDate = newDate;
            }
        }

        store.save();
        ui.renderHeatmap();
        ui.render();

        toast.show(
            'Configurações de estratégia sincronizadas na nuvem.', 
            'success', 
            '✅ Salvo com Sucesso'
        );
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
        const review = store.reviews.find(r => r.id === id);
        if (!review) return;

        const idInput = document.getElementById('edit-study-id');
        const topicInput = document.getElementById('edit-input-topic');
        const timeInput = document.getElementById('edit-input-time');
        const linkInput = document.getElementById('edit-input-link');
        const subjSelect = document.getElementById('edit-input-subject');

        if(idInput) idInput.value = review.id;
        if(topicInput) topicInput.value = review.topic;
        if(timeInput) timeInput.value = review.time;
        if(linkInput) linkInput.value = review.link || '';

        const subjectObj = store.subjects.find(s => s.name === review.subject);
        if (subjectObj && subjSelect) {
            subjSelect.value = subjectObj.id;
        }

        ui.toggleModal('modal-edit-study', true);
    },

    handleEditSubmit: (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-study-id').value;
        const newSubjectId = document.getElementById('edit-input-subject').value;
        const newTopic = document.getElementById('edit-input-topic').value;
        const newTime = document.getElementById('edit-input-time').value;
        const newLink = document.getElementById('edit-input-link').value;

        if (!newTopic || !newSubjectId) return toast.show("Preencha os campos obrigatórios.", "warning");

        store.updateReviewFull(id, { newSubjectId, newTopic, newTime, newLink });
        
        ui.toggleModal('modal-edit-study', false);
    },

    handleStatusToggle: (id, checkboxEl) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        
        if (!review) return;

        const isMarkingAsDone = checkboxEl.checked;

        if (isMarkingAsDone) {
            const pendingSubtasks = (review.subtasks || []).filter(t => !t.done).length;
            
            if (pendingSubtasks > 0) {
                checkboxEl.checked = false; 
                toast.show(`🚫 Bloqueado: Finalize as ${pendingSubtasks} tarefas pendentes antes de concluir.`, 'error', 'Trava de Qualidade');
                return; 
            }
        }

        store.toggleStatus(id);
    },

    handleFutureSearch: (term) => {
        // Correção Crítica: Salva no escopo global 'app' para o view.js enxergar
        app.futureFilterTerm = term.toLowerCase().trim();
        
        // Lógica do Botão X
        const btn = document.getElementById('btn-clear-search');
        if (btn) {
            if (term.length > 0) {
                btn.classList.remove('hidden');
            } else {
                btn.classList.add('hidden');
            }
        }
        
        ui.render();
    },

    clearSearch: () => {
        const input = document.getElementById('future-search');
        if (input) {
            input.value = '';
            app.handleFutureSearch(''); // Reseta o filtro e esconde o botão
            input.focus(); // Devolve o foco para o usuário digitar de novo se quiser
        }
    },

    confirmDelete: (id) => {
        const r = store.reviews.find(x => x.id.toString() === id.toString()); 
        if(!r) return;
        
        const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];
        
        const pendingSubtasks = (r.subtasks || []).filter(t => !t.done).length;
        let warningMsg = "";

        if (pendingSubtasks > 0) {
            warningMsg = `\n\n🚨 ATENÇÃO: Há ${pendingSubtasks} tarefas não concluídas neste cartão!`;
        }

        if (siblings.length > 1) {
            if (confirm(`🗑️ Excluir CICLO COMPLETO (${siblings.length} itens)?${warningMsg}\n\n[OK] Sim, apagar tudo.\n[Cancelar] Não, apagar só este.`)) {
                store.deleteBatch(r.batchId);
                toast.show('Ciclo removido.', 'error');
            } else if(confirm(`Excluir apenas este card?${warningMsg}`)) {
                store.deleteReview(id);
                toast.show('Card removido.', 'info');
            }
        } else {
            if(confirm(`Excluir esta revisão?${warningMsg}`)) {
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
        if(window.engine) engine.generateICS();
    },

    handleReschedule: () => {
        if(window.engine) engine.handleReschedule();
    },

    handleVacationMode: () => {
    handleVacationMode: () => {
        if(window.engine) engine.applyVacationMode();
    },

    clearVacationMode: () => {
        store.vacationStart = null;
        store.vacationReturnDate = null;
        store.save();
        
        ui.updateVacationUI();
        toast.show('Bloqueio de calendário desativado. Novos ciclos seguirão as datas normais.', 'info', 'Regra Cancelada');
    },

    undoLastAction: () => {
        if(store.restoreBackup()) {
            store.vacationStart = null;
            store.vacationReturnDate = null;
            ui.render();
            if(!document.getElementById('modal-heatmap').classList.contains('hidden')) {
                ui.renderHeatmap();
            }
            
            const btnUndo = document.getElementById('btn-undo-vacation');
            if(btnUndo) btnUndo.classList.add('hidden');
            
            toast.show('A agenda retornou exatamente como estava antes.', 'success', '↩️ Ação Desfeita');
        } else {
            toast.show('Não há histórico recente para desfazer.', 'warning');
        }
    },

    // --- DRAG AND DROP HANDLERS (HEATMAP) ---

    // --- LÓGICA DE DRAG & DROP DO RADAR ---

    handleDragStart: (e, id) => {
        // [ATUALIZAÇÃO DE DEBUG] Garante conversão para String para compatibilidade total
        e.dataTransfer.setData("text/plain", String(id));
        e.dataTransfer.effectAllowed = "move";
        document.body.classList.add('is-dragging');
    },

    handleDragEnd: (e) => {
        document.body.classList.remove('is-dragging');
    },

    handleDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    },

    handleDragEnter: (e, element) => {
        e.preventDefault();
        element.classList.add('drag-hover');
    },

    handleDragLeave: (e, element) => {
        e.preventDefault();
        element.classList.remove('drag-hover');
    },

    handleDrop: (e, targetDateStr) => {
        e.preventDefault();
        document.body.classList.remove('is-dragging');
        
        // Limpeza visual de segurança
        document.querySelectorAll('.heatmap-day-cell').forEach(el => el.classList.remove('drag-hover'));

        const idRaw = e.dataTransfer.getData("text/plain");
        // Busca robusta para garantir compatibilidade de tipos
        const review = store.reviews.find(r => r.id.toString() === idRaw.toString());
        
        if (!review) return;
        if (review.date === targetDateStr) return; 

        // 1. Validação de Cronologia (Impedir quebra de sequência)
        if (review.batchId) {
            const siblings = store.reviews
                .filter(r => r.batchId === review.batchId)
                .sort((a, b) => a.date.localeCompare(b.date));
            
            const currentIndex = siblings.findIndex(r => r.id.toString() === review.id.toString());
            
            const nextReview = siblings[currentIndex + 1];
            if (nextReview && targetDateStr >= nextReview.date) {
                return toast.show(`Bloqueado: Próxima revisão é em ${formatDateDisplay(nextReview.date)}.`, 'error', '⛔ Cronologia');
            }
            
            const prevReview = siblings[currentIndex - 1];
            if (prevReview && targetDateStr <= prevReview.date) {
                 return toast.show(`Bloqueado: Revisão anterior foi em ${formatDateDisplay(prevReview.date)}.`, 'error', '⛔ Cronologia');
            }
        }

        // 2. Validação de Capacidade (Alerta de Sobrecarga - Permissivo)
        const targetDayLoad = store.reviews
            .filter(r => r.date === targetDateStr && r.id.toString() !== review.id.toString())
            .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
        const newTotal = targetDayLoad + parseInt(review.time);
        const capacity = store.capacity || 240;

        if (newTotal > capacity) {
             // Apenas um alerta visual, mas permite a ação para dar liberdade ao usuário
             toast.show(`Atenção: O dia ficará com ${newTotal}min (Meta: ${capacity}min).`, 'warning', '⚠️ Sobrecarga');
        }

        // Executa a movimentação
        review.date = targetDateStr;
        store.save();
        
        ui.renderHeatmap(); 
        ui.render(); 
        
        toast.show(`Revisão movida para ${formatDateDisplay(targetDateStr)}.`, 'success', '📅 Reagendado');
    },

    // --- [NOVO] MÉTODOS DE REMANEJAMENTO INTELIGENTE ---

    moveToToday: (id) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (!review) return;
        const today = getLocalISODate();

        if (review.date === today) return;

        // Trava de Cultura: Bloqueia puxar itens do futuro se existirem atrasos
        if (review.date > today) {
            const hasLateTasks = store.reviews.some(r => r.date < today && r.status === 'PENDING');
            if (hasLateTasks) {
                return toast.show('Zere suas pendências atrasadas antes de adiantar estudos futuros!', 'error', '🔒 Foco Exigido');
            }
        }

        // Marca como Temporário (Emprestado)
        if (!review.isTemporary) {
            review.originalDate = review.date;
            review.isTemporary = true;
        }
        review.date = today;

        store.save();
        ui.render();
        toast.show('Tarefa puxada para Hoje!', 'success', '⚡ Antecipado');
    },

    revertMove: (id) => {
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (review && review.isTemporary) {
            review.date = review.originalDate;
            delete review.originalDate;
            delete review.isTemporary;
            store.save();
            ui.render();
            toast.show('Retornado ao planejamento original.', 'info');
        }
    },

    checkTemporaryReversions: () => {
        const today = getLocalISODate();
        let changeCount = 0;

        store.reviews.forEach(r => {
            if (r.isTemporary && r.status === 'PENDING' && r.date < today) {
                if (r.originalDate) {
                    r.date = r.originalDate; 
                } else {
                    console.warn(`[CicloSmart] Data original perdida para o card ${r.id}. Mantendo como atrasado.`);
                }
                delete r.originalDate;
                delete r.isTemporary;
                changeCount++;
            }
            else if (r.isTemporary && r.status === 'DONE') {
                delete r.originalDate;
                delete r.isTemporary;
                store.save(); 
            }
            else if (r.isTemporary && r.date !== today) {
                delete r.originalDate;
                delete r.isTemporary;
                changeCount++;
            }
        });

        if (changeCount > 0) {
            store.save();
            setTimeout(() => {
                ui.render(); 
                toast.show(`${changeCount} estudos reorganizados.`, 'info', '✨ Agenda Higienizada');
            }, 500);
        }
    },
 
    handleKanbanDragStart: (e, id) => {
        try {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
            document.body.classList.add('is-dragging');
        } catch (err) {
            console.error('[DragStart Error]', err);
        }
    },

    allowDrop: (e) => {
        // Obrigatório no HTML5 Drag and Drop: 
        // Previne o comportamento padrão do navegador que proíbe soltar elementos
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    },

    handleKanbanDrop: (e, targetCol) => {
        e.preventDefault();
        document.body.classList.remove('is-dragging');
        
        document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-hover'));

        const idRaw = e.dataTransfer.getData("text/plain");
        const review = store.reviews.find(r => r.id.toString() === idRaw.toString());
        
        if (!review) {
            console.error('[ERRO] Review não encontrada. ID:', idRaw);
            return toast.show('Erro ao mover: Item não localizado.', 'error');
        }

        const today = getLocalISODate();

        if (targetCol === 'today') {
            if (review.date === today) return;

            const previousState = {
                date: review.date,
                isTemporary: review.isTemporary || false,
                originalDate: review.originalDate
            };

            if (!review.isTemporary) {
                review.originalDate = review.date;
                review.isTemporary = true;
            }
            
            review.date = today;
            store.save();
            
            toast.show(
                'Movido para hoje (Extra).', 
                'success', 
                '📅 Agenda Atualizada',
                {
                    label: 'Desfazer',
                    onClick: `app.undoMove('${review.id}', '${previousState.date}', ${previousState.isTemporary}, '${previousState.originalDate || ''}')`
                }
            );
        }
        else if ((targetCol === 'late' || targetCol === 'future')) {
            if (review.isTemporary) {
                review.date = review.originalDate;
                delete review.originalDate;
                delete review.isTemporary;
                store.save();
                toast.show('Item devolvido à posição original.', 'info');
            }
        }
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
            toast.show('Ação desfeita.', 'info');
        }
    },

    currentReviewId: null,

    openSubtasks: (id) => {
        console.log(`[DEBUG] 1. Tentando abrir modal para ID: ${id}`);
        
        app.currentReviewId = id;
        
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        
        if(!review) {
            console.error("[ERRO] Review não encontrada!");
            return;
        }

        const titleEl = document.getElementById('subtask-title');
        const subEl = document.getElementById('subtask-subtitle');
        if(titleEl) titleEl.innerText = review.subject;
        if(subEl) subEl.innerText = review.topic;

        ui.renderSubtaskList(review);
        ui.toggleModal('modal-subtasks', true);
        
        setTimeout(() => {
            const input = document.getElementById('input-subtask');
            if(input) input.focus();
        }, 100);
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

                    let addedCount = 0;

                    siblings.forEach(sibling => {
                        let shouldAdd = false;

                        if (recurrenceMode === 'cycle') {
                            shouldAdd = true;
                        } 
                        else if (recurrenceMode === '24h') {
                            const diffDays = (new Date(sibling.date) - new Date(currentReview.date)) / (1000 * 60 * 60 * 24);
                            if (sibling.type === '24h' || (diffDays >= 0.5 && diffDays <= 1.5)) shouldAdd = true;
                        }
                        else if (recurrenceMode === '7d') {
                            const diffDays = (new Date(sibling.date) - new Date(currentReview.date)) / (1000 * 60 * 60 * 24);
                            if (['24h', '7d'].includes(sibling.type) || diffDays <= 8) shouldAdd = true;
                        }

                        if (shouldAdd) {
                            store.addSubtask(sibling.id, text, { isRecurrent: true });
                            addedCount++;
                        }
                    });
                    
                    if (addedCount > 0) {
                        toast.show(`Tarefa replicada para ${addedCount} revisões futuras!`, 'neuro', '🔁 Ciclo Sincronizado');
                    }
                }
            }
            
            input.value = '';
            if(recurrenceSelect) recurrenceSelect.value = 'today';

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
    
    handleDeleteSubtask: (subId) => {
        if(app.currentReviewId) {
            store.removeSubtask(app.currentReviewId, subId);
            const r = store.reviews.find(x => x.id.toString() === app.currentReviewId.toString());
            if(r) ui.renderSubtaskList(r);
        }
    },

    handleLinkedTaskToggle: (reviewId, subtaskId) => {
        store.toggleSubtask(reviewId, subtaskId);
        setTimeout(() => {
            taskManager.renderLinkedTasks();
        }, 300);
    },

    handleLinkAction: (id, currentLink) => {
        if (typeof event !== 'undefined') {
            event.preventDefault();
            event.stopPropagation();
        }

        if (currentLink && currentLink !== 'null' && currentLink !== 'undefined' && currentLink.length > 5) {
            window.open(currentLink, '_blank', 'noopener,noreferrer');
        } 
        else {
            const newLink = prompt("Insira o link do material (Drive/Notion/PDF):");
            if (newLink && newLink.trim().length > 0) {
                store.updateReviewLink(id, newLink.trim());
            }
        }
    },

    copyStudyInfo: (cycleIndex, topic) => {
        if (typeof event !== 'undefined') {
            event.preventDefault(); 
            event.stopPropagation();
        }

        const textToCopy = `#${cycleIndex} - ${topic}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => toast.show(`Copiado: ${textToCopy}`, 'success', '📋 Área de Transferência'))
                .catch(err => toast.show('Erro ao copiar automaticamente.', 'error'));
        } else {
            prompt("Copie o texto abaixo:", textToCopy);
        }
    },

    locateAndHighlight: (id) => {
        ui.toggleModal('modal-tasks', false);

        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (review) {
            const today = getLocalISODate();
            let targetTab = 'today';
            if (review.date < today && review.status !== 'DONE') targetTab = 'late';
            else if (review.date > today) targetTab = 'future';
            
            ui.switchTab(targetTab);
        }

        setTimeout(() => {
            const el = document.getElementById(`card-${id}`);
            
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-card'); 
                
                setTimeout(() => el.classList.remove('highlight-card'), 2000);
            } else {
                toast.show('Cartão não localizado visualmente.', 'warning');
            }
        }, 300);
    }
};

app.init();
window.app = app;
