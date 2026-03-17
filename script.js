/* ============================================================
   script.js — TypeFree Application Logic
   Covers: dictionary loading, word validation, session state,
   typing event handlers, live stats, WPM calculation,
   accuracy calculation, word display rendering, session
   start/stop/reset, results overlay, WPM canvas graph,
   whitelist management, Elite Settings system (cookies,
   presets, colors, fonts, sounds, toggles, save/reset).
   ============================================================ */

/* ══════════════════════════════════════════════════
   DICTIONARY — full English word list (~370k words)
   Loaded async from dwyl/english-words (SCOWL/Aspell)
══════════════════════════════════════════════════ */

/** @type {Set<string>} The main dictionary, populated after async load */
let DICT = new Set();

/** @type {boolean} True once the full dictionary has loaded (or fallback is ready) */
let dictReady = false;

/* ─── Fallback seed dictionary ─── */
/* Used for validation while the full word list is downloading */
const SEED = new Set(`a,able,about,above,accept,across,act,add,admit,afraid,after,age,ago,agree,air,all,allow,almost,alone,along,already,also,although,always,among,an,and,another,answer,any,appear,are,area,around,as,ask,at,away,back,bad,be,became,because,become,been,before,begin,behind,believe,best,better,between,big,both,boy,bring,but,by,call,came,can,care,carry,certainly,change,child,children,city,close,come,could,course,day,decided,deep,did,different,do,does,done,door,down,during,each,early,end,enough,even,ever,every,eye,face,fact,family,far,feel,few,find,fine,first,follow,for,force,form,found,friend,from,front,full,gave,get,give,go,going,good,got,great,ground,grow,had,hand,happen,hard,has,have,he,her,here,high,him,his,home,hope,how,however,idea,if,in,instead,into,is,it,its,just,keep,kind,knew,know,large,last,late,later,learn,left,less,let,life,light,like,little,live,long,look,lost,lot,love,made,make,man,many,maybe,me,might,mind,more,most,move,much,must,my,name,need,never,new,next,night,no,not,now,of,off,often,old,on,once,only,open,or,other,our,out,over,own,part,people,perhaps,person,place,plan,point,possible,put,read,really,reason,rest,right,room,said,same,saw,say,second,see,seem,set,several,she,show,since,small,so,some,soon,state,stay,still,stop,such,sure,take,tell,than,that,the,their,them,then,there,these,they,think,this,those,thought,through,time,to,together,told,too,took,town,try,turn,two,under,until,up,use,very,voice,walk,want,was,way,we,well,went,were,what,when,where,whether,which,while,who,why,will,with,without,word,work,world,would,write,year,yes,yet,you,your,yourself,above,absence,absolute,accept,access,account,achieve,action,active,adapt,address,adjust,adopt,adult,advantage,advice,afford,agenda,aid,aim,alarm,announce,apply,argue,arrange,arrive,aside,aspect,assess,assign,assist,assume,attention,attitude,authority,avoid,award,balance,base,basic,basis,battle,bear,beat,beauty,benefit,bill,bit,blame,block,blood,blue,book,born,bottom,break,broad,build,burden,burn,busy,buy,calm,cause,challenge,chance,charge,check,choice,choose,circle,claim,clear,collect,column,combine,commit,compare,complete,complex,continue,control,connect,consider,create,current,damage,deal,decide,defend,define,deliver,deny,design,develop,difference,difficult,direct,discuss,divide,doubt,draw,drive,drop,earn,easy,edge,effort,ensure,enter,equal,error,evaluate,event,evidence,examine,except,exist,expect,experience,explain,extend,fail,fair,fall,fast,feature,focus,forget,forward,free,future,gather,general,goal,guide,health,hold,hurt,image,impact,improve,include,increase,indicate,influence,inform,inside,involve,issue,level,likely,list,local,major,manage,market,mean,measure,method,model,moment,natural,number,offer,office,order,outcome,outside,page,partner,past,perform,personal,power,present,primary,process,produce,project,prove,provide,public,purpose,reach,receive,reduce,refer,reflect,relate,remain,report,require,research,result,return,review,risk,role,rule,run,save,seek,service,share,short,simple,situation,skill,social,solve,specific,stand,start,step,study,success,suggest,support,system,target,task,teach,team,test,understand,update,value,view,visit,happy,heart,heavy,height,honor,human,judge,knowledge,language,leader,limit,master,matter,memory,middle,money,month,morning,music,national,notice,paper,parent,phone,picture,press,prison,range,ready,remove,river,round,school,section,sense,single,sister,sleep,stone,store,strong,summer,table,theme,though,three,travel,truth,twice,unless,water,weather,welcome,within,written,wrong,yesterday,beautiful,begin,below,beside,beyond,breath,bridge,bright,broken,brother,catch,certain,chair,chance,clean,clever,clock,cold,color,command,corner,count,couple,cover,crazy,cross,culture,dark,deep,despite,discover,distance,dream,earth,either,escape,evening,exact,express,false,famous,final,forest,front,glass,global,grade,green,heart,honor,hundred,hurt,interest,itself,jump,lose,lower,meaning,nature,nobody,normal,outside,peace,ready,reason,remove,result,round,single,sister,skill,sleep,solve,stone,store,strong,summer,support,theme,together,token,twice,unless,water,weather,welcome,within,young`.split(','));

/* ─── Tech / modern vocabulary seed ─── */
/* Words the SCOWL list may be missing; always treated as valid */
`api app application apps async await backend bandwidth blog bluetooth boot browser bug build cache cdn chat checkbox cli click cloud cluster code codec commit compiler config console container cookie cpu cpu cursor dashboard data database debug deploy desktop dev developer device display docker domain download drag dropdown email emoji encoder endpoint enum error event export fetch file filename firewall font form framework frontend function git gpu gui hash header host hover html http https icon ide import index input install interface internet ios javascript json kernel keyboard keystroke laptop launch library linux login logout loop macos markdown memory menu merge message mobile modem monitor mouse network node npm null object offline online open operating output package param parse password patch payload permission plugin port privacy process processor profile prompt protocol proxy python queue radio readme regex release render repo request resolution response restart router runtime screen script search select server settings shortcut sidebar software sql ssh ssl stack startup status storage string stylesheet sudo sync system tab tablet tag technology terminal theme thread token toolbar tooltip touchpad traceroute tweet type typewriter typing ui update upload url user username version virtual virus vpn web webapp webmaster website whitelist widget wifi window windows wireless workflow`.split(/\s+/).forEach(w => SEED.add(w.trim().toLowerCase()));

/**
 * Asynchronously fetches the full English word list (~370k words, one per line)
 * from dwyl/english-words on GitHub, parses it into the DICT Set, and merges
 * the tech/modern SEED words. Falls back gracefully to SEED on network error.
 */
