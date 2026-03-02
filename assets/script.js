function qs(sel, root=document){ return root.querySelector(sel); }

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWeighted(list){
  const total = list.reduce((s,x)=>s + x.w, 0);
  let r = Math.random() * total;
  for(const item of list){
    r -= item.w;
    if(r <= 0) return item;
  }
  return list[list.length - 1];
}

/* --- Bio modal --- */
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

/* --- Collect images (cover + images) --- */
function getAllImages(){
  const projects = window.PORTFOLIO?.projects || [];
  const out = [];

  for(const p of projects){
    if(p.cover) out.push({ src: p.cover, projectId: p.id, title: p.title });
    for(const src of (p.images || [])){
      out.push({ src, projectId: p.id, title: p.title });
    }
  }
  return out;
}

/* --- Editorial layout generator ---
   We simulate an “artsphere-like” rhythm: many medium tiles, some tall,
   some wide, some small. Using CSS Grid dense with spans. */
function renderEditorialOverview(){
  const grid = qs("#overviewGrid");
  if(!grid) return;

  const all = getAllImages();
  if(!all.length){
    grid.innerHTML = `<div style="color:rgba(242,242,242,.72)">Aucune image trouvée. Ajoute des images dans assets/data.js.</div>`;
    return;
  }

  // How many tiles to show on homepage
  const tiles = shuffle(all).slice(0, Math.min(42, all.length)); // ajuste 24–60

  // Weighted span presets: {c=colSpan, r=rowSpan}
  // 12-col grid: c ~ 2..8 ; r ~ 4..12
  const presets = [
    { c: 3, r: 6,  w: 28 }, // medium
    { c: 4, r: 6,  w: 22 }, // medium+
    { c: 3, r: 8,  w: 16 }, // tall-ish
    { c: 4, r: 9,  w: 10 }, // tall
    { c: 6, r: 6,  w: 9  }, // wide
    { c: 7, r: 5,  w: 6  }, // wide short
    { c: 2, r: 5,  w: 9  }, // small
  ];

  // Subtle vertical offsets to break strict rows (editorial feel)
  const yOffsets = [0, 0, 0, 6, 10, 14, 18];

  grid.innerHTML = tiles.map((item, idx) => {
    const p = pickWeighted(presets);

    // occasional “feature” tile
    const isFeature = (idx % 13 === 0) && (Math.random() > 0.35);
    const c = isFeature ? Math.min(8, p.c + 2) : p.c;
    const rspan = isFeature ? Math.min(12, p.r + 2) : p.r;

    const y = yOffsets[Math.floor(Math.random()*yOffsets.length)];
    const mood = Math.random() > 0.55 ? "is-soft" : "is-hard";

    return `
      <a class="ov ${mood}" style="--c:${c}; --rspan:${rspan}; --y:${y}px"
         href="project.html?id=${encodeURIComponent(item.projectId)}"
         aria-label="${escapeHtml(item.title)}">
        <img loading="lazy" src="${item.src}" alt="${escapeHtml(item.title)}">
      </a>
    `;
  }).join("");
}

/* --- Project page (si project.html existe) --- */
function renderProject(){
  const galEl = qs("#pGallery");
  if(!galEl || !window.PORTFOLIO) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = (window.PORTFOLIO.projects || []).find(x => x.id === id) || (window.PORTFOLIO.projects || [])[0];
  if(!p) return;

  const titleEl = qs("#pTitle");
  const catEl = qs("#pCat");
  const descEl = qs("#pDesc");

  document.title = `${p.title} — ${window.PORTFOLIO.artistName || "Portfolio"}`;
  if(titleEl) titleEl.textContent = p.title;
  if(catEl) catEl.textContent = p.category || "";
  if(descEl) descEl.textContent = p.description || "";

  const imgs = (p.images?.length ? p.images : [p.cover].filter(Boolean));
  galEl.innerHTML = imgs.map((src, i) => `
    <figure class="frame">
      <img loading="lazy" src="${src}" alt="${escapeHtml(p.title)} — image ${i+1}">
    </figure>
  `).join("");
}

/* init */
setupBio();
renderEditorialOverview();
renderProject();

document.querySelectorAll("a").forEach(link => {
  if(link.hostname === window.location.hostname){
    link.addEventListener("click", function(e){
      e.preventDefault();
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location = this.href;
      }, 350);
    });
  }
});
