/* ═══════════════════════════════════════════════════════════════
   Seed Template Data — "Store Visit" form
   ═══════════════════════════════════════════════════════════════ */
window.__SEED_VERSION__ = 3;
window.__SEED_TEMPLATES__ = [
  {
    "id": "sv-test-store-visit",
    "name": "Store Visit & Operations Audit",
    "description": "Comprehensive store visit form with KPIs, operational checks, customer service, and managerial review scoring.",
    "createdAt": new Date().toISOString(),
    "fields": [
      { "id": "sv-hdr", "answerType": "header", "label": "Store Visit Form", "subLabel": "Standard Operating Procedure Audit", "required": false, "scoringType": "none",
        "headerConfig": { "showName": true, "showJobTitle": true, "showDate": true, "showStore": true, "showDocRef": true, "showDocId": false, "showLogo": false, "showTraining": false, "defaultJobTitle": "Area Manager" } },

      { "id": "sv-sec-actions", "answerType": "section", "label": "Last Visit Actions", "required": false, "scoringType": "none" },
      { "id": "sv-act1", "answerType": "textarea", "label": "Action 1 Review", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2, "placeholder": "Review status of previous action 1..." },
      { "id": "sv-act2", "answerType": "textarea", "label": "Action 2 Review", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2, "placeholder": "Review status of previous action 2..." },
      { "id": "sv-act3", "answerType": "textarea", "label": "Action 3 Review", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2, "placeholder": "Review status of previous action 3..." },

      { "id": "sv-sec-kpi", "answerType": "section", "label": "KPIs & Targets", "required": false, "scoringType": "none" },
      { "id": "sv-kpi-sales", "answerType": "table", "label": "Sales & Spend Metrics", "scoringType": "passfail", "scoreWeight": 2, "required": false,
        "tableCols": 2, "tableRows": 2, "tableHeaders": ["Target", "Actual"], "tableRowHeaders": ["Sales vs target", "Average Spend"], "tableRowHeaderLabel": "Metric", "tableScoredRows": [0, 1] },
      { "id": "sv-kpi-waste", "answerType": "table", "label": "Wastage & Production", "scoringType": "passfail", "scoreWeight": 1, "required": false,
        "tableCols": 2, "tableRows": 4, "tableHeaders": ["Target", "Actual"], "tableRowHeaders": ["Wastage %", "Filled Rolls", "Sandwiches", "Hot Roll"], "tableRowHeaderLabel": "Metric", "tableScoredRows": [0, 1, 2, 3] },
      { "id": "sv-kpi-ops", "answerType": "table", "label": "Operational Efficiency", "scoringType": "passfail", "scoreWeight": 1, "required": false,
        "tableCols": 2, "tableRows": 3, "tableHeaders": ["Target", "Actual"], "tableRowHeaders": ["Hot Beverages", "Store working within allotted hours?", "Is energy usage being monitored?"], "tableRowHeaderLabel": "Metric", "tableScoredRows": [0, 1, 2] },

      { "id": "sv-sec-daypart", "answerType": "section", "label": "Sales by Day Part", "required": false, "scoringType": "none" },
      { "id": "sv-dp-sales", "answerType": "table", "label": "Day Part Targets", "scoringType": "passfail", "scoreWeight": 1, "required": false,
        "tableCols": 2, "tableRows": 3, "tableHeaders": ["Target", "Actual"], "tableRowHeaders": ["Breakfast - opening until 10:30am", "Lunch - 10:30am until 1:30pm", "Afternoon - 1:30pm until Close"], "tableRowHeaderLabel": "Time", "tableScoredRows": [0, 1, 2] },

      { "id": "sv-sec-support", "answerType": "section", "label": "Supporting Checks", "required": false, "scoringType": "none" },
      { "id": "sv-sup-tracker", "answerType": "textarea", "label": "Is the target tracker on display and filled in?", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-sup-aware", "answerType": "textarea", "label": "Are the whole team aware of their daily tracker?", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-sup-expenses", "answerType": "textarea", "label": "Are expenses in line and approved?", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-sup-discount", "answerType": "textarea", "label": "Is discount procedure in place?", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2 },

      { "id": "sv-sec-ops", "answerType": "section", "label": "Operational Review", "required": false, "scoringType": "none" },
      { "id": "sv-ops-clean", "answerType": "textarea", "label": "Is store clean and tidy?", "required": false, "scoringType": "passfail", "scoreWeight": 2, "rows": 2 },
      { "id": "sv-ops-display", "answerType": "textarea", "label": "Are products correctly displayed and have correct pricing tickets?", "required": false, "scoringType": "passfail", "scoreWeight": 1.5, "rows": 2 },
      { "id": "sv-ops-avail", "answerType": "textarea", "label": "Is there adequate availability of products for the time of day?", "required": false, "scoringType": "passfail", "scoreWeight": 1.5, "rows": 2 },
      { "id": "sv-ops-coffee", "answerType": "textarea", "label": "Are coffee checks up to date and is the coffee area clean and tidy?", "required": false, "scoringType": "passfail", "scoreWeight": 1, "rows": 2 },

      { "id": "sv-sec-cs", "answerType": "section", "label": "Customer Service", "required": false, "scoringType": "none" },
      { "id": "sv-cs-staffing", "answerType": "textarea", "label": "Was the staffing levels adequate for the level of trade?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-cs-upsell", "answerType": "textarea", "label": "Was upselling observed?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-cs-hotdrinks", "answerType": "textarea", "label": "Were all team offering hot drinks to customers?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-cs-uber", "answerType": "textarea", "label": "Uber and JE - is the service being monitored, stock of paper goods adequate?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },

      { "id": "sv-sec-mgr", "answerType": "section", "label": "Managerial", "required": false, "scoringType": "none" },
      { "id": "sv-mgr-birdsway", "answerType": "textarea", "label": "Can manager access The Birds Way and demonstrate communications of this with team?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-caplor", "answerType": "textarea", "label": "Caplor - has the manager been through most recent training session: Caplor house?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-foodsafety", "answerType": "textarea", "label": "Food safety - compliance logs, probe and scale calibrations, pest control?", "required": false, "scoringType": "rag", "scoreWeight": 2, "rows": 2 },
      { "id": "sv-mgr-fire", "answerType": "textarea", "label": "Fire Safety - demonstrate alarm and lighting checks, fire drills up to date?", "required": false, "scoringType": "rag", "scoreWeight": 2, "rows": 2 },
      { "id": "sv-mgr-hs", "answerType": "textarea", "label": "Health and Safety - correct stock of oven gloves, rhino sleeves, goggles, accident book?", "required": false, "scoringType": "rag", "scoreWeight": 2, "rows": 2 },
      { "id": "sv-mgr-eho", "answerType": "textarea", "label": "Can manager access last EHO visit and have all actions been resolved?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-complaints", "answerType": "textarea", "label": "If applicable, have all customer complaints been reviewed?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-safe", "answerType": "textarea", "label": "Is the safe closed, locked and keys stored away safely?", "required": false, "scoringType": "rag", "scoreWeight": 2, "rows": 2 },
      { "id": "sv-mgr-discrepancies", "answerType": "textarea", "label": "Any discrepancies reported and investigated?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-absence", "answerType": "textarea", "label": "Are all holidays, sickness, absences being monitored and reviewed?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },
      { "id": "sv-mgr-rota", "answerType": "textarea", "label": "Are ROTAs planned and reviewed for any holidays, long term sickness, etc?", "required": false, "scoringType": "rag", "scoreWeight": 1, "rows": 2 },

      { "id": "sv-sec-newactions", "answerType": "section", "label": "New Actions", "required": false, "scoringType": "none" },
      { "id": "sv-newact1", "answerType": "textarea", "label": "Action 1", "required": false, "scoringType": "none", "rows": 2, "placeholder": "Describe new action 1..." },
      { "id": "sv-newact2", "answerType": "textarea", "label": "Action 2", "required": false, "scoringType": "none", "rows": 2, "placeholder": "Describe new action 2..." },
      { "id": "sv-newact3", "answerType": "textarea", "label": "Action 3", "required": false, "scoringType": "none", "rows": 2, "placeholder": "Describe new action 3..." },

      { "id": "sv-summary", "answerType": "textarea", "label": "Executive Summary", "required": true, "scoringType": "none", "rows": 4, "placeholder": "Overall summary and final thoughts on the visit..." },
      { "id": "sv-photo-evidence", "answerType": "photo", "label": "Audit Evidence Photos", "maxPhotos": 10, "required": false, "scoringType": "none" },

      { "id": "sv-sig-mgr", "answerType": "signoff", "label": "", "signoffRole": "Area Manager", "required": false, "scoringType": "none" },
      { "id": "sv-sig-storemgr", "answerType": "signoff", "label": "", "signoffRole": "Store Manager", "required": false, "scoringType": "none" }
    ]
  }
];