async function loadDictionary() {
  const statusEl = document.getElementById('dictStatus');
  const barEl    = document.getElementById('dictBar');
  const wrapEl   = document.getElementById('dictLoadWrap');

  // Full SCOWL English word list from dwyl/english-words, ~370,000 words, one per line
  const URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error('fetch failed');

    const reader  = res.body.getReader();
    const total   = parseInt(res.headers.get('Content-Length') || '0', 10);
    let received  = 0;
    let chunks    = [];

    /* Stream the response, updating the progress bar as chunks arrive */
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total > 0) {
        const pct = Math.min(100, Math.round((received / total) * 100));
        barEl.style.width = pct + '%';
        statusEl.textContent = `loading dictionary… ${pct}%`;
      }
    }

    barEl.style.width = '100%';
    statusEl.textContent = 'parsing…';

    /* Concatenate all Uint8Array chunks into a single buffer, then decode */
    const text  = new TextDecoder().decode(
      chunks.reduce((a, b) => { const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c; }, new Uint8Array(0))
    );

    /* Build the Set from newline-separated words */
    const words = text.split('\n');
    DICT = new Set(words.map(w => w.trim().toLowerCase()).filter(w => w.length > 0));

    /* Merge tech/modern SEED words that may be absent from the SCOWL list */
    SEED.forEach(w => DICT.add(w));

    /* Additional compound & modern terms the raw word list sometimes misses */
    'typewriter typewriters website websites webapp webapps application applications smartphone smartphones touchscreen touchscreens screenshot screenshots dropdown dropdowns checkbox checkboxes scrollbar scrollbars sidebar sidebars toolbar toolbars tooltip tooltips trackpad trackpads touchpad touchpads screensaver screensavers filesystem filesystems username usernames password passwords permalink permalinks hashtag hashtags emoji emojis podcast podcasts selfie selfies bluetooth wifi internet software hardware keyboard keystrokes laptop desktop monitor printer scanner router modem browser tab click hover drag scroll zoom login logout signup signup dashboard analytics backend frontend fullstack devops sysadmin'.split(' ').forEach(w => DICT.add(w));

    dictReady = true;
    statusEl.textContent = `✓ ${DICT.size.toLocaleString()} words loaded`;
    barEl.style.background = 'var(--ok)';

    /* Fade out the loading bar after a short delay */
    setTimeout(() => {
      wrapEl.style.opacity = '0';
      wrapEl.style.transform = 'translateY(-6px)';
      setTimeout(() => { wrapEl.style.display = 'none'; }, 400);
    }, 800);

  } catch (err) {
    /* Network failure: fall back to the smaller seed dictionary */
    DICT = new Set(SEED);
    dictReady = true;
    statusEl.textContent = '⚠ offline — using 5k-word fallback';
    barEl.style.background = 'var(--error)';
    barEl.style.width = '100%';
    setTimeout(() => {
      wrapEl.style.opacity = '0';
      setTimeout(() => { wrapEl.style.display = 'none'; }, 400);
    }, 2500);
  }
}

/**
 * Checks whether a typed word is considered valid.
 * Handles contractions (don't, it's) and possessives (john's).
 * Words shorter than 2 characters are always valid.
 * Whitelisted words are always valid regardless of the dictionary.
 *
 * @param {string} word - The typed word to validate
 * @returns {boolean} True if the word is valid
 */
