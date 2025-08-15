/* Enkel nedräkning + YouTube-reveal + inbäddningsknapp (fixad) */

/* ====== 1) Standardvärden ====== */
const DEFAULTS = {
  title: "Nedräkning till något svängigt",
  // Din tid: 15 aug 2025 kl 10:00 (Stockholm, sommartid +02:00)
  targetISO: "2025-08-15T10:00:00+02:00",
  text: "Klockan 10.00 den 15 augusti smäller det!",
  yt: "dQw4w9WgXcQ" // bara video-ID, inte hela URL
};

/* ====== 2) Hjälpare ====== */
function parseYouTubeId(input){
  if(!input) return "";
  // Om användaren klistrar in en hel URL – extrahera ID
  try {
    // Om det redan är ett ID (11 tecken A–Z a–z 0–9 _ -) – returnera direkt
    if (/^[\w-]{11}$/.test(input)) return input;

    const url = new URL(input, window.location.origin);
    // Vanliga format:
    // https://www.youtube.com/watch?v=ID
    // https://youtu.be/ID
    // https://www.youtube.com/embed/ID
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const pathParts = url.pathname.split("/").filter(Boolean);
    // youtu.be/ID eller /embed/ID
    const last = pathParts[pathParts.length - 1] || "";
    if (/^[\w-]{11}$/.test(last)) return last;

    // Sista nödlösning: rensa query-delen om någon klistrat "ID?si=..."
    return input.split("?")[0];
  } catch {
    // Inte en URL – ta bort ev. query-svans
    return input.split("?")[0];
  }
}

function pad(n, size=2){
  const s = String(n);
  return s.length >= size ? s : "0".repeat(size - s.length) + s;
}

function remaining(target){
  const now = new Date();
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { ms, days, hours, minutes, seconds };
}

/* ====== 3) Läs URL-parametrar (kan styra embed) ====== */
const params = new URLSearchParams(location.search);
const TITLE       = params.get("title") || DEFAULTS.title;
const TARGET_ISO  = params.get("t")     || DEFAULTS.targetISO;
const TARGET      = new Date(TARGET_ISO);
const TARGET_TEXT = params.get("text")  || DEFAULTS.text;
const YT_ID       = parseYouTubeId(params.get("yt") || DEFAULTS.yt);

/* ====== 4) Koppla upp DOM ====== */
document.getElementById("title").textContent = TITLE;
document.getElementById("targetText").textContent = TARGET_TEXT;

const el = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  reveal: document.getElementById("reveal"),
  videoMount: document.getElementById("videoMount"),
  revealTitle: document.getElementById("revealTitle"),
  btnEmbed: document.getElementById("btnEmbed"),
  modal: document.getElementById("embedModal"),
  embedCode: document.getElementById("embedCode"),
  embedClose: document.getElementById("embedClose"),
  embedDone: document.getElementById("embedDone"),
  embedCopy: document.getElementById("embedCopy"),
  toast: document.getElementById("toast"),
};

/* ====== 5) YouTube-mount när tiden gått ut ====== */
function mountYouTube(id){
  const cleanId = parseYouTubeId(id);
  if(!cleanId) return;
  const src = `https://www.youtube.com/embed/${cleanId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", src);
  iframe.setAttribute("title", "YouTube video player");
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  el.videoMount.innerHTML = "";
  el.videoMount.appendChild(iframe);
}

/* ====== 6) Render-loop ====== */
let timer = null;
let revealed = false;

// Skydda mot ogiltigt datum
if (isNaN(TARGET.getTime())) {
  document.getElementById("title").textContent = "Fel datumformat";
  document.getElementById("targetText").textContent = "Kontrollera parametern t=… (ISO 8601).";
} else {
  function render(){
    const r = remaining(TARGET);
    el.days.textContent = pad(r.days, 2);
    el.hours.textContent = pad(r.hours);
    el.minutes.textContent = pad(r.minutes);
    el.seconds.textContent = pad(r.seconds);

    if(r.ms <= 0 && !revealed){
      revealed = true;
      clearInterval(timer);
      document.getElementById("title").textContent = "Nu är det dags!";
      el.revealTitle.textContent = "Välkommen – filmen startar 👇";
      mountYouTube(YT_ID);
      el.reveal.classList.remove("hidden");
      if (window.self === window.top) {
        el.reveal.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
  render();
  timer = setInterval(render, 1000);
}

/* ====== 7) Inbäddningskod ====== */
function currentEmbedUrl(){
  const url = new URL(window.location.href);
  url.search = ""; // börja om
  const p = new URLSearchParams();
  p.set("title", TITLE);
  p.set("t", TARGET_ISO);
  p.set("text", TARGET_TEXT);
  p.set("yt", YT_ID);
  url.search = p.toString();
  return url.toString();
}

function buildIframeCode(){
  const src = currentEmbedUrl();
  return `<iframe src="${src}"
  style="width:100%;max-width:900px;height:560px;border:0;border-radius:12px;overflow:hidden"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="autoplay; encrypted-media; picture-in-picture"></iframe>`;
}

function openEmbedModal(){
  if(!el.modal) return; // om du kör varianten utan modal i HTML
  el.embedCode.value = buildIframeCode();
  el.modal.classList.remove("hidden");
  el.embedCode.focus();
  el.embedCode.select();
}

function closeEmbedModal(){
  if(!el.modal) return;
  el.modal.classList.add("hidden");
}

async function copyEmbed(){
  const text = el.embedCode.value;
  try{
    await navigator.clipboard.writeText(text);
    showToast("Kopierat!");
  }catch{
    el.embedCode.focus();
    el.embedCode.select();
    showToast("Kunde inte använda urklipp – kopiera manuellt.");
  }
}

let toastTimer = null;
function showToast(msg){
  if(!el.toast) return;
  el.toast.textContent = msg;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.toast.classList.add("hidden"), 1800);
}

/* ====== 8) Eventhantering ====== */
if (el.btnEmbed) {
  el.btnEmbed.addEventListener("click", openEmbedModal);
  el.embedClose.addEventListener("click", closeEmbedModal);
  el.embedDone.addEventListener("click", closeEmbedModal);
  el.embedCopy.addEventListener("click", copyEmbed);
  el.modal.addEventListener("click", (e)=>{
    if(e.target === el.modal) closeEmbedModal();
  });
}
