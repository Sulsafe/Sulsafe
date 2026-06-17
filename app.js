// ============================================================
// ===== DETALHES DAS NRS (TEXTOS EXPANSÍVEIS) =====
// ============================================================
const detalhesNrs = {
    "NR-01": {
        itens: [
            { 
                label: "Gerenciar riscos ocupacionais",
                texto: `<p><strong>O Gerenciamento de Riscos Ocupacionais (GRO)</strong> é um conjunto de práticas e estratégias adotadas pelas empresas para identificar, avaliar, controlar e monitorar os riscos no ambiente de trabalho. Seu objetivo é prevenir acidentes e doenças, garantindo um local seguro e saudável para todos.</p>
                        <p><strong>Como funciona na prática?</strong><br> O GRO funciona de forma dinâmica, respondendo a quatro pilares básicos:</p>
                        <ul>
                            <li><strong>Identificação:</strong> Reconhecer os perigos físicos, químicos, biológicos, ergonômicos e psicossociais.</li>
                            <li><strong>Avaliação:</strong> Analisar a probabilidade de um evento ocorrer e a gravidade dos danos.</li>
                            <li><strong>Controle:</strong> Implementar medidas preventivas ou corretivas, seguindo hierarquia de controle.</li>
                            <li><strong>Monitoramento:</strong> Acompanhar a eficácia das medidas adotadas e revisar continuamente.</li>
                        </ul>
                        <div class="highlight-box"><strong>📌 Obrigatoriedade Legal:</strong> No Brasil, o GRO é exigido pela NR-01 do Ministério do Trabalho e Emprego.</div>`
            },
            { 
                label: "Elaborar o PGR",
                texto: `<p>A elaboração do <strong>Programa de Gerenciamento de Riscos (PGR)</strong> segue as diretrizes da NR-01. O processo exige a criação de um Inventário de Riscos e de um Plano de Ação.</p>
                        <p><strong>Passo a passo:</strong></p>
                        <ol>
                            <li><strong>Levantamento Preliminar:</strong> Percorra os setores da empresa para identificar perigos.</li>
                            <li><strong>Avaliação de Riscos:</strong> Analise os perigos levantados para determinar o nível de risco.</li>
                            <li><strong>Plano de Ação:</strong> Defina o que será feito para mitigar ou eliminar os riscos.</li>
                            <li><strong>Implementação e Revisão:</strong> O PGR é um programa contínuo, revisado a cada 2 anos.</li>
                        </ol>
                        <div class="highlight-box"><strong>⚠️ Restrições:</strong> O TST pode elaborar o PGR. Na NR-18, só pode assinar obras com menos de 7m e até 10 trabalhadores.</div>`
            },
            { 
                label: "Definir responsabilidades",
                texto: `<p>A definição de responsabilidades do <strong>Técnico em Segurança do Trabalho (TST)</strong> está regulamentada pela portaria do Ministério do Trabalho.</p>
                        <p><strong>Principais atribuições:</strong></p>
                        <ul>
                            <li><strong>Avaliação de Riscos:</strong> Informar os riscos existentes.</li>
                            <li><strong>Medidas de Controle:</strong> Propor medidas para eliminar riscos.</li>
                            <li><strong>Orientação:</strong> Informar colaboradores sobre riscos e EPIs.</li>
                            <li><strong>Investigação:</strong> Participar da investigação de acidentes.</li>
                        </ul>`
            },
            { 
                label: "Inventariar fontes de risco",
                texto: `<p><strong>Inventariar fontes de risco</strong> é o processo de mapear, identificar e documentar os perigos e agentes nocivos presentes no ambiente de trabalho.</p>
                        <p><strong>Passo a Passo:</strong></p>
                        <ol>
                            <li><strong>Caracterização do ambiente:</strong> Descreva processos produtivos e instalações.</li>
                            <li><strong>Identificação de perigos:</strong> Mapeie e liste as fontes geradoras de risco.</li>
                            <li><strong>Classificação por GSE:</strong> Agrupe trabalhadores com mesmos riscos.</li>
                            <li><strong>Avaliação de risco:</strong> Determine probabilidade e severidade.</li>
                            <li><strong>Medidas de prevenção:</strong> Registre controles já existentes.</li>
                        </ol>
                        <div class="highlight-box"><strong>📌 Exemplo:</strong> Indústria metalúrgica com ruído >85 dB → enclausuramento acústico + protetores auriculares.</div>`
            }
        ]
    },
    "NR-33": {
        itens: [
            { 
                label: "Identificar perigos em espaços confinados",
                texto: `<p><strong>Identificação de perigos em espaços confinados</strong> envolve o reconhecimento de riscos específicos como:</p>
                        <ul>
                            <li><strong>Atmosferas perigosas:</strong> Falta de oxigênio, gases tóxicos ou inflamáveis.</li>
                            <li><strong>Riscos de confinamento:</strong> Dificuldade de entrada e saída.</li>
                            <li><strong>Riscos mecânicos:</strong> Movimentação de materiais, equipamentos internos.</li>
                            <li><strong>Riscos biológicos:</strong> Presença de agentes patogênicos.</li>
                        </ul>`
            },
            { 
                label: "Elaborar o PET",
                texto: `<p>O <strong>Procedimento de Entrada em Espaço Confinado (PET)</strong> é obrigatório para qualquer acesso a esses locais.</p>
                        <p>O PET deve conter:</p>
                        <ul>
                            <li>Análise de Risco detalhada</li>
                            <li>Permissão de Entrada assinada pelo supervisor</li>
                            <li>Lista de equipamentos obrigatórios</li>
                            <li>Procedimentos de resgate e emergência</li>
                            <li>Treinamento específico da equipe</li>
                        </ul>`
            },
            { 
                label: "Supervisão e monitoramento",
                texto: `<p>O <strong>Supervisor de Entrada</strong> tem responsabilidades críticas:</p>
                        <ul>
                            <li>Verificar as condições de acesso antes da entrada</li>
                            <li>Garantir que todos os equipamentos estão funcionando</li>
                            <li>Manter contato com os trabalhadores no interior</li>
                            <li>Cancelar a permissão se houver condições inseguras</li>
                        </ul>`
            },
            { 
                label: "Equipamentos e resgate",
                texto: `<p>Os <strong>equipamentos para espaços confinados</strong> incluem:</p>
                        <ul>
                            <li>Detectores de gases multi-sensor</li>
                            <li>Sistemas de ventilação forçada</li>
                            <li>Equipamentos de comunicação</li>
                            <li>Equipamentos de resgate com tripé e cabo</li>
                            <li>EPIs específicos (cinto de segurança, máscara, etc.)</li>
                        </ul>`
            }
        ]
    },
    "NR-35": {
        itens: [
            { 
                label: "Identificar perigos em altura",
                texto: `<p><strong>Identificação de perigos em altura</strong> envolve o reconhecimento de todos os riscos presentes em atividades acima de 2 metros.</p>
                        <ul>
                            <li><strong>Riscos de queda:</strong> Falta de proteção coletiva, superfícies escorregadias.</li>
                            <li><strong>Riscos de impacto:</strong> Objetos em movimento, ferramentas soltas.</li>
                            <li><strong>Condições climáticas:</strong> Vento, chuva, calor intenso.</li>
                            <li><strong>Fatores humanos:</strong> Fadiga, falta de treinamento, distração.</li>
                        </ul>
                        <div class="highlight-box"><strong>📌 Importante:</strong> Toda atividade acima de 2 metros de altura requer análise de risco específica.</div>`
            },
            { 
                label: "Elaborar o PTA",
                texto: `<p>O <strong>Plano de Trabalho em Altura (PTA)</strong> é obrigatório para todas as atividades acima de 2 metros.</p>
                        <p>O PTA deve conter:</p>
                        <ul>
                            <li>Análise de Risco da tarefa</li>
                            <li>Medidas de proteção coletiva e individual</li>
                            <li>Procedimento de resgate</li>
                            <li>Lista de EPIs específicos (cinto paraquedista, trava-queda, etc.)</li>
                            <li>Autorização do responsável</li>
                        </ul>
                        <div class="highlight-box"><strong>⚠️ Atenção:</strong> O PTA deve ser revisado sempre que houver mudanças na tarefa ou no ambiente.</div>`
            },
            { 
                label: "Treinamento e capacitação",
                texto: `<p>O <strong>treinamento para trabalho em altura</strong> é obrigatório e deve ser:</p>
                        <ul>
                            <li><strong>Teórico-prático:</strong> Com carga horária mínima de 8 horas.</li>
                            <li><strong>Atualizado:</strong> Com reciclagem a cada 2 anos.</li>
                            <li><strong>Prático:</strong> Com simulações de resgate e utilização de equipamentos.</li>
                        </ul>`
            },
            { 
                label: "Equipamentos e inspeção",
                texto: `<p>Os <strong>equipamentos para trabalho em altura</strong> devem ser inspecionados regularmente:</p>
                        <ul>
                            <li><strong>Cinto paraquedista:</strong> Inspeção diária antes do uso.</li>
                            <li><strong>Trava-queda:</strong> Verificação de funcionamento.</li>
                            <li><strong>Talabartes:</strong> Comprimento máximo de 2 metros.</li>
                            <li><strong>Linhas de vida:</strong> Inspeção periódica por profissional habilitado.</li>
                        </ul>
                        <div class="highlight-box"><strong>🛡️ Lembre-se:</strong> Todo equipamento deve ter CA (Certificado de Aprovação) válido.</div>`
            }
        ]
    },
    "NR-18": {
        itens: [
            { 
                label: "PCMAT na construção civil",
                texto: `<p>O <strong>Programa de Condições e Meio Ambiente de Trabalho na Indústria da Construção (PCMAT)</strong> é obrigatório para obras com 20 ou mais trabalhadores.</p>
                        <p>O PCMAT deve conter:</p>
                        <ul>
                            <li>Memorial de segurança</li>
                            <li>Projeto de proteções coletivas</li>
                            <li>Plano de emergência</li>
                            <li>Treinamentos específicos</li>
                            <li>Procedimentos de segurança para cada etapa da obra</li>
                        </ul>`
            },
            { 
                label: "Andaimes e escadas",
                texto: `<p><strong>Andaimes e escadas</strong> são equipamentos críticos na construção civil:</p>
                        <ul>
                            <li><strong>Andaimes:</strong> Devem ser dimensionados por profissional habilitado.</li>
                            <li><strong>Escadas:</strong> Devem ter largura mínima de 50cm e inclinação de 75°.</li>
                            <li><strong>Guarda-corpos:</strong> Obrigatórios em todo local com risco de queda.</li>
                        </ul>`
            },
            { 
                label: "EPIs na construção civil",
                texto: `<p>Os <strong>EPIs obrigatórios na construção civil</strong> incluem:</p>
                        <ul>
                            <li>Capacete de segurança</li>
                            <li>Botina de segurança</li>
                            <li>Cinto de segurança para trabalho em altura</li>
                            <li>Luvas e óculos de proteção</li>
                            <li>Protetor auricular (quando necessário)</li>
                        </ul>`
            },
            { 
                label: "Sinalização e organização",
                texto: `<p>A <strong>sinalização no canteiro de obras</strong> é fundamental:</p>
                        <ul>
                            <li>Placas indicativas de perigo</li>
                            <li>Fitas de isolamento em áreas de risco</li>
                            <li>Identificação de saídas de emergência</li>
                            <li>Organização do armazenamento de materiais</li>
                        </ul>`
            }
        ]
    },
    "NR-10": {
        itens: [
            { 
                label: "Segurança em eletricidade",
                texto: `<p><strong>Segurança em instalações elétricas</strong> é uma das áreas mais críticas:</p>
                        <ul>
                            <li><strong>Treinamento obrigatório:</strong> Todos os trabalhadores que atuam com eletricidade.</li>
                            <li><strong>EPI específico:</strong> Luvas dielétricas, óculos de segurança, capacete.</li>
                            <li><strong>Procedimentos:</strong> Desligamento, teste de ausência de tensão, aterramento.</li>
                        </ul>`
            },
            { 
                label: "Prontuário de instalações elétricas",
                texto: `<p>O <strong>Prontuário de Instalações Elétricas</strong> é obrigatório e deve conter:</p>
                        <ul>
                            <li>Diagramas unifilares</li>
                            <li>Laudos de medição de aterramento</li>
                            <li>Relatórios de manutenção</li>
                            <li>Certificados de equipamentos</li>
                        </ul>`
            },
            { 
                label: "Equipamentos de Proteção",
                texto: `<p><strong>Equipamentos de Proteção Coletiva e Individual</strong> para eletricidade:</p>
                        <ul>
                            <li><strong>EPC:</strong> Barreiras, isolamentos, aterramento temporário.</li>
                            <li><strong>EPI:</strong> Luvas, capacete, óculos, vestimenta antichama.</li>
                            <li><strong>Verificação:</strong> Todos os EPIs devem ser testados periodicamente.</li>
                        </ul>`
            },
            { 
                label: "Sinalização de segurança",
                texto: `<p>A <strong>sinalização em áreas elétricas</strong> deve incluir:</p>
                        <ul>
                            <li>Placas de "Perigo - Alta Tensão"</li>
                            <li>Identificação de quadros elétricos</li>
                            <li>Sinalização de procedimentos de emergência</li>
                            <li>Indicação de áreas restritas</li>
                        </ul>`
            }
        ]
    }
};