function isValidWord(word) {
  const w = word.toLowerCase().replace(/[^a-z']/g, '');
  if (!w || w.length <= 1) return true;      // single chars always valid
  if (whitelist.has(w)) return true;          // user-whitelisted words always valid

  const dict = dictReady ? DICT : SEED;       // use SEED while full dict loads

  if (dict.has(w)) return true;

  /* Contractions: don't, it's, i've → check the base word before the apostrophe */
  if (/^[a-z]+'[a-z]+$/.test(w)) {
    const base = w.split("'")[0];
    return dict.has(base);
  }

  /* Possessives: john's → check "john" */
  if (/^[a-z]+'s$/.test(w)) {
    return dict.has(w.slice(0, -2));
  }

  return false;
}

/* ══════════════════════════════════════════════════
   SESSION STATE
   All mutable state for the current typing session
══════════════════════════════════════════════════ */

/** @type {number|null} Timestamp (ms) when the current session started */
let startTime   = null;

/** @type {number|null} setInterval handle for the live timer tick */
let timerHandle = null;

/** @type {number|null} Duration limit in seconds for timed modes (null = free) */
let timerLimit  = null;

/** @type {number} Elapsed seconds in the current session */
let elapsed     = 0;

/** @type {boolean} True while a typing session is in progress */
let active      = false;

/** @type {number[]} Array of WPM snapshots recorded every 500ms during a session */
let wpmHistory  = [];

/** @type {Set<string>} User-defined words that are always treated as valid */
let whitelist   = new Set();

/** @type {boolean} When false, repeated words don't count toward WPM */
let allowRepeat = true;

/* ─── DOM Element References ─── */
const typeInput    = document.getElementById('typeInput');
const wordDisplay  = document.getElementById('wordDisplay');
const hint         = document.getElementById('hint');
const wpmVal       = document.getElementById('wpmVal');
const accVal       = document.getElementById('accVal');
const timeVal      = document.getElementById('timeVal');
const wordsVal     = document.getElementById('wordsVal');
const validCount   = document.getElementById('validCount');
const invalidCount = document.getElementById('invalidCount');
const charCount    = document.getElementById('charCount');
const stopBtn      = document.getElementById('stopBtn');
const graphSection = document.getElementById('graphSection');
const wpmCanvas    = document.getElementById('wpmCanvas');
const graphPeak    = document.getElementById('graphPeak');
const ctx2d        = wpmCanvas.getContext('2d');

/* ══════════════════════════════════════════════════
   TIMER MODES
══════════════════════════════════════════════════ */

/**
 * Switches to a timed mode (30s / 60s / 120s).
 * Marks the clicked tab as active and resets the session.
 *
 * @param {number} seconds - Duration in seconds
 * @param {HTMLElement} btn - The mode tab button that was clicked
 */
function setTimer(seconds, btn) {
  timerLimit = seconds;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  resetSession();
}

/* Free (∞) mode tab — clears the timer limit */
document.querySelectorAll('.mode-tab')[0].addEventListener('click', function() {
  timerLimit = null;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  this.classList.add('active');
  resetSession();
});

/* ══════════════════════════════════════════════════
   CORE TYPING LOGIC
══════════════════════════════════════════════════ */

/* Attach the main input and keydown listeners to the hidden textarea */
typeInput.addEventListener('input', onInput);
typeInput.addEventListener('keydown', onKeyDown);

/**
 * Handles keydown events on the textarea.
 * Escape resets the session; any printable character starts a new session.
 *
 * @param {KeyboardEvent} e
 */
function onKeyDown(e) {
  if (e.key === 'Escape') { resetSession(); return; }
  if (!active && e.key.length === 1) startSession();
}

/**
 * Starts a new typing session: records the start time, launches the
 * interval ticker, hides the hint, and reveals the stats bar.
 */
function startSession() {
  active    = true;
  startTime = Date.now();
  elapsed   = 0;
  wpmHistory = [];
  stopBtn.style.display = '';
  hint.classList.add('hidden');
  revealStats();

  /* Tick every 500ms: update elapsed time display, push WPM snapshot, redraw graph */
  timerHandle = setInterval(() => {
    elapsed = (Date.now() - startTime) / 1000;
    timeVal.textContent = timerLimit
      ? `${Math.max(0, timerLimit - Math.floor(elapsed))}s`  /* countdown for timed mode */
      : `${Math.floor(elapsed)}s`;                            /* count-up for free mode */

    const wpm = calcWPM();
    wpmVal.textContent = wpm;
    wpmHistory.push(wpm);
    drawGraph();

    /* Auto-stop when the timer limit is reached */
    if (timerLimit && elapsed >= timerLimit) stopSession(true);
  }, 500);
}

/**
 * Fired on every input event in the textarea.
 * Starts the session if needed, re-renders the word display, and updates stats.
 */
function onInput() {
  if (!active && typeInput.value.trim().length > 0) startSession();
  if (!active) return;
  renderWords();
  updateLiveStats();
}

/**
 * Re-renders the word display overlay by splitting the current textarea
 * value into tokens (words and spaces) and wrapping each word in a
 * <span> with the appropriate state class: valid, invalid, or current.
 */
function renderWords() {
  const raw    = typeInput.value;

  /* Split into word tokens and space tokens; process each */
  const tokens = raw.match(/\S+|\s+/g) || [];
  let html = '';
  let wordTokenIdx = 0;

  /* Count only non-space tokens to determine which is the last (current) word */
  const wordTokenCount = tokens.filter(t => !/\s+/.test(t)).length;

  for (const token of tokens) {
    if (/\s+/.test(token)) {
      /* Preserve whitespace as-is (includes spaces and newlines) */
      html += token;
    } else {
      /* Determine if this is the word currently being typed */
      const isLast = (wordTokenIdx === wordTokenCount - 1) && !raw.endsWith(' ');
      const valid  = isValidWord(token);
      const cls    = isLast ? 'word current' : (valid ? 'word valid' : 'word invalid');
      const escaped = token.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html += `<span class="${cls}">${escaped}</span>`;
      wordTokenIdx++;
    }
  }

  wordDisplay.innerHTML = html;
}

/**
 * Calculates the current WPM based on completed, valid words.
 * Formula: (total valid chars / 5) / elapsed minutes.
 * Repeated words are excluded when allowRepeat is false.
 *
 * @returns {number} Rounded WPM value
 */
function calcWPM() {
  if (!startTime) return 0;
  const mins = (Date.now() - startTime) / 60000;
  if (mins < 0.002) return 0;    /* avoid division by near-zero */

  const raw = typeInput.value;
  const tokens = raw.split(/\s+/).filter(Boolean);

  /* Only count words that have been "committed" (followed by a space) */
  const completedTokens = raw.endsWith(' ') ? tokens : tokens.slice(0, -1);

  let validChars = 0;
  const seenWords = new Set();

  for (const w of completedTokens) {
    const lw = w.toLowerCase();
    if (!allowRepeat && seenWords.has(lw)) continue;  /* skip repeated words */
    if (!isValidWord(w)) continue;                    /* skip invalid words */
    seenWords.add(lw);
    validChars += w.length + 1; /* +1 for the trailing space */
  }

  return Math.round((validChars / 5) / mins);
}

/**
 * Calculates the accuracy as the percentage of completed words that are valid.
 * Excludes the word currently being typed (no trailing space yet).
 *
 * @returns {number|null} Accuracy 0–100, or null if no completed words yet
 */
function calcAccuracy() {
  const text = typeInput.value.trim();
  if (!text) return null;

  const tokens = text.split(/\s+/).filter(Boolean);
  const raw    = typeInput.value;

  /* Only evaluate completed (space-terminated) words */
  const completedWords = raw.endsWith(' ')
    ? tokens
    : tokens.slice(0, -1);

  if (completedWords.length === 0) return null;

  const valid = completedWords.filter(w => isValidWord(w)).length;
  return Math.round((valid / completedWords.length) * 100);
}

/**
 * Updates all live stats in the stats bar and meta-info row:
 * WPM, accuracy (with color coding), total words, valid/invalid counts,
 * and total character count.
 */
function updateLiveStats() {
  const text   = typeInput.value;
  const wpm    = calcWPM();
  const acc    = calcAccuracy();
  const tokens = text.split(/\s+/).filter(Boolean);
  const raw    = text;

  const completedTokens = raw.endsWith(' ')
    ? tokens
    : tokens.slice(0, -1);

  const validW   = completedTokens.filter(w => isValidWord(w)).length;
  const invalidW = completedTokens.length - validW;

  wpmVal.textContent  = wpm;
  accVal.textContent  = acc !== null ? `${acc}%` : '—';
  wordsVal.textContent = completedTokens.length;
  validCount.textContent   = validW;
  invalidCount.textContent = invalidW;
  charCount.textContent    = text.length;

  /* Color-code the accuracy stat value */
  accVal.className = 'stat-value';
  if (acc === null)  accVal.classList.add('neutral');
  else if (acc >= 85) accVal.classList.add('good');
  else if (acc >= 60) accVal.classList.add('neutral');
  else                accVal.classList.add('bad');
}

/* ══════════════════════════════════════════════════
   SESSION CONTROL
══════════════════════════════════════════════════ */

/**
 * Stops the current session (manually or automatically after a timer).
 * Computes final stats, populates the results overlay, and shows it.
 *
 * @param {boolean} [auto=false] - True when called automatically by the timer
 */
function stopSession(auto = false) {
  if (!active) return;
  clearInterval(timerHandle);
  active = false;
  stopBtn.style.display = 'none';

  /* Compute final session statistics */
  const finalWpm  = calcWPM();
  const finalAcc  = calcAccuracy();
  const finalSecs = Math.round((Date.now() - startTime) / 1000);
  const text      = typeInput.value.trim();
  const tokens    = text.split(/\s+/).filter(Boolean);
  const raw       = typeInput.value;
  const completed = raw.endsWith(' ') ? tokens : tokens.slice(0,-1);
  const validW    = completed.filter(w => isValidWord(w)).length;
  const invalidW  = completed.length - validW;

  /* Populate result overlay fields */
  document.getElementById('rWpm').textContent    = finalWpm;
  document.getElementById('rAcc').textContent    = finalAcc !== null ? `${finalAcc}%` : '—';
  document.getElementById('rTime').textContent   = finalSecs;
  document.getElementById('rWords').textContent  = completed.length;
  document.getElementById('rValid').textContent  = validW;
  document.getElementById('rInvalid').textContent = invalidW;

  /* Color-code the result accuracy value */
  const rAcc = document.getElementById('rAcc');
  rAcc.className = 'result-val';
  if (finalAcc === null || finalAcc < 60) rAcc.classList.add('err');
  else if (finalAcc >= 85) rAcc.classList.add('ok');

  drawGraph();
  graphSection.classList.add('visible');

  /* Brief delay before showing the results overlay so graph animates in first */
  setTimeout(() => {
    document.getElementById('resultsOverlay').classList.add('show');
  }, 300);
}

/**
 * Resets the entire session back to the initial state.
 * Clears the textarea, stats, graph, and focuses the input.
 */
function resetSession() {
  clearInterval(timerHandle);
  active    = false;
  startTime = null;
  elapsed   = 0;
  wpmHistory = [];
  typeInput.value = '';
  wordDisplay.innerHTML = '';
  hint.classList.remove('hidden');
  stopBtn.style.display = 'none';
  wpmVal.textContent   = '0';
  accVal.textContent   = '—';
  timeVal.textContent  = timerLimit ? `${timerLimit}s` : '0s';
  wordsVal.textContent = '0';
  validCount.textContent   = '0';
  invalidCount.textContent = '0';
  charCount.textContent    = '0';
  accVal.className = 'stat-value neutral';
  wpmVal.className = 'stat-value neutral';
  graphSection.classList.remove('visible');
  ctx2d.clearRect(0, 0, wpmCanvas.width, wpmCanvas.height);
  typeInput.focus();
}

/** Hides the results overlay (dismiss button handler). */
function hideResults() {
  document.getElementById('resultsOverlay').classList.remove('show');
}

/**
 * Staggered animation to fade-in the stat blocks in the stats bar.
 * Called once at session start and once shortly after page load.
 */
function revealStats() {
  document.querySelectorAll('.stat').forEach((s, i) => {
    setTimeout(() => s.classList.add('visible'), i * 80);
  });
}

/* Reveal stats on initial page load after a brief visual settle */
setTimeout(() => revealStats(), 400);

/* ══════════════════════════════════════════════════
   WPM GRAPH (Canvas)
══════════════════════════════════════════════════ */

/**
 * Resizes the canvas backing buffer to match the device pixel ratio,
 * preventing blurry rendering on high-DPI displays.
 */
function resizeCanvas() {
  const rect = wpmCanvas.getBoundingClientRect();
  wpmCanvas.width  = rect.width  * devicePixelRatio;
  wpmCanvas.height = rect.height * devicePixelRatio;
  ctx2d.scale(devicePixelRatio, devicePixelRatio);
}

/* Re-size and redraw on window resize */
window.addEventListener('resize', () => {
  resizeCanvas();
  drawGraph();
});

resizeCanvas();

/**
 * Draws the WPM-over-time line graph on the canvas element.
 * Renders a grid, a gradient fill under the curve, the Bézier curve line,
 * and endpoint dots. Requires at least 2 data points to render.
 */
function drawGraph() {
  if (wpmHistory.length < 2) return;

  const W = wpmCanvas.getBoundingClientRect().width;
  const H = wpmCanvas.getBoundingClientRect().height;
  ctx2d.clearRect(0, 0, W, H);

  const max = Math.max(...wpmHistory, 1);
  const min = 0;

  /* Update the peak WPM label in the graph header */
  graphPeak.textContent = `peak ${max} wpm`;

  /* ── Horizontal grid lines at 25%, 50%, 75%, 100% ── */
  ctx2d.strokeStyle = 'rgba(90,90,114,0.2)';
  ctx2d.lineWidth   = 1;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = H - f * H * 0.85 - H * 0.1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, y);
    ctx2d.lineTo(W, y);
    ctx2d.stroke();
  });

  /* ── Gradient fill under the curve ── */
  const grad = ctx2d.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   'rgba(247,111,142,0.25)');
  grad.addColorStop(1,   'rgba(247,111,142,0.0)');

  /* Map WPM history to canvas coordinates */
  const pts = wpmHistory.map((v, i) => ({
    x: (i / (wpmHistory.length - 1)) * W,
    y: H - ((v - min) / (max - min)) * H * 0.85 - H * 0.1
  }));

  /* Fill path using cubic Bézier curves for smooth appearance */
  ctx2d.beginPath();
  ctx2d.moveTo(pts[0].x, H);
  ctx2d.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1].x + pts[i].x) / 2;
    ctx2d.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx2d.lineTo(pts[pts.length-1].x, H);
  ctx2d.closePath();
  ctx2d.fillStyle = grad;
  ctx2d.fill();

  /* ── Stroke the curve line ── */
  ctx2d.beginPath();
  ctx2d.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1].x + pts[i].x) / 2;
    ctx2d.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx2d.strokeStyle = 'rgba(247,111,142,0.85)';
  ctx2d.lineWidth   = 2;
  ctx2d.stroke();

  /* ── Endpoint dots (start and most recent) ── */
  [pts[0], pts[pts.length-1]].forEach(p => {
    ctx2d.beginPath();
    ctx2d.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx2d.fillStyle = 'rgba(247,111,142,1)';
    ctx2d.fill();
  });
}

