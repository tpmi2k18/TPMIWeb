/* ============================================================
   TPMI — Bilingual content model + store
   ------------------------------------------------------------
   This is the single source of truth for the public site.
   The admin panel edits a DRAFT copy; "publish" promotes the
   draft to PUBLISHED, which is what the public site renders.
   Persistence: localStorage (prototype). Export = JSON file.
   ============================================================ */

const DEFAULT_CONTENT = {
  meta: { version: 3, updated: "2026-06-08" },

  /* ---------- HERO ---------- */
  hero: {
    image: "images/top1-desktop.png",
    imageMobile: "images/top1-mobile.png",
    buttonText: { en: "Research Highlights", zh: "成果亮點" }
  },

  /* ---------- NEWS (multi-item, editable) ---------- */
  news: {
    title: { en: "News", zh: "最新消息" },
    image: "images/news.png",
    items: [
      {
        id: "news-nature-2025",
        title: { en: "TPMI Papers Published in <em>Nature</em>", zh: "TPMI 論文登上《<em>Nature</em>》期刊" },
        lead: {
          en: "Two TPMI studies were published in <em>Nature</em> (Dec 2025), presenting a 560,000+ participant cohort with integrated genome and EMR data, alongside a <em>News &amp; Views</em> commentary recognizing TPMI’s global impact.",
          zh: "TPMI 兩篇研究成果正式刊登於《<em>Nature</em>》（2025 年 12 月），主文介紹超過 56 萬人研究計畫，並整合基因體與電子病歷（EMR）資料，建立可用於族群健康與臨床研究的系統性資源。研究結果揭示族群特有的疾病風險基因變異，並建立涵蓋 265 項疾病的多基因風險評分（PRS）。同期刊登的 News &amp; Views 專文亦高度肯定 TPMI 的國際影響力。"
        },
        highlights: {
          en: [
            "One of the largest precision-medicine cohorts in East Asia",
            "Population-specific genetic variants linked to disease risk",
            "Polygenic risk scores (PRSs) developed for 265 diseases",
            "Improves non-European representation in global research"
          ],
          zh: [
            "建立東亞最大精準醫療研究隊列之一，形成可長期追蹤的研究平台",
            "發現族群特有的疾病風險基因變異，提供更貼近台灣族群的遺傳證據",
            "建立 265 項疾病多基因風險評分（PRS），支援風險分層與預防策略研究",
            "強化全球研究中非歐洲族群基因多樣性"
          ]
        },
        downloads: [
          { label: { en: "TPMI Nature Main Article (PDF)", zh: "TPMI Nature 主文 (PDF)" }, url: "docs/20251204_Nature_TPMI_Cohort.pdf" },
          { label: { en: "Nature News & Views Commentary (PDF)", zh: "Nature News & Views 評論 (PDF)" }, url: "docs/20251204_Nature_TPMI_News_Views.pdf" }
        ]
      }
    ]
  },

  /* ---------- INTRO / 精準醫療 (editable text) ---------- */
  intro: {
    title: { en: "Why Taiwan", zh: "精準醫療" },
    image: { en: "images/tpmi_1_1.png", zh: "images_cn/tpmi_1_1_cn.png" },
    paragraphs: {
      en: [
        "<strong>Taiwan</strong>, with its population of relatively homogeneous genetic background, comprehensive national health insurance, advanced medical system with many years of electronic medical records, and excellent R&D in information science, is in the perfect position to pursue “precision medicine”.",
        "To realize precision medicine, the foundational work of collecting genetic profiles and clinical data from a large Taiwanese cohort must be done."
      ],
      zh: [
        "<strong>精準醫療</strong>為全球醫療發展趨勢，隨著大數據及 AI 的快速發展，各國紛紛聚焦於精準醫療發展。要進一步發現基因與疾病的關聯，需要大量且能代表族群的數據。因此，全球在 2015 年便開始積極規劃大型精準醫學計畫，有大型世代研究計畫打底，才能發展精準醫學與智慧醫療。",
        "台灣即將在 2025 年邁入超高齡社會，國人平均壽命雖近八十歲，但臨終前平均臥床高達 8.04 年，高齡化所帶來的失能、臥病、慢性病等問題，對於個人及社會都會增加很多壓力與負擔。而精準醫學、智慧醫療是超高齡社會的解方之一，透過疾病風險評估及建立適當的健康指引，將有助於個人化的健康照護。",
        "台灣需要有能代表台灣族群的資料，才能發展精準醫療，若希望未來人人享有量身訂製的健康照護，需要更多人共同努力。"
      ]
    }
  },

  /* ---------- ABOUT TPMI (editable text) ---------- */
  about: {
    title: { en: "About TPMI", zh: "關於 TPMI" },
    image: { en: "images/tpmi_2_1.png", zh: "images/tpmi_2_1.png" },
    paragraphs: {
      en: [
        "<strong>The Taiwan Precision Medicine Initiative (TPMI)</strong> is a genomic research program designed to advance precision healthcare in Taiwan. This initiative focuses on collecting and analyzing genetic and clinical data from Taiwanese individuals to develop personalized healthcare solutions tailored specifically to Taiwan’s population. With over 500,000 Taiwanese residents already enrolled, TPMI maintains the most comprehensive dataset of genotypes and electronic medical records for Han Chinese populations.",
        "Given that Han Chinese make up about 20% of the global population, TPMI’s findings have the potential to impact healthcare for over 1.4 billion people worldwide, setting a model for precision medicine initiatives tailored to specific populations."
      ],
      zh: [
        "<strong>台灣精準醫療計畫（TPMI）</strong>是一項基因體研究計畫，致力於推動台灣的精準健康照護。本計畫專注於蒐集與分析台灣民眾的基因與臨床資料，發展專為台灣族群量身打造的個人化健康照護方案。目前已有超過 50 萬名台灣民眾參與，TPMI 擁有漢人族群中最完整的基因型與電子病歷整合資料庫。",
        "由於漢人約占全球人口的 20%，TPMI 的研究成果有潛力影響全球超過 14 億人的健康照護，為針對特定族群的精準醫療計畫樹立典範。"
      ]
    }
  },

  /* ---------- DATA SNAPSHOTS (stats band, editable) ---------- */
  stats: {
    title: { en: "By the Numbers", zh: "數據快照" },
    subtitle: { en: "TPMI cohort at a glance", zh: "TPMI 研究隊列概覽" },
    items: [
      { value: "565,390", label: { en: "Participants", zh: "參與者人數" } },
      { value: "500,081", label: { en: "Electronic Medical Records", zh: "電子病歷數據" } },
      { value: "509,912", label: { en: "Participants Genotyped", zh: "已完成基因分析的參與者" } }
    ]
  },

  /* ---------- MILESTONES (HTML timeline, editable) ---------- */
  milestones: {
    title: { en: "Milestones", zh: "計畫里程碑" },
    events: [
      { year: "2018", month: { en: "Aug", zh: "8月" }, text: { en: "TWBv1 (TWB2.0) array developed", zh: "TWBv1（TWB2.0）晶片開發完成" } },
      { year: "2018", month: { en: "Sep", zh: "9月" }, text: { en: "Pilot study", zh: "前導研究啟動" } },
      { year: "2019", month: { en: "Jul", zh: "7月" }, text: { en: "TPMI initiated", zh: "TPMI 計畫啟動" } },
      { year: "2019", month: { en: "Oct", zh: "10月" }, text: { en: "10,000 participants enrolled", zh: "1 萬名參與者加入" } },
      { year: "2020", month: { en: "Mar", zh: "3月" }, text: { en: "TPMv2 array implemented", zh: "TPMv2 晶片導入" } },
      { year: "2020", month: { en: "May", zh: "5月" }, text: { en: "100,000 participants enrolled", zh: "10 萬名參與者加入" } },
      { year: "2022", month: { en: "Sep", zh: "9月" }, text: { en: "500,000 participants enrolled", zh: "50 萬名參與者加入" } },
      { year: "2023", month: { en: "Oct", zh: "10月" }, text: { en: "500,000 participants genotyped", zh: "50 萬名參與者完成基因定型" } },
      { year: "2024", month: { en: "Dec", zh: "12月" }, text: { en: "Completed database", zh: "資料庫建置完成" } }
    ]
  },

  /* ---------- PARTNER HOSPITALS (editable text + regions) ---------- */
  partner: {
    title: { en: "Partner Hospitals", zh: "合作醫院" },
    heading: { en: "Building Taiwan’s own biomedical big-data resource", zh: "TPMI 打造台灣專屬的生醫大數據資源" },
    paragraphs: {
      en: [
        "The Taiwan Precision Medicine Initiative (TPMI), launched in July 2019, is a genomic research program that aims to advance precision healthcare through collaboration between Academia Sinica and 16 major medical centers (33 hospitals in total) across Taiwan."
      ],
      zh: [
        "台灣精準醫療計畫（TPMI）由中央研究院聯合全國 16 家醫療體系共同推動，為台灣建立具種族特異性的整合型基因與電子病歷資料，成為亞洲最具代表性的漢人生醫大數據資源。相較於歐美以白人為主的資料來源，TPMI 補足全球 20% 人口所屬的漢人族群在精準醫療領域的關鍵資料缺口，具備高度科學價值與國際合作潛力。",
        "TPMI 的研究成果亦獲國際肯定，已刊登於《Nature》期刊，象徵台灣在全球精準健康發展中的重要貢獻與領先地位。TPMI 不僅是受到國際學術肯定的科研計畫，也是一項全民參與的健康行動，研究團隊視參與者為夥伴，將研究成果轉化為疾病風險預測模式，促進全民健康識能。"
      ]
    },
    regionsTitle: { en: "Partner hospitals across Taiwan", zh: "全台合作醫院分布" },
    regions: [
      { name: { en: "Northern Taiwan", zh: "北部" }, color: "#d9737a", hospitals: {
        en: ["Tri-Service General Hospital","Fu Jen Catholic University Hospital","Far Eastern Memorial Hospital","Koo Foundation Sun Yat-Sen Cancer Center","Cathay General Hospital","Chang Gung Memorial Hospital","Taipei City Hospital","Taipei Veterans General Hospital","Taipei Medical University Health Care System","National Taiwan University Hospital"],
        zh: ["三軍總醫院","天主教輔仁大學附設醫院","亞東紀念醫院","和信治癌中心醫院","國泰綜合醫院醫療體系","長庚紀念醫院","臺北市立聯合醫院","臺北榮民總醫院","臺北醫學大學醫療體系","臺灣大學醫學院附設醫院及臺大醫療體系"] } },
      { name: { en: "Middle Western Taiwan", zh: "中部" }, color: "#6aa56a", hospitals: {
        en: ["Chung Shan Medical University Hospital","Changhua Christian Hospital","Taichung Veterans General Hospital"],
        zh: ["中山醫學大學附設醫院","彰化基督教醫院","臺中榮民總醫院及中榮醫療體系"] } },
      { name: { en: "Southern Taiwan", zh: "南部" }, color: "#5b8fd9", hospitals: {
        en: ["Chia-Yi Christian Hospital","Kaohsiung Medical University Hospital"],
        zh: ["嘉義基督教醫院","高雄醫學大學附設中和紀念醫院及高醫醫療體系"] } },
      { name: { en: "Eastern Taiwan", zh: "東部" }, color: "#e0a55f", hospitals: {
        en: ["Hualien Tzu Chi Hospital"],
        zh: ["慈濟醫院醫療體系"] } }
    ]
  },

  /* ---------- LEADERSHIP (heading text + leader photos) ---------- */
  leadership: {
    title: { en: "The Leadership", zh: "執行團隊" },
    subtitle: { en: "Academia Sinica Principal Investigators", zh: "中央研究院計畫主持人" },
    leaders: [
      { img: "images/as_leader_00.png", link: "https://www.ibms.sinica.edu.tw/Pui-Yan-Kwok/en/", alt: "Pui-Yan Kwok" },
      { img: "images/as_leader_05.png", link: "https://www.ibms.sinica.edu.tw/yuan-tsong-chen/en", alt: "Yuan-Tsong Chen" },
      { img: "images/as_leader_01.png", link: "https://www.ibms.sinica.edu.tw/jer-yuarn-wu/en", alt: "Jer-Yuarn Wu" },
      { img: "images/as_leader_04.png", link: "https://www.nhri.edu.tw/eng/about/more?id=c2076ca28c574d86bc6838e4c8b85eb7", alt: "Wayne Huey-Herng Sheu" },
      { img: "images/as_leader_03.png", link: "https://www.ibms.sinica.edu.tw/yijuang-chern/en/", alt: "Yi-Juang Chern" },
      { img: "images/as_leader_02.png", link: "https://www.stat.sinica.edu.tw/eng/index.php?act=researcher_manager&code=view&member=5", alt: "Chun-Houh Chen" }
    ]
  },

  /* ---------- ACADEMIA SINICA TEAM (carousel) ---------- */
  teamCarousel: {
    title: { en: "Academia Sinica Team", zh: "協同研究人員" },
    items: [
      { img: { en: "images/as_leader_08.png", zh: "images_cn/as_leader_cn_08.png" }, link: "https://scholar.google.com/citations?hl=zh-TW&user=ZLE53hgAAAAJ&view_op=list_works&sortby=pubdate" },
      { img: { en: "images/as_leader_09.png", zh: "images_cn/as_leader_cn_09.png" }, link: "https://www.ibms.sinica.edu.tw/ling-hui-li/en" },
      { img: { en: "images/as_leader_10.png", zh: "images_cn/as_leader_cn_10.png" }, link: "https://www.ibms.sinica.edu.tw/hung-hsin-chen/en" },
      { img: { en: "images/as_leader_11.png", zh: "images_cn/as_leader_cn_11.png" }, link: "https://www.ibms.sinica.edu.tw/chien-hsiun-chen/en/" },
      { img: { en: "images/as_leader_12.png", zh: "images_cn/as_leader_cn_12.png" }, link: "https://www.ibms.sinica.edu.tw/cathy-fann/en" },
      { img: { en: "images/as_leader_13.png", zh: "images_cn/as_leader_cn_13.png" }, link: "https://www.stat.sinica.edu.tw/eng/index.php?act=researcher_manager&code=view&member=28" },
      { img: { en: "images/as_leader_14.png", zh: "images_cn/as_leader_cn_14.png" }, link: "https://www.stat.sinica.edu.tw/eng/index.php?act=researcher_manager&code=view&member=13" },
      { img: { en: "images/as_leader_15.png", zh: "images_cn/as_leader_cn_15.png" }, link: "https://www.ibms.sinica.edu.tw/yungling-lee/en" },
      { img: { en: "images/as_leader_16.png", zh: "images_cn/as_leader_cn_16.png" }, link: "https://www.ibms.sinica.edu.tw/yi-shuian-huang/en" },
      { img: { en: "images/as_leader_17.png", zh: "images_cn/as_leader_cn_17.png" }, link: "https://www.ibms.sinica.edu.tw/chih-cheng-chen/en" },
      { img: { en: "images/as_leader_18.png", zh: "images_cn/as_leader_cn_18.png" }, link: "https://www.ibms.sinica.edu.tw/yi-cheng-chang/en/" }
    ]
  },

  /* ---------- PARTNER HOSPITAL TEAMS (carousel) ---------- */
  hospitalTeam: {
    title: { en: "Partner Hospital Teams", zh: "合作醫院團隊" },
    items: [
      { img: { en: "images/hospital_leader_001.png", zh: "images_cn/hospital_leader_cn_1.png" } },
      { img: { en: "images/hospital_leader_002.png", zh: "images_cn/hospital_leader_cn_2.png" } },
      { img: { en: "images/hospital_leader_003.png", zh: "images_cn/hospital_leader_cn_3.png" } },
      { img: { en: "images/hospital_leader_1.png", zh: "images_cn/hospital_leader_cn_4.png" } },
      { img: { en: "images/hospital_leader_2.png", zh: "images_cn/hospital_leader_cn_5.png" } },
      { img: { en: "images/hospital_leader_3.png", zh: "images_cn/hospital_leader_cn_6.png" } },
      { img: { en: "images/hospital_leader_4.png", zh: "images_cn/hospital_leader_cn_7.png" } },
      { img: { en: "images/hospital_leader_5.png", zh: "images_cn/hospital_leader_cn_8.png" } },
      { img: { en: "images/hospital_leader_6.png", zh: "images_cn/hospital_leader_cn_9.png" } },
      { img: { en: "images/hospital_leader_7.png", zh: "images_cn/hospital_leader_cn_10.png" } },
      { img: { en: "images/hospital_leader_8.png", zh: "images_cn/hospital_leader_cn_11.png" } },
      { img: { en: "images/hospital_leader_9.png", zh: "images_cn/hospital_leader_cn_12.png" } },
      { img: { en: "images/hospital_leader_10.png", zh: "images_cn/hospital_leader_cn_13.png" } },
      { img: { en: "images/hospital_leader_11.png", zh: "images_cn/hospital_leader_cn_14.png" } },
      { img: { en: "images/hospital_leader_12.png", zh: "images_cn/hospital_leader_cn_15.png" } },
      { img: { en: "images/hospital_leader_13.png", zh: "images_cn/hospital_leader_cn_16.png" } },
      { img: { en: "images/hospital_leader_14.png", zh: "images_cn/hospital_leader_cn_17.png" } },
      { img: { en: "images/hospital_leader_15.png", zh: "images_cn/hospital_leader_cn_18.png" } },
      { img: { en: "images/hospital_leader_16.png", zh: "images_cn/hospital_leader_cn_19.png" } },
      { img: { en: "images/hospital_leader_17.png", zh: "images_cn/hospital_leader_cn_20.png" } },
      { img: { en: "images/hospital_leader_18.png", zh: "images_cn/hospital_leader_cn_21.png" } },
      { img: { en: "images/hospital_leader_19.png", zh: "images_cn/hospital_leader_cn_22.png" } },
      { img: { en: "images/hospital_leader_20.png", zh: "images_cn/hospital_leader_cn_23.png" } },
      { img: { en: "images/hospital_leader_21.png", zh: "images_cn/hospital_leader_cn_24.png" } },
      { img: { en: "images/hospital_leader_22.png", zh: "images_cn/hospital_leader_cn_25.png" } },
      { img: { en: "images/hospital_leader_23.png", zh: "images_cn/hospital_leader_cn_26.png" } },
      { img: { en: "images/hospital_leader_24.png", zh: "images_cn/hospital_leader_cn_27.png" } },
      { img: { en: "images/hospital_leader_25.png", zh: "images_cn/hospital_leader_cn_28.png" } },
      { img: { en: "images/hospital_leader_26.png", zh: "images_cn/hospital_leader_cn_29.png" } },
      { img: { en: "images/hospital_leader_27.png", zh: "images_cn/hospital_leader_cn_30.png" } }
    ]
  },

  /* ---------- RESEARCH HIGHLIGHTS (multi-item, editable) ---------- */
  research: {
    title: { en: "Research Highlights", zh: "成果亮點" },
    sideImage: "images/research-1.png",
    items: [
      { title: { en: "The Taiwan Precision Medicine Initiative Provides a Cohort for Large-Scale Studies.", zh: "The Taiwan Precision Medicine Initiative Provides a Cohort for Large-Scale Studies." }, authors: { en: "Yang et al. Nature (2025)", zh: "Yang et al. Nature (2025)" }, url: "https://www.nature.com/articles/s41586-025-09680-x" },
      { title: { en: "Population-Specific Polygenic Risk Scores for People of Han Chinese Ancestry.", zh: "Population-Specific Polygenic Risk Scores for People of Han Chinese Ancestry." }, authors: { en: "Chen et al. Nature (2025)", zh: "Chen et al. Nature (2025)" }, url: "https://www.nature.com/articles/s41586-025-09350-y" },
      { title: { en: "Clinical Impact of Pharmacogenetic Risk Variants in a Large Chinese Cohort.", zh: "Clinical Impact of Pharmacogenetic Risk Variants in a Large Chinese Cohort." }, authors: { en: "Wei et al. Nat Commun 16, 6344 (2025).", zh: "Wei et al. Nat Commun 16, 6344 (2025)." }, url: "https://www.nature.com/articles/s41467-025-61644-x" },
      { title: { en: "Deleterious Variants Contribute Minimal Excess Risk in Large-Scale Testing.", zh: "Deleterious Variants Contribute Minimal Excess Risk in Large-Scale Testing." }, authors: { en: "Huang et al.", zh: "Huang et al." }, url: "https://doi.org/10.1101/2024.10.21.24315653" }
    ]
  },

  /* ---------- ACCESS TO DATA (HTML cards, editable) ---------- */
  accessData: {
    title: { en: "Access to Data", zh: "資料探索" },
    subtitle: { en: "Open research platforms", zh: "開放研究平台" },
    cards: [
      {
        name: "TPMI PheWeb",
        tag: { en: "GWAS", zh: "GWAS" },
        desc: {
          en: "Provides GWAS summary statistics across a wide range of phenotypes and traits, letting researchers explore associations between genetic variants and phenotypes through a user-friendly interface.",
          zh: "平台提供了對廣泛表現型和性狀的全基因組關聯研究（GWAS）的摘要統計數據，讓研究人員能在使用者友善的介面中，探索遺傳變異和表現型之間的關聯。"
        },
        link: "https://pheweb.ibms.sinica.edu.tw/"
      },
      {
        name: "TPMI SNPView",
        tag: { en: "Variants", zh: "變異資料" },
        desc: {
          en: "An integrated platform with detailed information on every variant on the TPMI SNP array — including minor allele frequencies (MAF) among TPMI participants, plus variant data from trusted sources such as ClinVar, OMIM and NCBI dbSNP.",
          zh: "提供包含台灣精準醫療單一核苷酸晶片（TPMI SNP array）中所有基因變異的詳細資訊的整合性平台，例如 TPMI 研究參與者中的次要等位基因頻率（MAF），以及來自 ClinVar、OMIM 和 NCBI dbSNP 資料庫等可信任來源的變異數據。"
        },
        link: "https://tdap.ibms.sinica.edu.tw/snpview/"
      },
      {
        name: "TPMI Data View",
        tag: { en: "Cohort stats", zh: "族群統計" },
        desc: {
          en: "Offers statistical insights about TPMI participants, including data on specific health conditions, laboratory results, prescriptions and treatments.",
          zh: "平台提供有關 TPMI 研究參與者的統計洞察，包含特定健康狀況、檢驗結果、處方藥物及治療方式等數據。"
        },
        link: "https://dataview.ibms.sinica.edu.tw/"
      },
      {
        name: "TDAP",
        tag: { en: "Secure", zh: "安全平台" },
        desc: {
          en: "A secure central database and analysis platform. Researchers submit a proposal reviewed by the TPMI Consortium Data Access Committee and approved by the institution’s IRB; authorized researchers may then use the platform in an isolated workspace.",
          zh: "為安全的中央數據庫及分析平台，研究人員需提出研究提案，經 TPMI 聯盟資料使用委員會審查，並通過該機構研究倫理委員會（IRB）審查核准後，經授權的研究人員方可至獨立作業區使用該平台。"
        },
        link: "",
        badge: { en: "By application", zh: "需提出申請" }
      }
    ]
  },

  /* ---------- COLLABORATION (HTML 5-step, editable) ---------- */
  collaboration: {
    title: { en: "Collaborate with TPMI", zh: "與 TPMI 合作" },
    intro: { en: "5 Steps", zh: "五個步驟" },
    steps: [
      { title: { en: "Specify Requirements", zh: "提出需求" }, desc: { en: "Complete an on-line concept sheet posted on the TPMI website with specific proposals for collaboration.", zh: "於 TPMI 網站填寫線上 Concept Sheet，提出具體的合作提案。" } },
      { title: { en: "Feasibility Evaluation", zh: "可行性評估" }, desc: { en: "The TPMI Feasibility Committee will assess the scientific, clinical, technical, resource, and regulatory feasibility of the proposals.", zh: "TPMI 可行性委員會將評估提案在科學、臨床、技術、資源與法規面的可行性。" } },
      { title: { en: "Ethical Review", zh: "倫理審查" }, desc: { en: "The TPMI team will work with the applicant of the approved proposal to prepare a protocol for review by Academia Sinica.", zh: "TPMI 團隊將與通過提案的申請者合作擬定研究計畫書，送中央研究院審查。" } },
      { title: { en: "Study Execution", zh: "研究執行" }, desc: { en: "The collaborative work will be performed by the TPMI team according to the collaborators’ proposed study design.", zh: "合作研究將由 TPMI 團隊依合作者提出的研究設計執行。" } },
      { title: { en: "Results Delivery", zh: "結果交付" }, desc: { en: "Summary statistics and analysis results will be delivered to the collaborators.", zh: "摘要統計與分析結果將交付給合作者。" } }
    ],
    conceptSheetUrl: "docs/TPMI_Concept_Sheet_Application_Form_v1.docx"
  },

  /* ---------- CONTACT (editable) ---------- */
  contact: {
    title: { en: "Contact", zh: "聯絡資訊" },
    org: { en: "Institute of Biomedical Sciences, Academia Sinica", zh: "中央研究院生物醫學科學研究所" },
    address: { en: "No. 128, Sec. 2, Academia Rd., Nangang Dist., Taipei City 115, Taiwan", zh: "台北市南港區 11529 研究院路二段 128 號" },
    email: "tpmi@ibms.sinica.edu.tw",
    copyright: { en: "© 2025 TPMI", zh: "© 2025 TPMI" }
  }
};

