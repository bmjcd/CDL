const originalMessages = [
    "Tu es incroyable ❤️","Une petite douceur rien que pour toi ✨","Tu illumines mon hiver ❄️",
    "Aujourd’hui, je te veux heureuse.","Je pense fort à toi 🧡","Tu es adorable",
    "Ton sourire = mon cadeau du jour.","Tu gères tellement bien la vie","Un chocolat chaud mental ☕",
    "Tu es magique ✨","Je suis fier de toi","Merci d’être toi ❤️",
    "Je te trouve géniale","Tu mérites tout ce qu’il y a de beau","Bisous givrés 😘",
    "Tu es précieuse","Tu comptes beaucoup pour moi","Ton énergie est magnifique",
    "J’adore ta douceur","Je te souhaite une journée splendide","Tu es magique ✨",
    "Je crois en toi","Tu rends le monde plus joli","Gros câlin virtuel 🤗"
];

const porte = document.getElementById("porte");
const maison = document.getElementById("maison");
const calendrier = document.getElementById("calendrier");

// State persisted in localStorage under 'avent_state'
// { opened: [1,2], messages: { '3':'msg used for case 3' } }
function loadState() {
    try {
        const raw = localStorage.getItem('avent_state');
        return raw ? JSON.parse(raw) : { opened: [], messages: {} };
    } catch (e) {
        return { opened: [], messages: {} };
    }
}

function saveState(state) {
    localStorage.setItem('avent_state', JSON.stringify(state));
}

let state = loadState();