/* ══════════════════════════════════════════════════
   WHITELIST
══════════════════════════════════════════════════ */

/**
 * Toggles the whitelist panel open/closed and updates the nav button state.
 *
 * @param {HTMLElement} btn - The "+ whitelist" nav button
 */
function toggleWhitelist(btn) {
  const panel = document.getElementById('whitelistPanel');
  panel.classList.toggle('open');
  btn.classList.toggle('active');
}

/* Allow pressing Enter in the whitelist input to add a word */
document.getElementById('whitelistInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addWhitelistWord();
});

/**
 * Reads the whitelist input, adds the word to the whitelist Set,
 * re-renders the tags and the word display.
 */
function addWhitelistWord() {
  const inp = document.getElementById('whitelistInput');
  const val = inp.value.trim().toLowerCase();
  if (!val || whitelist.has(val)) { inp.value = ''; return; }
  whitelist.add(val);
  inp.value = '';
  renderWhitelistTags();
  renderWords(); /* refresh display with updated validity */
}

/**
 * Removes a word from the whitelist Set and updates the tag display.
 *
 * @param {string} word - The word to remove
 */
function removeWhitelistWord(word) {
  whitelist.delete(word);
  renderWhitelistTags();
  renderWords();
}

/**
 * Re-renders all whitelist tag pills inside the tags container,
 * attaching a click handler to each × button for removal.
 */
