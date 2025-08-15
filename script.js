/* Enkel nedräkning — ändra här */
const TITLE = "Varmt välkommen om";
// Sommartid (mar–okt): +02:00  •  Vintertid (okt–mar): +01:00
const TARGET = new Date("2025-08-18T08:00:00+01:00");
const TARGET_TEXT = "Knickedicken med kicken till KLK🥳";

/* ———— Ingen ändring behövs nedan ———— */

document.getElementById("title").textContent = TITLE;
document.getElementById("targetText").textContent = TARGET_TEXT;

const el = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
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

function render(){
  const r = remaining(TARGET);
  el.days.textContent = pad(r.days, 2);       // visa minst två siffror
  el.hours.textContent = pad(r.hours);
  el.minutes.textContent = pad(r.minutes);
  el.seconds.textContent = pad(r.seconds);

  // Stanna när vi nått målet
  if(r.ms <= 0){
    clearInterval(timer);
    // (valfritt) Ändra rubriken när mål nås:
    // document.getElementById("title").textContent = "Nu är det dags!";
  }
}

// Direkt render och därefter varje sekund
render();
const timer = setInterval(render, 1000);
