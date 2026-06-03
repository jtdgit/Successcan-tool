/**
 * AFAS Successcan - Beheerscan Data
 * 11 stellingen in 4 categorieën, scoring 0-1-2
 */
const BeheerscanData = {
    titel: 'AFAS Successcan | Beheerscan',
    introductie: 'Deelrapport beheerscan als onderdeel van de AFAS Successcan. We hanteren 11 stellingen onderverdeeld in 4 categorieën. Per stelling kan de organisatie 0, 1 of 2 punten scoren.',

    scoreOpties: [
        { waarde: 0, label: 'Niet aanwezig', kleur: '#E53935', kleurLicht: '#FFEBEE', icoon: '🌧️' },
        { waarde: 1, label: 'Gedeeltelijk', kleur: '#FF9800', kleurLicht: '#FFF3E0', icoon: '⛅' },
        { waarde: 2, label: 'Volledig', kleur: '#43A047', kleurLicht: '#E8F5E9', icoon: '☀️' }
    ],

    categorieen: [
        {
            id: 'structuur-rollen',
            naam: 'Structuur & Rollen',
            icoon: '🏗️',
            kleur: '#1565C0',
            stellingen: [
                {
                    id: 'producteigenaar',
                    titel: 'Producteigenaar heeft sleutelrol in beheerorganisatie',
                    toelichting: 'De producteigenaar is formeel aangesteld als eindverantwoordelijke voor het AFAS-systeem binnen de organisatie. Deze persoon is niet alleen technisch aanspreekpunt, maar heeft ook mandaat om beslissingen te nemen over inrichting, prioritering en doorontwikkeling.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen producteigenaar aangesteld of deze heeft geen mandaat.',
                        1: 'Er is een producteigenaar, maar deze heeft beperkt mandaat of geeft geen actieve invulling aan de rol.',
                        2: 'De producteigenaar is formeel aangesteld, heeft mandaat en geeft actief vorm aan regie over het AFAS-systeem.'
                    },
                    aanbevelingen: [
                        'Beleg eigenaarschap expliciet: stel een producteigenaar aan met mandaat op prioritering, roadmap en besluitvorming.',
                        'Introduceer een duidelijke structuur: wie doet wat, wanneer, hoe vaak.',
                        'Richt een duidelijke besturingscyclus in: ontwikkel een roadmap en prioriteringsproces (strategisch–tactisch–operationeel).',
                        'Herpositioneer beheer: geef beheer een structurele adviesrol en toetsingsmoment.',
                        'Borg besluitvorming onafhankelijk: voorkom dat prioriteiten uitsluitend per afdeling worden bepaald.'
                    ]
                },
                {
                    id: 'sleutelgebruikers',
                    titel: 'Er zijn sleutelgebruikers van alle afdelingen betrokken in de beheerorganisatie',
                    toelichting: 'Alle relevante bedrijfsonderdelen zijn vertegenwoordigd door een sleutelgebruiker die de verbinding vormt tussen de afdeling en de beheerorganisatie. Deze sleutelgebruikers kennen het AFAS-gebruik van hun afdeling, signaleren verbeterpunten en zijn eerste aanspreekpunt voor collega\'s.',
                    scoreBeschrijvingen: {
                        0: 'Er zijn geen sleutelgebruikers aangesteld of ze zijn niet betrokken bij beheer.',
                        1: 'Er zijn sleutelgebruikers, maar niet voor alle afdelingen of hun betrokkenheid is beperkt.',
                        2: 'Alle afdelingen hebben een actieve sleutelgebruiker die structureel betrokken is bij de beheerorganisatie.'
                    },
                    aanbevelingen: [
                        'Geef sleutelgebruikers tijd en ruimte om hun rol goed uit te kunnen voeren.',
                        'Stimuleer actieve participatie bij het beheren van AFAS.',
                        'Zorg dat sleutelgebruikers structureel overleggen met de beheerorganisatie.'
                    ]
                }
            ]
        },
        {
            id: 'capaciteit-kennis',
            naam: 'Capaciteit & Kennis',
            icoon: '🎓',
            kleur: '#6A1B9A',
            stellingen: [
                {
                    id: 'fte-norm',
                    titel: 'Aantal FTE afgezet tegen het gebruik van AFAS klopt met de norm',
                    toelichting: 'Het aantal FTE dat beschikbaar is voor beheer en ondersteuning van AFAS is in verhouding tot het aantal gebruikers en de complexiteit van het systeem. Er is een bewuste keuze gemaakt over de benodigde capaciteit.',
                    scoreBeschrijvingen: {
                        0: 'Er is structureel te weinig capaciteit voor beheer van AFAS.',
                        1: 'De capaciteit is voldoende maar krap, of er is geen bewuste afweging gemaakt.',
                        2: 'De FTE-inzet is in lijn met de norm en er is een bewuste keuze gemaakt over capaciteit.'
                    },
                    aanbevelingen: [
                        'Breng het huidige FTE-gebruik in kaart en vergelijk met de AFAS-norm.',
                        'Maak een bewuste keuze over benodigde capaciteit op basis van modules en complexiteit.',
                        'Overweeg uitbreiding als de capaciteit structureel onder de norm ligt.'
                    ]
                },
                {
                    id: 'kennis',
                    titel: 'Beheerorganisatie heeft voldoende kennis',
                    toelichting: 'De mensen die het beheer uitvoeren beschikken over actuele en voldoende diepgaande kennis van AFAS — zowel functioneel (processen, inrichting) als op het gebied van relevante modules. Ze zijn in staat wijzigingen te beoordelen, door te voeren en te begeleiden zonder altijd externe hulp nodig te hebben.',
                    scoreBeschrijvingen: {
                        0: 'De kennis is onvoldoende; er is structureel externe hulp nodig.',
                        1: 'De kennis is overwegend voldoende, maar er zijn duidelijke hiaten of afhankelijkheden van externen.',
                        2: 'Het team beschikt over voldoende actuele kennis om zelfstandig te beheren en door te ontwikkelen.'
                    },
                    aanbevelingen: [
                        'Laat beheerders pro-trainingen volgen op relevante gebieden.',
                        'Laat sleutelgebruikers basistrainingen volgen.',
                        'Borg kennis door werkbeschrijvingen vast te leggen.',
                        'Maak een overzicht van kennishiaten en stel een plan op om deze te dichten.'
                    ]
                },
                {
                    id: 'opleidingsplan',
                    titel: 'Er is een opleidingsplan voor de beheerorganisatie',
                    toelichting: 'Er bestaat een concreet en actueel opleidingsplan voor de medewerkers in de beheerorganisatie. Dit plan is afgestemd op de doorontwikkeling van AFAS, de ambities van de organisatie en eventuele kennishiaten.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen opleidingsplan en opleidingen worden niet of incidenteel gevolgd.',
                        1: 'Er worden opleidingen gevolgd, maar zonder structureel plan of samenhang.',
                        2: 'Er is een concreet opleidingsplan dat actief wordt bijgehouden en uitgevoerd.'
                    },
                    aanbevelingen: [
                        'Zorg voor een opleidingsplan voor zowel beheerders als sleutelgebruikers, inclusief onboarding en jaarlijkse bijscholing.',
                        'Borg kennis en processen door standaard procesbeschrijvingen en centrale vastlegging.',
                        'Richt een structurele kenniscyclus in (bijv. per update/release) om nieuwe AFAS-functionaliteiten te beoordelen en te delen.',
                        'Versterk de rol van sleutelgebruikers door tijd, erkenning en duidelijke verwachtingen.',
                        'Stuur actief op gebruik van beschikbare capaciteit (toegekende uren).'
                    ]
                }
            ]
        },
        {
            id: 'sturing-processen',
            naam: 'Sturing & Processen',
            icoon: '⚙️',
            kleur: '#E65100',
            stellingen: [
                {
                    id: 'roadmap',
                    titel: 'Er is een (duidelijke) roadmap / jaarplan met concrete planning',
                    toelichting: 'De beheerorganisatie werkt met een roadmap of jaarplan waarin de geplande doorontwikkelingen, verbeteringen en projecten voor het komende jaar zijn opgenomen. De roadmap is concreet, met eigenaren, deadlines en prioriteiten.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen roadmap of jaarplan aanwezig.',
                        1: 'Er is een globaal plan, maar dit is niet concreet, niet actueel of wordt niet actief bijgehouden.',
                        2: 'Er is een concrete roadmap met eigenaren, deadlines en prioriteiten die actief wordt beheerd.'
                    },
                    aanbevelingen: [
                        'Introduceer een centrale backlog waarin alle werkzaamheden via een wijzigingsverzoek worden ingestuurd en geprioriteerd.',
                        'Maak een jaarplan met per tijdvak grote en kleinere wijzigingsverzoeken.',
                        'Richt een uniform intake- en prioriteringsproces in voor wijzigingsverzoeken.'
                    ]
                },
                {
                    id: 'optimalisatie-ratio',
                    titel: 'Verhouding optimalisatie versus ad-hoc vraagstukken is 80/20',
                    toelichting: 'Het beheerteam besteedt het grootste deel van de tijd (circa 80%) aan geplande, structurele verbeteringen en optimalisaties. Slechts een klein deel (circa 20%) gaat op aan onvoorziene, ad-hoc verzoeken of incidenten.',
                    scoreBeschrijvingen: {
                        0: 'Het werk is overwegend ad-hoc en reactief; er is nauwelijks sprake van gepland optimalisatiewerk.',
                        1: 'Er is enige balans, maar ad-hoc werk overheerst of de verhouding is niet bewust gestuurd.',
                        2: 'De organisatie stuurt actief op de 80/20 verhouding en is overwegend planmatig bezig.'
                    },
                    aanbevelingen: [
                        'Plan vaste tijd voor doorontwikkeling en innovatie.',
                        'Monitor en analyseer ad-hoc werk (oorzaken).',
                        'Stuur bewust op de verhouding tussen gepland en ongepland werk.'
                    ]
                },
                {
                    id: 'backlog',
                    titel: 'Er is een gestructureerde backlog met inzage in noodzakelijke wijzigingen en wensen',
                    toelichting: 'Alle wijzigingsverzoeken, verbeterwensen en signalen vanuit de organisatie worden centraal vastgelegd in een backlog. Deze is transparant, prioriteert op basis van impact en urgentie, en wordt regelmatig besproken.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen centrale backlog of overzicht van wijzigingen en wensen.',
                        1: 'Er wordt iets bijgehouden (bijv. in een ticketsysteem), maar zonder structuur, prioritering of transparantie.',
                        2: 'Er is een gestructureerde, transparante backlog die regelmatig wordt besproken en geprioriteerd.'
                    },
                    aanbevelingen: [
                        'Maak doorlooptijden inzichtelijk en voorspelbaar door standaard werkwijzen.',
                        'Maak status en planning transparant voor de interne organisatie.',
                        'Plan structureel een inhoudelijk werkoverleg voor de functioneel beheerders in.'
                    ]
                }
            ]
        },
        {
            id: 'ambitie-visie',
            naam: 'Ambitie & Visie',
            icoon: '🚀',
            kleur: '#00695C',
            stellingen: [
                {
                    id: 'applicatielandschap',
                    titel: 'Applicatielandschap is bekend',
                    toelichting: 'De beheerorganisatie heeft een volledig en actueel overzicht van alle applicaties die in de organisatie worden gebruikt, inclusief de koppelingen met AFAS. Dit applicatielandschap is gedocumenteerd en wordt actief bijgehouden.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen overzicht van het applicatielandschap.',
                        1: 'Er is een overzicht, maar dit is onvolledig, verouderd of niet visueel beschikbaar.',
                        2: 'Er is een volledig, actueel en gedocumenteerd applicatielandschap dat actief wordt bijgehouden.'
                    },
                    aanbevelingen: [
                        'Ontwikkel een actueel en visueel applicatielandschap.',
                        'Benoem een eigenaar voor beheer en actualisatie.',
                        'Gebruik dit als basis voor beslissingen en integraties.'
                    ]
                },
                {
                    id: 'directie-betrokkenheid',
                    titel: 'Directie is betrokken bij ontwikkelingen rondom inrichting in AFAS',
                    toelichting: 'Het management en de directie zijn actief betrokken bij strategische keuzes rondom AFAS. Ze worden geïnformeerd over de roadmap, grote wijzigingen en de waarde die het systeem levert. Het principe \'water stroomt van boven naar beneden\' geldt.',
                    scoreBeschrijvingen: {
                        0: 'Directie is niet betrokken bij AFAS-gerelateerde besluitvorming.',
                        1: 'Directie is beperkt betrokken, bijvoorbeeld alleen via middenmanagement of incidenteel.',
                        2: 'Directie is actief betrokken, wordt periodiek geïnformeerd en stuurt op strategisch niveau.'
                    },
                    aanbevelingen: [
                        'Richt een stuurgroep op directieniveau in.',
                        'Rapporteer periodiek over het jaarplan/roadmap en voortgang.',
                        'Zorg dat AFAS onderdeel wordt van strategische besluitvorming.'
                    ]
                },
                {
                    id: 'toekomstvisie',
                    titel: 'Er is een duidelijke toekomstvisie voor het gebruik van AFAS',
                    toelichting: 'De organisatie heeft een heldere visie op hoe AFAS de komende jaren bijdraagt aan de bedrijfsdoelstellingen. Deze visie is vastgelegd, gedeeld met relevante stakeholders en vormt de basis voor keuzes in de roadmap en inrichting.',
                    scoreBeschrijvingen: {
                        0: 'Er is geen visie of strategie op het gebruik van AFAS.',
                        1: 'Er zijn losse ideeën of initiatieven, maar geen samenhangende visie.',
                        2: 'Er is een vastgelegde toekomstvisie die als kader dient voor keuzes en prioritering.'
                    },
                    aanbevelingen: [
                        'Ontwikkel een duidelijke toekomstvisie voor AFAS (1–3 jaar).',
                        'Vertaal organisatiedoelen naar het jaarplan.',
                        'Gebruik visie als kader voor keuzes (wel/niet implementeren).'
                    ]
                }
            ]
        }
    ],

    // Bereken maximale score
    get maxScore() {
        return this.categorieen.reduce((sum, cat) => sum + cat.stellingen.length * 2, 0);
    },

    // Bereken max score per categorie
    getMaxScoreCategorie(categorieId) {
        const cat = this.categorieen.find(c => c.id === categorieId);
        return cat ? cat.stellingen.length * 2 : 0;
    },

    // Bepaal overall niveau op basis van percentage
    getNiveau(percentage) {
        if (percentage >= 80) return { label: 'Volwassen', kleur: '#43A047', beschrijving: 'De beheerorganisatie is goed ingericht en werkt proactief.' };
        if (percentage >= 60) return { label: 'Gevorderd', kleur: '#7CB342', beschrijving: 'Er is een goede basis, maar er zijn verbeterpunten.' };
        if (percentage >= 40) return { label: 'Basis', kleur: '#FF9800', beschrijving: 'De basis staat, maar er mist structuur en samenhang.' };
        if (percentage >= 20) return { label: 'Beginnend', kleur: '#F4511E', beschrijving: 'De organisatie mist regie, samenhang en sturing.' };
        return { label: 'Onvoldoende', kleur: '#E53935', beschrijving: 'De beheerorganisatie is niet of nauwelijks ingericht.' };
    },

    // Conclusie templates op basis van score
    getConclusie(percentage) {
        if (percentage >= 80) return 'De beheerorganisatie is goed ingericht en werkt grotendeels proactief en planmatig. Er is sprake van duidelijke regie, voldoende capaciteit en een heldere visie. Kleine verbeterpunten zijn er altijd, maar de basis is stevig.';
        if (percentage >= 60) return 'De organisatie beschikt over een goede basis met duidelijke structuren en processen. Er zijn echter verbeterpunten op het gebied van sturing, kennisborging of strategische betrokkenheid die aandacht verdienen.';
        if (percentage >= 40) return 'De organisatie beschikt over basisstructuren en capaciteit, maar mist regie, samenhang en sturing. Hierdoor ontstaat een reactieve, versnipperde werkwijze waarin prioritering, eigenaarschap en lange termijnontwikkeling ontbreken.';
        if (percentage >= 20) return 'De beheerorganisatie is beperkt ingericht. Er ontbreekt structuur, regie en een duidelijke visie. Het werk is overwegend reactief en ad-hoc, zonder centrale sturing of planmatige aanpak.';
        return 'De beheerorganisatie is niet of nauwelijks ingericht. Er is geen sprake van structureel beheer, kennisborging of sturing. Directe actie is nodig om een basis neer te zetten.';
    }
};