function renderWhitelistTags() {
  const container = document.getElementById('whitelistTags');
  container.innerHTML = '';
  whitelist.forEach(w => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${w}<span class="tag-remove" onclick="removeWhitelistWord('${w}')">×</span>`;
    container.appendChild(tag);
  });
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */

/* Auto-focus the textarea and initialize the timer display on page load */
typeInput.focus();
timeVal.textContent = timerLimit ? `${timerLimit}s` : '0s';

/* Begin loading the full dictionary in the background */
loadDictionary();

/* ══════════════════════════════════════════════════
   ELITE SETTINGS SYSTEM
   Persistent per-user customization via cookies.
   Covers: themes, colors, fonts, sounds, and UI toggles.
══════════════════════════════════════════════════ */

/* ─── Cookie helpers ─── */

/**
 * Sets a cookie with a given name, value, and expiry.
 *
 * @param {string} name   - Cookie name
 * @param {string} val    - Cookie value (will be URI-encoded)
 * @param {number} [days=365] - Expiry in days
 */
function setCookie(name, val, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(val)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Reads a cookie value by name.
 *
 * @param {string} name - Cookie name
 * @returns {string|null} Decoded value or null if not found
 */
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Deletes a cookie by setting its expiry to the past.
 *
 * @param {string} name - Cookie name to delete
 */
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

/* ─── Default settings ─── */
/* These values are used on first visit or after a reset */
const DEFAULTS = {
  accent:    '#F76F8E',   /* primary accent color */
  bg:        '#0e0e10',   /* page background */
  surface:   '#16161a',   /* card surfaces */
  text:      '#cccce0',   /* body text */
  error:     '#f43f5e',   /* invalid word color */
  ok:        '#34d399',   /* valid word color */
  monoFont:  'JetBrains Mono',  /* typing area font family */
  fontSize:  '1.35',     /* typing area font size (rem) */
  volume:    '0.4',      /* keypress sound volume (0–1) */
  pitch:     '0.08',     /* keypress pitch variation (0–0.4) */
  soundPreset: 'none',   /* active sound preset name */
  noiseOn:    'false',   /* grain texture overlay toggle */
  caretGlow:  'true',    /* glowing caret effect toggle */
  animStats:  'true',    /* stat number animations toggle */
  allowRepeat:'true',    /* whether repeated words count toward WPM */
  activePreset: '',      /* ID of the last applied color preset */
};

/** @type {Object} Live settings object; mutated by all settings controls */
let settings = { ...DEFAULTS };

/* ─── All theme presets (Catppuccin + Classic) ─── */
/* Each entry: id, display name, sub-label, 5-dot swatch, and color values */
const ALL_PRESETS = [
  // ── Catppuccin Mocha ──
  { id:'cat-mocha-pink',   name:'Pink',    sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#f38ba8','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#f38ba8', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-mauve',  name:'Mauve',   sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#cba6f7','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#cba6f7', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-blue',   name:'Blue',    sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#89b4fa','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#89b4fa', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-sky',    name:'Sky',     sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#89dceb','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#89dceb', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-teal',   name:'Teal',    sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#94e2d5','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#94e2d5', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-green',  name:'Green',   sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#a6e3a1','#f38ba8'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#a6e3a1', error:'#f38ba8', ok:'#94e2d5' },
  { id:'cat-mocha-yellow', name:'Yellow',  sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#f9e2af','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#f9e2af', error:'#f38ba8', ok:'#a6e3a1' },
  { id:'cat-mocha-peach',  name:'Peach',   sub:'Mocha',   group:'catmocha',
    swatch:['#1e1e2e','#313244','#cdd6f4','#fab387','#a6e3a1'],
    bg:'#1e1e2e', surface:'#313244', text:'#cdd6f4', accent:'#fab387', error:'#f38ba8', ok:'#a6e3a1' },

  // ── Catppuccin Macchiato ──
  { id:'cat-mac-pink',     name:'Pink',    sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#ed8796','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#ed8796', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-mauve',    name:'Mauve',   sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#c6a0f6','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#c6a0f6', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-blue',     name:'Blue',    sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#8aadf4','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#8aadf4', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-sky',      name:'Sky',     sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#91d7e3','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#91d7e3', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-teal',     name:'Teal',    sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#8bd5ca','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#8bd5ca', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-green',    name:'Green',   sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#a6da95','#ed8796'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#a6da95', error:'#ed8796', ok:'#8bd5ca' },
  { id:'cat-mac-yellow',   name:'Yellow',  sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#eed49f','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#eed49f', error:'#ed8796', ok:'#a6da95' },
  { id:'cat-mac-peach',    name:'Peach',   sub:'Macchiato', group:'catmacchiato',
    swatch:['#24273a','#363a4f','#cad3f5','#f5a97f','#a6da95'],
    bg:'#24273a', surface:'#363a4f', text:'#cad3f5', accent:'#f5a97f', error:'#ed8796', ok:'#a6da95' },

  // ── Catppuccin Frappé ──
  { id:'cat-fra-pink',     name:'Pink',    sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#e78284','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#e78284', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-mauve',    name:'Mauve',   sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#ca9ee6','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#ca9ee6', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-blue',     name:'Blue',    sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#8caaee','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#8caaee', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-sky',      name:'Sky',     sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#99d1db','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#99d1db', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-teal',     name:'Teal',    sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#81c8be','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#81c8be', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-green',    name:'Green',   sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#a6d189','#e78284'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#a6d189', error:'#e78284', ok:'#81c8be' },
  { id:'cat-fra-yellow',   name:'Yellow',  sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#e5c890','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#e5c890', error:'#e78284', ok:'#a6d189' },
  { id:'cat-fra-peach',    name:'Peach',   sub:'Frappé', group:'catfrappe',
    swatch:['#303446','#414559','#c6d0f5','#ef9f76','#a6d189'],
    bg:'#303446', surface:'#414559', text:'#c6d0f5', accent:'#ef9f76', error:'#e78284', ok:'#a6d189' },

  // ── Catppuccin Latte (light theme) ──
  { id:'cat-lat-pink',     name:'Pink',    sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#d20f39','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#d20f39', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-mauve',    name:'Mauve',   sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#8839ef','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#8839ef', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-blue',     name:'Blue',    sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#1e66f5','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#1e66f5', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-sky',      name:'Sky',     sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#04a5e5','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#04a5e5', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-teal',     name:'Teal',    sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#179299','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#179299', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-green',    name:'Green',   sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#40a02b','#d20f39'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#40a02b', error:'#d20f39', ok:'#179299' },
  { id:'cat-lat-yellow',   name:'Yellow',  sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#df8e1d','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#df8e1d', error:'#d20f39', ok:'#40a02b' },
  { id:'cat-lat-peach',    name:'Peach',   sub:'Latte', group:'catlatte',
    swatch:['#eff1f5','#ccd0da','#4c4f69','#fe640b','#40a02b'],
    bg:'#eff1f5', surface:'#ccd0da', text:'#4c4f69', accent:'#fe640b', error:'#d20f39', ok:'#40a02b' },

  // ── Classic presets ──
  { id:'default',  name:'TypeFree',  sub:'Default',  group:'classic',
    swatch:['#0e0e10','#16161a','#cccce0','#F76F8E','#34d399'],
    bg:'#0e0e10', surface:'#16161a', text:'#cccce0', accent:'#F76F8E', error:'#f43f5e', ok:'#34d399' },
  { id:'midnight', name:'Midnight',  sub:'Indigo',   group:'classic',
    swatch:['#0a0a14','#12121e','#c4c4e0','#818cf8','#34d399'],
    bg:'#0a0a14', surface:'#12121e', text:'#c4c4e0', accent:'#818cf8', error:'#f87171', ok:'#34d399' },
  { id:'forest',   name:'Forest',    sub:'Green',    group:'classic',
    swatch:['#0a110e','#121a16','#b8d4c8','#34d399','#86efac'],
    bg:'#0a110e', surface:'#121a16', text:'#b8d4c8', accent:'#34d399', error:'#f87171', ok:'#86efac' },
  { id:'amber',    name:'Amber',     sub:'Warm',     group:'classic',
    swatch:['#0f0d08','#1a1610','#d4c9a0','#f59e0b','#34d399'],
    bg:'#0f0d08', surface:'#1a1610', text:'#d4c9a0', accent:'#f59e0b', error:'#f87171', ok:'#34d399' },
  { id:'rose',     name:'Rose Ice',  sub:'Soft',     group:'classic',
    swatch:['#120a0d','#1c1015','#e0bec4','#fb7185','#34d399'],
    bg:'#120a0d', surface:'#1c1015', text:'#e0bec4', accent:'#fb7185', error:'#f43f5e', ok:'#34d399' },
  { id:'slate',    name:'Slate',     sub:'GitHub',   group:'classic',
    swatch:['#0d1117','#161b22','#c9d1d9','#94a3b8','#3fb950'],
    bg:'#0d1117', surface:'#161b22', text:'#c9d1d9', accent:'#94a3b8', error:'#f87171', ok:'#3fb950' },
];

/**
 * Builds the theme preset button grids in the Themes settings panel.
 * Groups presets by their `group` property and injects them into the
 * matching `#pg-{group}` container element.
 */
function buildPresetGrids() {
  const groups = ['catmocha','catmacchiato','catfrappe','catlatte','classic'];
  groups.forEach(g => {
    const container = document.getElementById('pg-' + g);
    if (!container) return;
    const presets = ALL_PRESETS.filter(p => p.group === g);
    container.innerHTML = presets.map(p => `
      <button class="preset-btn ${settings.activePreset === p.id ? 'active' : ''}"
              onclick="applyPreset('${p.id}')"
              data-preset="${p.id}">
        <div>
          <div class="preset-swatch">
            ${p.swatch.map(c => `<span style="background:${c}"></span>`).join('')}
          </div>
          <div class="preset-name" style="margin-top:6px">${p.name}</div>
          <div class="preset-sub">${p.sub}</div>
        </div>
      </button>`).join('');
  });
}

/**
 * Applies a color preset by ID: copies its colors into `settings`,
 * calls applyAllSettings(), and marks the matching button as active.
 *
 * @param {string} id - Preset ID string (e.g. 'cat-mocha-pink')
 */
function applyPreset(id) {
  const p = ALL_PRESETS.find(x => x.id === id);
  if (!p) return;
  settings.accent  = p.accent;
  settings.bg      = p.bg;
  settings.surface = p.surface;
  settings.text    = p.text;
  settings.error   = p.error;
  settings.ok      = p.ok;
  settings.activePreset = id;
  applyAllSettings();
  /* Update active state on all preset buttons */
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === id);
  });
}

