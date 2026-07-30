/**
 * AFAS Successcan - Beheerscan Wizard
 * Wizard logica voor invullen en rapportgeneratie
 */
const Beheerscan = (() => {
    const STORAGE_KEY = 'beheerscan-scans';

    const state = {
        scanId: null,     // unieke ID voor deze scan
        currentStep: 0,   // 0 = intro, 1-4 = categorieën, 5 = opmerkingen, 6 = inrichting, 7 = resultaat
        klantNaam: '',
        relatienummer: '',
        datum: new Date().toLocaleDateString('nl-NL'),
        scores: {},       // { stellingId: 0|1|2 }
        bevindingen: {},  // { stellingId: 'tekst' }
        algemeneOpmerkingen: '',
        inrichtingsscanData: [],  // [ { proces, procesonderdeel, toelichting }, ... ]
        totalSteps: 8     // intro + 4 cats + opmerkingen + inrichting + resultaat
    };

    // === LocalStorage functies ===
    function getAllScans() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch { return []; }
    }

    function saveScan() {
        if (!state.scanId) return;
        const scans = getAllScans();
        const idx = scans.findIndex(s => s.scanId === state.scanId);
        const scanData = {
            scanId: state.scanId,
            klantNaam: state.klantNaam,
            relatienummer: state.relatienummer,
            datum: state.datum,
            scores: { ...state.scores },
            bevindingen: { ...state.bevindingen },
            algemeneOpmerkingen: state.algemeneOpmerkingen,
            inrichtingsscanData: [...state.inrichtingsscanData],
            currentStep: state.currentStep,
            laatstGewijzigd: new Date().toISOString()
        };
        if (idx >= 0) scans[idx] = scanData;
        else scans.push(scanData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    }

    function loadScan(scanId) {
        const scans = getAllScans();
        const scan = scans.find(s => s.scanId === scanId);
        if (!scan) return false;
        state.scanId = scan.scanId;
        state.klantNaam = scan.klantNaam || '';
        state.relatienummer = scan.relatienummer || '';
        state.datum = scan.datum || new Date().toLocaleDateString('nl-NL');
        state.scores = scan.scores || {};
        state.bevindingen = scan.bevindingen || {};
        state.inrichtingsscanData = scan.inrichtingsscanData || [];
        state.algemeneOpmerkingen = scan.algemeneOpmerkingen || '';
        state.currentStep = scan.currentStep || 0;
        return true;
    }

    function deleteScan(scanId) {
        const scans = getAllScans().filter(s => s.scanId !== scanId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
    }

    function nieuweScan() {
        state.scanId = 'scan-' + Date.now();
        state.currentStep = 0;
        state.klantNaam = '';
        state.relatienummer = '';
        state.datum = new Date().toLocaleDateString('nl-NL');
        state.scores = {};
        state.bevindingen = {};
        state.inrichtingsscanData = [];
        state.algemeneOpmerkingen = '';
    }

    // === Init ===
    function init() {
        initDarkMode();
        renderScanOverzicht();
    }

    function renderStep() {
        const container = document.getElementById('wizard-content');
        container.classList.add('step-exit');

        window.scrollTo({ top: 0, behavior: 'instant' });

        setTimeout(() => {
            switch (state.currentStep) {
                case 0: renderIntro(container); break;
                case 5: renderAlgemeneOpmerkingen(container); break;
                case 6: renderInrichtingsScan(container); break;
                case 7: renderResultaat(container); break;
                default: renderCategorie(container, state.currentStep - 1); break;
            }
            container.classList.remove('step-exit');
            container.classList.add('step-enter');
            setTimeout(() => container.classList.remove('step-enter'), 300);
            updateProgressBar();
            updateNavButtons();
            updateStamkaartButton();
            showWizardUI(true);
        }, 200);
    }

    function renderScanOverzicht() {
        showWizardUI(false);
        updateStamkaartButton();
        const container = document.getElementById('wizard-content');
        const scans = getAllScans();

        container.innerHTML = `
            <div class="intro-section scan-overzicht-page">
                <div class="intro-header">
                    <div class="intro-icon">📋</div>
                    <h2>AFAS Successcan | Beheerscan</h2>
                    <p class="intro-description">Start een nieuwe scan of hervat een eerder opgeslagen scan.</p>
                </div>

                <button class="btn-nieuwe-scan" onclick="Beheerscan.startNieuweScan()">
                    ➕ Nieuwe scan starten
                </button>

                ${scans.length > 0 ? `
                    <div class="opgeslagen-scans">
                        <h3>Opgeslagen scans</h3>
                        <div class="scan-lijst">
                            ${scans.sort((a, b) => new Date(b.laatstGewijzigd) - new Date(a.laatstGewijzigd)).map(scan => {
                                const voortgang = Math.round((Object.keys(scan.scores || {}).length / 11) * 100);
                                return `
                                    <div class="scan-item">
                                        <div class="scan-item-info">
                                            <strong>${scan.klantNaam || 'Naamloos'}</strong>
                                            <span class="scan-item-meta">
                                                ${scan.relatienummer ? `Rel. ${scan.relatienummer} • ` : ''}
                                                ${scan.datum} • ${voortgang}% ingevuld
                                            </span>
                                        </div>
                                        <div class="scan-item-acties">
                                            <button class="btn-scan-open" onclick="Beheerscan.openScan('${scan.scanId}')">
                                                ${voortgang === 100 ? '📊 Bekijk' : '✏️ Hervat'}
                                            </button>
                                            <button class="btn-scan-delete" onclick="Beheerscan.verwijderScan('${scan.scanId}')">🗑️</button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function showWizardUI(show) {
        const nav = document.querySelector('.wizard-nav');
        const progress = document.querySelector('.progress-container');
        if (nav) nav.style.display = show ? '' : 'none';
        if (progress) progress.style.display = show ? '' : 'none';
    }

    function startNieuweScan() {
        nieuweScan();
        renderStep();
    }

    function openScan(scanId) {
        if (loadScan(scanId)) {
            renderStep();
        }
    }

    function verwijderScan(scanId) {
        if (confirm('Weet je zeker dat je deze scan wilt verwijderen?')) {
            deleteScan(scanId);
            renderScanOverzicht();
        }
    }

    function renderIntro(container) {
        container.innerHTML = `
            <div class="intro-section">
                <div class="intro-header">
                    <div class="intro-icon">📋</div>
                    <h2>AFAS Successcan | Beheerscan</h2>
                    <p class="intro-description">${BeheerscanData.introductie}</p>
                </div>
                <div class="form-group">
                    <label for="relatienummer">Verkooprelatienummer</label>
                    <input type="text" id="relatienummer" placeholder="Bijv. 12345" 
                           value="${state.relatienummer}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="klant-naam">Klantnaam</label>
                    <input type="text" id="klant-naam" placeholder="Voer de naam van de organisatie in..." 
                           value="${state.klantNaam}" autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="scan-datum">Datum</label>
                    <input type="date" id="scan-datum" value="${formatDateForInput(state.datum)}">
                </div>
                <div class="scan-overzicht">
                    <h3>Overzicht categorieën</h3>
                    <div class="categorie-cards">
                        ${BeheerscanData.categorieen.map(cat => `
                            <div class="categorie-preview" style="border-left: 4px solid ${cat.kleur}">
                                <span class="cat-icon">${cat.icoon}</span>
                                <div>
                                    <strong>${cat.naam}</strong>
                                    <span class="cat-count">${cat.stellingen.length} stellingen</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('relatienummer').addEventListener('input', e => {
            state.relatienummer = e.target.value;
            saveScan();
            updateStamkaartButton();
        });
        document.getElementById('klant-naam').addEventListener('input', e => {
            state.klantNaam = e.target.value;
            saveScan();
        });
        document.getElementById('scan-datum').addEventListener('change', e => {
            state.datum = new Date(e.target.value).toLocaleDateString('nl-NL');
            saveScan();
        });
    }

    function renderCategorie(container, catIndex) {
        const cat = BeheerscanData.categorieen[catIndex];
        container.innerHTML = `
            <div class="categorie-section">
                <div class="categorie-header" style="border-color: ${cat.kleur}">
                    <span class="cat-header-icon">${cat.icoon}</span>
                    <div>
                        <h2>${cat.naam}</h2>
                        <span class="cat-subtitle">${cat.stellingen.length} stellingen • Categorie ${catIndex + 1} van 4</span>
                    </div>
                </div>
                <div class="stellingen-lijst">
                    ${cat.stellingen.map((stelling, idx) => renderStelling(stelling, idx, cat.kleur)).join('')}
                </div>
            </div>
        `;

        // Attach event listeners
        cat.stellingen.forEach(stelling => {
            const scoreButtons = container.querySelectorAll(`[data-stelling="${stelling.id}"] .score-btn`);
            scoreButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const score = parseInt(btn.dataset.score);
                    state.scores[stelling.id] = score;
                    // Update UI
                    scoreButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Show score description
                    const descEl = container.querySelector(`[data-stelling="${stelling.id}"] .score-beschrijving`);
                    if (descEl) descEl.textContent = stelling.scoreBeschrijvingen[score];
                    saveScan();
                });
            });

            const textarea = container.querySelector(`[data-stelling="${stelling.id}"] textarea`);
            if (textarea) {
                textarea.addEventListener('input', e => {
                    state.bevindingen[stelling.id] = e.target.value;
                    autoResize(e.target);
                    saveScan();
                });
            }
        });
    }

    function renderAlgemeneOpmerkingen(container) {
        container.innerHTML = `
            <div class="categorie-section">
                <div class="categorie-header" style="border-color: #005FAA">
                    <span class="cat-header-icon">📝</span>
                    <div>
                        <h2>Algemene opmerkingen</h2>
                        <span class="cat-subtitle">Aanvullende observaties en context voor het adviesrapport</span>
                    </div>
                </div>
                <div class="stelling-card">
                    <div class="stelling-content">
                        <p class="stelling-toelichting">Gebruik dit scherm voor opmerkingen die niet bij een specifieke stelling horen.</p>
                        <div class="bevindingen-sectie">
                            <label for="algemene-opmerkingen">Opmerkingen</label>
                            <textarea id="algemene-opmerkingen" placeholder="Voeg hier algemene opmerkingen toe..." rows="8">${state.algemeneOpmerkingen || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const algemeneOpmerkingen = document.getElementById('algemene-opmerkingen');
        if (!algemeneOpmerkingen) return;

        algemeneOpmerkingen.addEventListener('input', e => {
            state.algemeneOpmerkingen = e.target.value;
            autoResize(e.target);
            saveScan();
        });
        autoResize(algemeneOpmerkingen);
    }

    function renderInrichtingsScan(container) {
        const rows = state.inrichtingsscanData.map((row, idx) => `
            <tr class="tabel-row">
                <td>${escapeHtml(row.proces || '')}</td>
                <td>${escapeHtml(row.procesonderdeel || '')}</td>
                <td>${escapeHtml(row.toelichting || '')}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="categorie-section">
                <div class="categorie-header" style="border-color: #FF6F00">
                    <span class="cat-header-icon">🔧</span>
                    <div>
                        <h2>Inrichtingsscan</h2>
                        <span class="cat-subtitle">Adviezen voor inrichtingsverbeteringen (optioneel)</span>
                    </div>
                </div>
                <div class="stelling-card">
                    <div class="stelling-content">
                        <p class="stelling-toelichting">Upload hier de Excel met inrichtingsadviezen van je consultant.</p>
                        <div style="margin: 20px 0;">
                            <label for="excel-upload" style="display: block; font-weight: 600; margin-bottom: 8px;">📊 Excel-bestand uploaden</label>
                            <input type="file" id="excel-upload" accept=".xlsx,.xls" style="padding: 8px; border: 2px solid #ccc; border-radius: 6px; width: 100%; max-width: 400px;">
                        </div>
                        ${state.inrichtingsscanData.length > 0 ? `
                            <div style="margin-top: 20px;">
                                <h3>Geladen gegevens (${state.inrichtingsscanData.length} items)</h3>
                                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                    <thead>
                                        <tr style="background: #f5f5f5;">
                                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Proces</th>
                                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Procesonderdeel</th>
                                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Toelichting</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rows}
                                    </tbody>
                                </table>
                            </div>
                        ` : '<p style="margin-top: 20px; color: #999;">Nog geen Excel geladen. Dit onderdeel is optioneel.</p>'}
                    </div>
                </div>
            </div>
        `;

        const excelInput = document.getElementById('excel-upload');
        if (excelInput) {
            excelInput.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) parseExcelInrichtingsScan(file);
            });
        }
    }

    function parseExcelInrichtingsScan(file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    throw new Error('Geen werkbladen in Excel-bestand gevonden');
                }
                
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const rawData = XLSX.utils.sheet_to_json(worksheet);
                
                if (!rawData || rawData.length === 0) {
                    throw new Error('Excel-bestand is leeg');
                }

                // Detecteer kolom-headers (case-insensitive, trim whitespace)
                const firstRow = rawData[0];
                const headerMap = {};
                
                for (const key in firstRow) {
                    const cleanKey = key.trim().toLowerCase();
                    headerMap[key] = cleanKey;
                }
                
                // Map de juiste kolomnamen
                const kolommen = {
                    proces: null,
                    procesonderdeel: null,
                    toelichting: null,
                    inScope: null
                };
                
                for (const key in headerMap) {
                    const clean = headerMap[key];
                    if (!kolommen.proces && clean.includes('proces') && !clean.includes('onderdeel')) kolommen.proces = key;
                    if (!kolommen.procesonderdeel && clean.includes('onderdeel')) kolommen.procesonderdeel = key;
                    if (!kolommen.toelichting && clean.includes('toelichting')) kolommen.toelichting = key;
                    if (!kolommen.inScope && clean.includes('scope')) kolommen.inScope = key;
                }
                
                if (!kolommen.proces || !kolommen.procesonderdeel || !kolommen.inScope) {
                    throw new Error('Verplichte kolommen niet gevonden: Proces, Procesonderdeel, In Scope');
                }

                // Filter en map data
                state.inrichtingsscanData = rawData
                    .filter(row => Number(row[kolommen.inScope]) === 1)
                    .map(row => ({
                        proces: row[kolommen.proces] || '',
                        procesonderdeel: row[kolommen.procesonderdeel] || '',
                        toelichting: row[kolommen.toelichting] || ''
                    }));

                saveScan();
                renderStep(); // Refresh het scherm om de tabel te tonen
                showValidation('Excel geladen!', `${state.inrichtingsscanData.length} items met "In Scope" = 1`, '✅');
            } catch (err) {
                console.error('Excel parse error:', err);
                showValidation('Fout bij laden', err.message || 'Het Excel-bestand kon niet gelezen worden.', '❌');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function renderStelling(stelling, idx, kleur) {
        const currentScore = state.scores[stelling.id];
        const currentBevinding = state.bevindingen[stelling.id] || '';

        return `
            <div class="stelling-card" data-stelling="${stelling.id}">
                <div class="stelling-nummer" style="background: ${kleur}">${idx + 1}</div>
                <div class="stelling-content">
                    <h3 class="stelling-titel">${stelling.titel}</h3>
                    <p class="stelling-toelichting">${stelling.toelichting}</p>
                    
                    <div class="score-selectie">
                        <label class="score-label">Score:</label>
                        <div class="score-buttons">
                            ${BeheerscanData.scoreOpties.map(opt => `
                                <button class="score-btn ${currentScore === opt.waarde ? 'active' : ''}" 
                                        data-score="${opt.waarde}"
                                        style="--btn-kleur: ${opt.kleur}; --btn-kleur-licht: ${opt.kleurLicht}">
                                    <span class="score-icoon">${opt.icoon}</span>
                                    <span class="score-waarde">${opt.waarde}</span>
                                    <span class="score-text">${opt.label}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="score-beschrijving">${currentScore !== undefined ? stelling.scoreBeschrijvingen[currentScore] : ''}</div>
                    </div>

                    <div class="bevindingen-sectie">
                        <label>Bevindingen:</label>
                        <textarea placeholder="Noteer hier de bevindingen uit het interview..." 
                                  rows="3">${currentBevinding}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    function renderResultaat(container) {
        const resultaten = berekenResultaten();
        const algemeneOpmerkingen = prettifyTekst(state.algemeneOpmerkingen || '');
        let stellingNr = 0;

        container.innerHTML = `
            <div class="resultaat-section">

                <!-- SCORECARD OVERZICHT (print-first page) -->
                <div class="scorecard-overzicht">
                    <div class="scorecard-header">
                        <div class="scorecard-titel">
                            <h1>SUCCESSCAN AFAS</h1>
                            <p class="scorecard-subtitel">Beoordeel onderstaande 11 stellingen en geef per vraag een score.</p>
                        </div>
                        <div class="scorecard-legenda-top">
                            <span class="legenda-item"><span class="legenda-icoon">🌧️</span> Regenachtig = 0 punten</span>
                            <span class="legenda-item"><span class="legenda-icoon">⛅</span> Bewolkt = 1 punt</span>
                            <span class="legenda-item"><span class="legenda-icoon">☀️</span> Zonnig = 2 punten</span>
                        </div>
                        <div class="scorecard-totaal-box">
                            <div class="scorecard-totaal-label">TOTAAL SCORE</div>
                            <div class="scorecard-totaal-waarde">${resultaten.totaalScore} / ${BeheerscanData.maxScore}</div>
                        </div>
                    </div>

                    <div class="scorecard-body">
                        <div class="scorecard-stellingen">
                            ${BeheerscanData.categorieen.map(cat => `
                                <div class="scorecard-categorie">
                                    <div class="scorecard-cat-label" style="border-color: ${cat.kleur}">
                                        <span class="scorecard-cat-icoon">${cat.icoon}</span>
                                        <div>
                                            <strong>${cat.naam.toUpperCase()}</strong>
                                        </div>
                                    </div>
                                    <div class="scorecard-cat-stellingen">
                                        ${cat.stellingen.map(st => {
                                            stellingNr++;
                                            const score = state.scores[st.id];
                                            return `
                                                <div class="scorecard-stelling-row">
                                                    <span class="scorecard-nr">${stellingNr}</span>
                                                    <span class="scorecard-stelling-tekst">${st.titel}</span>
                                                    <div class="scorecard-weer-iconen">
                                                        <span class="scorecard-weer ${score === 0 ? 'selected' : ''}">🌧️</span>
                                                        <span class="scorecard-weer ${score === 1 ? 'selected' : ''}">⛅</span>
                                                        <span class="scorecard-weer ${score === 2 ? 'selected' : ''}">☀️</span>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="scorecard-sidebar">
                            <h4>HOE SCOOR JE?</h4>
                            <div class="scorecard-uitleg">
                                <div class="scorecard-uitleg-item rood">
                                    <span class="uitleg-icoon">🌧️</span>
                                    <div>
                                        <strong>REGENACHTIG = 0 PUNTEN</strong>
                                        <p>De situatie is onvoldoende op orde. Er is actie en verbetering nodig.</p>
                                    </div>
                                </div>
                                <div class="scorecard-uitleg-item oranje">
                                    <span class="uitleg-icoon">⛅</span>
                                    <div>
                                        <strong>BEWOLKT = 1 PUNT</strong>
                                        <p>De situatie is gedeeltelijk op orde. Er is ruimte voor verbetering.</p>
                                    </div>
                                </div>
                                <div class="scorecard-uitleg-item groen">
                                    <span class="uitleg-icoon">☀️</span>
                                    <div>
                                        <strong>ZONNIG = 2 PUNTEN</strong>
                                        <p>De situatie is goed op orde. Ga zo door en blijf optimaliseren.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="scorecard-tip">
                                <strong>⭐ TIP</strong>
                                <p>Gebruik de uitkomsten om samen de belangrijkste verbeterkansen te bepalen en prioriteiten te stellen.</p>
                            </div>
                        </div>
                    </div>

                    <div class="scorecard-footer">
                        <div class="scorecard-range rood">0 – 7 punten = <strong>Urgentie:</strong> basis op orde brengen</div>
                        <div class="scorecard-range oranje">8 – 14 punten = <strong>Aandacht:</strong> verbeteren &amp; versterken</div>
                        <div class="scorecard-range groen">15 – 22 punten = <strong>Sterk fundament,</strong> doorontwikkelen</div>
                    </div>

                    <!-- Compacte samenvatting onder scorecard (alleen zichtbaar bij scorecard print) -->
                    <div class="scorecard-samenvatting">
                        <div class="scorecard-sam-grid">
                            <div class="scorecard-sam-chart">
                                <canvas id="radar-chart-mini" width="240" height="240"></canvas>
                            </div>
                            <div class="scorecard-sam-score">
                                <div class="sam-percentage" style="color: ${resultaten.niveau.kleur}">${resultaten.percentage}%</div>
                                <div class="sam-label">${resultaten.niveau.label}</div>
                                <div class="sam-punten">${resultaten.totaalScore} / ${BeheerscanData.maxScore} punten</div>
                            </div>
                            <div class="scorecard-sam-tabel">
                                <table>
                                    <thead><tr><th>Categorie</th><th>Score</th><th>%</th></tr></thead>
                                    <tbody>
                                        ${resultaten.perCategorie.map(r => `
                                            <tr>
                                                <td>${r.icoon} ${r.naam}</td>
                                                <td>${r.score}/${r.max}</td>
                                                <td><span class="sam-bar" style="background: ${getBarColor(r.percentage)}">${r.percentage}%</span></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="scorecard-sam-conclusie">
                            <strong>Conclusie:</strong> ${BeheerscanData.getConclusie(resultaten.percentage)}
                        </div>
                    </div>
                </div>

                <!-- Bestaande rapport content -->
                <div class="resultaat-header">
                    <h2>Resultaat Beheerscan</h2>
                    <div class="resultaat-meta">
                        <span class="meta-klant">${state.klantNaam || 'Onbekend'}</span>
                        <span class="meta-datum">${state.datum}</span>
                    </div>
                </div>

                <div class="resultaat-grid">
                    <div class="resultaat-chart">
                        <h3>Radardiagram</h3>
                        <canvas id="radar-chart" width="400" height="400"></canvas>
                    </div>
                    <div class="resultaat-totaal">
                        <div class="totaal-score-card" style="border-color: ${resultaten.niveau.kleur}">
                            <div class="totaal-percentage" style="color: ${resultaten.niveau.kleur}">${resultaten.percentage}%</div>
                            <div class="totaal-label">${resultaten.niveau.label}</div>
                            <div class="totaal-punten">${resultaten.totaalScore} / ${BeheerscanData.maxScore} punten</div>
                        </div>
                        <p class="totaal-beschrijving">${resultaten.niveau.beschrijving}</p>
                    </div>
                </div>

                <div class="score-tabel">
                    <h3>Scores per categorie</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Categorie</th>
                                <th>Score</th>
                                <th>Max</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resultaten.perCategorie.map(r => `
                                <tr>
                                    <td><span class="cat-icon-small">${r.icoon}</span> ${r.naam}</td>
                                    <td>${r.score}</td>
                                    <td>${r.max}</td>
                                    <td>
                                        <div class="score-bar-container">
                                            <div class="score-bar" style="width: ${r.percentage}%; background: ${getBarColor(r.percentage)}"></div>
                                            <span class="score-bar-label">${r.percentage}%</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="detail-scores">
                    <h3>Detail per stelling</h3>
                    ${BeheerscanData.categorieen.map(cat => `
                        <div class="detail-categorie">
                            <h4 style="color: ${cat.kleur}">${cat.icoon} ${cat.naam}</h4>
                            ${cat.stellingen.map(st => {
                                const score = state.scores[st.id];
                                const scoreOpt = BeheerscanData.scoreOpties.find(o => o.waarde === score) || BeheerscanData.scoreOpties[0];
                                const bevinding = getBevindingFormatted(st.id);
                                return `
                                    <div class="detail-stelling">
                                        <div class="detail-stelling-header">
                                            <span class="detail-titel">${st.titel}</span>
                                            <span class="detail-score-badge" style="background: ${scoreOpt.kleurLicht}; color: ${scoreOpt.kleur}">
                                                ${scoreOpt.icoon} ${score !== undefined ? score : '?'}/2
                                            </span>
                                        </div>
                                        ${bevinding ? `<div class="detail-bevinding"><strong>Bevindingen:</strong> ${escapeHtml(bevinding)}</div>` : ''}
                                        ${score !== undefined && score < 2 ? `
                                            <div class="detail-aanbevelingen">
                                                <strong>Aanbevelingen:</strong>
                                                <ul>${st.aanbevelingen.map(a => `<li>${a}</li>`).join('')}</ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>

                <div class="conclusie-sectie">
                    <h3>Conclusie</h3>
                    <p>${BeheerscanData.getConclusie(resultaten.percentage)}</p>
                </div>

                ${algemeneOpmerkingen ? `
                    <div class="conclusie-sectie">
                        <h3>Algemene opmerkingen</h3>
                        <div class="detail-bevinding">${escapeHtml(algemeneOpmerkingen)}</div>
                    </div>
                ` : ''}

                ${state.inrichtingsscanData.length > 0 ? `
                    <div class="conclusie-sectie">
                        <h3>Inrichtingsadviezen</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Proces</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Procesonderdeel</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #005FAA; font-weight: 600;">Toelichting</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${state.inrichtingsscanData.map(row => `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 6px 8px;"><strong>${escapeHtml(row.proces)}</strong></td>
                                        <td style="padding: 6px 8px;">${escapeHtml(row.procesonderdeel)}</td>
                                        <td style="padding: 6px 8px;">${escapeHtml(row.toelichting)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <div class="export-buttons">
                    <button class="btn-export btn-pdf" onclick="Beheerscan.exportScorecard()">
                        📊 Exporteer Scorecard (PDF)
                    </button>
                    <button class="btn-export btn-pdf btn-advies" onclick="Beheerscan.exportAdvies()">
                        📝 Exporteer Adviesrapport (Word)
                    </button>
                </div>
            </div>
        `;

        // Render radar chart
        setTimeout(() => {
            renderRadarChart(resultaten);
            renderRadarChartMini(resultaten);
        }, 100);
    }

    function berekenResultaten() {
        let totaalScore = 0;
        const perCategorie = BeheerscanData.categorieen.map(cat => {
            let catScore = 0;
            cat.stellingen.forEach(st => {
                catScore += state.scores[st.id] || 0;
            });
            totaalScore += catScore;
            const max = cat.stellingen.length * 2;
            return {
                id: cat.id,
                naam: cat.naam,
                icoon: cat.icoon,
                kleur: cat.kleur,
                score: catScore,
                max: max,
                percentage: Math.round((catScore / max) * 100)
            };
        });

        const percentage = Math.round((totaalScore / BeheerscanData.maxScore) * 100);
        return {
            totaalScore,
            percentage,
            niveau: BeheerscanData.getNiveau(percentage),
            perCategorie
        };
    }

    function renderRadarChart(resultaten) {
        const canvas = document.getElementById('radar-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const center = size / 2;
        const radius = size * 0.35;
        const categories = resultaten.perCategorie;
        const n = categories.length;

        ctx.clearRect(0, 0, size, size);

        // Draw grid circles
        for (let level = 1; level <= 5; level++) {
            const r = (radius / 5) * level;
            ctx.beginPath();
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= n; i++) {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw axes
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            ctx.beginPath();
            ctx.strokeStyle = '#BDBDBD';
            ctx.moveTo(center, center);
            ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
            ctx.stroke();
        }

        // Draw data polygon
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 95, 170, 0.2)';
        ctx.strokeStyle = '#005FAA';
        ctx.lineWidth = 2.5;
        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const value = cat.percentage / 100;
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw data points
        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const value = cat.percentage / 100;
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            ctx.beginPath();
            ctx.fillStyle = '#005FAA';
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.font = '12px "Open Sans", sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const labelRadius = radius + 30;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            ctx.fillText(cat.naam, x, y);
            ctx.fillText(`${cat.percentage}%`, x, y + 14);
        });
    }

    function renderRadarChartMini(resultaten) {
        const canvas = document.getElementById('radar-chart-mini');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const center = size / 2;
        const radius = size * 0.32;
        const categories = resultaten.perCategorie;
        const n = categories.length;

        ctx.clearRect(0, 0, size, size);

        // Grid
        for (let level = 1; level <= 5; level++) {
            const r = (radius / 5) * level;
            ctx.beginPath();
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= n; i++) {
                const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Axes
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            ctx.beginPath();
            ctx.strokeStyle = '#BDBDBD';
            ctx.lineWidth = 0.5;
            ctx.moveTo(center, center);
            ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
            ctx.stroke();
        }

        // Data
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 95, 170, 0.2)';
        ctx.strokeStyle = '#005FAA';
        ctx.lineWidth = 2;
        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const value = cat.percentage / 100;
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.font = '9px "Open Sans", sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        categories.forEach((cat, i) => {
            const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            ctx.fillText(cat.naam, x, y);
        });
    }

    function exportPDF() {
        // Fallback: print alles
        document.body.classList.remove('print-scorecard', 'print-advies');
        window.print();
    }

    function exportScorecard() {
        if (!validateScoresVoorExport()) return;

        document.documentElement.classList.add('print-scorecard');
        document.body.classList.add('print-scorecard');
        document.body.classList.remove('print-advies');
        window.print();
        setTimeout(() => {
            document.documentElement.classList.remove('print-scorecard');
            document.body.classList.remove('print-scorecard');
        }, 500);
    }

    function exportAdvies() {
        if (!validateScoresVoorExport()) return;

        const resultaten = berekenResultaten();
        const klantNaam = state.klantNaam || 'Onbekend';
        const datum = state.datum;
        const algemeneOpmerkingen = prettifyTekst(state.algemeneOpmerkingen || '');

        const navyDark = '#2B3544';
        const afasBlauw = '#005FAA';
        const lichtGrijs = '#F0F4F7';

        // Bouw Word-compatible HTML op in AFAS huisstijl
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
                <style>
                    @page { margin: 0; }
                    @page cover { mso-header-margin: 0; mso-footer-margin: 0; margin: 0; }
                    @page content { margin: 2cm 2cm 2.5cm 2cm; mso-footer-margin: 1cm; }
                    body { font-family: 'Roboto', 'Segoe UI', Calibri, sans-serif; font-size: 10.5pt; color: #212121; line-height: 1.6; margin: 0; }
                    
                    /* Voorblad */
                    .cover-page { page: cover; text-align: center; padding: 0; margin: 0; }
                    .cover-logo { margin-top: 30pt; margin-bottom: 10pt; }
                    .cover-logo span { font-family: 'Roboto', Arial, sans-serif; font-size: 28pt; font-weight: 900; font-style: italic; color: ${afasBlauw}; }
                    .cover-logo sub { font-size: 14pt; font-style: italic; color: ${afasBlauw}; vertical-align: baseline; }
                    .cover-title-block { text-align: left; padding: 20pt 50pt; margin-top: 10pt; border-right: 4pt solid ${afasBlauw}; margin-right: 50pt; }
                    .cover-title { font-family: 'Roboto', sans-serif; font-size: 26pt; font-weight: 900; color: ${afasBlauw}; margin: 0 0 4pt 0; }
                    .cover-klant { font-family: 'Roboto', sans-serif; font-size: 22pt; font-weight: 900; color: #1a1a1a; margin: 0 0 20pt 0; }
                    .cover-subtitle { font-family: 'Roboto', sans-serif; font-size: 16pt; font-weight: 300; color: ${afasBlauw}; margin: 0; }

                    /* Content pagina's */
                    .content-page { page: content; }
                    .section-header { background-color: ${navyDark}; color: white; padding: 20pt 20pt 20pt 2cm; font-family: 'Roboto', sans-serif; font-size: 16pt; font-weight: 900; margin: 0 -2cm; padding-right: 2cm; margin-bottom: 24pt; line-height: 1.4; }
                    
                    h1 { font-family: 'Roboto', sans-serif; font-size: 16pt; font-weight: 900; color: #1a1a1a; margin-top: 20pt; margin-bottom: 6pt; }
                    h2 { font-family: 'Roboto', sans-serif; font-size: 13pt; font-weight: 300; color: #333; margin-top: 0; margin-bottom: 12pt; }
                    h3 { font-family: 'Roboto', sans-serif; font-size: 11pt; font-weight: 700; color: #1a1a1a; margin-top: 16pt; margin-bottom: 4pt; }
                    
                    p { margin: 4pt 0; }
                    
                    /* Tabellen */
                    table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
                    .tabel-label { color: ${afasBlauw}; font-size: 9pt; font-weight: 600; padding: 4pt 0 2pt 0; }
                    td { padding: 5pt 10pt; font-size: 9.5pt; vertical-align: top; }
                    .tabel-row { border-bottom: 1px solid #E0E0E0; }
                    .tabel-row td { padding: 8pt 10pt; }
                    
                    /* Score styling */
                    .score-cel { text-align: center; width: 80pt; }
                    .score-0 { background-color: #FFEBEE; color: #E53935; padding: 3pt 8pt; font-weight: 700; font-size: 9pt; }
                    .score-1 { background-color: #FFF3E0; color: #EF6C00; padding: 3pt 8pt; font-weight: 700; font-size: 9pt; }
                    .score-2 { background-color: #E8F5E9; color: #2E7D32; padding: 3pt 8pt; font-weight: 700; font-size: 9pt; }
                    
                    .bevinding { background-color: ${lichtGrijs}; padding: 8pt 12pt; margin: 6pt 0; font-size: 9.5pt; line-height: 1.5; }
                    .aanbeveling-lijst { margin: 4pt 0 4pt 18pt; }
                    .aanbeveling-lijst li { margin-bottom: 3pt; font-size: 9.5pt; }
                    
                    /* Afsluitend */
                    .closing-bg { background-color: ${lichtGrijs}; padding: 30pt 2cm; margin: 0 -2cm; }
                    .groet { color: ${afasBlauw}; font-size: 11pt; font-weight: 300; margin-top: 40pt; }
                    
                    /* Footer */
                    .page-footer { border-top: 0; background-color: ${navyDark}; color: #ccc; font-size: 8pt; padding: 8pt 20pt; margin: 0 -2cm; margin-top: 20pt; }
                    .page-footer table { width: 100%; }
                    .page-footer td { color: #ccc; font-size: 8pt; padding: 2pt 4pt; border: 0; }
                    
                    /* Page breaks */
                    .page-break { page-break-before: always; mso-break-type: section-break; }
                    
                    /* Cover afbeelding */
                    .cover-image { width: 100%; max-width: 420pt; height: auto; margin: 0 auto; display: block; }
                    
                    /* Separator */
                    .separator { border: 0; border-top: 1px solid #ccc; margin: 16pt 0; }
                </style>
            </head>
            <body>
                <!-- VOORBLAD -->
                <div class="cover-page">
                    <div class="cover-logo">
                        <span>AFAS</span><br><sub>software</sub>
                    </div>
                    <div style="margin: 10pt 30pt;">
                        <img class="cover-image" src="https://jtdgit.github.io/Successcan-tool/img/cover.jpg" alt="AFAS Successcan">
                    </div>
                    <div class="cover-title-block">
                        <p class="cover-title">Successcan</p>
                        <p class="cover-klant">${escapeHtml(klantNaam)}</p>
                        <p class="cover-subtitle">Aanbevelingenrapport</p>
                    </div>
                </div>

                <!-- PAGINA 2: SCORECARD -->
                <div class="content-page page-break">
                    <div class="section-header">Scorecard</div>
                    
                    <h1>Resultaten Beheerscan</h1>
                    <h2>${escapeHtml(klantNaam)} — ${datum}</h2>
                    
                    <p style="margin-bottom: 14pt;">
                        <span class="tabel-label">Totaalscore</span><br>
                        <strong style="font-size: 14pt;">${resultaten.totaalScore} / ${BeheerscanData.maxScore}</strong> 
                        <span style="color: #616161;">(${resultaten.percentage}%) — ${resultaten.niveau.label}</span>
                    </p>
                    
                    <table>
                        <tr class="tabel-row" style="border-bottom: 2px solid ${afasBlauw};">
                            <td><span class="tabel-label">Categorie</span></td>
                            <td class="score-cel"><span class="tabel-label">Score</span></td>
                            <td class="score-cel"><span class="tabel-label">Max</span></td>
                            <td class="score-cel"><span class="tabel-label">%</span></td>
                        </tr>
                        ${resultaten.perCategorie.map(r => `
                            <tr class="tabel-row">
                                <td><strong>${r.icoon} ${r.naam}</strong></td>
                                <td class="score-cel">${r.score}</td>
                                <td class="score-cel">${r.max}</td>
                                <td class="score-cel">${r.percentage}%</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <hr class="separator">

                    ${algemeneOpmerkingen ? `
                        <h3>Algemene opmerkingen</h3>
                        <div class="bevinding">${escapeHtml(algemeneOpmerkingen)}</div>
                        <hr class="separator">
                    ` : ''}
                </div>

                <!-- DETAIL PAGINA'S PER CATEGORIE -->
                ${BeheerscanData.categorieen.map(cat => {
                    const catResult = resultaten.perCategorie.find(r => r.id === cat.id);
                    return `
                <div class="content-page page-break">
                    <div class="section-header">${cat.icoon} ${cat.naam}</div>
                    
                    <h1>${cat.naam}</h1>
                    <h2>Score: ${catResult.score} / ${catResult.max} (${catResult.percentage}%)</h2>
                    
                    ${cat.stellingen.map(st => {
                        const score = state.scores[st.id];
                        const scoreLabel = score === 2 ? '☀️ Zonnig' : score === 1 ? '⛅ Bewolkt' : '🌧️ Regenachtig';
                        const scoreClass = 'score-' + (score !== undefined ? score : 0);
                        const bevinding = getBevindingFormatted(st.id);
                        return `
                    <h3>${st.titel}</h3>
                    <p><span class="${scoreClass}">${scoreLabel} (${score !== undefined ? score : '?'}/2)</span></p>
                    ${bevinding ? `<div class="bevinding">${escapeHtml(bevinding)}</div>` : ''}
                    ${score !== undefined && score < 2 ? `
                    <p><span class="tabel-label">Aanbevelingen:</span></p>
                    <ul class="aanbeveling-lijst">
                        ${st.aanbevelingen.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                    ` : ''}
                    <hr class="separator">
                        `;
                    }).join('')}
                </div>
                    `;
                }).join('')}

                <!-- INRICHTINGSSCAN TABEL (als data beschikbaar) -->
                ${state.inrichtingsscanData.length > 0 ? `
                <div class="content-page page-break">
                    <div class="section-header">Inrichtingsscan Adviezen</div>
                    
                    <h1>Inrichtingsadviezen</h1>
                    <h2>Aanbevelingen van de consultant</h2>
                    
                    <table>
                        <tr class="tabel-row" style="border-bottom: 2px solid ${afasBlauw};">
                            <td><span class="tabel-label">Proces</span></td>
                            <td><span class="tabel-label">Procesonderdeel</span></td>
                            <td><span class="tabel-label">Toelichting</span></td>
                        </tr>
                        ${state.inrichtingsscanData.map(row => `
                            <tr class="tabel-row">
                                <td><strong>${escapeHtml(row.proces)}</strong></td>
                                <td>${escapeHtml(row.procesonderdeel)}</td>
                                <td>${escapeHtml(row.toelichting)}</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <hr class="separator">
                </div>
                ` : ''}

                <!-- AFSLUITEND -->
                <div class="content-page page-break">
                    <div class="section-header">Afsluitend</div>
                    
                    <div class="closing-bg">
                        <h1>Conclusie</h1>
                        <p>${BeheerscanData.getConclusie(resultaten.percentage)}</p>
                        
                        <p class="groet">Met vriendelijke groet,</p>
                        <p style="margin-top: 30pt;"><strong>AFAS Software</strong><br>
                        <span style="color: #616161;">Inspiratielaan 1, 3833 AV Leusden</span></p>
                    </div>
                </div>

            </body>
            </html>
        `;

        // Download als .doc (Word HTML format)
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Adviesrapport Beheerscan - ${klantNaam} - ${datum.replace(/\//g, '-')}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function getOningevuldeStellingen() {
        const oningevuld = [];
        BeheerscanData.categorieen.forEach(cat => {
            cat.stellingen.forEach(st => {
                if (state.scores[st.id] === undefined || state.scores[st.id] === null) {
                    oningevuld.push(st);
                }
            });
        });
        return oningevuld;
    }

    function validateScoresVoorExport() {
        const oningevuld = getOningevuldeStellingen();
        if (oningevuld.length === 0) return true;

        const aantalTekst = `${oningevuld.length} ${oningevuld.length === 1 ? 'stelling' : 'stellingen'}`;
        const voorbeeld = oningevuld.slice(0, 2).map(st => st.titel).join(' • ');
        const detail = `Nog ${aantalTekst} zonder score. Vul die eerst in, dan kan de export-raket vertrekken.\n${voorbeeld}`;

        showValidation('Bijna klaar voor export!', detail, '🚀');
        return false;
    }

    // Navigation
    function nextStep() {
        if (state.currentStep === 0 && !state.klantNaam.trim()) {
            showValidation('Vul de klantnaam in om verder te gaan.');
            return;
        }
        if (state.currentStep < 7) {
            state.currentStep++;
            saveScan();
            renderStep();
        }
    }

    function prevStep() {
        if (state.currentStep > 0) {
            state.currentStep--;
            saveScan();
            renderStep();
        }
    }

    function goToStep(step) {
        state.currentStep = step;
        saveScan();
        renderStep();
    }

    function updateProgressBar() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((el, idx) => {
            el.classList.remove('active', 'completed');
            if (idx === state.currentStep) el.classList.add('active');
            else if (idx < state.currentStep) el.classList.add('completed');
        });

        const progress = (state.currentStep / (state.totalSteps - 1)) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    function updateNavButtons() {
        const prevBtn = document.getElementById('btn-prev');
        const nextBtn = document.getElementById('btn-next');
        
        prevBtn.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';
        
        if (state.currentStep === 7) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = '';
            nextBtn.textContent = state.currentStep === 6 ? 'Bekijk resultaat →' : 'Volgende →';
        }
    }

    function showValidation(message, detail = '', icon = '⚠️') {
        const existing = document.querySelector('.validation-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'validation-toast';

        const title = document.createElement('div');
        title.className = 'validation-toast-title';
        title.textContent = `${icon} ${message}`;
        toast.appendChild(title);

        if (detail) {
            const text = document.createElement('div');
            text.className = 'validation-toast-text';
            text.textContent = detail;
            toast.appendChild(text);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, detail ? 4200 : 3000);
    }

    // Helpers
    function formatDateForInput(dateStr) {
        if (!dateStr) return new Date().toISOString().split('T')[0];
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return new Date().toISOString().split('T')[0];
    }

    function getBarColor(percentage) {
        if (percentage >= 80) return '#43A047';
        if (percentage >= 60) return '#7CB342';
        if (percentage >= 40) return '#FF9800';
        if (percentage >= 20) return '#F4511E';
        return '#E53935';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    /**
     * Formatteert ruwe aantekeningen naar professionele, vloeiende tekst.
     * Behoudt de essentie maar maakt er leesbare zinnen van.
     */
    function prettifyTekst(raw) {
        if (!raw || !raw.trim()) return '';

        // Split op newlines, bullet-achtige patronen, en puntkomma's
        let punten = raw
            .split(/[\n\r]+|(?:^|\n)\s*[-•*]\s*|;\s*/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Per punt: opschonen en als volledige zin formatteren
        punten = punten.map(punt => {
            // Verwijder leading bullets/nummers
            punt = punt.replace(/^[\d]+[.)]\s*/, '');
            punt = punt.replace(/^[-•*]\s*/, '');

            // Eerste letter hoofdletter
            punt = punt.charAt(0).toUpperCase() + punt.slice(1);

            // Zorg dat de zin eindigt met een punt
            if (!/[.!?]$/.test(punt)) {
                punt += '.';
            }

            return punt;
        });

        // Voeg samen tot vloeiende tekst
        return punten.join(' ');
    }

    /**
     * Geeft de opgemaakte versie van bevindingen terug voor weergave in het rapport.
     */
    function getBevindingFormatted(stellingId) {
        const raw = state.bevindingen[stellingId];
        return prettifyTekst(raw);
    }

    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('beheerscan-dark', isDark ? '1' : '0');
        const icon = document.querySelector('.darkmode-icon');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    }

    function initDarkMode() {
        if (localStorage.getItem('beheerscan-dark') === '1') {
            document.documentElement.classList.add('dark');
            const icon = document.querySelector('.darkmode-icon');
            if (icon) icon.textContent = '☀️';
        }
    }

    function openStamkaart() {
        if (state.relatienummer) {
            window.open('https://32772.afasinsite.nl/verkooprelatie-organisatie-prs?DbId=' + encodeURIComponent(state.relatienummer), '_blank');
        }
    }

    function updateStamkaartButton() {
        const btn = document.getElementById('btn-stamkaart');
        if (!btn) return;
        if (state.relatienummer && state.relatienummer.trim()) {
            btn.disabled = false;
            btn.title = 'Open stamkaart in AFAS InSite';
        } else {
            btn.disabled = true;
            btn.title = 'Vul eerst een verkooprelatienummer in';
        }
    }

    // Public API
    function naarOverzicht() {
        renderScanOverzicht();
    }

    return { init, nextStep, prevStep, goToStep, exportPDF, exportScorecard, exportAdvies, toggleDarkMode, startNieuweScan, openScan, verwijderScan, openStamkaart, naarOverzicht };
})();

document.addEventListener('DOMContentLoaded', () => Beheerscan.init());
