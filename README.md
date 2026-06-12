# TPMI 台灣精準醫療計畫 — 官方網站 2.0

Taiwan Precision Medicine Initiative (TPMI) 官網改版：保留原站的圖片、文字與版面配置，新增**內容管理後台**與互動式效果。純靜態網站，無需後端伺服器即可部署（GitHub Pages 可直接託管）。

## 功能

### 前台 `index.html`
- 中／英雙語切換（記憶使用者選擇）
- 互動效果：區塊捲動淡入、數據快照數字滾動、里程碑時間軸、團隊照片輪播（可拖曳）、合作醫院分區卡片
- 響應式設計（桌機／平板／手機），含手機抽屜式選單

### 管理後台 `admin.html`
- 登入保護（原型示範帳密：`admin` / `tpmi2026`，正式上線請改由後端驗證）
- 所有區塊文字、圖片皆可編輯（雙語欄位並排）
- 即時預覽（手機／平板／桌機尺寸切換）
- 草稿 → 發布 工作流程；可捨棄變更、匯出 JSON 備份、重設回預設內容
- 圖片管理：上傳／替換圖片

## 架構

```
index.html          前台入口（殼層，內容由 JS 渲染）
admin.html          管理後台
assets/
  content.js        ★ 內容資料模型（單一資料來源）+ ContentStore（草稿/發布/匯出）
  render.js         前台渲染器 + 互動效果
  site.css          前台樣式
  admin.js          後台編輯器邏輯
  admin.css         後台樣式
images/             英文版圖片
images_cn/          中文版圖片
docs/               PDF／申請表下載
```

內容儲存：原型階段使用 `localStorage`（後台發布後前台即更新）。預設內容寫在 `assets/content.js` 的 `DEFAULT_CONTENT`；後台「匯出 JSON」可下載目前內容備份。

> **正式上線注意**：localStorage 僅存在訪客各自的瀏覽器。要讓後台修改對所有訪客生效，需將後台匯出的 JSON 內容更新回 `assets/content.js`（或改接後端 API / headless CMS）。

## 本機預覽

```powershell
python -m http.server 8090
# 瀏覽 http://localhost:8090（前台）
# 瀏覽 http://localhost:8090/admin.html（後台）
```

## 部署到 GitHub Pages

Repo → Settings → Pages → Source 選 `main` branch 根目錄即可。