/**
 * Switches the visible settings panel and updates tab active states.
 *
 * @param {string} name - Panel name (e.g. 'themes', 'colors', 'fonts', 'sounds', 'interface')
 * @param {HTMLElement} btn - The tab button that was clicked
 */
function switchTab(name, btn) {
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');
}

/**
 * Reads all settings keys from cookies and populates the `settings` object.
 * Called once at boot before applying settings to the DOM.
 */
function loadSettingsFromCookies() {
  Object.keys(DEFAULTS).forEach(key => {
    const val = getCookie('tf_' + key);
    if (val !== null) settings[key] = val;
  });
}

/**
 * Applies all current settings values to the DOM:
 * - Updates CSS custom properties on :root
 * - Derives border/muted/sub/bright based on whether the bg is light or dark
 * - Loads and applies the chosen Google Font
 * - Sets font size on the typing area and word display
 * - Toggles the noise overlay opacity
 * - Syncs all settings panel UI controls
 */
function applyAllSettings() {
  const root = document.documentElement.style;

  /* Apply color tokens */
  root.setProperty('--accent',  settings.accent);
  root.setProperty('--caret',   settings.accent);   /* caret matches accent */
  root.setProperty('--bg',      settings.bg);
  root.setProperty('--surface', settings.surface);
  root.setProperty('--text',    settings.text);
  root.setProperty('--error',   settings.error);
  root.setProperty('--ok',      settings.ok);

  /* Derive neutral tones based on background lightness (dark vs light theme) */
  const isLight = isLightColor(settings.bg);
  if (isLight) {
    root.setProperty('--border', 'rgba(0,0,0,0.12)');
    root.setProperty('--muted',  'rgba(0,0,0,0.25)');
    root.setProperty('--sub',    'rgba(0,0,0,0.45)');
    root.setProperty('--bright', '#111111');
  } else {
    root.setProperty('--border', '#252530');
    root.setProperty('--muted',  '#3a3a4a');
    root.setProperty('--sub',    '#5a5a72');
    root.setProperty('--bright', '#eeeef8');
  }

  /* Load the chosen Google Font and apply it to the typing area */
  loadGoogleFont(settings.monoFont, () => {
    const fontStack = `'${settings.monoFont}', monospace`;
    root.setProperty('--mono', fontStack);
    document.getElementById('typeInput').style.fontFamily = fontStack;
    document.getElementById('wordDisplay').style.fontFamily = fontStack;
  });

  /* Apply font size */
  const fs = parseFloat(settings.fontSize) + 'rem';
  document.getElementById('typeInput').style.fontSize = fs;
  document.getElementById('wordDisplay').style.fontSize = fs;

  /* Noise overlay: controlled via CSS variable patched below */
  document.documentElement.style.setProperty('--noise-opacity',
    settings.noiseOn === 'true' ? '0.022' : '0');

  syncPanelUI();
}

/**
 * Determines whether a hex color is perceptually "light" using
 * the ITU-R BT.601 luma formula.
 *
 * @param {string} hex - A 6-digit hex color string (e.g. '#eff1f5')
 * @returns {boolean} True if the color is light
 */
function isLightColor(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (r*299 + g*587 + b*114) / 1000 > 128;
  } catch { return false; }
}

/**
 * Syncs all settings panel UI controls to match the current `settings` object.
 * Called whenever settings change so the panel reflects the live state.
 */
function syncPanelUI() {
  /* Color pickers and hex inputs */
  const colorFields = ['accent','bg','surface','text','error','ok'];
  colorFields.forEach(k => {
    const picker = document.getElementById('s_' + k);
    const hex    = document.getElementById('s_' + k + '_hex');
    if (picker) picker.value = settings[k];
    if (hex)    hex.value   = settings[k];
  });

  /* Font input */
  const fontInput = document.getElementById('s_monoFont');
  if (fontInput) fontInput.value = settings.monoFont;

  /* Font size slider */
  const fsSlider = document.getElementById('s_fontSize');
  if (fsSlider) {
    fsSlider.value = settings.fontSize;
    document.getElementById('s_fontSizeVal').textContent = parseFloat(settings.fontSize).toFixed(2) + 'rem';
  }

  /* Volume slider */
  const volSlider = document.getElementById('s_volume');
  if (volSlider) {
    volSlider.value = settings.volume;
    document.getElementById('s_volumeVal').textContent = Math.round(parseFloat(settings.volume)*100) + '%';
  }

  /* Pitch variation slider */
  const pitchSlider = document.getElementById('s_pitch');
  if (pitchSlider) {
    pitchSlider.value = settings.pitch;
    const pv = parseFloat(settings.pitch);
    document.getElementById('s_pitchVal').textContent = pv < 0.1 ? 'low' : pv < 0.25 ? 'med' : 'high';
  }

  /* Sound preset buttons */
  document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
  const sndBtn = document.getElementById('snd_' + settings.soundPreset);
  if (sndBtn) sndBtn.classList.add('active');

  /* Show/hide custom sound file upload row */
  const csr = document.getElementById('customSoundRow');
  if (csr) csr.style.display = settings.soundPreset === 'custom' ? '' : 'none';

  /* Toggle switches */
  setToggle('toggle_noise', settings.noiseOn === 'true');
  setToggle('toggle_caret', settings.caretGlow === 'true');
  setToggle('toggle_anim',  settings.animStats === 'true');
  setToggle('toggle_repeat', settings.allowRepeat === 'true');

  /* Sync the live allowRepeat flag */
  allowRepeat = settings.allowRepeat !== 'false';

  /* Font preview element */
  const fp = document.getElementById('fontPreview');
  if (fp) fp.style.fontFamily = `'${settings.monoFont}', monospace`;
}

