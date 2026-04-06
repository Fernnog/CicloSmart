/* --- ASSETS/JS/ENGINE.JS --- */
/**
 * CICLOSMART ENGINE (Business Logic Layer)
 * Contém: Algoritmos SRS, Lógica de Ciclo, Exportação ICS e Reparos de Dados.
 * Separa a "Inteligência" da "Interação" (Controller).
 */

const engine = {
    
    // --- Lógica de Numeração com DIAGNÓSTICO ATIVO ---
    // Varre o histórico em busca do maior índice numérico absoluto e loga o processo.
    calculateCycleIndex: () => {
        console.group("🕵️‍♂️ DEBUG ENGINE: Calculando Índice de Ciclo");
        
        let maxIndex = 0;
        
        // 1. Diagnóstico do Banco de Dados
        if (typeof store === 'undefined') {
            console.error("❌ ERRO CRÍTICO: 'store' não está definido!");
            console.groupEnd();
            return 1;
        }

        console.log("📊 Status do Store:", {
            reviewsLoaded: store.reviews ? store.reviews.length : 'NULO',
            exemploItem: store.reviews && store.reviews.length > 0 ? store.reviews[0] : 'Nenhum'
        });

// Diagnóstico da Varredura
            if (store.reviews && store.reviews.length > 0) {
                store.reviews.forEach((r, i) => {
                    // MODIFICADO: Trava de Escopo de Ciclo
                    // Ignora completamente os cards que foram criados antes da data âncora do ciclo atual
                    if (store.cycleStartDate && r.date < store.cycleStartDate) return;
                    
                    // CRÍTICO (CORREÇÃO DE BUG): Avaliar apenas os estudos originais ('NOVO' / 'NEW').
                    // Isso impede que as revisões projetadas para o futuro contaminem o cálculo do novo ciclo.
                    if (r.type !== 'NOVO' && r.type !== 'NEW') return;

                    // Tenta ler cycleIndex ou cycle_index (caso haja variação de legado)
                    // Loga apenas se o item tiver cycleIndex para não poluir
                    if (r.cycleIndex) {
                    const currentIdx = parseInt(r.cycleIndex, 10);
                    
                    // Loga apenas quando encontra um novo máximo (para economizar linhas)
                    if (!isNaN(currentIdx) && currentIdx > maxIndex) {
                        console.log(`📈 Novo Máximo Encontrado no item [${i}]:`, currentIdx, "(Anterior era:", maxIndex, ")");
                        maxIndex = currentIdx;
                    }
                }
            });
        } else {
            console.warn("⚠️ O Array de Reviews está vazio ou nulo.");
        }

        const nextIndex = maxIndex + 1;
        console.log("✅ Resultado Final Engine:", nextIndex);
        console.groupEnd();

        return nextIndex;
    },

    // --- Algoritmo SRS (Criação de Cards) ---
    // MODIFICADO: Adicionado parâmetro 'forceNewCycle' com valor padrão 'false'
    processStudyEntry: (data, forceNewCycle = false) => {
        // Recebe 'complexity' para definir o tempo das revisões (Funcionalidade v1.3.3)
        // Recebe 'link' para Integração com Drive/Notion (Funcionalidade v1.4.0)
        const { subjectName, subjectColor, topic, studyTime, selectedDateStr, complexity, link } = data;
        
        const baseDate = new Date(selectedDateStr + 'T12:00:00'); 
        const batchId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Garante início de ciclo se não houver (apenas para referência de metadados)
        if (!store.cycleStartDate) { store.cycleStartDate = selectedDateStr; store.save(); }

        // --- LÓGICA DE COMPLEXIDADE (Preservada) ---
        let COMPRESSION;
        if (complexity === 'high') {
            // Alta Complexidade: Compressão suave para conceitos difíceis (30% -> 20% -> 15%)
            COMPRESSION = { 1: 0.30, 7: 0.20, 30: 0.15 };
        } else {
            // Normal: Compressão padrão agressiva para fatos/lei (20% -> 10% -> 5%)
            COMPRESSION = { 1: 0.20, 7: 0.10, 30: 0.05 };
        }
        // -----------------------------------

        const REVIEW_CEILING_RATIO = 0.40; 
        const reviewLimitMinutes = Math.floor(store.capacity * REVIEW_CEILING_RATIO);
        
        // MODIFICADO: Se o usuário pediu novo ciclo, crava 1. Senão, calcula o próximo.
        const finalCycleIndex = forceNewCycle ? 1 : engine.calculateCycleIndex();
        
        const newReviews = [];
        let blocker = null;

        // Gera UUID
        const generateUUID = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

        // 1. Card de Aquisição (Matéria Nova)
        const acquisitionEntry = {
            id: generateUUID(), 
            subject: subjectName, color: subjectColor, topic: topic, time: studyTime,
            date: selectedDateStr, type: 'NOVO', status: 'PENDING',
            cycleIndex: finalCycleIndex, batchId: batchId,
            link: link || null // Persistência do Link Externo
        };
        newReviews.push(acquisitionEntry);

        // 2. Projeção de Revisões
        for (let interval of CONFIG.intervals) {
            let effectiveInterval = interval;
            if (store.profile === 'pendular') {
                if (interval === 7) effectiveInterval = 8;
                if (interval === 30) effectiveInterval = 31;
            }
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + effectiveInterval);
            const isoDate = getLocalISODate(targetDate); 
            
           // Aplica a compressão selecionada (Normal ou Alta)
            // ATUALIZADO v1.3.7: Piso mínimo de 5 min para evitar "ilusão de competência"
            const estimatedTime = Math.max(5, Math.ceil(studyTime * COMPRESSION[interval]));

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
                id: generateUUID(),
                subject: subjectName, color: subjectColor, topic: topic, time: estimatedTime,
                date: isoDate, type: typeLabel, status: 'PENDING',
                cycleIndex: finalCycleIndex, batchId: batchId,
                link: link || null // Persistência do Link Externo nas revisões
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

    // --- Integridade e Reparo ---
    checkCycleIntegrity: () => {
        if (!store.cycleStartDate) return;
        const cycleStudies = store.reviews
            .filter(r => r.type === 'NOVO' && r.date >= store.cycleStartDate)
            .sort((a, b) => a.cycleIndex - b.cycleIndex);

        let isBroken = false;
        let conflictListHtml = '';
        const seenIndices = new Set();
        
        cycleStudies.forEach(study => {
            let conflictDetected = false;
            if (seenIndices.has(study.cycleIndex)) conflictDetected = true;
            else seenIndices.add(study.cycleIndex);

            if (conflictDetected) {
                isBroken = true;
                conflictListHtml += `
                    <div class="p-3 flex justify-between items-center bg-white border-b border-slate-50 last:border-0">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${formatDateDisplay(study.date)}</div>
                            <div class="text-xs font-bold text-slate-800">${study.subject}</div>
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

    // --- Exportação ICS ---
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

    // --- Lógica Waterfall (Reschedule) ---
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

        // Waterfall Redistribution
        let dateCursor = new Date(targetDateStr + 'T00:00:00');
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
                    hasChanges = true; 
                }
            }
            dateCursor.setDate(dateCursor.getDate() + 1);
            daysProcessed++;
        }

        store.save(); 
        ui.toggleModal('modal-heatmap', false);
        toast.show(`Cronograma realinhado! ${shiftCount} cartões movidos.`, 'neuro', 'SRS Preservado');
    },

    // --- MANUTENÇÃO AUTOMÁTICA DE DADOS ---
    runDataSanitation: () => {
        console.log("[Engine] Iniciando protocolo de limpeza de dados...");
        
        // Helper para calcular datas de corte (Formato YYYY-MM-DD)
        const getCutoffDate = (daysAgo) => {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            return getLocalISODate(date); // Usa utilitário global do core.js
        };

        const cutoffTasks = getCutoffDate(30);   // Regra 1: 30 dias para Tarefas Gerais
        const cutoffStudies = getCutoffDate(45); // Regra 2: 45 dias para Checklists de Estudo

        let tasksRemoved = 0;
        let checklistsCleaned = 0;

        // 1. Limpeza de Tarefas Gerais (Abandonadas/Antigas)
        const initialTaskCount = store.tasks.length;
        // Mantém apenas tarefas cuja data seja MAIOR ou IGUAL a data de corte (30 dias atrás)
        store.tasks = store.tasks.filter(t => t.date >= cutoffTasks);
        tasksRemoved = initialTaskCount - store.tasks.length;

        // 2. Limpeza de Checklists em Estudos Concluídos (Otimização de Espaço)
        store.reviews.forEach(r => {
            // Se o estudo está FEITO, é antigo (>45 dias) e tem subtarefas pesando no banco
            if (r.status === 'DONE' && r.date < cutoffStudies && r.subtasks && r.subtasks.length > 0) {
                r.subtasks = []; // Esvazia o array de micro-quests, mantendo o card vivo para estatísticas
                checklistsCleaned++;
            }
        });

        // [NOVO] 3. Normalização de IDs (Type Safety)
        // Converte IDs numéricos antigos para String para evitar erros de comparação estrita
        let idFixedCount = 0;
        
        // Normaliza Tarefas Gerais
        store.tasks.forEach(t => {
            if (typeof t.id === 'number') { t.id = String(t.id); idFixedCount++; }
        });

        // Normaliza Checklists de Estudo
        store.reviews.forEach(r => {
            if (r.subtasks && r.subtasks.length > 0) {
                r.subtasks.forEach(t => {
                    if (typeof t.id === 'number') { t.id = String(t.id); idFixedCount++; }
                });
            }
        });

        if (idFixedCount > 0) {
            console.log(`[Engine] Normalização: ${idFixedCount} IDs convertidos para String.`);
        }

        // 4. Persistência e Feedback (Se houve limpeza ou normalização)
      if (tasksRemoved > 0 || checklistsCleaned > 0 || idFixedCount > 0) {
            store.save(); // Salva a versão "limpa/normalizada" no LocalStorage/Firebase
            
            console.log(`[Engine] Manutenção Concluída: ${tasksRemoved} tarefas removidas, ${checklistsCleaned} checklists otimizados.`);
            
            // Feedback discreto para o usuário saber que o sistema trabalhou
            setTimeout(() => {
                toast.show(
                    `Otimização: ${tasksRemoved} tarefas antigas, ${checklistsCleaned} checklists arquivados e dados padronizados.`, 
                    'info', 
                    '🧹 Manutenção Automática'
                );
            }, 2000); // Delay para não competir com o "Bem-vindo"
        }
    },

    // --- Modo Pausa Programada (Férias) ---
    applyVacationMode: () => {
        const startStr = document.getElementById('input-vacation-start').value;
        const daysStr = document.getElementById('input-vacation-days').value;

        if (!startStr || !daysStr) return toast.show('Preencha a data de início e a quantidade de dias.', 'warning');

        const daysToShift = parseInt(daysStr);
        if (daysToShift <= 0) return toast.show('A duração da pausa deve ser de pelo menos 1 dia.', 'warning');

        if (!confirm(`Congelar a agenda por ${daysToShift} dias a partir de ${formatDateDisplay(startStr)}?`)) return;

        let shiftCount = 0;

        // 1. Fase de Salto Temporal
        store.reviews.forEach(r => {
            // Empurra tudo que for da data da pausa em diante e que não estiver concluído
            if (r.status === 'PENDING' && r.date >= startStr) {
                const current = new Date(r.date + 'T00:00:00');
                current.setDate(current.getDate() + daysToShift);
                r.date = getLocalISODate(current);
                shiftCount++;
            }
        });

        // 2. Fase de Redistribuição Segura (Waterfall)
        let dateCursor = new Date(startStr + 'T00:00:00');
        dateCursor.setDate(dateCursor.getDate() + daysToShift); // Inicia verificação na data de retorno
        let hasChanges = true;
        let daysProcessed = 0;
        
        while (hasChanges && daysProcessed < 120) { // Escopo maior de segurança
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
                    hasChanges = true; 
                }
            }
            dateCursor.setDate(dateCursor.getDate() + 1);
            daysProcessed++;
        }

        store.save(); 
        if (typeof ui !== 'undefined') {
            ui.render();
            ui.renderHeatmap();
            ui.toggleSubjectModal(false);
        }
        toast.show(`Pausa ativada! ${shiftCount} tarefas remanejadas preservando a carga.`, 'neuro', '🌴 Férias Programadas');
    }
}; 

// [CORREÇÃO CRÍTICA]
// Expõe o Engine para o escopo global para que o Controller possa acessá-lo.
window.engine = engine;
