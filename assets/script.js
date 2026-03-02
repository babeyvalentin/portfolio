function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function setYear(){
  const y = new Date().getFullYear();
  const el = qs("#year");
  if(el) el.textContent = String(y);
}

/* -------- Random overview (from all images) -------- */
function getAllImagesByCategory(category){
  const p = window.PORTFOLIO?.projects || [];
  const imgs = [];
  for(const proj of p){
    if(category && proj.category !== category) continue;
    // on pioche dans images + cover (cover en premier)
    if(proj.cover) imgs.push({src: proj.cover, projectId: proj.id, title: proj.title});
    for(const src of (proj.images || [])){
      imgs.push({src, projectId: proj.id, title: proj.title});
    }
  }
  return imgs;
}

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderOverview(category){
const ratios = [
  { cls: "r-portrait", w: 3, h: 4, weight: 24 },
  { cls: "r-tall",     w: 2, h: 3, weight: 14 },
  { cls: "r-square",   w: 1, h: 1, weight: 12 },
  { cls: "r-landscape",w: 4, h: 3, weight: 22 },
  { cls: "r-wide",     w: 16,h: 9, weight: 18 },
  { cls: "r-pano",     w: 21,h: 9, weight: 10 }
];

function pickWeighted(list){
  const total = list.reduce((s,x)=>s + x.weight, 0);
  let r = Math.random() * total;
  for(const item of list){
    r -= item.weight;
    if(r <= 0) return item;
  }
  return list[list.length - 1];
}

grid.innerHTML = shuffled.map(item => {
  const r = pickWeighted(ratios);
  const offset = Math.random() < 0.55 ? "" : `offset-${1 + Math.floor(Math.random()*3)}`;
  return `
    <a class="masonryItem ${r.cls} ${offset}" href="project.html?id=${encodeURIComponent(item.projectId)}">
      <img loading="lazy" src="${item.src}" alt="${escapeHtml(item.title)}">
    </a>
  `;
}).join("");
}

/* -------- Bio modal -------- */
function setupBio(){
  const bioModal = qs("#bioModal");
  const bioBtn = qs("#bioBtn");
  const bioClose = qs("#bioClose");
  const bioContent = qs("#bioContent");

  if(bioContent && window.PORTFOLIO?.biography){
    bioContent.innerHTML = window.PORTFOLIO.biography;
  }

  bioBtn?.addEventListener("click", () => bioModal?.showModal());
  bioClose?.addEventListener("click", () => bioModal?.close());
  bioModal?.addEventListener("click", (e) => {
    if(e.target === bioModal) bioModal.close();
  });
}

/* -------- Home filters -------- */
function setupHome(){
  if(!window.PORTFOLIO) return;

  // si tu veux que le nom vienne du data.js
  const homeName = qs("#homeName");
  if(homeName && window.PORTFOLIO.artistName) homeName.textContent = window.PORTFOLIO.artistName;

let current = "Commercial";
renderOverview(current);

  qsa(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      qsa(".filter").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      current = btn.dataset.filter;
      renderOverview(current);
    });
  });

  qs("#rerollBtn")?.addEventListener("click", () => renderOverview(current));
}

/* -------- Project page (si tu gardes project.html) -------- */
function renderProject(){
  if(!window.PORTFOLIO) return;
  const galEl = qs("#pGallery");
  if(!galEl) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = (window.PORTFOLIO.projects || []).find(x => x.id === id) || (window.PORTFOLIO.projects || [])[0];
  if(!p) return;

  document.title = `${p.title} — ${window.PORTFOLIO.artistName || "Portfolio"}`;

  const titleEl = qs("#pTitle");
  const catEl = qs("#pCat");
  const descEl = qs("#pDesc");

  if(titleEl) titleEl.textContent = p.title;
  if(catEl) catEl.textContent = p.category || "";
  if(descEl) descEl.textContent = p.description || "";

  galEl.innerHTML = (p.images?.length ? p.images : [p.cover].filter(Boolean)).map((src, i) => `
    <figure class="frame">
      <img loading="lazy" src="${src}" alt="${escapeHtml(p.title)} — image ${i+1}">
    </figure>
  `).join("");
}

/* init */
setYear();
setupBio();
setupHome();
renderProject();