/**
 * Sets a toggle element's visual on/off state by adding or removing 'on'.
 *
 * @param {string} id - Element ID of the toggle div
 * @param {boolean} on - Whether the toggle should appear enabled
 */
function setToggle(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  if (on) el.classList.add('on'); else el.classList.remove('on');
}

/* ─── Individual setting appliers ─── */

/**
 * Updates a single color key in settings and re-applies all settings.
 * Deselects any active preset (since the user is customizing).
 *
 * @param {string} key   - Settings key (e.g. 'accent')
 * @param {string} value - New hex color value
 */
function applySetting(key, value) {
  settings[key] = value;
  settings.activePreset = '';   /* custom color → deselect preset */
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  applyAllSettings();
  /* Mirror the new value into the hex text input */
  const hex = document.getElementById('s_' + key + '_hex');
  if (hex) hex.value = value;
}

/**
 * Validates and applies a color entered via the hex text field.
 * Only commits if the value is a valid 6-digit hex string.
 *
 * @param {string} key   - Settings key (e.g. 'accent')
 * @param {string} value - Raw text input value
 */
function syncColorFromText(key, value) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    settings[key] = value;
    const picker = document.getElementById('s_' + key);
    if (picker) picker.value = value;
    settings.activePreset = '';
    applyAllSettings();
  }
}

/**
 * Updates the font size setting and immediately applies it to the typing area.
 *
 * @param {string} val - Font size value as a string (e.g. '1.35')
 */
function applyFontSize(val) {
  settings.fontSize = val;
  document.getElementById('s_fontSizeVal').textContent = parseFloat(val).toFixed(2) + 'rem';
  const fs = parseFloat(val) + 'rem';
  document.getElementById('typeInput').style.fontSize = fs;
  document.getElementById('wordDisplay').style.fontSize = fs;
}

/**
 * Updates the volume setting and refreshes the display label.
 *
 * @param {string} val - Volume as a string between '0' and '1'
 */
function applyVolume(val) {
  settings.volume = val;
  document.getElementById('s_volumeVal').textContent = Math.round(parseFloat(val)*100) + '%';
}

/**
 * Updates the pitch variation setting and refreshes the display label.
 *
 * @param {string} val - Pitch variation as a string between '0' and '0.4'
 */
function applyPitch(val) {
  settings.pitch = val;
  const pv = parseFloat(val);
  document.getElementById('s_pitchVal').textContent = pv < 0.1 ? 'low' : pv < 0.25 ? 'med' : 'high';
}

/* ─── Google Font dynamic loader ─── */

/** @type {Set<string>} Tracks which font families have already been injected */
const loadedFonts = new Set(['JetBrains Mono', 'Syne']);

/**
 * Dynamically injects a Google Fonts <link> stylesheet for the given family.
 * No-ops if the font is already loaded. Calls the optional callback when done.
 *
 * @param {string}   name - Google Fonts family name (e.g. 'Fira Code')
 * @param {Function} [cb] - Callback to invoke after the font loads (or fails)
 */
function loadGoogleFont(name, cb) {
  if (!name || !name.trim()) { if(cb) cb(); return; }
  const family = name.trim();
  if (loadedFonts.has(family)) { if(cb) cb(); return; }
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g,'+')}:wght@300;400;500;700&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = url;
  link.onload  = () => { loadedFonts.add(family); if(cb) cb(); };
  link.onerror = () => { console.warn('Font not found:', family); if(cb) cb(); };
  document.head.appendChild(link);
}

/**
 * Updates the font preview element as the user types a font name,
 * loading the font from Google Fonts dynamically.
 *
 * @param {string} name - Font family name typed into the input
 */
function previewFont(name) {
  const fp = document.getElementById('fontPreview');
  if (!fp || !name.trim()) return;
  loadGoogleFont(name, () => { fp.style.fontFamily = `'${name.trim()}', monospace`; });
}

/**
 * Reads the font name input and applies the font to the full typing experience.
 */
function applyFont() {
  const val = document.getElementById('s_monoFont').value.trim();
  if (!val) return;
  settings.monoFont = val;
  applyAllSettings();
}

/**
 * Quick-applies a font suggestion (pill button) by name.
 * Updates the input field, previews, and applies immediately.
 *
 * @param {string} name - Font family name to apply
 */
function quickFont(name) {
  document.getElementById('s_monoFont').value = name;
  previewFont(name);
  settings.monoFont = name;
  applyAllSettings();
}

/* ─── Sound engine (Web Audio API) ─── */

/** @type {AudioContext|null} Lazily-created Web Audio context */
let audioCtx = null;

/** @type {AudioBuffer|null} Decoded buffer for a user-uploaded custom sound */
let customSoundBuffer = null;

/** @type {string} ID of the currently active sound preset */
let soundPreset = 'none';

/**
 * Returns the shared AudioContext, creating it on first call.
 *
 * @returns {AudioContext}
 */
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Sets the active sound preset and updates the UI buttons.
 * Plays a test sequence when switching to a non-silent preset.
 *
 * @param {string}      name - Preset name (none, click, mechanical, soft, typewriter, custom)
 * @param {HTMLElement} btn  - The button that was clicked
 */
function setSoundPreset(name, btn) {
  soundPreset = name;
  settings.soundPreset = name;
  document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  /* Show the file upload row only when 'custom' is selected */
  const csr = document.getElementById('customSoundRow');
  if (csr) csr.style.display = name === 'custom' ? '' : 'none';
  if (name !== 'none') testSound();
}

/**
 * Reads a user-selected audio file, decodes it into an AudioBuffer,
 * and optionally saves it to a cookie (files < 200KB only).
 *
 * @param {HTMLInputElement} input - The file input element
 */
function loadCustomSound(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('uploadLabel').textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    getAudioCtx().decodeAudioData(e.target.result.slice(0), buf => {
      customSoundBuffer = buf;
      /* Persist small files in a cookie for the next visit */
      if (e.target.result.byteLength < 200000) {
        const b64 = btoa(String.fromCharCode(...new Uint8Array(e.target.result)));
        setCookie('tf_customSound', b64, 365);
      }
    });
  };
  reader.readAsArrayBuffer(file);
}

/**
 * Restores a previously saved custom sound from its base64 cookie on page load.
 */
function loadCustomSoundFromCookie() {
  const b64 = getCookie('tf_customSound');
  if (!b64) return;
  try {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    getAudioCtx().decodeAudioData(buf.buffer, decoded => {
      customSoundBuffer = decoded;
      document.getElementById('uploadLabel').textContent = '(saved sound loaded)';
    });
  } catch(e) {}
}