// Apply persisted door position if present
function applyDoorPosition() {
    if (state.doorPos && state.doorPos.left != null && state.doorPos.top != null) {
        porte.style.position = 'absolute';
        porte.style.left = state.doorPos.left + '%';
        porte.style.top = state.doorPos.top + '%';
        const scale = (state.doorSize != null) ? state.doorSize : 1;
        porte.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
}
applyDoorPosition();

// Apply fullscreen house on mobile widths so `maison.png` colle aux bords
function applyMaisonFullscreenIfMobile() {
    const mobileThreshold = 600; // px, same threshold as interior logic
    const should = window.innerWidth <= mobileThreshold;
    if (should) {
        maison.classList.add('fullscreen-house');
        // prevent body scroll while home is fullscreen
        document.documentElement.style.overflow = 'hidden';
    } else {
        maison.classList.remove('fullscreen-house');
        document.documentElement.style.overflow = '';
    }
}
applyMaisonFullscreenIfMobile();
window.addEventListener('resize', applyMaisonFullscreenIfMobile);

// --- Import des positions fournies par l'utilisateur (appliquer une fois) ---
// Ces positions proviennent de la demande: elles remplaceront les positions existantes.
const importedPositionsPayload = {
    "1": {"left":11.57, "top":15.08, "sizeRatio":0.10500000000000001},
    "2": {"left":9.57, "top":93.35, "sizeRatio":0.10500000000000001},
    "3": {"left":89.29, "top":11.95, "sizeRatio":0.10500000000000001},
    "4": {"left":39.57, "top":19.92, "sizeRatio":0.10500000000000001},
    "5": {"left":28.43, "top":53.79, "sizeRatio":0.10500000000000001},
    "6": {"left":10.71, "top":67.74, "sizeRatio":0.10500000000000001},
    "7": {"left":11.57, "top":39.56, "sizeRatio":0.10500000000000001},
    "8": {"left":72.14, "top":23.91, "sizeRatio":0.10500000000000001},
    "9": {"left":24.71, "top":68.59, "sizeRatio":0.10500000000000001},
    "10": {"left":84.71, "top":92.78, "sizeRatio":0.10500000000000001},
    "11": {"left":91.29, "top":57.49, "sizeRatio":0.10500000000000001},
    "12": {"left":43.86, "top":33.87, "sizeRatio":0.10500000000000001},
    "13": {"left":24.14, "top":91.07, "sizeRatio":0.10500000000000001},
    "14": {"left":87.57, "top":33.87, "sizeRatio":0.10500000000000001},
    "15": {"left":38.43, "top":66.31, "sizeRatio":0.10500000000000001},
    "16": {"left":73.29, "top":61.48, "sizeRatio":0.10500000000000001},
    "17": {"left":24.71, "top":19.64, "sizeRatio":0.10500000000000001},
    "18": {"left":85.29, "top":73.43, "sizeRatio":0.10500000000000001},
    "19": {"left":71.57, "top":43.55, "sizeRatio":0.10500000000000001},
    "20": {"left":57.86, "top":83.11, "sizeRatio":0.10500000000000001},
    "21": {"left":10.14, "top":52.37, "sizeRatio":0.10500000000000001},
    "22": {"left":57, "top":20.21, "sizeRatio":0.10500000000000001},
    "23": {"left":35.57, "top":82.54, "sizeRatio":0.10500000000000001},
    "24": {"left":58.71, "top":62.61, "sizeRatio":0.15750000000000003}
};

// Appliquer et sauvegarder
state.positions = importedPositionsPayload;
saveState(state);
// Si l'intérieur est déjà affiché, regénérer immédiatement
const existingImg = calendrier.querySelector('img.interieur');
if (existingImg && existingImg.complete) {
    genererCases();
} else if (existingImg) {
    existingImg.addEventListener('load', genererCases, { once: true });
}
// Fin import

// Compute available messages by removing already-used messages saved in state.messages
function getAvailableMessages() {
    const used = Object.values(state.messages || {});
    return originalMessages.filter(m => !used.includes(m));
}

porte.addEventListener("click", function() {
    porte.classList.add("zoom");
    setTimeout(() => {
        maison.style.display = "none";
        calendrier.style.display = "block";
        afficherImageInterieur();
        genererCases();
    }, 700);
});

function afficherImageInterieur() {
    if (calendrier.querySelector('img.interieur')) return; // déjà ajoutée
    // Crée un wrapper qui contient l'image et l'overlay pour les cases
    let wrapper = calendrier.querySelector('.interior-wrapper');
    if (!wrapper) wrapper = document.createElement('div');
    wrapper.className = 'interior-wrapper';

    const img = document.createElement('img');
    img.className = 'interieur';
    img.src = 'interieurmaison.png'; // Mets ici le nom de ton image (assure-toi que le fichier existe)
    img.alt = 'Intérieur de la maison';
    // overlay pour placer les cases par-dessus l'image
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // ajouter image et overlay dans le wrapper puis wrapper dans calendrier
    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    calendrier.appendChild(wrapper);

    // Si écran mobile (petite largeur), mettre le wrapper en full-bleed pour coller aux bordures
    function applyFullscreenIfMobile() {
        const mobileThreshold = 600; // px
        const should = window.innerWidth <= mobileThreshold;
        if (should) {
            wrapper.classList.add('fullscreen');
            img.classList.add('fullscreen');
            overlay.classList.add('fullscreen');
            // prevent body scroll when fullscreen
            document.documentElement.style.overflow = 'hidden';
        } else {
            wrapper.classList.remove('fullscreen');
            img.classList.remove('fullscreen');
            overlay.classList.remove('fullscreen');
            document.documentElement.style.overflow = '';
        }
    }
    applyFullscreenIfMobile();
    window.addEventListener('resize', applyFullscreenIfMobile);
}

function genererCases() {
    // Conserver le wrapper et l'overlay
    const wrapper = calendrier.querySelector('.interior-wrapper');
    if (!wrapper) return; // rien à faire
    const overlay = wrapper.querySelector('.overlay');
    // vider l'overlay
    overlay.innerHTML = '';

    const available = getAvailableMessages();

    // Génération aléatoire des positions et tailles (persistées)
    state.positions = state.positions || {};

    // dimensions du wrapper pour convertir ratio -> pixels
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperWidth = wrapperRect.width || window.innerWidth;
    // wrapperHeight non nécessaire pour size, mais utile si besoin
    const wrapperHeight = wrapperRect.height || window.innerHeight;

    for (let i = 1; i <= 24; i++) {
        // créer position si inexistante
        if (!state.positions[i]) {
            // éviter les bords : marge en pourcentage
            const margin = 8; // %
            const left = Math.round((Math.random() * (100 - margin * 2) + margin) * 100) / 100;
            const top = Math.round((Math.random() * (100 - margin * 2) + margin) * 100) / 100;
            // taille ratio relative à la largeur du wrapper
            const minRatio = 0.08; // 8% of width
            const maxRatio = 0.14; // 14% of width
            let sizeRatio = Math.random() * (maxRatio - minRatio) + minRatio;
            if (i === 24) sizeRatio *= 1.5; // la case 24 un peu plus grosse
            state.positions[i] = { left, top, sizeRatio };
        }

        const pos = state.positions[i];

        const caseDiv = document.createElement('button');
        caseDiv.type = 'button';
        caseDiv.className = 'case';
        caseDiv.textContent = i;
        caseDiv.dataset.index = i;
        caseDiv.style.left = pos.left + '%';
        caseDiv.style.top = pos.top + '%';

        // calcul taille en px selon la largeur actuelle
        const sizePx = Math.max(28, Math.round(pos.sizeRatio * wrapperWidth));
        caseDiv.style.width = sizePx + 'px';
        caseDiv.style.height = sizePx + 'px';
        caseDiv.style.fontSize = Math.max(12, Math.round(sizePx * 0.45)) + 'px';

        // si déjà ouvert dans l'état, marquer
        if ((state.opened || []).includes(i)) {
            caseDiv.classList.add('ouverte');
        }

        caseDiv.addEventListener('click', function (ev) {
            ev.stopPropagation();
            const idxNum = parseInt(caseDiv.dataset.index, 10);
            if (caseDiv.classList.contains('ouverte') || caseDiv.classList.contains('opening')) return;

            // lancer l'animation d'ouverture
            caseDiv.classList.add('opening');

            const onEnd = function() {
                caseDiv.removeEventListener('animationend', onEnd);
                caseDiv.classList.remove('opening');
                caseDiv.classList.add('ouverte');

                // choisir un message disponible
                const avail = getAvailableMessages();
                let msg;
                if (avail.length > 0) {
                    const pick = Math.floor(Math.random() * avail.length);
                    msg = avail.splice(pick, 1)[0];
                } else {
                    msg = 'Joyeux Noël !';
                }

                // enregistrer dans l'état
                state.opened = Array.from(new Set([...(state.opened || []), idxNum]));
                state.messages = state.messages || {};
                state.messages[idxNum] = msg;
                saveState(state);

                afficherMessage(msg);
            };

            caseDiv.addEventListener('animationend', onEnd);
        });

        overlay.appendChild(caseDiv);
    }

    // sauvegarder positions si nouvellement générées
    saveState(state);

    // afficher le dernier message ouvert si présent
    const lastOpened = (state.opened || []).slice(-1)[0];
    if (lastOpened && state.messages && state.messages[lastOpened]) {
        afficherMessage(state.messages[lastOpened]);
    }
}

function afficherMessage(msg) {
    let msgDiv = document.querySelector('.message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        calendrier.parentNode.insertBefore(msgDiv, calendrier.nextSibling);
    }
    msgDiv.textContent = msg;
}

// Animation des flocons (clé conservée)
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes fall{0%{transform:translateY(0);}100%{transform:translateY(100vh);}}`;
document.head.appendChild(styleSheet);

// Optional: fonction pour réinitialiser l'état (utile pour debug)
window.aventReset = function() {
    state = { opened: [], messages: {} };
    saveState(state);
    location.reload();
};

// ------ UI controls (placement mode, randomize, reset, opacity) ------
let placementMode = false;
let moveDoorMode = false;
let doorDragging = false;
let _lastDoorLeft = null, _lastDoorTop = null;

function randomizePositions() {
    delete state.positions;
    saveState(state);
    // regénérer l'image et les cases
    if (!calendrier.querySelector('.interior-wrapper')) afficherImageInterieur();
    // allow image load to trigger generation
    const img = calendrier.querySelector('img.interieur');
    if (img && img.complete) {
        genererCases();
    }
}

function clearPositions() {
    delete state.positions;
    saveState(state);
    location.reload();
}

function resetAll() {
    localStorage.removeItem('avent_state');
    location.reload();
}

// Placement mode: click on interior-wrapper to set position for selected case
function enablePlacementMode(enable) {
    placementMode = !!enable;
    const btn = document.getElementById('placementToggle');
    btn.textContent = placementMode ? 'Placement: ON' : 'Mode placement';
}

// compute overlap helper for manual placement (returns true if overlap found)
function checkOverlapCandidate(leftPct, topPct, sizeRatio, skipIndex) {
    const wrapper = calendrier.querySelector('.interior-wrapper');
    const rect = wrapper.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    const cx = (leftPct/100) * w;
    const cy = (topPct/100) * h;
    const radius = Math.max(24, Math.round(sizeRatio * w)) / 2 + 4;
    for (const k in state.positions) {
        if (skipIndex && Number(k) === Number(skipIndex)) continue;
        const ex = state.positions[k];
        const exCx = (ex.left/100) * w;
        const exCy = (ex.top/100) * h;
        const exRadius = Math.max(24, Math.round(ex.sizeRatio * w)) /2 + 4;
        const dx = cx - exCx; const dy = cy - exCy;
        if (Math.sqrt(dx*dx + dy*dy) < (radius + exRadius)) return true;
    }
    return false;
}

// Attach listeners to editor buttons (if present)
document.addEventListener('click', function attachEditorHandlers(e){
    // attach only once when DOM ready
    if (!document.getElementById('editorPanel')) return;
    document.removeEventListener('click', attachEditorHandlers);

    document.getElementById('randomizeBtn').addEventListener('click', function(){
        if (confirm('Réorganiser aléatoirement les positions?')) randomizePositions();
    });
    // Import positions JSON (paste)
    const importBtn = document.getElementById('importPositionsBtn');
    if (importBtn) {
        importBtn.addEventListener('click', function(){
            const raw = prompt('Colle le JSON des positions ici (ex: {"1":{"left":10,"top":20,"sizeRatio":0.1}, ...})');
            if (!raw) return;
            try {
                const parsed = JSON.parse(raw);
                // basic validation: must be an object
                if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Format invalide');
                state.positions = parsed;
                saveState(state);
                // ensure interior exists and regenerate
                if (!calendrier.querySelector('.interior-wrapper')) afficherImageInterieur();
                const img = calendrier.querySelector('img.interieur');
                if (img && img.complete) {
                    genererCases();
                } else if (img) {
                    img.addEventListener('load', genererCases, { once: true });
                }
                alert('Positions importées et appliquées.');
            } catch (err) {
                alert('JSON invalide: ' + err.message);
            }
        });
    }
    document.getElementById('clearPositionsBtn').addEventListener('click', function(){
        if (confirm('Supprimer les positions existantes?')) clearPositions();
    });
    document.getElementById('resetOpenedBtn').addEventListener('click', function(){
        if (!confirm('Réinitialiser uniquement les ouvertures des cases ?\n(Cela gardera les positions et les messages seront supprimés)')) return;
        state.opened = [];
        state.messages = {};
        saveState(state);
        // Mettre à jour l'affichage : regénérer les cases et enlever le message affiché
        const msgDiv = document.querySelector('.message');
        if (msgDiv) msgDiv.remove();
        // Si calendrier visible, regénérer sinon il sera régénéré à l'ouverture
        if (calendrier.style.display !== 'none') genererCases();
    });
    document.getElementById('resetBtn').addEventListener('click', function(){
        if (confirm('Réinitialiser tout (ouvertures + messages + positions)?')) resetAll();
    });

    const placementToggle = document.getElementById('placementToggle');
    placementToggle.addEventListener('click', function(){
        enablePlacementMode(!placementMode);
    });

    // Move door button: toggles drag mode
    const moveDoorBtn = document.getElementById('moveDoorBtn');
    if (moveDoorBtn) {
        moveDoorBtn.addEventListener('click', function(){
            moveDoorMode = !moveDoorMode;
            moveDoorBtn.textContent = moveDoorMode ? 'Déplacer porte: ON' : 'Déplacer porte';
            porte.style.cursor = moveDoorMode ? 'move' : '';
        });
    }

    const opacityRange = document.getElementById('opacityRange');
    const opacityVal = document.getElementById('opacityVal');
    opacityRange.addEventListener('input', function(){
        // set the background alpha for cases only (keeps text and borders fully visible)
        document.documentElement.style.setProperty('--case-bg-alpha', opacityRange.value);
        opacityVal.textContent = opacityRange.value;
    });

    // placement click handler
    const wrapperClick = function(ev){
        if (!placementMode) return;
        const wrapper = calendrier.querySelector('.interior-wrapper');
        if (!wrapper) return;
        const r = wrapper.getBoundingClientRect();
        const left = ((ev.clientX - r.left) / r.width * 100);
        const top = ((ev.clientY - r.top) / r.height * 100);
        const caseNum = Number(document.getElementById('placementCase').value) || 1;
        const minRatio = 0.07; const maxRatio = 0.14; let sizeRatio = (minRatio+maxRatio)/2;
        if (caseNum === 24) sizeRatio *= 1.5;
        // Enregistrement sans vérification de chevauchement (placement manuel autorise les recouvrements)
        state.positions = state.positions || {};
        state.positions[caseNum] = { left: Math.round(left*100)/100, top: Math.round(top*100)/100, sizeRatio };
        saveState(state);
        // Ne pas désactiver le mode placement pour permettre plusieurs placements successifs
        genererCases();
    };

    // Delegate click events on the wrapper
    document.body.addEventListener('click', function(ev){
        const target = ev.target;
        const wrapper = calendrier.querySelector('.interior-wrapper');
        if (wrapper && (wrapper === target || wrapper.contains(target))) {
            wrapperClick(ev);
        }
    });
    
    // Pointer handlers for dragging the door when moveDoorMode is active
    porte.addEventListener('pointerdown', function(ev){
        if (!moveDoorMode) return;
        ev.preventDefault();
        doorDragging = true;
    });
    document.addEventListener('pointermove', function(ev){
        if (!doorDragging) return;
        const rect = maison.getBoundingClientRect();
        let leftPct = ((ev.clientX - rect.left) / rect.width) * 100;
        let topPct = ((ev.clientY - rect.top) / rect.height) * 100;
        leftPct = Math.min(98, Math.max(2, leftPct));
        topPct = Math.min(98, Math.max(2, topPct));
        _lastDoorLeft = Math.round(leftPct * 100) / 100;
        _lastDoorTop = Math.round(topPct * 100) / 100;
        porte.style.position = 'absolute';
        porte.style.left = _lastDoorLeft + '%';
        porte.style.top = _lastDoorTop + '%';
        const scaleNow = (state.doorSize != null) ? state.doorSize : 1;
        porte.style.transform = `translate(-50%, -50%) scale(${scaleNow})`;
    });
    document.addEventListener('pointerup', function(ev){
        if (!doorDragging) return;
        doorDragging = false;
        if (_lastDoorLeft != null && _lastDoorTop != null) {
            state.doorPos = { left: _lastDoorLeft, top: _lastDoorTop };
            saveState(state);
        }
    });

    // Door size slider handler
    const doorSizeRange = document.getElementById('doorSizeRange');
    const doorSizeVal = document.getElementById('doorSizeVal');
    if (doorSizeRange && doorSizeVal) {
        const initial = (state.doorSize != null) ? Math.round(state.doorSize * 100) : 100;
        doorSizeRange.value = initial;
        doorSizeVal.textContent = initial + '%';
        doorSizeRange.addEventListener('input', function(){
            const pct = Number(doorSizeRange.value);
            const scale = pct / 100;
            state.doorSize = scale;
            saveState(state);
            doorSizeVal.textContent = pct + '%';
            // apply immediately
            // preserve current door position if present
            if (state.doorPos && state.doorPos.left != null && state.doorPos.top != null) {
                porte.style.position = 'absolute';
                porte.style.left = state.doorPos.left + '%';
                porte.style.top = state.doorPos.top + '%';
            }
            porte.style.transform = `translate(-50%, -50%) scale(${scale})`;
        });
    }
});
