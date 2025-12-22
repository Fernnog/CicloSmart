--- START OF FILE app.js ---

/* --- START OF FILE app.js --- */

/**
 * CICLOSMART APP CONTROLLER (v1.1.4 - Reactive Architecture)
 * Contém: Lógica de Aplicação, UI Renderer, Batch Logic e DOM Injection.
 */

// Variável de Estado para o Modal de Decisão de Ciclo
let pendingStudyData = null;

// ==========================================
// 4. LÓGICA DO APP (CONTROLLER)
// ==========================================

const app = {
    init: () => {
        store.load();
        
        // --- ARQUITETURA REATIVA (OBSERVER v1.1.4) ---
        // Registra os componentes que devem ser atualizados automaticamente
        // sempre que os dados no store forem modificados/salvos.
        store.subscribe(taskManager.checkOverdue); // Atualiza o badge vermelho de atraso
        store.subscribe(taskManager.render);       // Atualiza a lista de tarefas (Smart Grouping)
        // ---------------------------------------------

        // --- AUTO-REPARO DE DADOS LEGADOS ---
        let migrationCount = 0;
        if (store.reviews && store.reviews.length > 0) {
            store.reviews.forEach(r => {
                if (!r.batchId) {
                    r.batchId = 'legacy-' + r.id + '-' + Math.floor(Math.random() * 1000); 
                    migrationCount++;
                }
            });
            if (migrationCount > 0) {
                console.log(`Migrado: ${migrationCount} estudos antigos para o novo formato Connected Studies.`);
                store.save();
                setTimeout(() => toast.show('Sistema atualizado para suportar Edição/Exclusão em Lote.', 'info', 'Upgrade Realizado'), 2000);
            }
        }
        // ------------------------------------

        app.initVersionControl();
        app.checkSmartCycle();

        // INICIALIZAÇÃO DA AUTENTICAÇÃO (Firebase)
        if (typeof app.initAuth === 'function') {
            app.initAuth(); 
        }

        ui.initSubjects(); 
        ui.render();
        taskManager.checkOverdue(); 
        
        const form = document.getElementById('form-study');
        if(form) form.addEventListener('submit', app.handleNewEntry);
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;
        
        const btnNew = document.getElementById('btn-new-study');
        if(btnNew) btnNew.onclick = app.handleNewStudyClick;

        app.updateProfileUI(store.profile); 
        ui.updateModeUI(); 

        ui.switchTab('today');
    },

    // --- NOVA FUNÇÃO DE AUTENTICAÇÃO (RESPONSIVA & EVENT-DRIVEN) ---
    initAuth: () => {
        // Função interna que realmente liga os botões e listeners
        const startFirebaseLogic = () => {
            console.log("[CicloSmart Auth] Iniciando ouvintes...");
            
            // Verificação de segurança extra
            if (!window.fireMethods || !window.fireAuth) {
                console.error("[CicloSmart Auth] Erro crítico: Firebase ainda indefinido.");
                return;
            }

            const { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, ref, onValue, get } = window.fireMethods;
            const auth = window.fireAuth;
            const db = window.fireDb;

            // Elementos UI NOVOS
            const btnUser = document.getElementById('user-menu-btn');
            const popover = document.getElementById('auth-popover');
            const viewLogin = document.getElementById('auth-view-login');
            const viewUser = document.getElementById('auth-view-user');
            
            // Inputs do Popover
            const txtEmail = document.getElementById('popover-email');
            const txtPass = document.getElementById('popover-pass');
            const lblUserEmail = document.getElementById('popover-user-email');

            // Toggle do Popover (Abrir/Fechar)
            if(btnUser) {
                btnUser.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede fechar ao clicar no botão
                    popover.classList.toggle('hidden');
                });
            }

            // Fechar Popover ao clicar fora
            document.addEventListener('click', (e) => {
                if(popover && !popover.classList.contains('hidden') && !popover.contains(e.target) && e.target !== btnUser) {
                    popover.classList.add('hidden');
                }
            });

            // Listener de Estado (Logado/Deslogado)
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    store.currentUser = user;
                    
                    // 1. VISUAL DO BOTÃO: LOGADO (Borda Verde + Ícone Ativo)
                    if(btnUser) {
                        btnUser.classList.remove('border-slate-300', 'text-slate-400');
                        btnUser.classList.add('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
                        // Opcional: Mostrar bolinha de status
                        const dot = document.getElementById('user-status-dot');
                        if(dot) {
                            dot.classList.remove('hidden', 'bg-slate-400');
                            dot.classList.add('bg-emerald-500');
                        }
                    }

                    // 2. CONTEÚDO DO POPOVER
                    if(viewLogin) viewLogin.classList.add('hidden');
                    if(viewUser) viewUser.classList.remove('hidden');
                    if(lblUserEmail) lblUserEmail.innerText = user.email;

                    // Sincronização de dados (Mantém lógica original)
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
                    
                    // 1. VISUAL DO BOTÃO: DESLOGADO (Cinza Padrão)
                    if(btnUser) {
                        btnUser.classList.add('border-slate-300', 'text-slate-400');
                        btnUser.classList.remove('border-emerald-500', 'text-emerald-600', 'bg-emerald-50');
                         // Opcional
                        const dot = document.getElementById('user-status-dot');
                        if(dot) {
                            dot.classList.add('hidden');
                        }
                    }

                    // 2. CONTEÚDO DO POPOVER
                    if(viewLogin) viewLogin.classList.remove('hidden');
                    if(viewUser) viewUser.classList.add('hidden');

                    store.load(null); 
                }
            });

            // Evento Login (Formulário do Popover)
            const formPopover = document.getElementById('auth-form-popover');
            if(formPopover) {
                formPopover.addEventListener('submit', (e) => {
                    e.preventDefault();
                    signInWithEmailAndPassword(auth, txtEmail.value, txtPass.value)
                        .then(() => {
                            popover.classList.add('hidden'); // Fecha popover ao logar
                        })
                        .catch((error) => toast.show('Erro: ' + error.message, 'error'));
                });
            }
            
            // Evento Logout
            const btnLogout = document.getElementById('btn-logout-popover');
            if(btnLogout) {
                btnLogout.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        popover.classList.add('hidden'); // Fecha popover ao sair
                        toast.show('Desconectado.', 'info');
                    });
                });
            }
                
            // Evento Cadastro
            const btnSignup = document.getElementById('btn-signup-popover');
            if(btnSignup) {
                btnSignup.addEventListener('click', (e) => {
                    e.preventDefault(); // Evita refresh
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

        // LÓGICA DE ESPERA (CORREÇÃO DE RACE CONDITION)
        if (window.fireMethods && window.fireAuth) {
            startFirebaseLogic();
        } else {
            console.log("[CicloSmart Auth] Aguardando Firebase carregar...");
            window.addEventListener('firebase-ready', startFirebaseLogic);
        }
    },
    // -----------------------------------------------------------

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
                setTimeout(() => toast.show(
                    'Como você estudou matéria nova ontem, hoje ativamos o Modo Defesa para consolidação.', 
                    'neuro', 
                    '🔄 Smart Cycle: Defesa Ativa'
                ), 800);
            }
        } 
        else if (diffDays >= 2) {
            if (store.cycleState !== 'ATTACK') {
                store.cycleState = 'ATTACK';
                store.save();
                setTimeout(() => toast.show(
                    'Após o descanso, seu ciclo reiniciou. Modo Ataque liberado!', 
                    'neuro', 
                    '⚔️ Bateria Recarregada'
                ), 800);
            }
        }
    },

    setProfile: (mode) => {
        store.profile = mode;
        if (mode === 'pendular') {
            app.checkSmartCycle();
        }
        store.save();
        app.updateProfileUI(mode);
        ui.updateModeUI();
        
        const msg = mode === 'pendular' 
            ? 'Teto de 90min e Ciclo Inteligente ativados.' 
            : 'Modo Integrado sem limites rígidos.';
        
        toast.show(msg, 'info', 'Perfil Atualizado');
    },

    toggleMode: () => {
        if (store.profile !== 'pendular') {
            toast.show('Alterne para o perfil Pendular nas configurações para usar este modo.', 'warning', 'Ação Inválida');
            return;
        }

        store.cycleState = store.cycleState === 'ATTACK' ? 'DEFENSE' : 'ATTACK';
        store.save();
        ui.updateModeUI();
        
        const msg = store.cycleState === 'ATTACK' 
            ? 'Matéria nova liberada manualmente!' 
            : 'Planejamento futuro habilitado manualmente.';
        
        const title = store.cycleState === 'ATTACK' ? '⚔️ Modo ATAQUE' : '🛡️ Modo DEFESA';
        
        toast.show(msg, 'warning', title); 
    },

    updateCycleStart: (dateStr) => {
        if(dateStr) {
            store.cycleStartDate = dateStr;
            store.save();
            toast.show('Seus novos cards seguirão esta referência.', 'success', '📅 Ciclo Ancorado');
        }
    },

    handleNewStudyClick: () => {
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
            return toast.show(
                'O tempo limite para estudo de qualidade neste modo é 90 minutos.', 
                'warning', 
                '⚠️ Atenção: Teto Cognitivo'
            );
        }

        if (store.profile === 'pendular' && store.cycleState === 'DEFENSE' && selectedDateStr === todayStr) {
            return toast.show(
                'Hoje é dia exclusivo de consolidação. Para manter a qualidade, agende novos conteúdos a partir de amanhã.', 
                'error', 
                '🛡️ Protocolo de Escudo Ativo'
            );
        }

        pendingStudyData = {
            subjectName, subjectColor, topic, studyTime, selectedDateStr, eTarget: e.target
        };

        let projectedDay = 1;
        if (store.cycleStartDate) {
             const previousUniqueDays = new Set(store.reviews
                .filter(r => 
                    r.type === 'NOVO' && 
                    r.date >= store.cycleStartDate && 
                    r.date < selectedDateStr
                )
                .map(r => r.date)
            );
            projectedDay = previousUniqueDays.size + 1;
        }

        const descEl = document.getElementById('cycle-option-keep-desc');
        if(descEl) descEl.innerText = `Será registrado como Dia #${projectedDay}`;
        
        ui.toggleModal('modal-cycle-confirm', true);
    },

    resolveCycle: (startNew) => {
        if (!pendingStudyData) return;

        if (startNew) {
            store.cycleStartDate = pendingStudyData.selectedDateStr;
            store.save();
            toast.show(
                'Ciclo reiniciado! Este estudo foi definido como o Dia #1.', 
                'neuro', 
                '🚩 Novo Ciclo Iniciado'
            );
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

        // GERAÇÃO DE ID DE LOTE (NOVO) - Conecta todas as revisões deste estudo
        const batchId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        if (!store.cycleStartDate) {
            store.cycleStartDate = selectedDateStr;
            store.save();
        }

        const COMPRESSION = { 1: 0.20, 7: 0.10, 30: 0.05 };
        const REVIEW_CEILING_RATIO = 0.40; 
        const reviewLimitMinutes = Math.floor(store.capacity * REVIEW_CEILING_RATIO);

        const previousDays = store.reviews
            .filter(r => 
                r.type === 'NOVO' && 
                r.date >= store.cycleStartDate && 
                r.date < selectedDateStr
            )
            .map(r => r.date);

        const uniquePreviousDays = new Set(previousDays).size;
        const finalCycleIndex = uniquePreviousDays + 1;

        const newReviews = [];
        let blocker = null;

        // CARD ORIGINAL (Com batchId)
        const acquisitionEntry = {
            id: Date.now() + Math.random(), 
            subject: subjectName,
            color: subjectColor,
            topic: topic,
            time: studyTime,
            date: selectedDateStr, 
            type: 'NOVO', 
            status: 'PENDING',
            cycleIndex: finalCycleIndex,
            batchId: batchId // Vínculo
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
            
            const projectedLoad = existingLoad + estimatedTime;

            if (projectedLoad > reviewLimitMinutes) {
                blocker = {
                    date: formatDateDisplay(isoDate),
                    load: projectedLoad,
                    limit: reviewLimitMinutes,
                    interval: effectiveInterval
                };
                break; 
            }

            let typeLabel = interval === 1 ? '24h' : interval + 'd';
            if (store.profile === 'pendular') {
                typeLabel = interval === 1 ? 'Defesa' : effectiveInterval + 'd+'; 
            }

            newReviews.push({
                id: Date.now() + Math.random() + effectiveInterval,
                subject: subjectName,
                color: subjectColor,
                topic: topic,
                time: estimatedTime,
                date: isoDate,
                type: typeLabel,
                status: 'PENDING',
                cycleIndex: finalCycleIndex,
                batchId: batchId // Vínculo
            });
        }

        if (blocker) {
            toast.show(
                `Adicionar este estudo faria o dia ${blocker.date} exceder o limite de revisões (40%). Tente reduzir a carga inicial.`, 
                'error', 
                '🚫 Bloqueio de Segurança'
            );
            
            if(window.lucide) lucide.createIcons();
            return; 
        }

        const todayStr = getLocalISODate();
        if (store.profile === 'pendular' && selectedDateStr <= todayStr) {
            store.lastAttackDate = selectedDateStr;
        }

        store.addReviews(newReviews);
        
        const msg = selectedDateStr < todayStr 
            ? 'Estudo retroativo registrado.'
            : selectedDateStr > todayStr
                ? 'Agendamento futuro realizado com sucesso.'
                : 'Estudo registrado e primeiras revisões calculadas.';
        
        const indexMsg = finalCycleIndex > 0 ? `#${finalCycleIndex}` : `(Pré-Ciclo)`;

        toast.show(
            `${msg} O algoritmo cuidará do resto.`, 
            'neuro', 
            `🧠 Trilha de Memória Criada (Dia ${indexMsg})`
        );
    },

    // FUNÇÕES DE BACKUP (downloadBackup e restoreData) REMOVIDAS
    // A persistência agora é gerenciada automaticamente pelo Firebase no store.save()

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

    // --- LÓGICA DE EDIÇÃO EM LOTE ---
    promptEdit: (id) => {
        const r = store.reviews.find(x => x.id === id);
        if(!r) return;

        // Tenta edição de Tópico primeiro
        const newTopic = prompt("Editar Tópico (Nome):", r.topic);
        
        if (newTopic !== null && newTopic !== r.topic) {
            // Verifica se é lote
            const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];
            const isBatch = siblings.length > 1;
            let updateAll = false;

            if (isBatch) {
                updateAll = confirm(`Este estudo tem ${siblings.length} revisões conectadas.\nDeseja renomear TODAS para "${newTopic}"?\n\n[OK] Sim, corrigir tudo.\n[Cancelar] Não, apenas este card.`);
            }

            if (updateAll) {
                // Atualiza em lote
                store.updateBatchTopic(r.batchId, newTopic);
                toast.show(`Tópico corrigido em ${siblings.length} cards.`, 'success', 'Correção em Lote');
            } else {
                // Atualiza individual
                store.updateReview(id, newTopic, r.time);
            }
        } 
        else if (newTopic === r.topic) {
            // Se usuário não mudou o nome (ou cancelou), oferece mudar o tempo
            const newTime = prompt("Editar Tempo (min):", r.time);
            if (newTime !== null && !isNaN(newTime) && newTime !== r.time) {
                store.updateReview(id, r.topic, newTime);
            }
        }
    },

    // --- LÓGICA DE EXCLUSÃO INTELIGENTE (Smart Delete) ---
    confirmDelete: (id) => {
        const r = store.reviews.find(x => x.id === id);
        if(!r) return;

        // Verifica se existem irmãos (mesmo batchId)
        const siblings = r.batchId ? store.reviews.filter(item => item.batchId === r.batchId) : [r];
        const isBatch = siblings.length > 1;

        if (isBatch) {
            // Pergunta Inteligente
            const deleteAll = confirm(
                `🗑️ EXCLUSÃO EM LOTE\n\nEste item faz parte de um ciclo com ${siblings.length} cards (Ataque + Revisões).\n\n[OK] Sim, apagar TODO o ciclo.\n[Cancelar] Não, apagar apenas este card.`
            );

            if (deleteAll) {
                store.deleteBatch(r.batchId);
                toast.show(`Ciclo completo removido (${siblings.length} itens).`, 'error', 'Limpeza em Lote');
            } else {
                // Se clicou em Cancelar, confirma se quer apagar só este (Segurança extra)
                if(confirm("Confirma a exclusão APENAS deste card específico?")) {
                    store.deleteReview(id);
                    toast.show('Item removido individualmente.', 'info');
                }
            }
        } else {
            // Item único (legado ou orfão)
            if(confirm("Tem certeza que deseja excluir esta revisão?")) {
                store.deleteReview(id);
                toast.show('Estudo removido.', 'info');
            }
        }
    },
    // -----------------------------------------------------

    // --- LÓGICA DE EXPORTAÇÃO ICS ---

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

        if (type === 'today') {
            const str = getLocalISODate(today);
            startInput.value = str;
            endInput.value = str;
        } else if (type === 'tomorrow') {
            today.setDate(today.getDate() + 1);
            const str = getLocalISODate(today);
            startInput.value = str;
            endInput.value = str;
        } else if (type === 'all') {
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

        const validReviews = store.reviews.filter(r => 
            r.status === 'PENDING' && 
            r.date >= startStr && 
            r.date <= endStr
        ).sort((a, b) => a.date.localeCompare(b.date));

        if (validReviews.length === 0) return alert("Nenhuma revisão encontrada neste período.");

        let icsLines = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CicloSmart//v2//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"
        ];

        let currentProcessDate = null;
        let accumulatedMinutes = 0;
        const [baseHour, baseMinute] = startTimeStr.split(':').map(Number);
        
        const breakTime = (breakCheckbox && breakCheckbox.checked) ? 10 : 0; 

        validReviews.forEach(r => {
            if (r.date !== currentProcessDate) {
                currentProcessDate = r.date;
                accumulatedMinutes = 0;
            }

            const [y, m, d] = r.date.split('-').map(Number);
            const eventStartObj = new Date(y, m - 1, d, baseHour, baseMinute + accumulatedMinutes);
            const eventEndObj = new Date(eventStartObj.getTime() + (r.time * 60000));

            accumulatedMinutes += r.time + breakTime;

            const formatICSDate = (d) => {
                return d.getFullYear() +
                       String(d.getMonth() + 1).padStart(2, '0') +
                       String(d.getDate()).padStart(2, '0') + 'T' +
                       String(d.getHours()).padStart(2, '0') +
                       String(d.getMinutes()).padStart(2, '0') + '00';
            };

            const cycleInfo = r.cycleIndex ? `[Ciclo #${r.cycleIndex}] ` : '';

            icsLines.push(
                "BEGIN:VEVENT",
                `UID:${r.id}-${Date.now()}@ciclosmart.app`,
                `DTSTAMP:${formatICSDate(new Date())}`,
                `DTSTART:${formatICSDate(eventStartObj)}`,
                `DTEND:${formatICSDate(eventEndObj)}`,
                `SUMMARY:${cycleInfo}${r.subject}`,
                `DESCRIPTION:Tópico: ${r.topic}\\nTipo: ${r.type}\\nDuração: ${r.time}min.`,
                "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Estudar", "END:VALARM",
                "END:VEVENT"
            );
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
        toast.show('Arquivo gerado com horários empilhados.', 'info', '📅 Agenda Sincronizada');
    },

    // --- LÓGICA DE REAGENDAMENTO (Modo Férias / Ajuste de Atrasos) ---
    handleReschedule: () => {
        const dateInput = document.getElementById('input-reschedule-date');
        const targetDateStr = dateInput.value;
        const todayStr = getLocalISODate(); // Data de hoje (core.js)
        
        if (!targetDateStr) return toast.show('Selecione uma data para retomar os estudos.', 'warning');

        // 1. Filtrar APENAS os itens que estão ESTRITAMENTE no passado (< Hoje)
        // Isso impede que o estudo de 'hoje' entre na conta e seja movido desnecessariamente
        const overdueReviews = store.reviews.filter(r => 
            r.status === 'PENDING' && 
            r.date < todayStr 
        );
        
        if (overdueReviews.length === 0) {
            return toast.show('Você não possui revisões atrasadas (anteriores a hoje) para reagendar.', 'success');
        }

        // Ordena para pegar o mais antigo (o início do atraso)
        overdueReviews.sort((a, b) => a.date.localeCompare(b.date));
        const oldestDateStr = overdueReviews[0].date;

        // Validação básica: Não permitir voltar no tempo além do atraso
        if (targetDateStr < oldestDateStr) {
            return toast.show('A data de retomada deve ser posterior ao atraso mais antigo.', 'warning');
        }

        // 2. Calcular a diferença em dias (Delta)
        const dateOldest = new Date(oldestDateStr + 'T00:00:00');
        const dateTarget = new Date(targetDateStr + 'T00:00:00');
        
        const diffTime = dateTarget - dateOldest;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return toast.show('As datas já coincidem.', 'info');
        }

        // 3. Confirmação
        const confirmMsg = `Isso moverá APENAS os ${overdueReviews.length} estudos atrasados.\n\nO item mais antigo (${formatDateDisplay(oldestDateStr)}) passará para ${formatDateDisplay(targetDateStr)}.\n\nOs estudos de hoje e futuros NÃO serão alterados.\nDeseja confirmar?`;
        
        if (!confirm(confirmMsg)) return;

        // 4. Aplicação do Shift (COM FILTRO DE DATA)
        let moveCount = 0;
        store.reviews.forEach(r => {
            // A MÁGICA ESTÁ AQUI: Só move se for pendente E for data passada
            if (r.status === 'PENDING' && r.date < todayStr) {
                const current = new Date(r.date + 'T00:00:00');
                current.setDate(current.getDate() + diffDays);
                r.date = getLocalISODate(current);
                moveCount++;
            }
        });

        store.save(); 
        ui.toggleModal('modal-heatmap', false);
        toast.show(`${moveCount} itens atrasados foram trazidos para frente.`, 'success', 'Cronograma Ajustado');
    }
};

