/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "tranche-page-v03",
    "title": "Post \u2014 \u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0420\u0421\u0411\u0423 v3"
  },
  "sources": {
    "flows": "55088365",
    "comments": "0ca54640"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0420\u0421\u0411\u0423 v3 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e).",
    "# \u041e\u0441\u043d\u043e\u0432\u0430 \u2014 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043c\u043e\u0434\u0443\u043b\u044f deals-app (\u0442\u0430\u0439\u043b \u0438 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a), 22.10.2026, RE0034."
  ],
  "lastState": 53,
  "flows": [
    {
      "id": "main",
      "title": "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u043f\u0443\u0442\u044c \u2014 \u0440\u0443\u043a\u0430\u043c\u0438",
      "desc": "\u0421\u0434\u0435\u043b\u043a\u0430 \u2192 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 (\u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c) \u2192 \u0442\u0440\u0430\u043d\u0448 \u2192 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u2192 \u043e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423. \u0413\u043e\u0442\u043e\u0432\u044b\u0445 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0439 \u0432 \u0430\u0434\u0440\u0435\u0441\u0435 \u043d\u0435\u0442, \u0441\u0442\u0430\u0440\u0442 \u2014 \u0441 \u0447\u0438\u0441\u0442\u043e\u0433\u043e.",
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438 \u2014 \u0447\u0438\u0441\u0442\u044b\u0439 \u0441\u0442\u0430\u0440\u0442",
          "page": "Deal.preview.html?id=1028&rasReset=1",
          "note": "\u0421\u0442\u0430\u0440\u0442: \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0441\u0434\u0435\u043b\u043a\u0438 \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0430\u0434\u0440\u0435\u0441\u0443 \u2014 \u043e\u043d \u0441\u0431\u0440\u0430\u0441\u044b\u0432\u0430\u0435\u0442 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d\u043d\u044b\u0435 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044e \u0438 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u044b \u0420\u0421\u0411\u0423 \u044d\u0442\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0438 \u0438 \u0443\u0431\u0438\u0440\u0430\u0435\u0442 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0445\u043e\u0434 \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u043d\u0435 \u0441\u0442\u0438\u0440\u0430\u0435\u0442. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0436\u043c\u0451\u0442 \u00ab\u041e\u0442\u0447\u0435\u0442\u044b \u2192\u00bb \u043d\u0430 \u0442\u0430\u0439\u043b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "main-metrics",
          "title": "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u00b7 \u0420\u0421\u0411\u0423",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u0412\u043a\u043b\u0430\u0434\u043a\u0430 \u0420\u0421\u0411\u0423 \u0431\u0435\u0437 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438: \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u0424\u0418 \u0441 \u0442\u0440\u0430\u043d\u0448\u0435\u043c \u2014 \u043a\u0435\u0431\u0430\u0431. \u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043a\u0435\u0431\u0430\u0431 \u0438 \u0436\u043c\u0451\u0442 \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0441\u0447\u0451\u0442\u00bb.",
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
          "state": 52,
          "id": "main-fixed",
          "title": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043b \u0440\u0430\u0441\u0447\u0451\u0442: \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u043f\u043e\u044f\u0432\u0438\u043b\u0441\u044f \u0447\u0438\u043f, \u043a\u0435\u0431\u0430\u0431\u0430 \u043d\u0435\u0442, \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043f\u0440\u0435\u0436\u043d\u0438\u0435. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0436\u043c\u0451\u0442 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb.",
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
          "state": 53,
          "id": "main-delta",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u2014 \u0434\u0435\u043b\u044c\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043d\u0430\u0436\u0430\u043b \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb: \u0441\u0442\u0440\u043e\u043a\u0430 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430 \u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e\u00bb, \u00ab\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430\u00bb, \u00ab\u0414\u0435\u043b\u044c\u0442\u0430\u00bb, \u0434\u0435\u043b\u044c\u0442\u0430 \u0440\u0430\u0441\u0442\u0451\u0442 \u043e\u0442 \u0434\u0430\u0442\u044b \u043a \u0434\u0430\u0442\u0435. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044f \u0432 \u0441\u0434\u0435\u043b\u043a\u0443 \u043a\u0440\u043e\u0448\u043a\u043e\u0439.",
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
          "state": 47,
          "id": "main-deal-back",
          "title": "\u0421\u0434\u0435\u043b\u043a\u0430 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "Deal.preview.html?id=1028",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0432\u0435\u0440\u043d\u0443\u043b\u0441\u044f \u0432 \u0441\u0434\u0435\u043b\u043a\u0443 \u043a\u0440\u043e\u0448\u043a\u043e\u0439: \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0438 \u0434\u0435\u043b\u044c\u0442\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u044b \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0440\u0430\u043d\u0448 \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u043e\u0432.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "main-tranche",
          "title": "\u0422\u0440\u0430\u043d\u0448 \u2014 \u0442\u0430\u0439\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043f\u0435\u0440\u0435\u0448\u0451\u043b \u0438\u0437 \u0434\u0435\u0440\u0435\u0432\u0430 \u0432 \u0442\u0440\u0430\u043d\u0448: \u0442\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u0431\u0435\u0437 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a, \u043d\u0430\u0434 \u0442\u0435\u043b\u043e\u043c \u2014 \u00ab\u0420\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0441 \u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413\u00bb. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0430\u0439\u043b \u0441\u0442\u0440\u0435\u043b\u043a\u043e\u0439 \u0438\u043b\u0438 \u043a\u043d\u043e\u043f\u043a\u043e\u0439 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "main-adjustments",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u2014 \u043f\u0443\u0441\u0442\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u043e\u0442\u043a\u0440\u044b\u043b \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u043f\u0443\u0441\u0442\u0430\u044f, \u043d\u0430\u0434 \u043d\u0435\u0439 \u043e\u0442\u043c\u0435\u0442\u043a\u0430 \u043e \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0438. \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0436\u043c\u0451\u0442 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb, \u0432\u0432\u043e\u0434\u0438\u0442 \u0434\u0430\u0442\u044b \u00ab\u0441\u00bb \u0438 \u00ab\u043d\u0430\u00bb, \u0447\u0430\u0441\u0442\u044c \u0434\u0435\u043b\u044c\u0442\u044b \u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 50,
          "id": "main-move-saved",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u043d\u0435\u0441\u0435\u043d\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u043b \u043f\u0435\u0440\u0435\u043d\u043e\u0441: \u0441\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u044f\u0432\u0438\u043b\u0430\u0441\u044c \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435, \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u043c\u0435\u043d\u044c\u0448\u0438\u043b\u043e\u0441\u044c (\u043f\u0440\u0438 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0435 \u0432\u0441\u0435\u0439 \u0434\u0435\u043b\u044c\u0442\u044b \u2014 \u0434\u043e \u043d\u0443\u043b\u044f). \u0414\u0430\u043b\u044c\u0448\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0438\u0434\u0451\u0442 \u00ab\u0412 \u0442\u0440\u0430\u043d\u0448\u00bb \u2014 \u0442\u0430\u043c \u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: 1\u00bb, \u2014 \u043f\u043e\u0442\u043e\u043c \u0432 \u0441\u0434\u0435\u043b\u043a\u0443 \u0438 \u043d\u0430 \u043c\u0435\u0442\u0440\u0438\u043a\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 51,
          "id": "main-report",
          "title": "\u041e\u0442\u0447\u0451\u0442 \u0420\u0421\u0411\u0423 \u043f\u043e\u0441\u043b\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": "FinancialMetrics.preview.html?id=1028",
          "note": "\u0427\u0435\u043b\u043e\u0432\u0435\u043a \u0441\u0430\u043c \u0432\u0435\u0440\u043d\u0443\u043b\u0441\u044f \u043d\u0430 \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u0438 \u043e\u0442\u043a\u0440\u044b\u043b \u0432\u043a\u043b\u0430\u0434\u043a\u0443 \u0420\u0421\u0411\u0423: \u0434\u0435\u043b\u044c\u0442\u0430 \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u043c\u0435\u043d\u044c\u0448\u0435 \u043d\u0430 \u0434\u0430\u0442\u0430\u0445 \u043d\u0435 \u0440\u0430\u043d\u044c\u0448\u0435 \u00ab\u043d\u0430\u00bb, \u044f\u0447\u0435\u0439\u043a\u0438 \u00ab\u0441\u00bb \u0438 \u00ab\u043d\u0430\u00bb \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u044b, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2026 \u043d\u0430 \u2026\u00bb. \u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0435\u0449\u0451 \u0441\u0442\u043e\u0438\u0442 \u2014 \u0441\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u043e\u043c.",
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
      "id": "ras-e2e",
      "title": "\u0410\u0432\u0442\u043e\u043f\u043e\u043a\u0430\u0437: \u0432\u0435\u0441\u044c \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0439 \u043f\u0443\u0442\u044c \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432: \u043f\u0430\u043d\u0435\u043b\u044c \u0441\u0430\u043c\u0430 \u043d\u0430\u0436\u0438\u043c\u0430\u0435\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u043e\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0441\u0434\u0435\u043b\u043a\u0438 \u0434\u043e \u0441\u043d\u044f\u0442\u0438\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 (\u0441\u0434\u0435\u043b\u043a\u0430 1028, \u00ab\u0412\u0432\u043e\u0434 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439\u00bb); \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0441 \u0447\u0438\u0441\u0442\u043e\u0433\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f",
      "steps": [
        {
          "state": 37,
          "id": "e2e-deal",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438",
          "page": "Deal.preview.html?id=1028&rasReset=1",
          "note": "\u041f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u043a\u0440\u044b\u0442, \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0443\u0448\u043b\u0430 \u0432 1\u0421. \u0414\u0430\u043b\u044c\u0448\u0435 \u2014 \u0444\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438, \u0432\u043a\u043b\u0430\u0434\u043a\u0430 \u0420\u0421\u0411\u0423. \u041f\u043e\u0437\u0434\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0432 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u043d\u0435 \u0432\u043d\u043e\u0441\u0438\u0442\u0441\u044f \u2014 \u0435\u0433\u043e \u0437\u0430\u043c\u0435\u043d\u044f\u0435\u0442 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u043f\u0440\u0438 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u043c \u0440\u0430\u0441\u0447\u0451\u0442\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 38,
          "id": "e2e-fix",
          "title": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=none&rasMoves=none",
          "note": "\u041a\u0435\u0431\u0430\u0431 \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u0424\u0418 \u0441 \u0442\u0440\u0430\u043d\u0448\u0435\u043c \u2192 \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0441\u0447\u0451\u0442\u00bb. \u0423 \u0441\u0442\u0440\u043e\u043a\u0438 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0447\u0438\u043f, \u0434\u0430\u0442\u0430 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u2014 \u0432 \u0442\u0443\u043b\u0442\u0438\u043f\u0435. \u041f\u043e\u0440\u044f\u0434\u043e\u043a \u00ab\u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f / \u043f\u043b\u0430\u0442\u0451\u0436\u00bb \u043d\u0430 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442 \u043d\u0435 \u0432\u043b\u0438\u044f\u0435\u0442.",
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
              "target": "#panel-ras [data-menu^=\"fm-fixmenu-\"]",
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
              "target": "[data-fm-fix-ras]",
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
              "target": "[data-fm-fix-ras]",
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
              "target": "#panel-ras [data-fm-fixed-chip]",
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
          "state": 39,
          "id": "e2e-recalc",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043e\u0441\u043b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u2014 \u0434\u0435\u043b\u044c\u0442\u0430",
          "page": null,
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u2014 \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430 \u0434\u0435\u0440\u0435\u0432\u043e \u0438\u0437 \u0442\u0440\u0451\u0445 \u0441\u0442\u0440\u043e\u043a: \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e\u00bb, \u00ab\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430\u00bb, \u00ab\u0414\u0435\u043b\u044c\u0442\u0430\u00bb (\u043f\u043b\u044e\u0441 \u0437\u0435\u043b\u0451\u043d\u044b\u043c, \u043c\u0438\u043d\u0443\u0441 \u043a\u0440\u0430\u0441\u043d\u044b\u043c). \u0420\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0440\u0430\u0441\u0442\u0451\u0442 \u043e\u0442 \u0434\u0430\u0442\u044b \u043a \u0434\u0430\u0442\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
          "state": 40,
          "id": "e2e-move-modal",
          "title": "\u041e\u043a\u043d\u043e \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430 \u2014 \u0434\u0435\u043b\u044c\u0442\u0430 \u043d\u0430 \u0434\u0430\u0442\u0443",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=none",
          "note": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0442\u0440\u0430\u043d\u0448\u0430; \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e, \u043d\u0430\u0434 \u0442\u0430\u0431\u043b\u0438\u0446\u0435\u0439 \u043e\u0442\u043c\u0435\u0442\u043a\u0430. \u0412 \u043e\u043a\u043d\u0435, \u043a\u043e\u0433\u0434\u0430 \u0432\u044b\u0431\u0440\u0430\u043d\u0430 \u0434\u0430\u0442\u0430 \u00ab\u0441\u00bb (30.06.2025), \u043f\u043e\u043a\u0430\u0437\u0430\u043d\u0430 \u00ab\u0414\u0435\u043b\u044c\u0442\u0430 \u043d\u0430 \u0434\u0430\u0442\u0443\u00bb (\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u0435\u043d\u0438\u0435).",
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
              "value": "30.06.2025",
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
              "target": "[data-rsbu-delta]:not([hidden])",
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
          "state": 41,
          "id": "e2e-move-saved",
          "title": "\u0427\u0430\u0441\u0442\u044c \u0434\u0435\u043b\u044c\u0442\u044b \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u0430",
          "page": null,
          "note": "\u0414\u0430\u0442\u0430 \u00ab\u043d\u0430\u00bb 30.09.2024 (\u0440\u0430\u043d\u044c\u0448\u0435 \u00ab\u0441\u00bb, \u0441 \u0441\u043e\u0431\u044b\u0442\u0438\u0435\u043c \u0443 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430), \u0441\u0443\u043c\u043c\u0430 25 000. \u041f\u043e\u0434 \u0441\u0443\u043c\u043c\u043e\u0439 \u043e\u043a\u043d\u043e \u043f\u043e\u043a\u0430\u0437\u0430\u043b\u043e \u043f\u0440\u043e\u0433\u043d\u043e\u0437 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f; \u0441\u0442\u0440\u043e\u043a\u0430 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435, \u043e\u0442\u043c\u0435\u0442\u043a\u0430 \u043e\u0441\u0442\u0430\u043b\u0430\u0441\u044c \u2014 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u043c\u0435\u043d\u044c\u0448\u0438\u043b\u043e\u0441\u044c, \u043d\u043e \u043d\u0435 \u043d\u043e\u043b\u044c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#rsbu-adj-end",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "30.09.2024",
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
              "target": "#rsbu-adj-amt",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "25000",
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
          "state": 42,
          "id": "e2e-tile",
          "title": "\u041e\u0442\u043c\u0435\u0442\u043a\u0430 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435 \u0442\u0440\u0430\u043d\u0448\u0430",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial",
          "note": "\u0422\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0447\u0438\u0441\u043b\u043e \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u043e\u0432 \u0438 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 43,
          "id": "e2e-report",
          "title": "\u041f\u043e\u0434\u0441\u0432\u0435\u0442\u043a\u0430 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u0420\u0421\u0411\u0423",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=partial",
          "note": "\u0420\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430 \u0432\u0438\u0434\u0435\u043d \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430: \u0434\u0435\u043b\u044c\u0442\u0430 \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u0443\u043c\u0435\u043d\u044c\u0448\u0438\u043b\u0430\u0441\u044c \u043d\u0430 \u0432\u0441\u0435\u0445 \u0434\u0430\u0442\u0430\u0445 \u043d\u0435 \u0440\u0430\u043d\u044c\u0448\u0435 \u0434\u0430\u0442\u044b \u00ab\u043d\u0430\u00bb, \u043f\u0435\u0440\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430; \u044f\u0447\u0435\u0439\u043a\u0438 \u00ab\u0441\u00bb \u0438 \u00ab\u043d\u0430\u00bb \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u044b \u0430\u043a\u0446\u0435\u043d\u0442\u043e\u043c, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2026 \u043d\u0430 \u2026\u00bb / \u00ab\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u2026 \u0441 \u2026\u00bb.",
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
              "target": "#panel-ras [data-fm-move]",
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
          "state": 44,
          "id": "e2e-warning",
          "title": "\u041d\u0435 \u0432\u0441\u0451 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2014 \u043e\u043a\u043d\u043e \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u044f",
          "page": null,
          "note": "\u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u043f\u0440\u0438 \u043d\u0435\u0443\u0441\u0442\u0440\u0430\u043d\u0451\u043d\u043d\u043e\u043c \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0438 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043e\u043a\u043d\u043e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u043c\u0435\u0442\u0440\u0438\u043a\u0438?\u00bb \u0441 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435\u043c \u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u0439 \u0434\u0430\u0442\u0435; \u00ab\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c\u00bb \u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0432\u0441\u0451 \u043a\u0430\u043a \u0435\u0441\u0442\u044c.",
          "recorded": null,
          "issues": [],
          "do": [
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
              "target": "#rrw-scrim:not([hidden])",
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
          "state": 45,
          "id": "e2e-released",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u2014 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u044f\u0442\u0430",
          "page": null,
          "note": "\u041f\u043e\u0441\u043b\u0435 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u044f\u0442\u0430 (\u0441\u043d\u0435\u043a), \u0447\u0438\u043f\u0430 \u0438 \u0434\u0435\u0440\u0435\u0432\u0430 \u043d\u0435\u0442; \u043f\u043e\u0434\u0441\u0432\u0435\u0442\u043a\u0430 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u043e\u0432 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u043d\u0430\u0432\u0441\u0435\u0433\u0434\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-rrw-ok]",
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
              "target": ".snack--warning",
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
          "state": 46,
          "id": "e2e-ok",
          "title": "\u0412\u0441\u0451 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2014 \u0441\u0432\u0435\u0440\u043a\u0430 \u0441\u043e\u0448\u043b\u0430\u0441\u044c",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=full",
          "note": "\u0414\u0440\u0443\u0433\u043e\u0439 \u0438\u0441\u0445\u043e\u0434: \u0434\u0435\u043b\u044c\u0442\u0430 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u2014 \u043e\u043a\u043d\u0430 \u043d\u0435\u0442, \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0438\u0434\u0451\u0442 \u0441\u0440\u0430\u0437\u0443, \u0441\u043d\u0435\u043a \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb, \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0441\u0430\u043c\u0430.",
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
              "target": ".snack--success",
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
      "id": "rsbu-tile",
      "title": "\u041f\u043e\u043a\u0430\u0437 \u0442\u0430\u0439\u043b\u0430 \u2014 \u0433\u043e\u0442\u043e\u0432\u044b\u0435 \u0432\u0438\u0434\u044b",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0432\u0438\u0434\u044b \u0442\u0430\u0439\u043b\u0430 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u043f\u043e \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c, \u0434\u0430\u043d\u043d\u044b\u043c \u0438 \u043f\u0440\u0430\u0432\u0430\u043c \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432",
      "steps": [
        {
          "state": 5,
          "id": "rsbu-tile-locked",
          "title": "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=locked&rasFix=none&rasMoves=none",
          "note": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u2014 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u00ab\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb, \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "rsbu-tile-none",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=none&rasFix=none&rasMoves=none",
          "note": "\u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb; \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "rsbu-tile-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=filled&rasFix=recalc&rasMoves=partial",
          "note": "\u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: N\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f. \u041f\u043e\u043a\u0430 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e \u2014 \u043e\u0442\u043c\u0435\u0442\u043a\u0430 \u00ab\u0420\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0441 \u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413: \u2026\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 8,
          "id": "rsbu-tile-view",
          "title": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&hardsState=filled&hardsMode=view&rasFix=recalc&rasMoves=partial",
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
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=none&rasMoves=none",
          "note": "\u041f\u0443\u0441\u0442\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u043a\u043e\u043b\u043e\u043d\u043a\u0438; \u00ab\u0412 \u0442\u0440\u0430\u043d\u0448\u00bb \u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432 \u0448\u0430\u043f\u043a\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 10,
          "id": "rsbu-page-modal",
          "title": "\u041d\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&open=add&rasFix=none&rasMoves=none",
          "note": "\u0422\u0430\u043a \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435. \u041e\u0431\u0435 \u0434\u0430\u0442\u044b \u2014 \u043e\u0431\u044b\u0447\u043d\u044b\u0435 \u043f\u043e\u043b\u044f \u0434\u0430\u0442\u044b \u0441 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0451\u043c; \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0440\u0430\u043d\u044c\u0448\u0435 \u0438\u0441\u0445\u043e\u0434\u043d\u043e\u0439 \u0438 \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u0435\u0442 \u0441 \u0434\u0430\u0442\u043e\u0439 \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430; \u0441\u0443\u043c\u043c\u0430 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0439.",
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
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0432 \u043e\u043a\u043d\u0435 \u0441\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435. \u041e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u2014 \u0441\u043e \u0437\u043d\u0430\u043a\u043e\u043c \u043c\u0438\u043d\u0443\u0441.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 12,
          "id": "rsbu-page-edit",
          "title": "\u041f\u0440\u0430\u0432\u043a\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial&demo=edit",
          "note": "\u041f\u0440\u0430\u0432\u043a\u0430 \u2014 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438\u043b\u0438 \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0441\u0442\u0440\u043e\u043a\u0435.",
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
          "state": 13,
          "id": "rsbu-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial&demo=delete",
          "note": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u2014 \u043a\u043e\u0440\u0437\u0438\u043d\u0430 \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438 \u043e\u043a\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f.",
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
      "id": "ras-fixation",
      "title": "\u041f\u043e\u043a\u0430\u0437: \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0440\u0430\u0441\u0447\u0451\u0442\u0430",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438: \u043a\u0435\u0431\u0430\u0431, \u043f\u0443\u043d\u043a\u0442 \u043c\u0435\u043d\u044e, \u0447\u0438\u043f \u0438 \u0434\u0435\u043b\u044c\u0442\u0430 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 (RE0034) \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c, \u0434\u043b\u044f \u043f\u043e\u043a\u0430\u0437\u0430 \u0438 \u0441\u043d\u0438\u043c\u043a\u043e\u0432",
      "steps": [
        {
          "state": 14,
          "id": "fix-before",
          "title": "\u041a\u0435\u0431\u0430\u0431 \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=none&rasMoves=none",
          "note": "\u0423 \u0441\u0442\u0440\u043e\u043a\u0438 \u00ab\u041d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0437\u0430 \u043f\u0435\u0440\u0438\u043e\u0434\u00bb \u0424\u0418 \u0441 \u0442\u0440\u0430\u043d\u0448\u0435\u043c (128-\u041a\u0440\u0435\u0434\u0438\u0442-202) \u2014 \u043a\u0435\u0431\u0430\u0431; \u0443 \u0424\u0418 \u0431\u0435\u0437 \u0442\u0440\u0430\u043d\u0448\u0430 (\u0430\u043a\u0446\u0438\u0438, \u0420\u0415\u041f\u041e) \u0435\u0433\u043e \u043d\u0435\u0442. \u0412 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435 \u043a\u0435\u0431\u0430\u0431\u0430 \u043d\u0435\u0442.",
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
            }
          ]
        },
        {
          "state": 15,
          "id": "fix-menu",
          "title": "\u041f\u0443\u043d\u043a\u0442 \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0441\u0447\u0451\u0442\u00bb",
          "page": null,
          "note": "\u041f\u0443\u043d\u043a\u0442 ContextMenu \u0414\u0421.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#panel-ras [data-menu^=\"fm-fixmenu-\"]",
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
              "target": "[data-fm-fix-ras]",
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
          "state": 16,
          "id": "fix-after",
          "title": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": null,
          "note": "\u0423 \u0441\u0442\u0440\u043e\u043a\u0438 \u2014 \u0447\u0438\u043f-\u0438\u043a\u043e\u043d\u043a\u0430, \u0434\u0430\u0442\u0430 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0432 \u0442\u0443\u043b\u0442\u0438\u043f\u0435; \u0441\u043d\u0435\u043a \u00ab\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u00bb. \u041a\u0435\u0431\u0430\u0431\u0430 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-fm-fix-ras]",
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
              "target": "#panel-ras [data-fm-fixed-chip]",
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
          "state": 23,
          "id": "fixed-before-recalc",
          "title": "\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e, \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=fixed&rasMoves=none",
          "note": "\u041f\u043b\u0430\u0442\u0451\u0436 \u0435\u0449\u0451 \u043d\u0435 \u0432\u043d\u0435\u0441\u0451\u043d \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 \u043d\u0435 \u0431\u044b\u043b\u043e \u2014 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043d\u0435 \u043e\u0442\u043b\u0438\u0447\u0430\u044e\u0442\u0441\u044f, \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0438\u043f.",
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
              "target": "#panel-ras [data-fm-fixed-chip]",
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
          "state": 20,
          "id": "value-recalc",
          "title": "\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430 \u2014 \u0434\u0435\u0440\u0435\u0432\u043e \u0438\u0437 \u0442\u0440\u0451\u0445 \u0441\u0442\u0440\u043e\u043a",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=none",
          "note": "\u0421\u0442\u0440\u043e\u043a\u0430 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430 \u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u00ab\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e\u00bb, \u00ab\u041f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430\u00bb, \u00ab\u0414\u0435\u043b\u044c\u0442\u0430\u00bb. \u0414\u0435\u043b\u044c\u0442\u0430 \u0441\u043e \u0437\u043d\u0430\u043a\u043e\u043c: \u043f\u043b\u044e\u0441 \u0437\u0435\u043b\u0451\u043d\u044b\u043c, \u043c\u0438\u043d\u0443\u0441 \u043a\u0440\u0430\u0441\u043d\u044b\u043c.",
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
      "id": "ras-move",
      "title": "\u041f\u043e\u043a\u0430\u0437: \u043f\u0435\u0440\u0435\u043d\u043e\u0441 \u0434\u0435\u043b\u044c\u0442\u044b",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430 \u0434\u0435\u043b\u044c\u0442\u044b \u043f\u043e \u0434\u0430\u0442\u0430\u043c: \u043e\u043a\u043d\u043e, \u043e\u0448\u0438\u0431\u043a\u0430, \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u044b\u0439 \u0438 \u043f\u043e\u043b\u043d\u044b\u0439 \u043f\u0435\u0440\u0435\u043d\u043e\u0441, \u043f\u043e\u0434\u0441\u0432\u0435\u0442\u043a\u0430 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 (RE0034) \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c",
      "steps": [
        {
          "state": 24,
          "id": "move-empty",
          "title": "\u0414\u0435\u043b\u044c\u0442\u0430 \u043d\u0435 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=none",
          "note": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d \u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u0437\u0434\u043d\u0435\u0433\u043e \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u2014 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 (84 210,50 RUB \u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u0439 \u0434\u0430\u0442\u0435, \u0434\u0430\u043b\u044c\u0448\u0435 \u0440\u0430\u0441\u0442\u0451\u0442) \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e, \u043d\u0430\u0434 \u0442\u0430\u0431\u043b\u0438\u0446\u0435\u0439 \u043e\u0442\u043c\u0435\u0442\u043a\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 25,
          "id": "move-modal",
          "title": "\u041e\u043a\u043d\u043e \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430 \u2014 \u0434\u0435\u043b\u044c\u0442\u0430 \u043d\u0430 \u0434\u0430\u0442\u0443",
          "page": null,
          "note": "\u0412\u0432\u0435\u0434\u0435\u043d\u0430 \u0438\u0441\u0445\u043e\u0434\u043d\u0430\u044f \u0434\u0430\u0442\u0430 30.06.2025 \u2014 \u043f\u043e\u0434 \u0434\u0430\u0442\u0430\u043c\u0438 \u00ab\u0414\u0435\u043b\u044c\u0442\u0430 \u043d\u0430 \u0434\u0430\u0442\u0443\u00bb (\u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0442\u0435\u043d\u0438\u0435).",
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
              "value": "30.06.2025",
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
              "target": "[data-rsbu-delta]:not([hidden])",
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
          "state": 26,
          "id": "move-error",
          "title": "\u0421\u0443\u043c\u043c\u0430 \u0431\u043e\u043b\u044c\u0448\u0435 \u0434\u0435\u043b\u044c\u0442\u044b",
          "page": null,
          "note": "\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0442\u0438 \u043c\u043e\u0436\u043d\u043e \u043d\u0435 \u0431\u043e\u043b\u044c\u0448\u0435 \u0434\u0435\u043b\u044c\u0442\u044b \u043d\u0430 \u0438\u0441\u0445\u043e\u0434\u043d\u0443\u044e \u0434\u0430\u0442\u0443; \u043e\u0448\u0438\u0431\u043a\u0430 \u2014 \u0432 Alert \u0432\u0432\u0435\u0440\u0445\u0443 \u043e\u043a\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#rsbu-adj-end",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "30.09.2024",
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
              "target": "#rsbu-adj-amt",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "200000",
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
              "target": "#rsbu-adj-alert:not([hidden])",
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
          "state": 27,
          "id": "move-partial",
          "title": "\u0427\u0430\u0441\u0442\u044c \u0434\u0435\u043b\u044c\u0442\u044b \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial",
          "note": "\u041f\u0435\u0440\u0435\u043d\u043e\u0441 22 476,66 \u0441 31.03.2025 \u043d\u0430 30.09.2024 \u2014 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0430 \u0432\u0441\u0435\u0445 \u0434\u0430\u0442\u0430\u0445 \u0443\u043c\u0435\u043d\u044c\u0448\u0438\u043b\u043e\u0441\u044c (\u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u0439 \u2014 \u0434\u043e 50 526,30 RUB), \u043d\u043e \u043d\u0435 \u043d\u043e\u043b\u044c. \u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043c\u0435\u0442\u0440\u0438\u043a \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u044d\u0442\u043e \u0441\u0440\u0430\u0437\u0443, \u0434\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 28,
          "id": "move-tile",
          "title": "\u041e\u0442\u043c\u0435\u0442\u043a\u0430 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435 \u0442\u0440\u0430\u043d\u0448\u0430",
          "page": "Tranche.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=partial",
          "note": "\u0422\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0447\u0438\u0441\u043b\u043e \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u043e\u0432 \u0438 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 29,
          "id": "move-report",
          "title": "\u041f\u043e\u0434\u0441\u0432\u0435\u0442\u043a\u0430 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u0420\u0421\u0411\u0423",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=partial",
          "note": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043c\u0435\u0442\u0440\u0438\u043a \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430: \u0441\u0442\u0440\u043e\u043a\u0430 \u00ab\u0414\u0435\u043b\u044c\u0442\u0430\u00bb \u0441\u0442\u0430\u043b\u0430 \u043c\u0435\u043d\u044c\u0448\u0435 \u043d\u0430 \u0432\u0441\u0435\u0445 \u0434\u0430\u0442\u0430\u0445 \u043d\u0435 \u0440\u0430\u043d\u044c\u0448\u0435 \u0434\u0430\u0442\u044b \u00ab\u043d\u0430\u00bb, \u043f\u0435\u0440\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u043e\u0442\u043c\u0435\u0447\u0435\u043d\u0430 \u0442\u0443\u043b\u0442\u0438\u043f\u043e\u043c; \u044f\u0447\u0435\u0439\u043a\u0438 \u00ab\u0441\u00bb \u0438 \u00ab\u043d\u0430\u00bb \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u044b, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2026 \u043d\u0430 \u2026\u00bb / \u00ab\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u2026 \u0441 \u2026\u00bb.",
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
              "target": "#panel-ras [data-fm-move]",
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
          "state": 30,
          "id": "move-done",
          "title": "\u0414\u0435\u043b\u044c\u0442\u0430 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=recalc&rasMoves=full",
          "note": "\u0420\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0443\u043b\u0435\u0432\u043e\u0435 \u043d\u0430 \u0432\u0441\u0435\u0445 \u0434\u0430\u0442\u0430\u0445 \u2014 \u043e\u0442\u043c\u0435\u0442\u043a\u0430 \u0438\u0441\u0447\u0435\u0437\u043b\u0430. \u041e\u0434\u0438\u043d \u0438 \u0442\u043e\u0442 \u0436\u0435 \u043f\u0435\u0440\u0435\u043d\u043e\u0441 \u0442\u0435\u043c \u0441\u0438\u043b\u044c\u043d\u0435\u0435, \u0447\u0435\u043c \u0440\u0430\u043d\u044c\u0448\u0435 \u0434\u0430\u0442\u0430 \u00ab\u043d\u0430\u00bb: \u0434\u0432\u0430 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0430 \u043d\u0430 \u0440\u0430\u0437\u043d\u044b\u0435 \u043f\u0440\u043e\u0448\u043b\u044b\u0435 \u0434\u0430\u0442\u044b \u0434\u0430\u043b\u0438 \u0440\u043e\u0432\u043d\u043e \u043d\u043e\u043b\u044c. \u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u043c \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435 \u043c\u0435\u0442\u0440\u0438\u043a \u2014 \u0448\u0430\u0433\u0438 \u043f\u043e\u0442\u043e\u043a\u0430 \u00ab\u041f\u043e\u043a\u0430\u0437: \u0441\u0432\u0435\u0440\u043a\u0430 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "ras-recon",
      "title": "\u041f\u043e\u043a\u0430\u0437: \u0441\u0432\u0435\u0440\u043a\u0430 \u043f\u043e\u0441\u043b\u0435 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
      "desc": "\u0413\u043e\u0442\u043e\u0432\u044b\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f \u0441\u0432\u0435\u0440\u043a\u0438: \u0434\u0435\u043b\u044c\u0442\u0430, \u043e\u043a\u043d\u043e \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u044f, \u0441\u043d\u044f\u0442\u0438\u0435 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438, \u0441\u0432\u0435\u0440\u043a\u0430 \u0441\u043e\u0448\u043b\u0430\u0441\u044c (RE0034) \u2014 \u0430\u0434\u0440\u0435\u0441\u043e\u043c",
      "steps": [
        {
          "state": 31,
          "id": "recon-delta",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043e\u0441\u043b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u2014 \u043f\u043e\u044f\u0432\u0438\u043b\u0430\u0441\u044c \u0434\u0435\u043b\u044c\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=fixed&rasMoves=none",
          "note": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d, \u043f\u043b\u0430\u0442\u0451\u0436 \u0432\u043d\u0435\u0441\u0451\u043d (\u0432 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u043d\u0435 \u0432\u0432\u043e\u0434\u0438\u0442\u0441\u044f). \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u2014 \u0443 \u0441\u0442\u0440\u043e\u043a\u0438 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0430 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0434\u0435\u0440\u0435\u0432\u043e \u0438\u0437 \u0442\u0440\u0451\u0445 \u0441\u0442\u0440\u043e\u043a \u0441 \u0434\u0435\u043b\u044c\u0442\u043e\u0439.",
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
              "target": "#panel-ras [data-fm-fixed-chip]",
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
          "state": 32,
          "id": "recon-warning",
          "title": "\u041d\u0435 \u0432\u0441\u0451 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2014 \u043e\u043a\u043d\u043e \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u044f",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=partial",
          "note": "\u0420\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u043d\u0435 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u043e. \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043e\u043a\u043d\u043e \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u043c\u0435\u0442\u0440\u0438\u043a\u0438?\u00bb \u0441 \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435\u043c \u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u0439 \u0434\u0430\u0442\u0435; \u00ab\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c\u00bb \u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0432\u0441\u0451 \u043a\u0430\u043a \u0435\u0441\u0442\u044c.",
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
              "target": "#rrw-scrim:not([hidden])",
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
          "state": 33,
          "id": "recon-released",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u2014 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u044f\u0442\u0430",
          "page": null,
          "note": "\u041f\u043e\u0441\u043b\u0435 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u043c\u0435\u0442\u0440\u0438\u043a\u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u044b, \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u044f\u0442\u0430 (\u0441\u043d\u0435\u043a), \u0447\u0438\u043f\u0430 \u0438 \u0434\u0435\u0440\u0435\u0432\u0430 \u043d\u0435\u0442, \u043f\u043e\u0434\u0441\u0432\u0435\u0442\u043a\u0430 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u043e\u0432 \u0432 \u043e\u0442\u0447\u0451\u0442\u0435 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-rrw-ok]",
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
              "target": ".snack--warning",
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
          "state": 34,
          "id": "recon-ok",
          "title": "\u0412\u0441\u0451 \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d\u043e \u2014 \u0441\u0432\u0435\u0440\u043a\u0430 \u0441\u043e\u0448\u043b\u0430\u0441\u044c",
          "page": "FinancialMetrics.preview.html?id=1028&rasFix=recalc&rasMoves=full",
          "note": "\u0414\u0435\u043b\u044c\u0442\u0430 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e \u2014 \u043e\u043a\u043d\u0430 \u043d\u0435\u0442, \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0438\u0434\u0451\u0442 \u0441\u0440\u0430\u0437\u0443; \u0441\u043d\u0435\u043a \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb, \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0441\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0441\u0430\u043c\u0430.",
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
              "target": "#panel-ras [data-node$=\"-ind\"]",
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
              "target": ".snack--success",
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
          "state": 35,
          "id": "recon-tile",
          "title": "\u041f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0441 \u0442\u0430\u0439\u043b\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0441\u0434\u0435\u043b\u043a\u0438",
          "page": "Deal.preview.html?id=1028&rasFix=recalc&rasMoves=partial",
          "note": "\u0422\u0430\u0439\u043b \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb \u043f\u0440\u0438 \u043d\u0435\u0443\u0441\u0442\u0440\u0430\u043d\u0451\u043d\u043d\u043e\u043c \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0438 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u043e \u0436\u0435 \u043e\u043a\u043d\u043e \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-fm-calc .lc-fin-metrics__buttons [data-fm-act=\"CALCULATE\"]",
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
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#rrw-scrim:not([hidden])",
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
          "state": 36,
          "id": "recon-adjustments",
          "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043f\u043e\u0441\u043b\u0435 \u0441\u043d\u044f\u0442\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1028&tr=1028.d1.p1.i1.t1&rasFix=none&rasMoves=partial",
          "note": "\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u043d\u0435\u0442 \u2014 \u043e\u0442\u043c\u0435\u0442\u043a\u0438 \u043e \u0440\u0430\u0441\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0438 \u043d\u0435\u0442, \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u044b \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    }
  ],
  "flowErrors": [],
  "comments": [
    {
      "n": 1,
      "status": "done",
      "created": "09.10.2026 12:00",
      "author": null,
      "page": "RsbuInterestAdjustments.html",
      "step": {
        "state": 9
      },
      "resolution": "22.10.2026 \u2014 \u0437\u0430\u043a\u0440\u044b\u0442 \u043e\u0442\u0432\u0435\u0442\u043e\u043c \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430 22.10.2026: \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u2014 \u043f\u0435\u0440\u0435\u043d\u043e\u0441 \u0441\u0443\u043c\u043c\u044b \u0441 \u0434\u0430\u0442\u044b \u00ab\u0441\u00bb \u043d\u0430 \u043f\u0440\u043e\u0448\u043b\u0443\u044e \u0434\u0430\u0442\u0443 \u00ab\u043d\u0430\u00bb (\u043f\u043b\u044e\u0441 \u0438\u043b\u0438 \u043c\u0438\u043d\u0443\u0441), \u043e\u0442\u0432\u0435\u0442 18 \u0437\u0430\u0434\u0430\u0447\u0438 RE0034; \u043e\u0442\u0432\u0435\u0442 5 \u2014 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u044b \u043f\u043e \u0434\u0435\u043b\u044c\u0442\u0430\u043c",
      "body": "**\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0439 \u0432\u043e\u043f\u0440\u043e\u0441: \u0431\u0438\u0437\u043d\u0435\u0441-\u0441\u043c\u044b\u0441\u043b \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a.** \u0414\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0439 \u0441\u0434\u0435\u043b\u043a\u0438 \u0435\u0441\u0442\u044c \u043e\u0442\u0447\u0451\u0442\u044b \u0420\u0421\u0411\u0423, \u0433\u0434\u0435 \u0432\u0438\u0434\u043d\u044b \u0432\u0441\u0435 \u0434\u0430\u0442\u044b \u0441 \u0440\u0430\u0437\u043d\u044b\u043c\u0438 \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u043c\u0438 (\u043f\u043e\u0445\u043e\u0436\u0435 \u043d\u0430 \u043a\u0435\u0448\u0444\u043b\u043e\u0443, \u043d\u043e \u043d\u0435 \u0441\u043e\u0432\u0441\u0435\u043c). \u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0438\u0442 \u0441\u0443\u043c\u043c\u0443 \u0434\u043e\u0431\u0438\u0432\u043a\u0438 \u0441 \u043e\u0434\u043d\u043e\u0439 \u0434\u0430\u0442\u044b \u043d\u0430 \u0434\u0440\u0443\u0433\u0443\u044e (\u0441\u0443\u043c\u043c\u0430 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043f\u043e\u043b\u043e\u0436\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0439 \u0438 \u043e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0439) \u0438 \u043f\u043e\u0437\u0432\u043e\u043b\u044f\u0435\u0442 \u043f\u043e\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u043b\u0430\u0442\u0435\u0436\u0438, \u043d\u0435 \u043c\u0435\u043d\u044f\u044f \u0432\u0435\u0441\u044c \u0440\u0430\u0441\u0447\u0451\u0442. \u041d\u0443\u0436\u043d\u0430 \u043d\u0435\u0447\u0430\u0441\u0442\u043e, \u043e\u0431\u044b\u0447\u043d\u043e \u0432 \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u043d\u044b\u0445 \u0441\u0434\u0435\u043b\u043a\u0430\u0445. \u0411\u0438\u0437\u043d\u0435\u0441-\u0441\u043c\u044b\u0441\u043b \u0447\u0435\u043b\u043e\u0432\u0435\u043a \u0434\u043e\u0443\u0442\u043e\u0447\u043d\u0438\u0442; \u0434\u043e \u044d\u0442\u043e\u0433\u043e \u043f\u0440\u0430\u0432\u0438\u043b\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u0444\u043e\u0440\u043c\u044b \u0438 \u043f\u0440\u0430\u0432\u0430 \u043d\u0430 \u043f\u0440\u0430\u0432\u043a\u0443 \u0438 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u2014 \u0440\u0430\u0431\u043e\u0447\u0438\u0435 \u0434\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u044f.\n\n_10.10.2026 (\u0434\u043e\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435): \u043f\u0440\u0438\u0448\u043b\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d\u043d\u043e\u0435 \u0431\u0438\u0437\u043d\u0435\u0441-\u0442\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u0438\u0435 \u00ab\u041a\u0440\u0438\u0442\u0435\u0440\u0438\u0438 \u043f\u0440\u0438\u0435\u043c\u043a\u0438\u00bb \u2014 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u0440\u0438\u0431\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f/\u0432\u044b\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u0441 \u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439 \u0434\u0430\u0442\u044b (\u0441\u043f\u0438\u0441\u043e\u043a \u0434\u0430\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u0435\u0440\u0438\u043e\u0434\u043e\u0432), \u043a\u043e\u043d\u0435\u0447\u043d\u0430\u044f \u0434\u0430\u0442\u0430 \u0432\u0432\u043e\u0434\u0438\u0442\u0441\u044f \u0440\u0443\u043a\u0430\u043c\u0438 \u0438 \u043f\u043e\u043f\u0430\u0434\u0430\u0435\u0442 \u0432 \u043e\u0442\u0447\u0451\u0442\u043d\u044b\u0435 \u0434\u0430\u0442\u044b \u0420\u0421\u0411\u0423. \u0412\u043e\u043f\u0440\u043e\u0441 \u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u043c \u0434\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430._"
    },
    {
      "n": 2,
      "status": "done",
      "created": "09.10.2026 13:00",
      "author": null,
      "page": "RsbuInterestAdjustments.html",
      "step": {
        "state": 10
      },
      "resolution": "22.10.2026 \u2014 \u0437\u0430\u043a\u0440\u044b\u0442 \u043e\u0442\u0432\u0435\u0442\u0430\u043c\u0438 14 \u0438 18 \u0437\u0430\u0434\u0430\u0447\u0438 RE0034 (22.10.2026): \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u0434\u0430\u0442\u0430 \u00ab\u043d\u0430\u00bb \u0441\u0442\u0440\u043e\u0433\u043e \u0440\u0430\u043d\u044c\u0448\u0435 \u0438\u0441\u0445\u043e\u0434\u043d\u043e\u0439 \u00ab\u0441\u00bb; \u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u0430\u0433\u0435\u043d\u0442\u0430 16",
      "body": "**\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0439 \u0432\u043e\u043f\u0440\u043e\u0441: \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0434\u0430\u0442.** \u041c\u043e\u0436\u0435\u0442 \u043b\u0438 \u00ab\u041a\u043e\u043d\u0435\u0447\u043d\u0430\u044f \u0434\u0430\u0442\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438\u00bb \u0431\u044b\u0442\u044c \u0440\u0430\u043d\u044c\u0448\u0435 \u00ab\u041d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439\u00bb? \u0421\u0435\u0439\u0447\u0430\u0441 \u0444\u043e\u0440\u043c\u0430 \u044d\u0442\u043e \u0437\u0430\u043f\u0440\u0435\u0449\u0430\u0435\u0442 (\u0434\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435; \u0432 \u0442\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u0438\u0438 \u043d\u0435 \u0441\u043a\u0430\u0437\u0430\u043d\u043e)."
    }
  ],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
