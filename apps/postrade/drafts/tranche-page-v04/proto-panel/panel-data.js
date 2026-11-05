/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "tranche-page-v04",
    "title": "Post \u2014 \u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0420\u0421\u0411\u0423 v4"
  },
  "sources": {
    "flows": "a83ba19a",
    "comments": "3fbb624f"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0420\u0421\u0411\u0423 v4 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e).",
    "# \u041e\u0441\u043d\u043e\u0432\u0430 \u2014 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043a\u043e\u043d\u0446\u0435\u043f\u0442\u0430 v3 (RE0034, RE0035 \u042d4); v4 \u2014 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u043d\u0430 \u0442\u0440\u0430\u043d\u0448\u0435, 28.10.2026;",
    "# RE0050 (03.11.2026) \u2014 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441\u043b\u0438\u0442\u044b \u0432 \u043e\u0434\u043d\u0443 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u044e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb",
    "# (\u043f\u0435\u0440\u0438\u043e\u0434 \u0432\u043c\u0435\u0441\u0442\u043e \u0434\u0430\u0442\u044b), \u043e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423 \u2014 \u043f\u043e\u043c\u0435\u0441\u044f\u0447\u043d\u0430\u044f \u0441\u0435\u0442\u043a\u0430 \u043a\u043e\u043b\u043e\u043d\u043e\u043a 01.2025\u201312.2027, \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
    "# \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u044b\u0445 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u043e\u0432 \u043d\u0430\u043a\u0430\u043f\u043b\u0438\u0432\u0430\u044e\u0442\u0441\u044f.",
    "# \u041d\u043e\u043c\u0435\u0440\u0430 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0439 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u044b (\u0443\u0440\u043e\u043a \u041b255): \u0448\u0430\u0433\u0438, \u0447\u0442\u043e \u043e\u0441\u0442\u0430\u043b\u0438\u0441\u044c \u043e\u0442 v3, \u0434\u0435\u0440\u0436\u0430\u0442 \u0441\u0432\u043e\u0438 \u043d\u043e\u043c\u0435\u0440\u0430;",
    "# \u043d\u043e\u043c\u0435\u0440\u0430 \u0443\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0448\u0430\u0433\u043e\u0432 (12, 14\u201353 \u043a\u0440\u043e\u043c\u0435 \u043e\u0441\u0442\u0430\u0432\u0448\u0438\u0445\u0441\u044f) \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u043e \u043d\u0435 \u0432\u044b\u0434\u0430\u044e\u0442\u0441\u044f, \u043d\u043e\u0432\u044b\u0435 \u2014 \u0441 54.",
    "# 05.11.2026: \u0434\u0432\u0430 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432\u044b\u0445 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u044f \u2014 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0447\u0435\u0440\u0435\u0437 \u0442\u0430\u0439\u043b \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435",
    "# \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb (main) \u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u0431\u0435\u0437 \u043d\u0435\u0433\u043e (manual); \u00ab\u0410\u0432\u0442\u043e\u043f\u043e\u043a\u0430\u0437\u00bb \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u0441\u043a\u0432\u043e\u0437\u043d\u044b\u043c \u043f\u043e\u043a\u0430\u0437\u043e\u043c."
  ],
  "lastState": 82,
  "flows": [
    {
      "id": "main",
      "title": "\u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0447\u0435\u0440\u0435\u0437 \u0442\u0430\u0439\u043b \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb",
      "desc": "\u0421\u0434\u0435\u043b\u043a\u0430 \u2192 \u0442\u0440\u0430\u043d\u0448 (\u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439: \u043f\u0435\u0440\u0438\u043e\u0434 \u0438 \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438, \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u0441\u0440\u0430\u0437\u0443) \u2192 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2192 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 (\u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442) \u2192 \u043e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423. \u0413\u043e\u0442\u043e\u0432\u044b\u0445 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0439 \u0432 \u0430\u0434\u0440\u0435\u0441\u0435 \u043d\u0435\u0442, \u0441\u0442\u0430\u0440\u0442 \u2014 \u0441 \u0447\u0438\u0441\u0442\u043e\u0433\u043e.",
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438 \u2014 \u0447\u0438\u0441\u0442\u044b\u0439 \u0441\u0442\u0430\u0440\u0442",
          "page": "Deal.preview.html?id=1028&rasReset=1",
          "note": "\u0421\u0442\u0430\u0440\u0442: \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0441\u0434\u0435\u043b\u043a\u0438 \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0430\u0434\u0440\u0435\u0441\u0443 \u2014 \u043e\u043d \u0441\u0431\u0440\u0430\u0441\u044b\u0432\u0430\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u0443\u0431\u0438\u0440\u0430\u0435\u0442 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0445\u043e\u0434 \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u043d\u0435 \u0441\u0442\u0438\u0440\u0430\u0435\u0442. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0440\u0430\u043d\u0448 \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "main-tranche",
          "title": "\u0422\u0440\u0430\u043d\u0448 \u2014 \u0442\u0430\u0439\u043b \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u041d\u0430 \u0442\u0430\u0439\u043b\u0435 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u2014 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb; \u0442\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u2014 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb. \u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0432\u043d\u043e\u0441\u0438\u0442 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0442\u0440\u0430\u043d\u0448\u0430 (\u0437\u0430 \u043a\u0430\u0434\u0440\u043e\u043c) \u0438 \u0436\u043c\u0451\u0442 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 54,
          "id": "main-fix-modal",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u041f\u0435\u0440\u0438\u043e\u0434 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u2014 \u041e\u0442 01.01.2025 \u0414\u043e 31.03.2025 (\u0437\u0430\u043a\u0440\u044b\u0442 \u043f\u0435\u0440\u0432\u044b\u0439 \u043a\u0432\u0430\u0440\u0442\u0430\u043b): \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043d\u0435 \u043c\u0435\u043d\u044f\u0435\u0442. \u0426\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0441\u0430\u043c\u0430 \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f 01.04.2025. \u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0436\u043c\u0451\u0442 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u2014 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0437\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u0442\u0441\u044f \u0441\u0440\u0430\u0437\u0443, \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u0441\u0430\u043c\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 55,
          "id": "main-recalculated",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u2014 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0441\u043e\u0437\u0434\u0430\u043d\u044b",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u0421\u043d\u0435\u043a \u00ab\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u0421\u043e\u0437\u0434\u0430\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0420\u0421\u0411\u0423: 3\u00bb, \u0442\u0430\u0439\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: 3\u00bb. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0430\u0439\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0441\u0442\u0440\u0435\u043b\u043a\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "main-adjustments",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 \u0441\u0442\u0440\u043e\u043a\u0438 \u0438\u0437 \u0434\u0435\u043b\u044c\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u0422\u0440\u0438 \u0441\u0442\u0440\u043e\u043a\u0438: \u0438\u0441\u0445\u043e\u0434\u043d\u044b\u0435 \u0434\u0430\u0442\u044b 16.01.2025, 13.02.2025 \u0438 31.03.2025, \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 01.04.2025; \u0441\u0443\u043c\u043c\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 \u0441\u0443\u043c\u043c\u0430 \u0448\u0435\u0441\u0442\u0438 \u0432\u0438\u0434\u043e\u0432 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432. \u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043c\u043e\u0436\u0435\u0442 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u0442\u0440\u043e\u043a\u0443.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "main-metrics",
          "title": "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u00b7 \u0420\u0421\u0411\u0423 \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u0412\u043a\u043b\u0430\u0434\u043a\u0430 \u0420\u0421\u0411\u0423: \u043e\u0442\u0447\u0451\u0442 \u0435\u0449\u0451 \u043f\u0440\u0435\u0436\u043d\u0438\u0439 \u2014 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u0445\u043e\u0434\u044f\u0442 \u0432 \u043e\u0442\u0447\u0451\u0442 \u043f\u0440\u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435 \u043c\u0435\u0442\u0440\u0438\u043a. \u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0436\u043c\u0451\u0442 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb (\u0432\u043a\u043b\u0430\u0434\u043a\u0443 \u0432\u044b\u0431\u0438\u0440\u0430\u0442\u044c \u043d\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e).",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 57,
          "id": "main-report-mark",
          "title": "\u041e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 \u0443 \u0424\u0418 \u00ab128-\u041a\u0440\u0435\u0434\u0438\u0442-202\u00bb \u0432 \u0441\u0442\u0440\u043e\u043a\u0435 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u043a\u043e\u043b\u043e\u043d\u043a\u0430 01.04.2025 \u2014 \u0436\u0451\u043b\u0442\u0430\u044f \u044f\u0447\u0435\u0439\u043a\u0430 \u0441 \u043c\u0435\u0442\u043a\u043e\u0439, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423 \u043d\u0430 \u0441\u0443\u043c\u043c\u0443 +\u2026 RUB\u00bb. \u041a\u043e\u043b\u043e\u043d\u043a\u0438 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u2014 \u043a\u0430\u043a \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430, \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u2014 \u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442. \u041f\u043e\u0432\u0442\u043e\u0440\u043d\u044b\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043c\u0435\u0442\u0440\u0438\u043a \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u043d\u0435 \u043c\u0435\u043d\u044f\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "manual",
      "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u0440\u0443\u0447\u043d\u0443\u044e, \u0431\u0435\u0437 \u0442\u0430\u0439\u043b\u0430 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb",
      "desc": "\u0422\u0440\u0430\u043d\u0448 \u2192 \u0442\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u2192 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2192 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u2192 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u2192 \u043e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423. \u0422\u0430\u0439\u043b \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u043d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f.",
      "steps": [
        {
          "state": 76,
          "id": "manual-start",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438 \u2014 \u0447\u0438\u0441\u0442\u044b\u0439 \u0441\u0442\u0430\u0440\u0442",
          "page": "Deal.preview.html?id=1028&rasReset=1",
          "note": "\u0421\u0442\u0430\u0440\u0442: \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438 \u0441\u0431\u0440\u0430\u0441\u044b\u0432\u0430\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0438. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0440\u0430\u043d\u0448 \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 77,
          "id": "manual-tranche",
          "title": "\u0422\u0440\u0430\u043d\u0448 \u2014 \u0442\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0442\u0430\u0439\u043b\u0430 \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a. \u0422\u0430\u0439\u043b \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u0432 \u044d\u0442\u043e\u043c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043d\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 78,
          "id": "manual-page-empty",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u041f\u0443\u0441\u0442\u043e\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0442\u0430\u0431\u043b\u0438\u0446\u044b: \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442\u00bb \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rh-empty:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 79,
          "id": "manual-modal",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432\u00bb",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&open=add&rasAdj=none",
          "note": "\u0418\u0441\u0445\u043e\u0434\u043d\u0430\u044f \u0434\u0430\u0442\u0430 \u2014 \u0434\u0430\u0442\u0430 \u043e\u0442\u0447\u0451\u0442\u0430 \u0420\u0421\u0411\u0423; \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 \u043f\u043e\u0437\u0436\u0435 \u0438\u0441\u0445\u043e\u0434\u043d\u043e\u0439; \u0448\u0435\u0441\u0442\u044c \u0441\u0443\u043c\u043c, \u00ab\u0421\u0443\u043c\u043c\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438\u00bb \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u0432\u0432\u043e\u0434\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-start",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "16.01.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-end",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.04.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-p1",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "10000",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-p2",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "2500",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 80,
          "id": "manual-saved",
          "title": "\u0420\u0443\u0447\u043d\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u043d\u0435\u0441\u0435\u043d\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=manual",
          "note": "\u0421\u0442\u0440\u043e\u043a\u0430 \u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 16.01.2025 \u2192 01.04.2025 \u043d\u0430 12 500,00; \u0442\u043e\u0441\u0442 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 81,
          "id": "manual-metrics",
          "title": "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u00b7 \u0420\u0421\u0411\u0423 \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028&rasAdj=manual",
          "note": "\u0412\u043a\u043b\u0430\u0434\u043a\u0430 \u0420\u0421\u0411\u0423: \u043e\u0442\u0447\u0451\u0442 \u0435\u0449\u0451 \u043f\u0440\u0435\u0436\u043d\u0438\u0439 \u2014 \u0440\u0443\u0447\u043d\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u0445\u043e\u0434\u0438\u0442 \u0432 \u043e\u0442\u0447\u0451\u0442 \u043f\u0440\u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435 \u043c\u0435\u0442\u0440\u0438\u043a.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 82,
          "id": "manual-report",
          "title": "\u041e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028&rasAdj=manual-applied",
          "note": "\u0416\u0451\u043b\u0442\u0430\u044f \u044f\u0447\u0435\u0439\u043a\u0430 \u043d\u0430 01.04.2025 \u2014 \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438; \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423 \u043d\u0430 \u0441\u0443\u043c\u043c\u0443 +12 500,00 RUB\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden]) [data-fm-adjusted]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "ras-e2e",
      "title": "\u0410\u0432\u0442\u043e\u043f\u043e\u043a\u0430\u0437: \u0432\u0435\u0441\u044c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0439 \u043f\u0443\u0442\u044c \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432: \u043f\u0430\u043d\u0435\u043b\u044c \u0441\u0430\u043c\u0430 \u043d\u0430\u0436\u0438\u043c\u0430\u0435\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u043e\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0441\u0434\u0435\u043b\u043a\u0438 \u0434\u043e \u043e\u0442\u043c\u0435\u0442\u043a\u0438 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u0420\u0421\u0411\u0423 (\u0441\u0434\u0435\u043b\u043a\u0430 1028, \u00ab\u0412\u0432\u043e\u0434 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439\u00bb); \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0441 \u0447\u0438\u0441\u0442\u043e\u0433\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f",
      "steps": [
        {
          "state": 58,
          "id": "e2e4-deal",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438",
          "page": "Deal.preview.html?id=1028&rasReset=1",
          "note": "\u041c\u0430\u0440\u0442 \u0437\u0430\u043a\u0440\u044b\u0442, \u0434\u0430\u043d\u043d\u044b\u0435 \u0443\u0448\u043b\u0438 \u0432 1\u0421; \u0434\u0430\u043d\u043d\u044b\u0435 \u0437\u0430 \u043c\u0430\u0440\u0442 \u043f\u0440\u0438\u0448\u043b\u0438 \u043f\u043e\u0437\u0436\u0435. \u0414\u0430\u043b\u044c\u0448\u0435 \u2014 \u0442\u0440\u0430\u043d\u0448.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 59,
          "id": "e2e-fix-modal",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u043d\u0430 \u0442\u0430\u0439\u043b\u0435 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb. \u041f\u0435\u0440\u0438\u043e\u0434 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u041e\u0442 01.01.2025 \u0414\u043e 31.03.2025 \u2014 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0445 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434 \u043d\u0435 \u043c\u0435\u043d\u044f\u044e\u0442\u0441\u044f \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u043e\u043c; \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 01.04.2025, \u043d\u0430 \u043d\u0435\u0451 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u044f\u0442\u0441\u044f \u0441\u0443\u043c\u043c\u044b \u0434\u0435\u043b\u044c\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#ip-fix-recalc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rsbu-fix-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-from",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-to",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "31.03.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-adjust",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.04.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 60,
          "id": "e2e-recalc-run",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0437\u0430\u043f\u0443\u0449\u0435\u043d",
          "page": null,
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0432 \u043e\u043a\u043d\u0435: \u043e\u043a\u043d\u043e \u0437\u0430\u043a\u0440\u044b\u043b\u043e\u0441\u044c, \u043b\u043e\u0430\u0434\u0435\u0440 \u043d\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb, \u043e\u0431\u0435 \u043a\u043d\u043e\u043f\u043a\u0438 \u0442\u0430\u0439\u043b\u0430 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b (~1,5 \u0441).",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-rsbu-fix-submit]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-fix-recalc.btn--loading",
              "text": null,
              "index": 0,
              "timeout": 8000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-recalc[disabled]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 61,
          "id": "e2e4-recalc",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u2014 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0441\u043e\u0437\u0434\u0430\u043d\u044b",
          "page": null,
          "note": "\u0414\u0435\u043b\u044c\u0442\u044b \u0434\u0430\u0442 Q1 2025 \u0441\u0442\u0430\u043b\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430\u043c\u0438 \u043d\u0430 01.04.2025; \u0442\u0430\u0439\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: 3\u00bb, \u0441\u043d\u0435\u043a \u00ab\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u0421\u043e\u0437\u0434\u0430\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0420\u0421\u0411\u0423: 3\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#tile-rsbu-adjustments[data-state=\"data\"]",
              "text": null,
              "index": 0,
              "timeout": 8000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 62,
          "id": "e2e-adjustments",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=created",
          "note": "\u0421\u0442\u0440\u043e\u043a\u0430 \u043d\u0430 \u043a\u0430\u0436\u0434\u0443\u044e \u0434\u0430\u0442\u0443 \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u0441 \u0434\u0435\u043b\u044c\u0442\u043e\u0439 (\u0442\u0440\u0438); \u0448\u0435\u0441\u0442\u044c \u0432\u0438\u0434\u043e\u0432 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0438 \u0438\u0445 \u0441\u0443\u043c\u043c\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 63,
          "id": "e2e-manual-modal",
          "title": "\u041e\u043a\u043d\u043e \u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": null,
          "note": "\u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb: \u0448\u0435\u0441\u0442\u044c \u0441\u0443\u043c\u043c \u0432 \u0442\u0440\u0438 \u0440\u044f\u0434\u0430 \u043f\u043e \u0434\u0432\u0435 \u043a\u043e\u043b\u043e\u043d\u043a\u0438, \u00ab\u0421\u0443\u043c\u043c\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438\u00bb \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u0432\u0432\u043e\u0434\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#rh-add",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-start",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "16.01.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-end",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.04.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-p1",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "10000",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-adj-p2",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "2500",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 64,
          "id": "e2e-manual-saved",
          "title": "\u0420\u0443\u0447\u043d\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u043d\u0435\u0441\u0435\u043d\u0430",
          "page": null,
          "note": "\u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb \u2014 \u0441\u0442\u0440\u043e\u043a\u0430 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435, \u0442\u043e\u0441\u0442 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-rsbu-submit]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "hidden",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 65,
          "id": "e2e4-report",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043c\u0435\u0442\u0440\u0438\u043a \u2014 \u043e\u0442\u043c\u0435\u0442\u043a\u0430 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u0420\u0421\u0411\u0423",
          "page": "FinancialMetrics.preview.html?id=1028&rasAdj=created",
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb: \u0432 \u0441\u0442\u0440\u043e\u043a\u0435 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u043a\u043e\u043b\u043e\u043d\u043a\u0430 01.04.2025 \u2014 \u0436\u0451\u043b\u0442\u0430\u044f \u044f\u0447\u0435\u0439\u043a\u0430, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423 \u043d\u0430 \u0441\u0443\u043c\u043c\u0443 +\u2026 RUB\u00bb; \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u2014 \u043a\u0430\u043a \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden]) [data-node]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "click",
              "target": "#fm-calc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras [data-fm-adjusted]",
              "text": null,
              "index": 0,
              "timeout": 8000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "rsbu-payments",
      "title": "\u041f\u043e\u043a\u0430\u0437 \u0442\u0430\u0439\u043b\u0430 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0432\u0438\u0434\u044b \u0442\u0430\u0439\u043b\u0430 \u0438 \u043e\u043a\u043d\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432",
      "steps": [
        {
          "state": 66,
          "id": "pay-none",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043e\u00bb, \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 67,
          "id": "pay-modal",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none&open=fix",
          "note": "\u041f\u0435\u0440\u0438\u043e\u0434 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 (\u041e\u0442/\u0414\u043e, \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c) \u0438 \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438; \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u043e\u043d\u0430 \u2014 \u043f\u0435\u0440\u0432\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u043c\u0435\u0441\u044f\u0446\u0430 \u043f\u043e\u0441\u043b\u0435 \u00ab\u0414\u043e\u00bb. \u041e\u043a\u043d\u043e \u0432\u0441\u0435\u0433\u0434\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u0443\u0441\u0442\u044b\u043c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-fix-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 68,
          "id": "pay-modal-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u2014 \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043d\u0435 \u043f\u043e\u0437\u0436\u0435 \u043a\u043e\u043d\u0446\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u0430",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none&open=fix",
          "note": "\u0426\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0434\u043e\u043b\u0436\u043d\u0430 \u0431\u044b\u0442\u044c \u043f\u043e\u0437\u0436\u0435 \u043a\u043e\u043d\u0446\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u2014 Alert \u0432\u0432\u0435\u0440\u0445\u0443 \u043e\u043a\u043d\u0430, \u043f\u043e\u043b\u0435 \u043a\u0440\u0430\u0441\u043d\u043e\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-fix-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-from",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-to",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "31.03.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "fill",
              "target": "#rsbu-fix-adjust",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "31.03.2025",
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "click",
              "target": "[data-rsbu-fix-submit]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rsbu-fix-alert:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 69,
          "id": "pay-done",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=created",
          "note": "\u0422\u0430\u0439\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: 3\u00bb (\u0434\u0435\u043b\u044c\u0442\u044b Q1 2025 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u044b \u043d\u0430 01.04.2025); \u0448\u0442\u0430\u043c\u043f\u0430 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435 \u043f\u043b\u0430\u0442\u0451\u0436\u0435\u0439 \u043d\u0435\u0442. \u041f\u043e\u0432\u0442\u043e\u0440\u043d\u043e\u0435 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u043e\u0442\u043a\u0440\u043e\u0435\u0442 \u043f\u0443\u0441\u0442\u043e\u0435 \u043e\u043a\u043d\u043e \u2014 \u043d\u043e\u0432\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434 \u0438 \u043d\u043e\u0432\u0430\u044f \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 70,
          "id": "pay-view",
          "title": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsMode=view&rasAdj=none",
          "note": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u043d\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043d\u0435\u0442 \u043d\u0438 \u043e\u0434\u043d\u043e\u0439 \u0438\u0437 \u0434\u0432\u0443\u0445 \u043a\u043d\u043e\u043f\u043e\u043a \u2014 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u043e\u0431\u0435 \u0441\u043a\u0440\u044b\u0442\u044b.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ip-recalc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "hidden",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-fix-recalc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "hidden",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 73,
          "id": "pay-recalc",
          "title": "\u041e\u0431\u044b\u0447\u043d\u044b\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u2014 \u0431\u0435\u0437 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0431\u0435\u0437 \u043e\u043a\u043d\u0430: \u043b\u043e\u0430\u0434\u0435\u0440 \u043d\u0430 \u043d\u0435\u0439, \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u0442\u043e\u0436\u0435 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430 \u043d\u0430 \u0432\u0440\u0435\u043c\u044f \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0438; \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043d\u0435 \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f, \u0441\u043d\u0435\u043a \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u0442\u0440\u0430\u043d\u0448\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u044b\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#ip-recalc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-recalc.btn--loading",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-fix-recalc[disabled]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 75,
          "id": "pay-no-fi",
          "title": "\u0422\u0440\u0430\u043d\u0448 \u0431\u0435\u0437 \u0424\u0418 \u2014 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u0430",
          "page": "Tranche.preview.html?id=1026&tr=1026.d1.p1.i1.t1&rasAdj=none",
          "note": "\u0411\u0435\u0437 \u0424\u0418 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430, \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u0432\u0438\u0434\u043d\u0430 \u0438 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430; \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u2014 \u0442\u0443\u043b\u0442\u0438\u043f \u0441 \u043f\u0440\u0438\u0447\u0438\u043d\u043e\u0439 (\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430 05.11.2026).",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ip-fix-recalc[disabled]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#ip-recalc",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "hover",
              "target": "#ip-fix-anchor",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": ".tip.is-visible",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "rsbu-tile",
      "title": "\u041f\u043e\u043a\u0430\u0437 \u0442\u0430\u0439\u043b\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u0433\u043e\u0442\u043e\u0432\u044b\u0435 \u0432\u0438\u0434\u044b",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0432\u0438\u0434\u044b \u0442\u0430\u0439\u043b\u0430 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u043f\u043e \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c, \u0434\u0430\u043d\u043d\u044b\u043c \u0438 \u043f\u0440\u0430\u0432\u0430\u043c \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432",
      "steps": [
        {
          "state": 5,
          "id": "rsbu-tile-locked",
          "title": "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=locked&rasAdj=none",
          "note": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u2014 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u00ab\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb, \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "rsbu-tile-none",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=none&rasAdj=none",
          "note": "\u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb; \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "rsbu-tile-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=created",
          "note": "\u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: 3\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 8,
          "id": "rsbu-tile-view",
          "title": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsMode=view&rasAdj=created",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u043d\u0435\u0442, \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u2014 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043c\u043e\u0436\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-page",
      "title": "\u041f\u043e\u043a\u0430\u0437 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u044b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a, \u043e\u043a\u043d\u0430 \u0438 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432",
      "steps": [
        {
          "state": 9,
          "id": "rsbu-page-empty",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=none",
          "note": "\u041f\u0443\u0441\u0442\u043e\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0442\u0430\u0431\u043b\u0438\u0446\u044b \u0414\u0421 \u2014 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043f\u043e\u043a\u0430 \u043d\u0435\u0442\u00bb \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u043f\u043e\u0434 \u0448\u0430\u043f\u043a\u043e\u0439 \u043a\u043e\u043b\u043e\u043d\u043e\u043a; \u043f\u0430\u0433\u0438\u043d\u0430\u0446\u0438\u044f \u0432\u0438\u0434\u043d\u0430 \u0438 \u0431\u0435\u0437 \u0441\u0442\u0440\u043e\u043a. \u00ab\u0412 \u0442\u0440\u0430\u043d\u0448\u00bb \u0432 \u0448\u0430\u043f\u043a\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rh-empty:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rh-empty-add:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rh-footer:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 74,
          "id": "rsbu-page-view",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u2014 \u0431\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsMode=view&rasAdj=created",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u043d\u0435\u0442, \u0432 \u0441\u0442\u0440\u043e\u043a\u0435 \u043d\u0435\u0442 \u043a\u043e\u0440\u0437\u0438\u043d\u044b \u2014 \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0442\u043e\u0436\u0435 \u043d\u0435\u0442; \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rh-add",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "hidden",
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rh-tbl:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 10,
          "id": "rsbu-page-modal",
          "title": "\u041e\u043a\u043d\u043e \u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&open=add&rasAdj=none",
          "note": "\u0422\u0430\u043a \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435. \u0414\u0430\u0442\u044b \u2014 \u043f\u043e\u043b\u044f \u0441 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0451\u043c; \u0448\u0435\u0441\u0442\u044c \u0441\u0443\u043c\u043c \u2014 \u0441\u043b\u0435\u0432\u0430 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435, \u0441\u043f\u0440\u0430\u0432\u0430 \u00ab\u041a\u0430\u043f.\u00bb; \u00ab\u0421\u0443\u043c\u043c\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438\u00bb \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u0435\u043d\u0438\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        },
        {
          "state": 11,
          "id": "rsbu-page-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0438\u0437 \u0434\u0435\u043b\u044c\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=created",
          "note": "\u0421\u0442\u0440\u043e\u043a\u0438, \u0441\u043e\u0437\u0434\u0430\u043d\u043d\u044b\u0435 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439\u00bb \u043d\u0430 \u0442\u0440\u0430\u043d\u0448\u0435; \u043f\u0440\u0430\u0432\u043a\u0438 \u043d\u0435\u0442 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u043a\u043e\u0440\u0437\u0438\u043d\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 13,
          "id": "rsbu-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=created&demo=delete",
          "note": "\u041e\u043a\u043d\u043e \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0430\u0435\u0442, \u0447\u0442\u043e \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 \u043c\u0435\u0442\u0440\u0438\u043a \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u043d\u0430 \u0438\u0441\u0445\u043e\u0434\u043d\u043e\u0439 \u0434\u0430\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rh-delete-scrim:not([hidden])",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "rsbu-multi",
      "title": "\u041f\u043e\u0432\u0442\u043e\u0440\u043d\u044b\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439 \u2014 \u043d\u0430\u043a\u043e\u043f\u043b\u0435\u043d\u0438\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
      "desc": "\u0414\u0432\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 \u0441 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0435\u0439 \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432; \u043f\u0440\u0435\u0436\u043d\u0438\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043d\u0435 \u043f\u0440\u043e\u043f\u0430\u0434\u0430\u044e\u0442",
      "steps": [
        {
          "state": 71,
          "id": "multi-adjustments",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0434\u0432\u0443\u0445 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u043e\u0432",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasAdj=multi",
          "note": "21 \u0441\u0442\u0440\u043e\u043a\u0430: 3 \u0441 \u0446\u0435\u043b\u0435\u0432\u043e\u0439 \u0434\u0430\u0442\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 01.04.2025 (\u043f\u0435\u0440\u0432\u044b\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442, \u043f\u0435\u0440\u0438\u043e\u0434 Q1 2025) \u0438 18 \u0441 01.07.2026 (\u0432\u0442\u043e\u0440\u043e\u0439, \u0441\u043f\u0443\u0441\u0442\u044f \u043f\u043e\u043b\u0442\u043e\u0440\u0430 \u0433\u043e\u0434\u0430, \u043f\u0435\u0440\u0438\u043e\u0434 01.2025\u201306.2026). \u041f\u0440\u0435\u0436\u043d\u0438\u0435 \u0441\u0442\u0440\u043e\u043a\u0438 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f: \u043a\u0430\u0436\u0434\u044b\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0438\u0442 \u0441\u0432\u043e\u0438 \u0434\u0435\u043b\u044c\u0442\u044b \u043d\u0430 \u0441\u0432\u043e\u044e \u0446\u0435\u043b\u0435\u0432\u0443\u044e \u0434\u0430\u0442\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 72,
          "id": "multi-report",
          "title": "\u041e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423 \u2014 \u043e\u0442\u043c\u0435\u0442\u043a\u0438 \u043d\u0430 \u0434\u0432\u0443\u0445 \u0434\u0430\u0442\u0430\u0445 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
          "page": "FinancialMetrics.preview.html?id=1028&rasAdj=multi-applied",
          "note": "\u041a\u043e\u043b\u043e\u043d\u043a\u0438 \u2014 \u043f\u043e\u043c\u0435\u0441\u044f\u0447\u043d\u0430\u044f \u0441\u0435\u0442\u043a\u0430 \u0441 \u044f\u043d\u0432\u0430\u0440\u044f 2025 \u043f\u043e \u0434\u0435\u043a\u0430\u0431\u0440\u044c 2027 (\u0432 \u043c\u0430\u0440\u0442\u0435, \u0438\u044e\u043d\u0435, \u0441\u0435\u043d\u0442\u044f\u0431\u0440\u0435 \u0438 \u0434\u0435\u043a\u0430\u0431\u0440\u0435 \u2014 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0434\u043d\u0438 \u043c\u0435\u0441\u044f\u0446\u0435\u0432). \u0412 \u0441\u0442\u0440\u043e\u043a\u0435 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u0436\u0451\u043b\u0442\u044b\u0435 \u044f\u0447\u0435\u0439\u043a\u0438 \u043d\u0430 01.04.2025 \u0438 01.07.2026; \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u0432\u0442\u043e\u0440\u043e\u0433\u043e \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430 (\u043f\u043e 30.06.2026) \u2014 \u043a\u0430\u043a \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430, \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u2014 \u043d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-ras",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#panel-ras:not([hidden]) [data-fm-adjusted]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    }
  ],
  "flowErrors": [],
  "comments": [],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u041a-1 \u0438 \u041a-2 \u043a\u043e\u043d\u0446\u0435\u043f\u0442\u0430 v3 (\u0431\u0438\u0437\u043d\u0435\u0441-\u0441\u043c\u044b\u0441\u043b \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430, \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0434\u0430\u0442) \u0437\u0430\u043a\u0440\u044b\u0442\u044b \u0438 \u043a \u043c\u043e\u0434\u0435\u043b\u0438 v4\n\u043d\u0435 \u043e\u0442\u043d\u043e\u0441\u044f\u0442\u0441\u044f \u2014 \u043e\u0441\u0442\u0430\u043b\u0438\u0441\u044c \u0432 `tranche-page-v03/proto-panel/comments.md`.",
  "commentErrors": []
};
