/* ============================================================
   TPMI — Public site renderer
   Builds the page from ContentStore.getPublished() for a language.
   ============================================================ */
(function () {
  const LANG_KEY = "tpmi_lang";
  const PREVIEW = new URLSearchParams(location.search).get("preview") === "1";
  function source(){ return PREVIEW ? ContentStore.getDraft() : ContentStore.getPublished(); }
  function getLang() {
    const u = new URLSearchParams(location.search).get("lang");
    if (u === "en" || u === "zh") return u;
    return localStorage.getItem(LANG_KEY) || "zh";
  }
  function setLang(l) { localStorage.setItem(LANG_KEY, l); }

  // bilingual field accessor
  function tv(field, lang) {
    if (field == null) return "";
    if (typeof field === "object" && !Array.isArray(field)) return field[lang] ?? field.en ?? "";
    return field;
  }
  function img(field, lang) {
    if (!field) return "";
    if (typeof field === "object") return field[lang] ?? field.en ?? "";
    return field;
  }
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const NAV = [
    { id:"news", key:"news" },
    { id:"intro", key:"intro" },
    { id:"about", key:"about" },
    { id:"partner", key:"partner" },
    { id:"leadership", key:"leadership" },
    { id:"research", key:"research" },
    { id:"access", key:"accessData" },
    { id:"collab", key:"collaboration" }
  ];

  function render(C, lang) {
    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";

    /* ---- nav ---- */
    const navHtml = NAV.map(n => `<a href="#${n.id}">${esc(tv(C[n.key].title, lang))}</a>`).join("");
    document.getElementById("nav-desktop").innerHTML = navHtml;
    document.getElementById("nav-drawer").innerHTML = navHtml;

    /* ---- lang toggle active ---- */
    document.querySelectorAll(".lang-toggle button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === lang));
    document.querySelector(".admin-link span").textContent = lang === "zh" ? "管理後台" : "Admin";

    const m = document.getElementById("site-content");
    const parts = [];

    /* ===== HERO ===== */
    parts.push(`
      <section class="hero" id="top">
        <img class="hero-desktop" src="${esc(C.hero.image)}" alt="TPMI">
        <img class="hero-mobile" src="${esc(C.hero.imageMobile)}" alt="TPMI">
        <div class="hero-cta"><button id="hero-btn"><span class="cta-label">${esc(tv(C.hero.buttonText, lang))}</span></button></div>
      </section>`);

    /* ===== NEWS ===== */
    parts.push(section("news", false, `
      ${head(lang==="zh"?"最新消息":"Latest", tv(C.news.title, lang))}
      ${C.news.items.map(it => newsCard(it, C.news.image, lang)).join("")}
    `));

    /* ===== INTRO ===== */
    parts.push(section("intro", true, `
      ${head(lang==="zh"?"精準醫療":"Why Taiwan", tv(C.intro.title, lang))}
      ${split(img(C.intro.image, lang), C.intro.paragraphs[lang], lang, false)}
    `));

    /* ===== ABOUT ===== */
    parts.push(section("about", false, `
      ${head("TPMI", tv(C.about.title, lang))}
      ${split(img(C.about.image, lang), C.about.paragraphs[lang], lang, true)}
    `));

    /* ===== DATA SNAPSHOTS (stats band) ===== */
    parts.push(`
      <section class="stats-band" id="stats">
        <div class="wrap">
          <div class="stats-head reveal">
            <span class="eyebrow light">${esc(tv(C.stats.subtitle,lang))}</span>
            <h2>${esc(tv(C.stats.title,lang))}</h2>
          </div>
          <div class="stats-grid reveal">
            ${C.stats.items.map(s=>`<div class="stat"><div class="stat-value" data-target="${esc(s.value)}">${esc(s.value)}</div><div class="stat-label">${esc(tv(s.label,lang))}</div></div>`).join("")}
          </div>
        </div>
      </section>`);

    /* ===== MILESTONES (HTML timeline) ===== */
    parts.push(section("milestones", true, `
      ${head(lang==="zh"?"歷程":"Timeline", tv(C.milestones.title, lang))}
      <div class="timeline reveal">
        <div class="tl-line"></div>
        ${C.milestones.events.map((ev,i)=>`
          <div class="tl-row ${i%2?'right':'left'}">
            <div class="tl-node"></div>
            <div class="tl-card">
              <div class="tl-meta"><span class="tl-year">${esc(ev.year)}</span><span class="tl-month">${esc(tv(ev.month,lang))}</span></div>
              <p>${esc(tv(ev.text,lang))}</p>
            </div>
          </div>`).join("")}
      </div>
    `));

    /* ===== PARTNER HOSPITALS (text + regions grid) ===== */
    const pProse = `<h3>${esc(tv(C.partner.heading, lang))}</h3>` +
      C.partner.paragraphs[lang].map(p=>`<p>${p}</p>`).join("");
    parts.push(section("partner", false, `
      ${head(lang==="zh"?"合作網絡":"Network", tv(C.partner.title, lang))}
      <div class="prose partner-intro reveal">${pProse}</div>
      <div class="region-eyebrow reveal">${esc(tv(C.partner.regionsTitle,lang))}</div>
      <div class="region-grid reveal">
        ${C.partner.regions.map(r=>`
          <div class="region-card" style="--rc:${esc(r.color)}">
            <div class="region-head"><span class="region-name">${esc(tv(r.name,lang))}</span><span class="region-count">${(r.hospitals[lang]||[]).length}</span></div>
            <ul class="region-list">${(r.hospitals[lang]||[]).map(h=>`<li>${esc(h)}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>
    `));

    /* ===== LEADERSHIP ===== */
    parts.push(section("leadership", true, `
      ${head(tv(C.leadership.subtitle,lang), tv(C.leadership.title, lang))}
      <div class="leader-grid reveal">
        ${C.leadership.leaders.map(l=>`<a href="${esc(l.link||'#')}" ${l.link?'target="_blank" rel="noopener"':''}><img src="${esc(l.img)}" alt="${esc(l.alt||'')}" loading="lazy"></a>`).join("")}
      </div>
      ${carousel("team", tv(C.teamCarousel.title,lang), C.teamCarousel.items.map(it=>carItem(img(it.img,lang), it.link)))}
      ${carousel("hteam", tv(C.hospitalTeam.title,lang), C.hospitalTeam.items.map(it=>carItem(img(it.img,lang), it.link)))}
    `));

    /* ===== RESEARCH ===== */
    parts.push(section("research", false, `
      ${head(lang==="zh"?"發表":"Publications", tv(C.research.title, lang))}
      <div class="research-grid reveal">
        <div class="paper-list">
          ${C.research.items.map(r=>`<a class="paper" href="${esc(r.url||'#')}" target="_blank" rel="noopener">
            <span class="paper-title">${esc(tv(r.title,lang))}</span>
            <span class="paper-authors">${esc(tv(r.authors,lang))}</span></a>`).join("")}
        </div>
        <div class="research-media"><img src="${esc(C.research.sideImage)}" alt="" loading="lazy"></div>
      </div>
    `));

    /* ===== ACCESS TO DATA (HTML platform cards) ===== */
    parts.push(section("access", true, `
      ${head(tv(C.accessData.subtitle,lang), tv(C.accessData.title, lang))}
      <div class="platform-grid reveal">
        ${C.accessData.cards.map(c=>{
          const inner = `
            <div class="platform-top"><span class="platform-name">${esc(c.name)}</span><span class="platform-tag">${esc(tv(c.tag,lang))}</span></div>
            <p class="platform-desc">${esc(tv(c.desc,lang))}</p>
            <div class="platform-foot">${ c.link ? `<span class="platform-cta">${lang==="zh"?"前往平台 →":"Open platform →"}</span>` : `<span class="platform-badge">${esc(tv(c.badge,lang))}</span>` }</div>`;
          return c.link
            ? `<a class="platform-card" href="${esc(c.link)}" target="_blank" rel="noopener">${inner}</a>`
            : `<div class="platform-card no-link">${inner}</div>`;
        }).join("")}
      </div>
    `));

    /* ===== COLLABORATION (HTML steps) ===== */
    parts.push(section("collab", false, `
      ${head(tv(C.collaboration.intro,lang), tv(C.collaboration.title, lang))}
      <ol class="steps reveal">
        ${C.collaboration.steps.map((s,i)=>`
          <li class="step">
            <span class="step-num">${i+1}</span>
            <div class="step-body"><h4>${esc(tv(s.title,lang))}</h4><p>${esc(tv(s.desc,lang))}</p></div>
          </li>`).join("")}
      </ol>
      <div class="collab-actions">
        <a class="btn-primary" href="${esc(C.collaboration.conceptSheetUrl)}" target="_blank" rel="noopener">${lang==="zh"?"下載 Concept Sheet 申請表":"Download Concept Sheet"}</a>
        <a class="btn-ghost" href="mailto:${esc(C.contact.email)}">${lang==="zh"?"來信洽詢":"Contact us"} · ${esc(C.contact.email)}</a>
      </div>
    `));

    m.innerHTML = parts.join("");

    /* ===== FOOTER ===== */
    document.getElementById("site-footer").innerHTML = `
      <div class="footer-inner">
        <img class="footer-logo" src="images/tpmi_logo.png" alt="TPMI">
        <div class="footer-meta">
          <div class="org">${esc(tv(C.contact.org,lang))}</div>
          <div>${esc(tv(C.contact.address,lang))}</div>
          <div><a href="mailto:${esc(C.contact.email)}">${esc(C.contact.email)}</a></div>
        </div>
        <div class="footer-copy">${esc(tv(C.contact.copyright,lang))}</div>
      </div>`;

    wireDynamic();
  }

  /* ---------- html builders ---------- */
  function section(id, tint, inner){ return `<section class="section ${tint?'tint':''}" id="${id}"><div class="wrap">${inner}</div></section>`; }
  function head(eyebrow, title){ return `<div class="section-head reveal"><span class="eyebrow">${esc(eyebrow)}</span><h2 class="section-title">${esc(title)}</h2></div>`; }
  function split(image, paras, lang, reverse){
    return `<div class="split ${reverse?'reverse':''} reveal">
      <div class="split-media"><img src="${esc(image)}" alt="" loading="lazy"></div>
      <div class="prose">${paras.map(p=>`<p>${p}</p>`).join("")}</div>
    </div>`;
  }
  function newsCard(it, fallbackImg, lang){
    const dls = (it.downloads||[]).map(d=>`<li><a href="${esc(d.url||'#')}" target="_blank" rel="noopener">${esc(tv(d.label,lang))}</a></li>`).join("");
    const hl = (it.highlights && it.highlights[lang]||[]).map(h=>`<li>${esc(h)}</li>`).join("");
    return `<article class="news-card reveal">
      <div class="news-media"><img src="${esc(it.image||fallbackImg)}" alt="News"></div>
      <div class="news-body">
        <h3 class="news-title">${tv(it.title,lang)}</h3>
        <div class="news-label">${lang==="zh"?"重點摘要":"Key Points"}</div>
        <p>${tv(it.lead,lang)}</p>
        ${hl?`<div class="news-label">${lang==="zh"?"研究亮點":"Highlights"}</div><ul class="news-list">${hl}</ul>`:""}
        ${dls?`<div class="news-label">${lang==="zh"?"資料下載":"Downloads"}</div><ul class="news-downloads">${dls}</ul>`:""}
      </div>
    </article>`;
  }
  function carItem(src, link){
    return link
      ? `<div class="carousel-item"><a href="${esc(link)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="" loading="lazy"></a></div>`
      : `<div class="carousel-item"><div class="ci-img"><img src="${esc(src)}" alt="" loading="lazy"></div></div>`;
  }
  function carousel(id, title, items){
    return `<div class="carousel-block reveal" style="margin-top:34px">
      <div class="eyebrow" style="margin-bottom:14px">${esc(title)}</div>
      <div class="carousel" data-carousel>
        <button class="carousel-btn prev" aria-label="prev">&#10094;</button>
        <div class="carousel-track">${items.join("")}</div>
        <button class="carousel-btn next" aria-label="next">&#10095;</button>
      </div>
    </div>`;
  }

  /* ---------- dynamic wiring (per render) ---------- */
  function wireDynamic(){
    const heroBtn = document.getElementById("hero-btn");
    if (heroBtn) heroBtn.onclick = () => document.getElementById("research")?.scrollIntoView();

    // carousels
    document.querySelectorAll("[data-carousel]").forEach(c=>{
      const track = c.querySelector(".carousel-track");
      const step = () => Math.max(track.clientWidth*0.8, 240);
      c.querySelector(".prev").onclick = ()=>track.scrollBy({left:-step(),behavior:"smooth"});
      c.querySelector(".next").onclick = ()=>track.scrollBy({left: step(),behavior:"smooth"});
      // drag
      let down=false,sx,sl;
      track.addEventListener("mousedown",e=>{down=true;sx=e.pageX;sl=track.scrollLeft;track.style.scrollBehavior="auto";});
      window.addEventListener("mouseup",()=>{down=false;track.style.scrollBehavior="smooth";});
      track.addEventListener("mousemove",e=>{if(!down)return;e.preventDefault();track.scrollLeft=sl-(e.pageX-sx);});
    });

    // lightbox
    document.querySelectorAll("[data-zoom]").forEach(im=>{
      im.onclick = ()=>openLightbox(im.src);
    });

    // count-up stats
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".stat-value").forEach(elm=>{
      const raw = elm.dataset.target || elm.textContent;
      if(reduce || !/^[\d,]+$/.test(raw)) return;
      const num = parseInt(raw.replace(/,/g,""),10);
      const io2 = new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting){ animateCount(elm,num,raw); io2.unobserve(e.target); }
      }),{threshold:.4});
      io2.observe(elm);
    });

    // reveal
    const io = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
  }

  function animateCount(elm, num, raw){
    const dur=1100, t0=performance.now();
    function frame(t){
      const p=Math.min((t-t0)/dur,1);
      const v=Math.round(num*(1-Math.pow(1-p,3)));
      elm.textContent = v.toLocaleString("en-US");
      if(p<1) requestAnimationFrame(frame); else elm.textContent = raw;
    }
    requestAnimationFrame(frame);
  }

  function openLightbox(src){
    let lb = document.getElementById("lightbox");
    if(!lb){
      lb = document.createElement("div");
      lb.id="lightbox"; lb.className="lightbox";
      lb.innerHTML=`<button class="lb-close" aria-label="close">&times;</button><img alt="">`;
      document.body.appendChild(lb);
      lb.addEventListener("click",()=>lb.classList.remove("open"));
    }
    lb.querySelector("img").src = src;
    lb.classList.add("open");
  }

  /* ---------- static wiring (once) ---------- */
  function wireStatic(){
    const header = document.querySelector(".site-header");
    window.addEventListener("scroll",()=>header.classList.toggle("scrolled",window.scrollY>16),{passive:true});

    const burger = document.getElementById("hamburger");
    const drawer = document.getElementById("nav-drawer");
    const scrim = document.getElementById("scrim");
    const closeDrawer = ()=>{burger.classList.remove("open");drawer.classList.remove("open");scrim.classList.remove("open");};
    burger.onclick = ()=>{const o=!drawer.classList.contains("open");burger.classList.toggle("open",o);drawer.classList.toggle("open",o);scrim.classList.toggle("open",o);};
    scrim.onclick = closeDrawer;
    drawer.addEventListener("click",e=>{if(e.target.tagName==="A")closeDrawer();});

    document.querySelectorAll(".lang-toggle button").forEach(b=>{
      b.onclick = ()=>{ const l=b.dataset.lang; setLang(l); render(source(), l); };
    });
    // allow parent (admin) to drive language/refresh
    window.addEventListener("message", e=>{
      if(e.data && e.data.tpmi){
        if(e.data.lang){ setLang(e.data.lang); }
        render(source(), e.data.lang || getLang());
      }
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded",()=>{
    wireStatic();
    render(source(), getLang());
    // live refresh: preview watches draft, public watches published
    const watchKey = PREVIEW ? "tpmi_content_draft" : "tpmi_content_published";
    window.addEventListener("storage",e=>{ if(e.key && e.key.indexOf(watchKey)===0){ const y=window.scrollY; render(source(), getLang()); window.scrollTo(0,y); } });
  });
})();
