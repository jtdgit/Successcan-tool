/**
 * AFAS Successcan - Beheerscan Wizard
 * Wizard logica voor invullen en rapportgeneratie
 */
const Beheerscan = (() => {
    const state = {
        currentStep: 0, // 0 = intro, 1-4 = categorieën, 5 = resultaat
        klantNaam: '',
        datum: new Date().toLocaleDateString('nl-NL'),
        scores: {},       // { stellingId: 0|1|2 }
        bevindingen: {},  // { stellingId: 'tekst' }
        totalSteps: 6     // intro + 4 cats + resultaat
    };

    function init() {
        initDarkMode();
        renderStep();
        updateProgressBar();
    }

    function renderStep() {
        const container = document.getElementById('wizard-content');
        container.classList.add('step-exit');

        setTimeout(() => {
            switch (state.currentStep) {
                case 0: renderIntro(container); break;
                case 5: renderResultaat(container); break;
                default: renderCategorie(container, state.currentStep - 1); break;
            }
            container.classList.remove('step-exit');
            container.classList.add('step-enter');
            setTimeout(() => container.classList.remove('step-enter'), 300);
            updateProgressBar();
            updateNavButtons();
        }, 200);
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

        document.getElementById('klant-naam').addEventListener('input', e => {
            state.klantNaam = e.target.value;
        });
        document.getElementById('scan-datum').addEventListener('change', e => {
            state.datum = new Date(e.target.value).toLocaleDateString('nl-NL');
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
                });
            });

            const textarea = container.querySelector(`[data-stelling="${stelling.id}"] textarea`);
            if (textarea) {
                textarea.addEventListener('input', e => {
                    state.bevindingen[stelling.id] = e.target.value;
                    autoResize(e.target);
                });
            }
        });
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

                <div class="export-buttons">
                    <button class="btn-export btn-pdf" onclick="Beheerscan.exportPDF()">
                        📄 Exporteer als PDF
                    </button>
                </div>
            </div>
        `;

        // Render radar chart
        setTimeout(() => renderRadarChart(resultaten), 100);
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

    function exportPDF() {
        window.print();
    }

    // Navigation
    function nextStep() {
        if (state.currentStep === 0 && !state.klantNaam.trim()) {
            showValidation('Vul de klantnaam in om verder te gaan.');
            return;
        }
        if (state.currentStep < 5) {
            state.currentStep++;
            renderStep();
        }
    }

    function prevStep() {
        if (state.currentStep > 0) {
            state.currentStep--;
            renderStep();
        }
    }

    function goToStep(step) {
        state.currentStep = step;
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
        
        if (state.currentStep === 5) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = '';
            nextBtn.textContent = state.currentStep === 4 ? 'Bekijk resultaat →' : 'Volgende →';
        }
    }

    function showValidation(message) {
        const existing = document.querySelector('.validation-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'validation-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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

    // Public API
    return { init, nextStep, prevStep, goToStep, exportPDF, toggleDarkMode };
})();

document.addEventListener('DOMContentLoaded', () => Beheerscan.init());