/* ============================================================
   ContentStore — load / save / publish / reset / export
   ============================================================ */
const ContentStore = (function () {
  const PUBLISHED_KEY = "tpmi_content_published_v3";
  const DRAFT_KEY = "tpmi_content_draft_v3";

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // Deep-merge defaults so newly-added fields survive old saved copies.
  function merge(base, over) {
    if (Array.isArray(base)) return over !== undefined ? clone(over) : clone(base);
    if (base && typeof base === "object") {
      const out = {};
      const keys = new Set([...Object.keys(base), ...(over ? Object.keys(over) : [])]);
      keys.forEach(k => {
        if (over && k in over && (over[k] === null || typeof over[k] !== "object" || Array.isArray(over[k]))) {
          out[k] = clone(over[k]);
        } else if (base[k] && typeof base[k] === "object") {
          out[k] = merge(base[k], over ? over[k] : undefined);
        } else {
          out[k] = over && k in over ? clone(over[k]) : clone(base[k]);
        }
      });
      return out;
    }
    return over !== undefined ? over : base;
  }

  function read(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  return {
    getPublished() { return merge(DEFAULT_CONTENT, read(PUBLISHED_KEY)); },
    getDraft() { return merge(DEFAULT_CONTENT, read(DRAFT_KEY) || read(PUBLISHED_KEY)); },
    saveDraft(data) { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); },
    publish(data) {
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(data));
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    },
    discardDraft() {
      const pub = read(PUBLISHED_KEY);
      if (pub) localStorage.setItem(DRAFT_KEY, JSON.stringify(pub));
      else localStorage.removeItem(DRAFT_KEY);
    },
    resetAll() { localStorage.removeItem(PUBLISHED_KEY); localStorage.removeItem(DRAFT_KEY); },
    defaults() { return clone(DEFAULT_CONTENT); }
  };
})();

if (typeof window !== "undefined") {
  window.DEFAULT_CONTENT = DEFAULT_CONTENT;
  window.ContentStore = ContentStore;
}