// ============================================================
// ===== FUNÇÕES DAS NRS EXPANSÍVEIS (DENTRO DO MODAL) =====
// ============================================================

// Sobrescreve a função abrirModalNr para usar os detalhes expansíveis
const abrirModalNrOriginal = window.abrirModalNr;

window.abrirModalNr = function(num) {
    const nr = todasNrs.find(n => n.num === num);
    if (!nr) return;
    nrSelecionadaAtual = nr;
    
    // Pega os detalhes da NR (se tiver)
    const detalhes = detalhesNrs[nr.num] || { itens: [] };
    const itens = detalhes.itens.length > 0 ? detalhes.itens : nr.objs.map(objeto => ({
        label: objeto,
        texto: `<p><strong>${escapeHtml(objeto)}</strong> - Detalhes específicos desta atividade podem ser consultados na documentação completa da ${nr.num}.</p>`
    }));
    
    document.getElementById('mNrIcon').textContent = nr.icon;
    document.getElementById('mNrNum').textContent = nr.num;
    document.getElementById('mNrTitle').textContent = nr.nome;
    document.getElementById('mNrDesc').textContent = nr.desc;
    
    // Gera os itens com setas expansíveis
    document.getElementById('mNrObjs').innerHTML = itens.map(item => `
        <div class="nr-expand-item">
            <div class="nr-expand-header" onclick="window.toggleNrExpand(this)">
                <div class="left">
                    <span class="checkbox-custom">✔</span>
                    <span class="label">${escapeHtml(item.label)}</span>
                </div>
                <span class="arrow-nr-expand">▶</span>
            </div>
            <div class="nr-expand-content">
                ${item.texto}
            </div>
        </div>
    `).join('');
    
    document.getElementById('modalNrBg').classList.add('open');
}

// Função para expandir/recolher o item
window.toggleNrExpand = function(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow-nr-expand');
    
    // Fecha outros itens do mesmo modal
    const parent = header.closest('#mNrObjs');
    if (parent) {
        const allItems = parent.querySelectorAll('.nr-expand-item');
        allItems.forEach(item => {
            if (item !== header.closest('.nr-expand-item')) {
                const c = item.querySelector('.nr-expand-content');
                const a = item.querySelector('.arrow-nr-expand');
                if (c) c.classList.remove('open');
                if (a) a.classList.remove('active');
            }
        });
    }
    
    content.classList.toggle('open');
    arrow.classList.toggle('active');
}

console.log('✅ Funções das NRS expansíveis carregadas!');