/**
 * Synthesizes a short keystroke sound using the Web Audio API.
 * Each preset has different oscillator/buffer characteristics.
 * Pitch variation is applied randomly within the configured range.
 *
 * @param {string} preset - Sound preset name (click|mechanical|soft|typewriter)
 */
function playSynthSound(preset) {
  const ctx = getAudioCtx();
  const vol = parseFloat(settings.volume);
  const pitchVar = parseFloat(settings.pitch);
  const t = ctx.currentTime;
  const pitchMult = 1 + (Math.random() - 0.5) * pitchVar * 2; /* randomized pitch */

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (preset === 'click') {
    /* Sharp square-wave click with fast frequency sweep */
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 * pitchMult, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);
    gain.gain.setValueAtTime(vol * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain); osc.start(t); osc.stop(t + 0.04);

  } else if (preset === 'mechanical') {
    /* Band-pass filtered noise burst simulating a mechanical key */
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random()*2-1) * Math.pow(1 - i/data.length, 3);
    const src = ctx.createBufferSource(); src.buffer = buf;
    src.playbackRate.value = pitchMult;
    const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=900; f.Q.value=0.8;
    src.connect(f); f.connect(gain);
    gain.gain.setValueAtTime(vol*0.6,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.06);
    src.start(t);

  } else if (preset === 'soft') {
    /* Gentle sine sweep for a quiet, low-impact sound */
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(300*pitchMult,t); osc.frequency.exponentialRampToValueAtTime(80,t+0.08);
    gain.gain.setValueAtTime(vol*0.3,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    osc.connect(gain); osc.start(t); osc.stop(t+0.08);

  } else if (preset === 'typewriter') {
    /* High-pass filtered noise burst for a classic typewriter feel */
    const buf = ctx.createBuffer(1, ctx.sampleRate*0.08, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random()*2-1) * Math.pow(1-i/data.length,2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    src.playbackRate.value = (0.9+Math.random()*0.2)*pitchMult;
    const f = ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=600;
    src.connect(f); f.connect(gain);
    gain.gain.setValueAtTime(vol*0.5,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    src.start(t);
  }
}

/**
 * Plays the user's uploaded custom sound with pitch variation applied.
 */
function playCustomSound() {
  if (!customSoundBuffer) return;
  const ctx = getAudioCtx();
  const src = ctx.createBufferSource(); src.buffer = customSoundBuffer;
  src.playbackRate.value = 1+(Math.random()-0.5)*parseFloat(settings.pitch)*2;
  const gain = ctx.createGain(); gain.gain.value = parseFloat(settings.volume);
  src.connect(gain); gain.connect(ctx.destination); src.start();
}

/**
 * Plays the keystroke sound for the current preset.
 * Called on every relevant key event during typing.
 */
function playKeypressSound() {
  if (soundPreset === 'none') return;
  try {
    if (soundPreset === 'custom') { playCustomSound(); return; }
    playSynthSound(soundPreset);
  } catch(e) {}
}

/**
 * Plays a short 3-note test sequence to preview the active sound preset.
 */
function testSound() {
  [0, 0.12, 0.24].forEach(d => setTimeout(() => playKeypressSound(), d * 1000));
}

/* ─── UI toggle handlers ─── */

/** Toggles the grain noise overlay. @param {HTMLElement} el */
function toggleNoise(el) {
  el.classList.toggle('on');
  settings.noiseOn = el.classList.contains('on') ? 'true' : 'false';
  document.documentElement.style.setProperty('--noise-opacity', settings.noiseOn === 'true' ? '0.022' : '0');
}

/** Toggles the custom caret glow CSS effect. @param {HTMLElement} el */
function toggleCaretGlow(el) {
  el.classList.toggle('on');
  settings.caretGlow = el.classList.contains('on') ? 'true' : 'false';
}

/** Toggles animated stat number transitions. @param {HTMLElement} el */
function toggleAnimStats(el) {
  el.classList.toggle('on');
  settings.animStats = el.classList.contains('on') ? 'true' : 'false';
}

/**
 * Toggles whether repeated words count toward WPM.
 * Immediately re-renders the word display to reflect the new rule.
 *
 * @param {HTMLElement} el
 */
function toggleAllowRepeat(el) {
  el.classList.toggle('on');
  settings.allowRepeat = el.classList.contains('on') ? 'true' : 'false';
  allowRepeat = settings.allowRepeat === 'true';
  renderWords(); /* re-highlight immediately */
}

/* ─── Open / close settings drawer ─── */

/**
 * Opens the Elite Settings fullscreen drawer.
 * Builds preset grids, syncs all panel controls, and locks body scroll.
 */
function openSettings() {
  buildPresetGrids();
  syncPanelUI();
  document.getElementById('settingsDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the Elite Settings drawer and restores scroll / focus.
 */
function closeSettings() {
  document.getElementById('settingsDrawer').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => typeInput.focus(), 300);
}

/* Pressing Escape closes the settings drawer if it is open */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('settingsDrawer').classList.contains('open')) {
    closeSettings();
  }
});

/* ─── Save settings ─── */

/**
 * Persists all current settings to cookies.
 * Optionally closes the drawer afterwards.
 *
 * @param {boolean} [andClose=false] - If true, closes the drawer after saving
 */
function saveSettings(andClose = false) {
  Object.keys(settings).forEach(key => setCookie('tf_' + key, settings[key]));
  if (andClose) closeSettings();
  /* Briefly show a "✓ Saved!" confirmation on the save button */
  const btn = document.querySelector('.settings-footer .btn-primary');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Saved!';
    setTimeout(() => btn.innerHTML = orig, 1200);
  }
}

/* ─── Reset all settings to defaults ─── */

/**
 * Deletes all settings cookies and resets `settings` to DEFAULTS.
 * Also clears the custom sound buffer and resets the upload label.
 */
function resetAllSettings() {
  if (!confirm('Reset all settings to defaults?')) return;
  Object.keys(DEFAULTS).forEach(key => deleteCookie('tf_' + key));
  deleteCookie('tf_customSound');
  settings = { ...DEFAULTS };
  soundPreset = 'none';
  customSoundBuffer = null;
  const ul = document.getElementById('uploadLabel');
  if (ul) ul.textContent = 'Choose MP3 / WAV / OGG…';
  buildPresetGrids();
  applyAllSettings();
}

/* ─── Hook keyboard for per-keystroke sound playback ─── */
/* Plays the sound on printable characters and backspace */
typeInput.addEventListener('keydown', function(e) {
  if (e.key.length === 1 || e.key === 'Backspace') playKeypressSound();
});

/* ─── Noise overlay CSS variable patch ─── */
/* Injects a style rule so the ::before pseudo-element reads --noise-opacity */
(function() {
  const s = document.createElement('style');
  s.textContent = `body::before { opacity: var(--noise-opacity, 0.022); }`;
  document.head.appendChild(s);
})();

/* ─── BOOT SEQUENCE ─── */
/* Load saved settings from cookies, apply them, and initialize sounds */
loadSettingsFromCookies();
applyAllSettings();
if (settings.soundPreset === 'custom') setTimeout(loadCustomSoundFromCookie, 500);
soundPreset = settings.soundPreset;
