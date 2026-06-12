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

  /* ============================================================
     Vector hero — high-resolution redraw of top1-desktop/mobile.
     Pure SVG: crisp at any screen size / zoom level.
     ============================================================ */
  const heroArt = (function(){
    const TITLE="#106C9C", GRAY="#8E93A0", ORANGE="#F5A52E",
          MESH_L="#CBDFE6", MESH_N="#B9D6DD", SKY_B="#2A6A8C", SKY_O="#F2A23C";

    // deterministic rng so the mesh never shifts between renders
    function rng(seed){ let s=seed>>>0; return ()=>((s=(s*1664525+1013904223)>>>0)/4294967296); }

    // crescent network of nodes + lines (the "molecular" arc)
    function mesh(cx,cy,r0,r1,a0,a1,seed,scale,maxLink){
      const rnd=rng(seed), pts=[];
      for(let ring=0; ring<3; ring++){
        const rr=r1-(r1-r0)*ring/2, steps=14-ring*3;
        for(let i=0;i<=steps;i++){
          const a=a0+(a1-a0)*i/steps+(rnd()-0.5)*0.14;
          const r=rr+(rnd()-0.5)*58;
          pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r, rnd()]);
        }
      }
      let lines="", nodes="";
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const d=Math.hypot(pts[i][0]-pts[j][0], pts[i][1]-pts[j][1]);
          if(d<maxLink) lines+=`<line x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${pts[j][0].toFixed(1)}" y2="${pts[j][1].toFixed(1)}"/>`;
        }
        const t=pts[i][2];
        if(t>0.22) nodes+=`<circle cx="${pts[i][0].toFixed(1)}" cy="${pts[i][1].toFixed(1)}" r="${((t>0.86?9:t>0.6?5.5:3.2)*scale).toFixed(1)}"${t>0.86?' opacity=".5"':''}/>`;
      }
      return `<g stroke="${MESH_L}" stroke-width="1.4" opacity=".85">${lines}</g><g fill="${MESH_N}">${nodes}</g>`;
    }

    // celebrating-person glyph (raised arms), head drawn separately
    function person(x,y,s,body,head){
      return `<g transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="-31" r="10.5" fill="${head}"/>`+
        `<path fill="${body}" d="M0,26 C-2,13 -7,3 -16,-3 C-25,-9 -30,-18 -27,-23 C-23,-28 -14,-25 -8,-17 C-4,-12 -2,-7 0,-1 C2,-7 4,-12 8,-17 C14,-25 23,-28 27,-23 C30,-18 25,-9 16,-3 C7,3 2,13 0,26 Z"/></g>`;
    }

    // Taiwan island emblem with the people inside (local 0..150 × 0..270)
    function island(x,y,s){
      const ppl =
        person( 80, 68,0.78,"#93AE8C","#5F7A56")+
        person( 58,108,0.62,"#F2C14E","#7C8288")+
        person( 96,120,0.55,"#F2C14E","#7C8288")+
        person( 72,156,0.95,"#B85C42","#6E2C1D")+
        person( 41,152,0.55,"#F2C14E","#7C8288")+
        person( 53,198,0.80,"#7395BD","#2F4F73")+
        person( 93,188,0.58,"#F2C14E","#7C8288")+
        person( 66,232,0.55,"#F2C14E","#7C8288");
      const dots =
        `<circle cx="98" cy="92" r="6" fill="#7C8288"/><circle cx="34" cy="128" r="5" fill="#7C8288"/>`+
        `<circle cx="104" cy="158" r="5" fill="#7C8288"/><circle cx="84" cy="212" r="6" fill="#7C8288"/>`;
      return `<g transform="translate(${x},${y}) scale(${s})">
        <path fill="#fff" stroke="${ORANGE}" stroke-width="9" stroke-linejoin="round"
          d="M112,12 C128,18 134,38 127,58 C120,78 113,95 108,115 C103,137 102,160 94,182 C86,206 77,228 65,245 C59,255 50,257 46,247 C42,237 44,223 40,209 C34,189 24,171 20,149 C16,127 19,107 29,89 C39,71 56,57 72,43 C86,31 98,7 112,12 Z"/>
        ${ppl}${dots}</g>`;
    }

    // line-art skyline (local 0..620 × 0..220, baseline y=215)
    function skyline(x,y,s){
      const o=`fill="none" stroke="${SKY_O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
      const b=`fill="none" stroke="${SKY_B}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
      // dotted windows helper
      function win(cx,cy,cols,rows,gap,col){
        let out="";
        for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)
          out+=`<rect x="${cx+c*gap}" y="${cy+r*gap}" width="3" height="3" fill="${col}"/>`;
        return out;
      }
      // ferris wheel
      let wheel=`<circle cx="212" cy="155" r="46" ${b}/><circle cx="212" cy="155" r="7" ${b}/>`;
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6, cx=212+Math.cos(a)*46, cy=155+Math.sin(a)*46;
        wheel+=`<line x1="${(212+Math.cos(a)*7).toFixed(1)}" y1="${(155+Math.sin(a)*7).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" ${b}/>`+
               `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" ${b}/>`;
      }
      wheel+=`<path d="M192,215 L212,162 L232,215" ${b}/>`;
      // Taipei 101 — stacked flared segments
      let t101=`<path d="M362,215 L362,196 L352,196 L352,188 L398,188 L398,196 L388,196 L388,215" ${b}/>`;
      for(let i=0;i<8;i++){
        const top=188-15*(i+1), bot=188-15*i, w1=20-i*1.1, w2=15-i*1.1;
        t101+=`<path d="M${375-w2},${top} L${375+w2},${top} L${375+w1},${bot} L${375-w1},${bot} Z" ${b}/>`;
      }
      t101+=`<path d="M371,68 L379,68 L378,56 L376,56 L376,44 L374,44 L374,56 L372,56 Z" ${b}/>`;
      // temple / gate beside 101
      const temple=`<path d="M408,215 L408,196 C408,196 404,196 404,191 C420,194 440,194 456,191 C456,196 452,196 452,196 L452,215" ${b}/>`+
        `<path d="M406,191 C412,185 420,182 430,182 C440,182 448,185 454,191" ${b}/><path d="M424,215 L424,204 C424,200 436,200 436,204 L436,215" ${b}/>`;
      // left blue blocks
      const left=`<path d="M0,215 L0,160 L26,160 L26,142 L58,142 L58,170 L84,170 L84,150 L112,150 L112,178 L134,178 L134,215" ${b}/>`+
        win(8,170,3,4,9,SKY_B)+win(64,150,2,3,9,SKY_B)+win(90,158,2,4,9,SKY_B);
      // orange spire (left)
      const spire1=`<path d="M96,150 L104,96 L106,90 L108,96 L116,150" ${o}/><line x1="100" y1="124" x2="112" y2="124" ${o}/>`;
      // orange mid cluster (behind wheel→101)
      const midO=`<path d="M252,196 L252,156 L274,156 L274,144 L300,144 L300,160 L322,160 L322,148 L344,148 L344,196" ${o}/>`+
        win(258,164,2,3,9,SKY_O)+win(280,152,2,3,9,SKY_O)+win(327,156,2,3,9,SKY_O)+
        `<path d="M462,196 L462,150 L484,150 L484,138 L506,138 L506,158 L524,158 L524,196" ${o}/>`+
        win(468,158,2,3,9,SKY_O)+win(489,146,2,4,9,SKY_O);
      // orange spire (mid-right)
      const spire2=`<path d="M530,160 L538,104 L540,98 L542,104 L550,160" ${o}/><line x1="534" y1="132" x2="546" y2="132" ${o}/>`;
      // right orange tower
      const rightO=`<path d="M556,196 L556,92 L568,92 L568,84 L596,84 L596,92 L608,92 L608,196" ${o}/>`+win(566,100,3,7,11,SKY_O);
      // right blue blocks
      const rightB=`<path d="M448,215 L448,186 L472,186 L472,176 L498,176 L498,192 L538,192 L538,180 L560,180 L560,200 L590,200 L590,184 L620,184 L620,215" ${b}/>`+
        win(454,192,2,2,9,SKY_B)+win(478,182,2,3,9,SKY_B)+win(566,188,2,2,9,SKY_B)+
        `<line x1="506" y1="198" x2="506" y2="208" ${b}/><line x1="512" y1="198" x2="512" y2="208" ${b}/><line x1="518" y1="198" x2="518" y2="208" ${b}/>`;
      // baseline
      const base=`<line x1="0" y1="215" x2="620" y2="215" ${b}/>`;
      return `<g transform="translate(${x},${y}) scale(${s})">${spire1}${midO}${spire2}${rightO}${left}${wheel}${rightB}${t101}${temple}${base}</g>`;
    }

    function titleBlock(x,y,anchor,cjkSize,enSize){
      const ff=`font-family="'Huninn','Noto Sans TC','Microsoft JhengHei',sans-serif"`;
      const sub=[["T","aiwan "],["P","recision "],["M","edicine "],["I","nitiative"]]
        .map(p=>`<tspan fill="${ORANGE}">${p[0]}</tspan><tspan fill="${GRAY}">${p[1]}</tspan>`).join("");
      return `<text x="${x}" y="${y}" ${ff} font-size="${cjkSize}" letter-spacing="${Math.round(cjkSize*0.06)}" fill="${TITLE}" font-weight="bold" text-anchor="${anchor}">台灣精準醫療計畫</text>`+
             `<text x="${x}" y="${y+cjkSize*0.66}" ${ff} font-size="${enSize}" font-weight="bold" text-anchor="${anchor}">${sub}</text>`;
    }

    return function(variant){
      if(variant==="mobile"){
        return `<svg class="hero-mobile hero-art" viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="台灣精準醫療計畫 Taiwan Precision Medicine Initiative">
          <rect width="750" height="500" fill="#fff"/>
          <g opacity=".45">${mesh(40,470,170,300,-1.5,0.9,7,0.8,95)}</g>
          <g opacity=".45">${mesh(760,80,150,260,2.2,4.4,11,0.7,90)}</g>
          ${skyline(105,18,0.88)}
          ${titleBlock(375,262,"middle",58,27.5)}
        </svg>`;
      }
      return `<svg class="hero-desktop hero-art" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="台灣精準醫療計畫 Taiwan Precision Medicine Initiative">
        <rect width="1200" height="720" fill="#fff"/>
        ${mesh(430,330,260,410,1.65,4.55,5,1,125)}
        ${island(258,128,1)}
        ${titleBlock(392,268,"start",75,37)}
        ${skyline(588,498,1)}
      </svg>`;
    };
  })();

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
    // default art is the vector redraw; an image uploaded in admin overrides it
    const heroDesk = C.hero.image && C.hero.image !== "images/top1-desktop.png"
      ? `<img class="hero-desktop" src="${esc(C.hero.image)}" alt="TPMI">` : heroArt("desktop");
    const heroMob = C.hero.imageMobile && C.hero.imageMobile !== "images/top1-mobile.png"
      ? `<img class="hero-mobile" src="${esc(C.hero.imageMobile)}" alt="TPMI">` : heroArt("mobile");
    parts.push(`
      <section class="hero" id="top">
        ${heroDesk}
        ${heroMob}
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
