/* Enkel nedräkning + YouTube-reveal — ändra här */
const TITLE = "Nedräkning till lansering";
// Sommartid (mar–okt): +02:00  •  Vintertid (okt–mar): +01:00
const TARGET = new Date("2025-08-15T09:10:00+02:00");
const TARGET_TEXT = "Mål: 31 december 2025 kl 23:59 (Stockholm)";

// Ange YouTube-video-ID, t.ex. "dQw4w9WgXcQ"
const YT_ID = "dQw4w9WgXcQ?si=9NUXI6f8ofYjhw2f";

/* ———— Ingen ändring behövs nedan ———— */

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

let timer = null;
let revealed = false;

function mountYouTube(id){
  // Bygg inbäddningen när det behövs (så vi inte laddar videon i förväg)
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", src);
  iframe.setAttribute("title", "YouTube video player");
  iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; web-share");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  el.videoMount.innerHTML = "";
  el.videoMount.appendChild(iframe);
}

function render(){
  const r = remaining(TARGET);
  el.days.textContent = pad(r.days, 2);
  el.hours.textContent = pad(r.hours);
  el.minutes.textContent = pad(r.minutes);
  el.seconds.textContent = pad(r.seconds);

  if(r.ms <= 0 && !revealed){
    revealed = true;
    clearInterval(timer);
    // Uppdatera rubriker
    document.getElementById("title").textContent = "Nu är det dags!";
    el.revealTitle.textContent = "Välkommen – filmen startar 👇";

    // Visa videon
    mountYouTube(YT_ID);
    el.reveal.classList.remove("hidden");
    el.reveal.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Start
render();
timer = setInterval(render, 1000);
