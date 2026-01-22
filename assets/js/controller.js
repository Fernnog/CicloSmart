/* --- ASSETS/JS/CONTROLLER.JS --- */
/**
 * CICLOSMART APP CONTROLLER (v1.3.0 - Logic Layer)
 * Contém: Orquestração de UI, Auth e Eventos.
 * ATUALIZADO: Lógica pesada delegada para 'engine.js'.
 */

// Variável de Estado para o Modal de Decisão de Ciclo
let pendingStudyData = null;
// Variável de Estado para Busca na Coluna Futuro
let futureFilterTerm = '';

const app = {
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
    },
    // --- [NOVO MÉTODO] Lógica de Alerta Automático de Pendências ---
    checkPendingTasksOnStartup: () => {
        // Verifica se já rodou nesta sessão (SessionStorage limpa ao fechar aba)
        const hasChecked = sessionStorage.getItem('ciclo_startup_check');
        
        if (!hasChecked) {
            console.log("[CicloSmart] Executando varredura inicial de pendências...");
            
            const today = getLocalISODate();
            
            // 1. Contagem de Tarefas Gerais Atrasadas
            const lateTasks = store.tasks.filter(t => t.date < today).length;
            
            // 2. Contagem de Micro-Quests (Checklists) Atrasadas
            const lateChecklists = store.reviews.reduce((total, review) => {
                if (!review.subtasks) return total;
                return total + review.subtasks.filter(t => !t.done).length;
            }, 0);
            
            const totalPending = lateTasks + lateChecklists;

            if (totalPending > 0) {
                // Abre o modal automaticamente na frente do usuário
                taskManager.openModal();
                
                // Feedback visual explicando o motivo da abertura
                toast.show(
                    `Detectamos ${totalPending} pendências não resolvidas.`, 
                    'warning', 
                    '🔔 Lembrete de Início'
                );
            }

            // Marca como verificado para esta sessão para não incomodar no F5
            sessionStorage.setItem('ciclo_startup_check', 'true');
        }
    },

    setupEventListeners: () => {
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;
        
        const btnNew = document.getElementById('btn-new-study');
        if(btnNew) btnNew.onclick = app.handleNewStudyClick;

        // --- NOVO LISTENER PARA SUBTAREFAS (DEBUG ATIVO) ---
        const formSubtask = document.getElementById('form-subtask');
        if (formSubtask) {
            console.log("[DEBUG] Listener do FORM-SUBTASK conectado com sucesso!");
            formSubtask.addEventListener('submit', app.handleAddSubtask);
        } else {
            console.error("[ERRO CRÍTICO] Formulário 'form-subtask' não encontrado no HTML! Verifique se o modal foi inserido corretamente.");
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

    // --- DELEGAÇÃO PARA ENGINE (Integridade) ---
    checkCycleIntegrity: () => {
        // Lógica movida para engine.js
        if(window.engine) engine.checkCycleIntegrity();
    },

    runCycleRepair: (mode) => {
        // Lógica movida para engine.js
        if(window.engine) engine.runCycleRepair(mode);
    },

    handleNewEntry: (e) => {
        e.preventDefault();
        
        // 1. Captura de Dados do Formulário
        const select = document.getElementById('input-subject');
        const subjectName = select.options[select.selectedIndex].text;
        const subjectColor = select.options[select.selectedIndex].dataset.color;
        const topic = document.getElementById('input-topic').value;
        
        const studyTimeInput = document.getElementById('input-study-time');
        const studyTime = studyTimeInput ? parseInt(studyTimeInput.value) : 60; 
        
        const dateInput = document.getElementById('input-study-date');
        const selectedDateStr = dateInput.value; 
        const todayStr = getLocalISODate();

        // 2. Captura da Complexidade (Novo Recurso)
        const complexityInput = document.querySelector('input[name="complexity"]:checked');
        const complexity = complexityInput ? complexityInput.value : 'normal';

        // 3. Validações de UI (Perfil Pendular)
        if (store.profile === 'pendular' && studyTime > 90) {
            return toast.show('O tempo limite para estudo neste modo é 90 minutos.', 'warning', '⚠️ Teto Cognitivo');
        }
        if (store.profile === 'pendular' && store.cycleState === 'DEFENSE' && selectedDateStr === todayStr) {
            return toast.show('Hoje é consolidação. Agende novos conteúdos a partir de amanhã.', 'error', '🛡️ Escudo Ativo');
        }

        // 4. Prepara objeto temporário (Incluindo complexity)
        pendingStudyData = { subjectName, subjectColor, topic, studyTime, selectedDateStr, eTarget: e.target, complexity };
        
        // 5. CÁLCULO DO CICLO (Com Logs de Recebimento)
        let projectedDay = 1;
        
        console.log("📞 CONTROLLER: Solicitando cálculo ao Engine...");
        
        if (window.engine) {
            projectedDay = engine.calculateCycleIndex();
            console.log("📨 CONTROLLER: Recebeu do Engine ->", projectedDay);
        } else {
            console.error("❌ CONTROLLER: window.engine não encontrado!");
        }

        // 6. Atualiza o Texto do Modal
        const descEl = document.getElementById('cycle-option-keep-desc');
        if(descEl) {
            descEl.innerHTML = `Continuar sequência: <b>Dia #${projectedDay}</b>`;
        }
        
        // 7. Abre o Modal de Confirmação
        ui.toggleModal('modal-cycle-confirm', true);
    },

    resolveCycle: (startNew) => {
        if (!pendingStudyData) return;
        if (startNew) {
            store.cycleStartDate = pendingStudyData.selectedDateStr;
            store.save();
            toast.show('Ciclo reiniciado! Dia #1 definido.', 'neuro', '🚩 Novo Ciclo');
        }
        
        // DELEGAÇÃO PARA ENGINE (Processamento)
        if(window.engine) engine.processStudyEntry(pendingStudyData);
        
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

    // NOVA FUNÇÃO: Salvar Manualmente Estratégia (com Feedback Toast)
    saveStrategySettingsManual: () => {
        // 1. Captura valores atuais dos inputs
        const capInput = document.getElementById('setting-capacity');
        const cycleInput = document.getElementById('setting-cycle-start');
        
        // 2. Validação e atualização da Capacidade
        if (capInput) {
            const newCap = parseInt(capInput.value);
            if (newCap > 0 && newCap !== store.capacity) {
                store.capacity = newCap;
            }
        }

        // 3. Validação e atualização da Data de Ciclo
        if (cycleInput) {
            const newDate = cycleInput.value;
            if (newDate && newDate !== store.cycleStartDate) {
                store.cycleStartDate = newDate;
            }
        }

        // 4. Força o salvamento na Nuvem (Firebase) e LocalStorage
        store.save();
        
        // 5. Atualiza a UI visualmente
        ui.renderHeatmap();
        ui.render();

        // 6. Feedback Visual (Toast)
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

// --- NOVA FUNÇÃO: Trava de Segurança Rígida (Hard Dependency) ---
    handleStatusToggle: (id, checkboxEl) => {
        // Busca robusta
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        
        if (!review) return;

        // Verifica se a ação é "Marcar como Feito"
        const isMarkingAsDone = checkboxEl.checked;

        if (isMarkingAsDone) {
            const pendingSubtasks = (review.subtasks || []).filter(t => !t.done).length;
            
            // BLOQUEIO RÍGIDO: Se houver pendências, não permite concluir de jeito nenhum
            if (pendingSubtasks > 0) {
                checkboxEl.checked = false; // Reverte visualmente na hora
                toast.show(`🚫 Bloqueado: Finalize as ${pendingSubtasks} tarefas pendentes antes de concluir.`, 'error', 'Trava de Qualidade');
                return; // Cancela a operação
            }
        }

        // Se passou pela guarda, chama o Store
        store.toggleStatus(id);
    },

    // --- NOVA FUNÇÃO: Busca na Coluna Futuro ---
    handleFutureSearch: (term) => {
        futureFilterTerm = term.toLowerCase().trim();
        // Chama o renderizador para atualizar a vista com o filtro
        ui.render();
    },

    // --- ATUALIZAÇÃO: Confirmação de Exclusão mais Segura ---
    confirmDelete: (id) => {
        const r = store.reviews.find(x => x.id.toString() === id.toString()); // Busca robusta
        if(!r) return;
        
        const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];
        
        // Verifica pendências locais
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

    // DELEGAÇÃO PARA ENGINE (Exportação)
    generateICS: () => {
        if(window.engine) engine.generateICS();
    },

    // DELEGAÇÃO PARA ENGINE (Reagendamento)
    handleReschedule: () => {
        if(window.engine) engine.handleReschedule();
    },

    // --- DRAG AND DROP HANDLERS (HEATMAP) ---

    handleDragStart: (e, id) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        // ATIVA FEEDBACK VISUAL NO BODY
        document.body.classList.add('is-dragging');
    },

    // Handler para garantir limpeza se o usuário soltar fora ou cancelar
    handleDragEnd: (e) => {
        document.body.classList.remove('is-dragging');
    },

    handleDragOver: (e) => {
        e.preventDefault(); // Necessário para permitir o drop
        e.dataTransfer.dropEffect = "move";
    },

    handleDrop: (e, targetDateStr) => {
        e.preventDefault();
        // REMOVE FEEDBACK VISUAL
        document.body.classList.remove('is-dragging');

        const idRaw = e.dataTransfer.getData("text/plain");
        
        // CORREÇÃO: Comparação Robusta (String vs String)
        const review = store.reviews.find(r => r.id.toString() === idRaw.toString());
        
        if (!review) return;
        if (review.date === targetDateStr) return; // Cancela se for o mesmo dia

        // 1. Validação de Cronologia (Não pode passar da próxima revisão)
        if (review.batchId) {
            const siblings = store.reviews
                .filter(r => r.batchId === review.batchId)
                .sort((a, b) => a.date.localeCompare(b.date));
            
            // Busca por ID usando toString para segurança
            const currentIndex = siblings.findIndex(r => r.id.toString() === review.id.toString());
            
            // Verifica revisão POSTERIOR
            const nextReview = siblings[currentIndex + 1];
            if (nextReview && targetDateStr >= nextReview.date) {
                return toast.show(`Bloqueado: A próxima revisão deste ciclo é em ${formatDateDisplay(nextReview.date)}.`, 'error', '⛔ Cronologia Inválida');
            }
            
            // Verifica revisão ANTERIOR (Opcional, para integridade)
            const prevReview = siblings[currentIndex - 1];
            if (prevReview && targetDateStr <= prevReview.date) {
                 return toast.show(`Bloqueado: A revisão anterior foi em ${formatDateDisplay(prevReview.date)}.`, 'error', '⛔ Cronologia Inválida');
            }
        }

        // 2. Validação de Capacidade (Sobrecarga)
        const targetDayLoad = store.reviews
            .filter(r => r.date === targetDateStr && r.id.toString() !== review.id.toString())
            .reduce((acc, curr) => acc + (parseInt(curr.time) || 0), 0);
            
        const newTotal = targetDayLoad + parseInt(review.time);
        const capacity = store.capacity || 240;

        if (newTotal > capacity) {
            return toast.show(`Bloqueado: O dia ficaria com ${newTotal}min (Max: ${capacity}min).`, 'warning', '⚠️ Sobrecarga Detectada');
        }

        // 3. Aplicação
        review.date = targetDateStr;
        store.save(); // Salva e notifica
        
        ui.renderHeatmap(); // Atualiza o Radar especificamente
        ui.render(); // Atualiza listas gerais se necessário
        
        toast.show('Estudo reagendado com sucesso.', 'success');
    },

    // --- NOVO: Lógica de Agendamento Elástico (Drag & Drop Kanban) ---
    // --- ATUALIZADO V1.2.4: ID Robustness, UX & Undo ---

    // 1. Verifica e devolve itens emprestados não concluídos (Roda ao iniciar)
    checkTemporaryReversions: () => {
        const today = getLocalISODate();
        let revertedCount = 0;

        store.reviews.forEach(r => {
            // Se é temporário, está pendente, e a data "emprestada" já passou
            if (r.isTemporary && r.status === 'PENDING' && r.date < today) {
                // Restaura a data original e remove as marcas
                r.date = r.originalDate;
                delete r.originalDate;
                delete r.isTemporary;
                revertedCount++;
            }
            // Se o item foi concluído (DONE), limpamos as marcas para ele ficar onde está permanentemente
            else if (r.isTemporary && r.status === 'DONE') {
                delete r.originalDate;
                delete r.isTemporary;
            }
        });

        if (revertedCount > 0) {
            store.save();
            // Pequeno delay para garantir que o Toast apareça após renderizar
            setTimeout(() => toast.show(`${revertedCount} estudos extras retornaram à data original.`, 'info', '↺ Agenda Restaurada'), 1000);
        }
    },

    // 2. Início do Arraste no Kanban
    handleKanbanDragStart: (e, id) => {
        try {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
            document.body.classList.add('is-dragging');
        } catch (err) {
            console.error('[DragStart Error]', err);
        }
    },

    // 3. Feedback Visual (Hover)
    handleDragEnter: (e, element) => {
        e.preventDefault();
        element.classList.add('drag-hover');
    },

    handleDragLeave: (e, element) => {
        e.preventDefault();
        element.classList.remove('drag-hover');
    },

    // 4. Permitir soltar (Drop)
    allowDrop: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move"; // Corrige ícone de proibido
    },

    // 5. Soltar o cartão na coluna (Lógica Principal)
    handleKanbanDrop: (e, targetCol) => {
        e.preventDefault();
        document.body.classList.remove('is-dragging');
        
        // Remove destaque visual de todas as colunas
        document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-hover'));

        const idRaw = e.dataTransfer.getData("text/plain");
        
        // CORREÇÃO CRÍTICA: Busca Robusta (String vs String)
        const review = store.reviews.find(r => r.id.toString() === idRaw.toString());
        
        if (!review) {
            console.error('[ERRO] Review não encontrada. ID:', idRaw);
            return toast.show('Erro ao mover: Item não localizado.', 'error');
        }

        const today = getLocalISODate();

        // CASO 1: Soltou na coluna "HOJE"
        if (targetCol === 'today') {
            if (review.date === today) return;

            // Snapshot para Undo
            const previousState = {
                date: review.date,
                isTemporary: review.isTemporary || false,
                originalDate: review.originalDate
            };

            // Se ainda não é temporário, salva a origem para poder devolver depois
            if (!review.isTemporary) {
                review.originalDate = review.date;
                review.isTemporary = true;
            }
            
            review.date = today;
            store.save();
            
            // Toast com Ação de Desfazer
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
        
        // CASO 2: Devolver manualmente para a lista original
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

    // 6. Função de Desfazer (Undo)
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

    // --- SUBTAREFAS / MICRO-QUESTS (COM DEBUG LOGS E PROPAGAÇÃO) ---
    // Variável para rastrear qual cartão está sendo editado
    currentReviewId: null,

    openSubtasks: (id) => {
        console.log(`[DEBUG] 1. Tentando abrir modal para ID: ${id} (Tipo: ${typeof id})`);
        
        app.currentReviewId = id;
        
        // Busca robusta
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        
        if(!review) {
            console.error("[ERRO] Review não encontrada no Store!");
            return;
        }
        console.log("[DEBUG] 2. Review encontrada:", review.subject);

        // Atualiza Títulos
        const titleEl = document.getElementById('subtask-title');
        const subEl = document.getElementById('subtask-subtitle');
        if(titleEl) titleEl.innerText = review.subject;
        if(subEl) subEl.innerText = review.topic;

        // Renderiza
        console.log("[DEBUG] 3. Chamando renderização inicial...");
        ui.renderSubtaskList(review);
        ui.toggleModal('modal-subtasks', true);
        
        setTimeout(() => {
            const input = document.getElementById('input-subtask');
            if(input) input.focus();
        }, 100);
    },

    // --- NOVO MÉTODO COM DEBUG PARA SUBTAREFAS ---
    handleAddSubtask: (e) => {
        e.preventDefault();
        
        console.log("[DEBUG] Iniciando adição de subtarefa...");

        const input = document.getElementById('input-subtask');
        const recurrenceSelect = document.getElementById('input-subtask-recurrence');
        
        const text = input.value.trim();
        // Fallback: Se o select não existir (erro de HTML), assume 'today'
        const recurrenceMode = recurrenceSelect ? recurrenceSelect.value : 'today';
        
        console.log(`[DEBUG] Texto: "${text}", Modo: "${recurrenceMode}", ID Atual: ${app.currentReviewId}`);

        if (text && app.currentReviewId) {
            // 1. Adiciona na tarefa atual (Sempre acontece)
            // Note que store.js precisa suportar o terceiro argumento { isRecurrent }
            const isRecurrent = recurrenceMode !== 'today';
            store.addSubtask(app.currentReviewId, text, { isRecurrent });
            console.log("[DEBUG] Tarefa adicionada no card atual.");

            // 2. Lógica de Propagação
            if (isRecurrent) {
                // Busca robusta (converte para string para garantir match)
                const currentReview = store.reviews.find(r => r.id.toString() === app.currentReviewId.toString());
                
                if (currentReview) {
                    console.log(`[DEBUG] Review atual encontrada. BatchID: ${currentReview.batchId}`);
                    
                    if (currentReview.batchId) {
                        // Busca irmãos
                        const siblings = store.reviews.filter(r => 
                            r.batchId === currentReview.batchId && 
                            r.id.toString() !== currentReview.id.toString() && // Ignora o atual
                            r.date >= currentReview.date // Apenas futuro/presente
                        );

                        console.log(`[DEBUG] Irmãos encontrados para propagação (Candidatos): ${siblings.length}`);
                        let addedCount = 0;

                        siblings.forEach(sibling => {
                            let shouldAdd = false;

                            // Lógica de Filtro
                            if (recurrenceMode === 'cycle') {
                                shouldAdd = true;
                            } 
                            else if (recurrenceMode === '24h') {
                                // Tenta identificar a revisão de 24h
                                const diffDays = (new Date(sibling.date) - new Date(currentReview.date)) / (1000 * 60 * 60 * 24);
                                // Aceita type '24h' OU diferença de aprox 1 dia
                                if (sibling.type === '24h' || (diffDays >= 0.5 && diffDays <= 1.5)) shouldAdd = true;
                            }
                            else if (recurrenceMode === '7d') {
                                const diffDays = (new Date(sibling.date) - new Date(currentReview.date)) / (1000 * 60 * 60 * 24);
                                if (['24h', '7d'].includes(sibling.type) || diffDays <= 8) shouldAdd = true;
                            }

                            if (shouldAdd) {
                                console.log(`[DEBUG] Propagando para irmão ID: ${sibling.id} (${sibling.date})`);
                                store.addSubtask(sibling.id, text, { isRecurrent: true });
                                addedCount++;
                            }
                        });
                        
                        if (addedCount > 0) {
                            toast.show(`Tarefa replicada para ${addedCount} revisões futuras!`, 'neuro', '🔁 Ciclo Sincronizado');
                        } else {
                             console.warn("[DEBUG] Nenhum irmão passou nos critérios de data/filtro.");
                        }
                    } else {
                        console.warn("[DEBUG] Review atual NÃO TEM batchId. É um estudo órfão.");
                        toast.show('Este estudo não tem vínculo de ciclo (BatchID ausente).', 'warning');
                    }
                } else {
                    console.error("[DEBUG] Erro Crítico: Review atual não encontrada no Store.");
                }
            }
            
            // Limpeza e UI
            input.value = '';
            if(recurrenceSelect) recurrenceSelect.value = 'today';

            const updatedReview = store.reviews.find(r => r.id.toString() === app.currentReviewId.toString());
            if (updatedReview) ui.renderSubtaskList(updatedReview);
        } else {
            console.warn("[DEBUG] Texto vazio ou ID perdido.");
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

    // --- NOVA FUNCIONALIDADE: DEEP LINKING (Navegação Direta) ---
    locateAndHighlight: (id) => {
        // 1. Fecha o modal de tarefas
        ui.toggleModal('modal-tasks', false);

        // 2. Lógica Smart Switch (Prioridade 3) - Garante que a aba correta esteja visível
        const review = store.reviews.find(r => r.id.toString() === id.toString());
        if (review) {
            const today = getLocalISODate();
            let targetTab = 'today';
            if (review.date < today && review.status !== 'DONE') targetTab = 'late';
            else if (review.date > today) targetTab = 'future';
            
            // Troca a aba para garantir que o elemento esteja visível no DOM
            ui.switchTab(targetTab);
        }

        // 3. Executa o Scroll e Destaque com pequeno delay para renderização e fechamento do modal
        setTimeout(() => {
            // O ID "card-XYZ" será adicionado via view.js conforme planejado
            const el = document.getElementById(`card-${id}`);
            
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-card'); 
                
                // Remove a classe após a animação (2s)
                setTimeout(() => el.classList.remove('highlight-card'), 2000);
            } else {
                toast.show('Cartão não localizado visualmente.', 'warning');
            }
        }, 300);
    }
};

// Inicialização Automática
app.init();

// Garante acesso global para os onclicks do HTML
window.app = app;
