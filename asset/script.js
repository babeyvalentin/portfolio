function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function setYear(){
  const y = new Date().getFullYear();
  const el = qs("#year");
  if(el) el.textContent = String(y);
}

function renderIndex(){
  if(!window.PORTFOLIO) return;

  // Title/meta (optionnel : si tu veux injecter dynamiquement)
  document.title = `${window.PORTFOLIO.artistName} — Portfolio`;

  const grid = qs("#grid");
  if(!grid) return;

  const state = { filter: "all" };

  function cardHTML(p){
    return `
      <a class="card" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="${escapeHtml(p.title)}">
        <div class="thumb">
          <img loading="lazy" src="${p.cover}" alt="${escapeHtml(p.title)} — cover">
        </div>
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(p.title)}</h3>
          <div class="card__meta">
            <span class="tag">${escapeHtml(p.category)}</span>
          </div>
        </div>
      </a>
    `;
  }

  function render(){
    const items = window.PORTFOLIO.projects.filter(p => state.filter === "all" ? true : p.category === state.filter);
    grid.innerHTML = items.map(cardHTML).join("");
  }

  // Filters
  qsa(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      qsa(".filter").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.filter = btn.dataset.filter;
      render();
    });
  });

  // Bio modal
  const bioModal = qs("#bioModal");
  const bioBtn = qs("#bioBtn");
  const bioClose = qs("#bioClose");
  const bioContent = qs("#bioContent");

  if(bioContent) bioContent.innerHTML = window.PORTFOLIO.biography;

  bioBtn?.addEventListener("click", () => bioModal?.showModal());
  bioClose?.addEventListener("click", () => bioModal?.close());
  bioModal?.addEventListener("click", (e) => {
    if(e.target === bioModal) bioModal.close();
  });

  // PDF demo modal
  const pdfModal = qs("#pdfModal");
  const pdfBtn = qs("#pdfBtn");
  const pdfClose = qs("#pdfClose");
  const fakePdf = qs("#fakePdf");
  const pdfHint = qs("#pdfHint");

  pdfBtn?.addEventListener("click", () => pdfModal?.showModal());
  pdfClose?.addEventListener("click", () => pdfModal?.close());
  pdfModal?.addEventListener("click", (e) => {
    if(e.target === pdfModal) pdfModal.close();
  });
  fakePdf?.addEventListener("click", () => {
    if(pdfHint) pdfHint.hidden = false;
    setTimeout(() => { if(pdfHint) pdfHint.hidden = true; }, 1800);
  });

  render();
}

function renderProject(){
  if(!window.PORTFOLIO) return;
  const titleEl = qs("#pTitle");
  const catEl = qs("#pCat");
  const descEl = qs("#pDesc");
  const galEl = qs("#pGallery");
  if(!galEl) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p = window.PORTFOLIO.projects.find(x => x.id === id) || window.PORTFOLIO.projects[0];

  document.title = `${p.title} — ${window.PORTFOLIO.artistName}`;

  if(titleEl) titleEl.textContent = p.title;
  if(catEl) catEl.textContent = p.category;
  if(descEl) descEl.textContent = p.description || "";

  galEl.innerHTML = (p.images || []).map((src, i) => `
    <figure class="frame">
      <img loading="lazy" src="${src}" alt="${escapeHtml(p.title)} — image ${i+1}">
    </figure>
  `).join("");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

setYear();
renderIndex();
renderProject();