// ==========================================
// 5. UI RENDERER (VIEW)
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
        app.updateProfileUI(store.profile);
        ui.toggleModal('modal-new', true);
    },
    
    openHeatmapModal: () => {
        const input = document.getElementById('setting-capacity');
        if(input) input.value = store.capacity;

        const cycleInput = document.getElementById('setting-cycle-start');
        if(cycleInput) cycleInput.value = store.cycleStartDate || getLocalISODate();
        
        const activeRadio = document.querySelector(`input[name="profile"][value="${store.profile}"]`);
        if(activeRadio) activeRadio.checked = true;

        // --- NOVO: Inicializa o input de reagendamento com Hoje ---
        const rescheduleInput = document.getElementById('input-reschedule-date');
        if(rescheduleInput) rescheduleInput.value = getLocalISODate();
        // ----------------------------------------------------------

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
                .filter(r => r.date === isoDate) 
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

    render: () => {
        const todayStr = getLocalISODate();
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

        // --- ATUALIZADO: BADGE INTERATIVO ---
        // Agora usa a classe .cycle-badge e chama ui.showCycleInfo
        const cycleHtml = review.batchId && review.cycleIndex 
           ? `<span onclick="ui.showCycleInfo('${review.batchId}', event)" class="cycle-badge ml-2" title="Ver Família de Estudos">#${review.cycleIndex}</span>` 
           : '';

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
                                ${cycleHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 pl-2">
                        <input type="checkbox" onclick="store.toggleStatus(${review.id})" ${isDone ? 'checked' : ''} 
                               class="appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors relative after:content-['✓'] after:absolute after:text-white after:text-xs after:left-1 after:top-0 after:hidden checked:after:block">
                        
                        <!-- BOTÃO DE EXCLUSÃO ATUALIZADO PARA SUPORTAR LOTE -->
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

    // --- FUNÇÃO BLINDADA: GERA DOM SE NÃO EXISTIR ---
    showCycleInfo: (batchId, event) => {
        if(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // 1. Verifica ou cria o Backdrop (Fundo escuro)
        let backdrop = document.getElementById('cycle-popover-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'cycle-popover-backdrop';
            // Ao clicar no backdrop, fecha tudo
            backdrop.onclick = () => {
                document.getElementById('cycle-popover')?.classList.remove('visible');
                backdrop.classList.remove('visible');
            };
            document.body.appendChild(backdrop);
        }

        // 2. Verifica ou cria o Popover (Janela)
        let popover = document.getElementById('cycle-popover');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'cycle-popover';
            document.body.appendChild(popover);
        }

        // 3. Busca Dados (Família)
        const family = store.reviews
            .filter(r => r.batchId === batchId)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (family.length === 0) return toast.show('Erro: Nenhum dado vinculado.', 'error');

        // Título e Matéria
        const subjectName = family[0].subject;

        // 4. Monta HTML da Lista
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

        // Preenche o conteúdo do Modal
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

        // 5. Exibe (Adiciona classes visible)
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

app.init();
