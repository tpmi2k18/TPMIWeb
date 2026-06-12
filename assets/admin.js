/* ============================================================
   TPMI — Admin panel logic (prototype)
   Auth is client-side only; real deployment needs a backend.
   ============================================================ */
(function () {
  "use strict";
  const CREDS = { user: "admin", pass: "tpmi2026" };
  const AUTH_KEY = "tpmi_admin_session";

  let draft = ContentStore.getDraft();
  let activeSection = "news";
  let previewLang = "zh";
  let dirty = false;
  let saveTimer = null;

  const $ = (s, r=document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };

  /* ---------------- AUTH ---------------- */
  function isAuthed(){ return sessionStorage.getItem(AUTH_KEY)==="1"; }
  function doLogin(){
    const u=$("#login-user").value.trim(), p=$("#login-pass").value;
    if(u===CREDS.user && p===CREDS.pass){ sessionStorage.setItem(AUTH_KEY,"1"); showApp(); }
    else { $("#login-err").textContent = previewLang==="zh"?"帳號或密碼錯誤":"Incorrect username or password"; }
  }
  function logout(){ sessionStorage.removeItem(AUTH_KEY); location.reload(); }

  /* ---------------- SAVE / STATUS ---------------- */
  function save(){
    ContentStore.saveDraft(draft);
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(previewRefresh, 120);
    setDirty(true);
  }
  function setDirty(v){
    dirty=v;
    const pill=$("#status-pill");
    pill.className = "status-pill " + (v?"status-dirty":"status-clean");
    pill.innerHTML = `<span class="dot"></span>${v?(previewLang==="zh"?"有未發布變更":"Unpublished changes"):(previewLang==="zh"?"已發布":"Published")}`;
  }
  function publish(){
    ContentStore.publish(draft); setDirty(false); toast(previewLang==="zh"?"已發布到網站 ✓":"Published to site ✓"); previewRefresh();
  }
  function discard(){
    if(!confirm(previewLang==="zh"?"確定捨棄所有未發布的變更？":"Discard all unpublished changes?")) return;
    ContentStore.discardDraft(); draft=ContentStore.getDraft(); setDirty(false); renderEditor(); previewRefresh();
    toast(previewLang==="zh"?"已還原至最新發布版本":"Reverted to published version");
  }
  function resetAll(){
    if(!confirm(previewLang==="zh"?"重設為原始預設內容？此動作無法復原。":"Reset to original default content? This cannot be undone.")) return;
    ContentStore.resetAll(); draft=ContentStore.getDraft(); setDirty(false); renderEditor(); previewRefresh();
    toast(previewLang==="zh"?"已重設為預設內容":"Reset to defaults");
  }
  function exportJSON(){
    const blob=new Blob([JSON.stringify(draft,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="tpmi-content.json"; a.click(); URL.revokeObjectURL(a.href);
    toast(previewLang==="zh"?"已匯出 tpmi-content.json":"Exported tpmi-content.json");
  }

  /* ---------------- FIELD BUILDERS ---------------- */
  function biText(label, obj, key, multiline){
    const g=el("div","f-group");
    if(label) g.appendChild(el("label","f-label",label));
    const grid=el("div","bi-grid");
    [["en","EN"],["zh","中文"]].forEach(([lng,tag])=>{
      const cell=el("div","bi-cell");
      cell.appendChild(el("span","tag"+(lng==="zh"?" zh":""),tag));
      const inp = multiline?el("textarea","f-input"):el("input","f-input");
      if(!multiline) inp.type="text";
      inp.value = (obj[key] && obj[key][lng]) || "";
      inp.addEventListener("input",()=>{ if(typeof obj[key]!=="object")obj[key]={}; obj[key][lng]=inp.value; save(); });
      cell.appendChild(inp); grid.appendChild(cell);
    });
    g.appendChild(grid); return g;
  }
  function plainText(label, obj, key, type){
    const g=el("div","f-group");
    g.appendChild(el("label","f-label",label));
    const inp=el("input","f-input"); inp.type=type||"text"; inp.value=obj[key]||"";
    inp.addEventListener("input",()=>{ obj[key]=inp.value; save(); });
    g.appendChild(inp); return g;
  }
  // synced parallel list: bi = {en:[], zh:[]}
  function syncedList(label, bi, multiline){
    const g=el("div","f-group");
    g.appendChild(el("label","f-label",label));
    const list=el("div");
    function redraw(){
      list.innerHTML="";
      const n=Math.max(bi.en.length, bi.zh.length, 1);
      for(let i=0;i<n;i++){
        if(bi.en[i]==null)bi.en[i]=""; if(bi.zh[i]==null)bi.zh[i]="";
        const item=el("div","list-item");
        const hd=el("div","li-head");
        hd.appendChild(el("span","li-title",(label.replace(/（.*）/,"")||"#")+" "+(i+1)));
        const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
        del.onclick=()=>{ bi.en.splice(i,1); bi.zh.splice(i,1); save(); redraw(); };
        hd.appendChild(del); item.appendChild(hd);
        const grid=el("div","bi-grid");
        [["en","EN"],["zh","中文"]].forEach(([lng,tag])=>{
          const cell=el("div","bi-cell");
          cell.appendChild(el("span","tag"+(lng==="zh"?" zh":""),tag));
          const inp=multiline?el("textarea","f-input"):el("input","f-input");
          if(!multiline)inp.type="text";
          inp.value=bi[lng][i]||"";
          inp.addEventListener("input",()=>{ bi[lng][i]=inp.value; save(); });
          cell.appendChild(inp); grid.appendChild(cell);
        });
        item.appendChild(grid); list.appendChild(item);
      }
    }
    redraw();
    g.appendChild(list);
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增一段":"Add item"));
    add.onclick=()=>{ bi.en.push(""); bi.zh.push(""); save(); redraw(); };
    g.appendChild(add); return g;
  }
  // image field; pathRef = obj, key. bilingual=true => {en,zh}
  function imageField(label, obj, key, bilingual){
    const g=el("div","f-group");
    g.appendChild(el("label","f-label",label));
    const langs = bilingual?[["en","EN"],["zh","中文"]]:[[null,null]];
    langs.forEach(([lng,tag])=>{
      const cur = lng? (obj[key]&&obj[key][lng]) : obj[key];
      const wrap=el("div","img-field"); wrap.style.marginBottom="10px";
      const thumb=el("div","img-thumb"); thumb.style.backgroundImage=`url("${cur||""}")`;
      const actions=el("div","img-actions");
      if(tag) actions.appendChild(el("span","tag"+(lng==="zh"?" zh":""),tag));
      const lbl=el("label","file-lbl",previewLang==="zh"?"上傳 / 替換圖片":"Upload / Replace");
      const file=el("input"); file.type="file"; file.accept="image/*";
      file.addEventListener("change",e=>{
        const f=e.target.files[0]; if(!f)return;
        if(f.size>2.6*1024*1024){ alert(previewLang==="zh"?"圖片過大（建議 < 2.5MB），原型以瀏覽器儲存。":"Image too large (<2.5MB recommended for the prototype)."); return; }
        const r=new FileReader();
        r.onload=()=>{ if(lng){ if(typeof obj[key]!=="object")obj[key]={}; obj[key][lng]=r.result; } else obj[key]=r.result; thumb.style.backgroundImage=`url("${r.result}")`; pathEl.textContent=f.name; save(); };
        r.readAsDataURL(f);
      });
      lbl.appendChild(file);
      actions.appendChild(lbl);
      const pathEl=el("div","path",(cur||"").startsWith("data:")?(previewLang==="zh"?"（已上傳的圖片）":"(uploaded image)"):(cur||""));
      actions.appendChild(pathEl);
      wrap.appendChild(thumb); wrap.appendChild(actions); g.appendChild(wrap);
    });
    return g;
  }
  function cardWrap(title, rightBtn){
    const c=el("div","card");
    const h=el("div","card-head"); h.appendChild(el("h3",null,title));
    if(rightBtn)h.appendChild(rightBtn);
    c.appendChild(h); return c;
  }

  /* ---------------- SECTION EDITORS ---------------- */
  const SECTIONS = [
    { id:"news",   icon:"📰", label:{en:"News",zh:"最新消息"}, render:edNews },
    { id:"intro",  icon:"🧬", label:{en:"Why Taiwan",zh:"精準醫療"}, render:edIntro },
    { id:"about",  icon:"ℹ️", label:{en:"About TPMI",zh:"關於 TPMI"}, render:edAbout },
    { id:"stats",  icon:"📊", label:{en:"Snapshots",zh:"數據快照"}, render:edStats },
    { id:"partner",icon:"🏥", label:{en:"Partner Hospitals",zh:"合作醫院"}, render:edPartner },
    { id:"milestones",icon:"📅", label:{en:"Milestones",zh:"里程碑"}, render:edMilestones },
    { id:"collaboration",icon:"🤝", label:{en:"Collaboration",zh:"合作流程"}, render:edCollab },
    { id:"research",icon:"📄",label:{en:"Research",zh:"成果亮點"}, render:edResearch },
    { id:"access", icon:"🔎", label:{en:"Access to Data",zh:"資料探索"}, render:edAccess },
    { id:"contact",icon:"✉️", label:{en:"Contact",zh:"聯絡資訊"}, render:edContact },
    { id:"media",  icon:"🖼️", label:{en:"Images",zh:"圖片管理"}, render:edMedia }
  ];

  function edNews(root){
    root.appendChild(headBlock(previewLang==="zh"?"最新消息":"News", previewLang==="zh"?"可新增多筆消息；每筆含標題、重點摘要、研究亮點與 PDF 下載。":"Add multiple news items; each has a title, summary, highlights and PDF downloads."));
    draft.news.items.forEach((it,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除此則":"Delete");
      del.onclick=()=>{ draft.news.items.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"消息 ":"Item ")+(idx+1), del);
      c.appendChild(imageField(previewLang==="zh"?"消息圖片":"News image", it, "image", false));
      c.appendChild(biText(previewLang==="zh"?"標題（可用 <em> 斜體）":"Title (allows <em>)", it, "title", false));
      c.appendChild(biText(previewLang==="zh"?"重點摘要":"Summary", it, "lead", true));
      if(!it.highlights)it.highlights={en:[],zh:[]};
      c.appendChild(syncedList(previewLang==="zh"?"研究亮點":"Highlights", it.highlights, false));
      // downloads
      c.appendChild(el("label","f-label",previewLang==="zh"?"資料下載（PDF / 連結）":"Downloads (PDF / link)"));
      const dlBox=el("div");
      (it.downloads||(it.downloads=[])).forEach((d,di)=>{
        const li=el("div","list-item");
        const hd=el("div","li-head");
        hd.appendChild(el("span","li-title",(previewLang==="zh"?"下載 ":"Download ")+(di+1)));
        const x=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
        x.onclick=()=>{ it.downloads.splice(di,1); save(); renderEditor(); };
        hd.appendChild(x); li.appendChild(hd);
        li.appendChild(biText(previewLang==="zh"?"顯示文字":"Label", d, "label", false));
        li.appendChild(plainText("URL", d, "url"));
        dlBox.appendChild(li);
      });
      c.appendChild(dlBox);
      const addDl=el("button","add-btn","＋ "+(previewLang==="zh"?"新增下載":"Add download"));
      addDl.onclick=()=>{ it.downloads.push({label:{en:"",zh:""},url:""}); save(); renderEditor(); };
      c.appendChild(addDl);
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增一則消息":"Add news item"));
    add.onclick=()=>{ draft.news.items.push({id:"news-"+Date.now(),title:{en:"",zh:""},lead:{en:"",zh:""},highlights:{en:[],zh:[]},downloads:[],image:draft.news.image}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function edIntro(root){
    root.appendChild(headBlock(previewLang==="zh"?"精準醫療（首頁介紹）":"Why Taiwan (intro)",""));
    const c=cardWrap(previewLang==="zh"?"內容":"Content");
    c.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.intro, "title", false));
    c.appendChild(imageField(previewLang==="zh"?"配圖":"Image", draft.intro, "image", true));
    c.appendChild(syncedList(previewLang==="zh"?"段落":"Paragraphs", draft.intro.paragraphs, true));
    root.appendChild(c);
  }
  function edAbout(root){
    root.appendChild(headBlock(previewLang==="zh"?"關於 TPMI":"About TPMI",""));
    const c=cardWrap(previewLang==="zh"?"內容":"Content");
    c.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.about, "title", false));
    c.appendChild(imageField(previewLang==="zh"?"配圖":"Image", draft.about, "image", true));
    c.appendChild(syncedList(previewLang==="zh"?"段落":"Paragraphs", draft.about.paragraphs, true));
    root.appendChild(c);
  }
  function edPartner(root){
    root.appendChild(headBlock(previewLang==="zh"?"合作醫院":"Partner Hospitals",""));
    const c=cardWrap(previewLang==="zh"?"介紹文字":"Intro text");
    c.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.partner, "title", false));
    c.appendChild(biText(previewLang==="zh"?"小標題":"Heading", draft.partner, "heading", false));
    c.appendChild(syncedList(previewLang==="zh"?"段落":"Paragraphs", draft.partner.paragraphs, true));
    root.appendChild(c);
    // regions
    const rc=cardWrap(previewLang==="zh"?"全台醫院分布":"Hospitals across Taiwan");
    rc.appendChild(biText(previewLang==="zh"?"分布區塊標題":"Region block title", draft.partner, "regionsTitle", false));
    (draft.partner.regions||[]).forEach((rg,ri)=>{
      const li=el("div","list-item");
      const hd=el("div","li-head");
      hd.appendChild(el("span","li-title",(previewLang==="zh"?"地區 ":"Region ")+(ri+1)));
      const x=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      x.onclick=()=>{ draft.partner.regions.splice(ri,1); save(); renderEditor(); };
      hd.appendChild(x); li.appendChild(hd);
      li.appendChild(biText(previewLang==="zh"?"地區名稱":"Region name", rg, "name", false));
      li.appendChild(plainText(previewLang==="zh"?"代表色":"Colour", rg, "color", "color"));
      if(!rg.hospitals)rg.hospitals={en:[],zh:[]};
      li.appendChild(syncedList(previewLang==="zh"?"醫院名單":"Hospital list", rg.hospitals, false));
      rc.appendChild(li);
    });
    const addR=el("button","add-btn","＋ "+(previewLang==="zh"?"新增地區":"Add region"));
    addR.onclick=()=>{ draft.partner.regions.push({name:{en:"",zh:""},color:"#236890",hospitals:{en:[],zh:[]}}); save(); renderEditor(); };
    rc.appendChild(addR);
    root.appendChild(rc);
  }
  function edMilestones(root){
    root.appendChild(headBlock(previewLang==="zh"?"計畫里程碑":"Milestones", previewLang==="zh"?"時間軸事件，可新增 / 刪除 / 排序（依清單順序顯示）。":"Timeline events; add / remove (shown in list order)."));
    const c0=cardWrap(previewLang==="zh"?"區塊設定":"Section");
    c0.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.milestones, "title", false));
    root.appendChild(c0);
    draft.milestones.events.forEach((ev,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      del.onclick=()=>{ draft.milestones.events.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"事件 ":"Event ")+(idx+1), del);
      const moves=el("div","f-group"); moves.style.display="flex"; moves.style.gap="8px";
      const up=el("button","mini-btn","↑"); up.onclick=()=>{ if(idx>0){ const a=draft.milestones.events; [a[idx-1],a[idx]]=[a[idx],a[idx-1]]; save(); renderEditor(); } };
      const dn=el("button","mini-btn","↓"); dn.onclick=()=>{ const a=draft.milestones.events; if(idx<a.length-1){ [a[idx+1],a[idx]]=[a[idx],a[idx+1]]; save(); renderEditor(); } };
      moves.appendChild(up); moves.appendChild(dn); c.appendChild(moves);
      c.appendChild(plainText(previewLang==="zh"?"年份":"Year", ev, "year"));
      c.appendChild(biText(previewLang==="zh"?"月份":"Month", ev, "month", false));
      c.appendChild(biText(previewLang==="zh"?"事件說明":"Event text", ev, "text", false));
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增事件":"Add event"));
    add.onclick=()=>{ draft.milestones.events.push({year:"",month:{en:"",zh:""},text:{en:"",zh:""}}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function edCollab(root){
    root.appendChild(headBlock(previewLang==="zh"?"合作流程":"Collaboration", previewLang==="zh"?"與 TPMI 合作的步驟卡片。":"Steps to collaborate with TPMI."));
    const c0=cardWrap(previewLang==="zh"?"區塊設定":"Section");
    c0.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.collaboration, "title", false));
    c0.appendChild(biText(previewLang==="zh"?"上方小字":"Eyebrow", draft.collaboration, "intro", false));
    c0.appendChild(plainText(previewLang==="zh"?"Concept Sheet 下載網址":"Concept Sheet URL", draft.collaboration, "conceptSheetUrl"));
    root.appendChild(c0);
    draft.collaboration.steps.forEach((s,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      del.onclick=()=>{ draft.collaboration.steps.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"步驟 ":"Step ")+(idx+1), del);
      c.appendChild(biText(previewLang==="zh"?"步驟標題":"Step title", s, "title", false));
      c.appendChild(biText(previewLang==="zh"?"步驟說明":"Step description", s, "desc", true));
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增步驟":"Add step"));
    add.onclick=()=>{ draft.collaboration.steps.push({title:{en:"",zh:""},desc:{en:"",zh:""}}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function edResearch(root){
    root.appendChild(headBlock(previewLang==="zh"?"成果亮點":"Research Highlights", previewLang==="zh"?"可新增多篇論文。":"Add multiple papers."));
    const c0=cardWrap(previewLang==="zh"?"區塊設定":"Section");
    c0.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.research, "title", false));
    c0.appendChild(imageField(previewLang==="zh"?"側邊配圖":"Side image", draft.research, "sideImage", false));
    root.appendChild(c0);
    draft.research.items.forEach((it,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      del.onclick=()=>{ draft.research.items.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"論文 ":"Paper ")+(idx+1), del);
      c.appendChild(biText(previewLang==="zh"?"論文標題":"Title", it, "title", false));
      c.appendChild(biText(previewLang==="zh"?"作者 / 出處":"Authors / source", it, "authors", false));
      c.appendChild(plainText("URL", it, "url"));
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增論文":"Add paper"));
    add.onclick=()=>{ draft.research.items.push({title:{en:"",zh:""},authors:{en:"",zh:""},url:""}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function edContact(root){
    root.appendChild(headBlock(previewLang==="zh"?"聯絡資訊":"Contact",""));
    const c=cardWrap(previewLang==="zh"?"頁尾與合作聯絡":"Footer & collaboration contact");
    c.appendChild(biText(previewLang==="zh"?"單位名稱":"Organisation", draft.contact, "org", false));
    c.appendChild(biText(previewLang==="zh"?"地址":"Address", draft.contact, "address", false));
    c.appendChild(plainText("Email", draft.contact, "email", "email"));
    c.appendChild(biText(previewLang==="zh"?"版權字樣":"Copyright", draft.contact, "copyright", false));
    root.appendChild(c);
  }
  function edMedia(root){
    root.appendChild(headBlock(previewLang==="zh"?"圖片管理":"Images", previewLang==="zh"?"替換主視覺與資訊圖。上傳的圖片會存在瀏覽器，匯出後交給工程師。":"Replace hero and infographics. Uploads are stored in the browser; export to hand off."));
    const c1=cardWrap(previewLang==="zh"?"主視覺 Hero":"Hero");
    c1.appendChild(imageField(previewLang==="zh"?"桌機版主視覺":"Desktop hero", draft.hero, "image", false));
    c1.appendChild(imageField(previewLang==="zh"?"手機版主視覺":"Mobile hero", draft.hero, "imageMobile", false));
    c1.appendChild(biText(previewLang==="zh"?"按鈕文字":"Button text", draft.hero, "buttonText", false));
    root.appendChild(c1);
  }
  function edStats(root){
    root.appendChild(headBlock(previewLang==="zh"?"數據快照":"Data Snapshots", previewLang==="zh"?"首頁的大數字統計區。純數字（含逗號）會自動跑動畫。":"Headline stat band; pure numbers animate on view."));
    const c0=cardWrap(previewLang==="zh"?"區塊設定":"Section");
    c0.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.stats, "title", false));
    c0.appendChild(biText(previewLang==="zh"?"上方小字":"Eyebrow", draft.stats, "subtitle", false));
    root.appendChild(c0);
    draft.stats.items.forEach((it,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      del.onclick=()=>{ draft.stats.items.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"數字 ":"Stat ")+(idx+1), del);
      c.appendChild(plainText(previewLang==="zh"?"數值（如 565,390）":"Value (e.g. 565,390)", it, "value"));
      c.appendChild(biText(previewLang==="zh"?"說明文字":"Label", it, "label", false));
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增數字":"Add stat"));
    add.onclick=()=>{ draft.stats.items.push({value:"0",label:{en:"",zh:""}}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function edAccess(root){
    root.appendChild(headBlock(previewLang==="zh"?"資料探索平台":"Access to Data", previewLang==="zh"?"研究資料平台卡片，可新增 / 刪除。":"Research data platform cards; add / remove."));
    const c0=cardWrap(previewLang==="zh"?"區塊設定":"Section");
    c0.appendChild(biText(previewLang==="zh"?"區塊標題":"Section title", draft.accessData, "title", false));
    c0.appendChild(biText(previewLang==="zh"?"上方小字":"Eyebrow", draft.accessData, "subtitle", false));
    root.appendChild(c0);
    draft.accessData.cards.forEach((card,idx)=>{
      const del=el("button","mini-btn danger",previewLang==="zh"?"刪除":"Delete");
      del.onclick=()=>{ draft.accessData.cards.splice(idx,1); save(); renderEditor(); };
      const c=cardWrap((previewLang==="zh"?"平台 ":"Platform ")+(idx+1), del);
      c.appendChild(plainText(previewLang==="zh"?"平台名稱":"Platform name", card, "name"));
      c.appendChild(biText(previewLang==="zh"?"標籤":"Tag", card, "tag", false));
      c.appendChild(biText(previewLang==="zh"?"說明":"Description", card, "desc", true));
      c.appendChild(plainText(previewLang==="zh"?"連結（留空＝顯示申請標籤）":"Link (empty = show badge)", card, "link"));
      if(!card.badge)card.badge={en:"",zh:""};
      c.appendChild(biText(previewLang==="zh"?"無連結時顯示的標籤":"Badge (when no link)", card, "badge", false));
      root.appendChild(c);
    });
    const add=el("button","add-btn","＋ "+(previewLang==="zh"?"新增平台":"Add platform"));
    add.onclick=()=>{ draft.accessData.cards.push({name:"",tag:{en:"",zh:""},desc:{en:"",zh:""},link:"",badge:{en:"",zh:""}}); save(); renderEditor(); };
    root.appendChild(add);
  }
  function headBlock(t,s){ const h=el("div","editor-head"); h.appendChild(el("h2",null,t)); if(s)h.appendChild(el("p",null,s)); return h; }

  /* ---------------- RENDER SHELL ---------------- */
  function renderSidebar(){
    const sb=$("#sidebar"); sb.innerHTML="";
    sb.appendChild(el("div","side-group",previewLang==="zh"?"內容":"Content"));
    SECTIONS.forEach(s=>{
      const b=el("button","side-link"+(s.id===activeSection?" active":""));
      b.innerHTML=`<span class="ic">${s.icon}</span>${s.label[previewLang]}`;
      b.onclick=()=>{ activeSection=s.id; renderEditor(); };
      sb.appendChild(b);
    });
  }
  function renderEditor(){
    renderSidebar();
    const root=$("#editor"); root.innerHTML="";
    const sec=SECTIONS.find(s=>s.id===activeSection);
    sec.render(root);
  }

  /* ---------------- PREVIEW ---------------- */
  function previewRefresh(){
    const f=$("#preview-frame");
    if(f && f.contentWindow){ try{ f.contentWindow.postMessage({tpmi:true,lang:previewLang},"*"); }catch(e){} }
  }
  function setDevice(w,btn){
    $$(".device-toggle button").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
    const wrap=$("#preview-frame-wrap");
    wrap.style.width = w==="full" ? "100%" : (w+"px");
  }
  function $$(s){ return Array.from(document.querySelectorAll(s)); }

  /* ---------------- TOAST ---------------- */
  let toastTimer=null;
  function toast(msg){
    let t=$("#toast"); if(!t){ t=el("div","toast"); t.id="toast"; document.body.appendChild(t); }
    t.textContent=msg; t.classList.add("show");
    if(toastTimer)clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2200);
  }

  /* ---------------- BOOT ---------------- */
  function showApp(){
    $("#login").style.display="none";
    $("#app").classList.add("show");
    renderEditor();
    setDirty(dirty);
    const f=$("#preview-frame");
    f.src="index.html?preview=1&lang="+previewLang;
    f.addEventListener("load",previewRefresh);
  }

  document.addEventListener("DOMContentLoaded",()=>{
    // login
    $("#btn-login").onclick=doLogin;
    $("#login-pass").addEventListener("keydown",e=>{ if(e.key==="Enter")doLogin(); });
    // topbar
    $("#btn-publish").onclick=publish;
    $("#btn-discard").onclick=discard;
    $("#btn-export").onclick=exportJSON;
    $("#btn-reset").onclick=resetAll;
    $("#btn-logout").onclick=logout;
    $("#btn-view").onclick=()=>window.open("index.html","_blank");
    $("#btn-show-preview").onclick=()=>$("#app").classList.toggle("preview-mode");
    // device toggles
    $$(".device-toggle button").forEach(b=> b.onclick=()=>setDevice(b.dataset.w,b));
    // preview lang
    $$(".preview-lang button").forEach(b=> b.onclick=()=>{
      previewLang=b.dataset.lang;
      $$(".preview-lang button").forEach(x=>x.classList.toggle("active",x===b));
      renderEditor(); previewRefresh();
    });
    if(isAuthed()) showApp();
  });
})();
