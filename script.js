/* Enkel nedräkning + YouTube-reveal — ändra här */
const TITLE = "Nedräkning till något svängigt";
// Sommartid (mar–okt): +02:00  •  Vintertid (okt–mar): +01:00
const TARGET = new Date("2025-08-15T10:00:00+02:00");
const TARGET_TEXT = "💃🏻Klockan 10 den 15 augusti smäller det🕺🏻";

// Ange YouTube-video-ID, t.ex. "dQw4w9WgXcQ"
const YT_ID = "dQw4w9WgXcQ?si=9NUXI6f8ofYjhw2f";

/* ====== 2) Läs URL-parametrar för embed-styrning ======
   ?title=...&t=2025-12-31T23%3A59%3A59%2B01%3A00&text=...&yt=VIDEOID
*/
const params = new URLSearchParams(location.search);
const TITLE = params.get("title") || DEFAULT_TITLE;
const TARGET_ISO = params.get("t") || DEFAULT_TARGET_ISO;
const TARGET = new Date(TARGET_ISO);
const TARGET_TEXT = params.get("text") || DEFAULT_TEXT;
const YT_ID = params.get("yt") || DEFAULT_YT_ID;

/* ====== 3) Koppla upp DOM ====== */
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

/* ====== 4) YouTube-mount när tiden gått ut ====== */
function mountYouTube(id){
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", src);
  iframe.setAttribute("title", "YouTube video player");
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  el.videoMount.innerHTML = "";
  el.videoMount.appendChild(iframe);
}

/* ====== 5) Render-loop ====== */
let timer = null;
let revealed = false;

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
    // scrolla inte om sidan är inbäddad (kan irritera i små iframes)
    if (window.self === window.top) {
      el.reveal.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
render();
timer = setInterval(render, 1000);

/* ====== 6) Inbäddningskod ======
   Skapar en iframe-kod med nuvarande parametrar (title/t/text/yt).
*/
function currentEmbedUrl(){
  // Bygg en absolut URL till denna sida + parametrar
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
  // Rimlig standardhöjd som funkar fint för den här layouten
  return `<iframe src="${src}"
  style="width:100%;max-width:900px;height:560px;border:0;border-radius:12px;overflow:hidden"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="autoplay; encrypted-media; picture-in-picture"></iframe>`;
}

function openEmbedModal(){
  el.embedCode.value = buildIframeCode();
  el.modal.classList.remove("hidden");
  el.embedCode.focus();
  el.embedCode.select();
}

function closeEmbedModal(){
  el.modal.classList.add("hidden");
}

async function copyEmbed(){
  const text = el.embedCode.value;
  try{
    await navigator.clipboard.writeText(text);
    showToast("Kopierat!");
  }catch{
    // Fallback – markera och låt användaren kopiera manuellt
    el.embedCode.focus();
    el.embedCode.select();
    showToast("Kunde inte använda urklipp – markera och kopiera manuellt.");
  }
}

let toastTimer = null;
function showToast(msg){
  el.toast.textContent = msg;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.toast.classList.add("hidden"), 1800);
}

/* ====== 7) Eventhantering ====== */
el.btnEmbed.addEventListener("click", openEmbedModal);
el.embedClose.addEventListener("click", closeEmbedModal);
el.embedDone.addEventListener("click", closeEmbedModal);
el.embedCopy.addEventListener("click", copyEmbed);

// Stäng modal om man klickar utanför kortet
el.modal.addEventListener("click", (e)=>{
  if(e.target === el.modal) closeEmbedModal();
});
