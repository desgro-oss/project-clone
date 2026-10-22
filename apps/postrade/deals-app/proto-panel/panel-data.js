/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "deals-app",
    "title": "Post \u2014 \u0414\u0418\u0414"
  },
  "sources": {
    "flows": "e61836ce",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u0414\u0418\u0414 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 53,
  "flows": [
    {
      "id": "main",
      "title": "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u043f\u0443\u0442\u044c",
      "desc": null,
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430",
          "page": "MainPage.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-tile",
      "title": "\u0422\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb",
      "desc": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0442\u0440\u0430\u043d\u0448\u0430 \u2014 \u0432\u0438\u0434 \u0442\u0430\u0439\u043b\u0430 \u043f\u043e \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c, \u0434\u0430\u043d\u043d\u044b\u043c \u0438 \u043f\u0440\u0430\u0432\u0430\u043c",
      "steps": [
        {
          "state": 2,
          "id": "rsbu-tile-locked",
          "title": "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=locked",
          "note": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u2014 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u00ab\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb, \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "rsbu-tile-none",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=none",
          "note": "\u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb; \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "rsbu-tile-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled",
          "note": "\u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: N\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 5,
          "id": "rsbu-tile-view",
          "title": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled&hardsMode=view",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u043d\u0435\u0442, \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u2014 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043c\u043e\u0436\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb",
      "desc": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a, \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043f\u0440\u0430\u0432\u043a\u0430, \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435, \u0432\u043e\u0437\u0432\u0440\u0430\u0442 \u0432 \u0442\u0440\u0430\u043d\u0448",
      "steps": [
        {
          "state": 6,
          "id": "rsbu-page-empty",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
          "note": "\u041f\u0443\u0441\u0442\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u043a\u043e\u043b\u043e\u043d\u043a\u0438; \u00ab\u0412 \u0442\u0440\u0430\u043d\u0448\u00bb \u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432 \u0448\u0430\u043f\u043a\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "rsbu-page-modal",
          "title": "\u041d\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "note": "\u0422\u0430\u043a \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435. \u0418\u0441\u0445\u043e\u0434\u043d\u0430\u044f \u0434\u0430\u0442\u0430 \u2014 \u0432\u044b\u043f\u0430\u0434\u0430\u044e\u0449\u0438\u0439 \u0441\u043f\u0438\u0441\u043e\u043a, \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u2014 \u0440\u0443\u0447\u043d\u043e\u0439 \u0432\u0432\u043e\u0434; \u0441\u0443\u043c\u043c\u0430 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0439.",
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
          "state": 8,
          "id": "rsbu-page-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0432 \u043e\u043a\u043d\u0435 \u0441\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435. \u041e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u2014 \u0441\u043e \u0437\u043d\u0430\u043a\u043e\u043c \u043c\u0438\u043d\u0443\u0441.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 9,
          "id": "rsbu-page-edit",
          "title": "\u041f\u0440\u0430\u0432\u043a\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=edit",
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
          "state": 10,
          "id": "rsbu-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=delete",
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
      "id": "fm-calc-tile",
      "title": "\u0422\u0430\u0439\u043b \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb",
      "desc": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u0434\u0435\u043b\u043a\u0438, \u0442\u0430\u0431 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435\u00bb \u2014 \u0440\u0430\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a \u043f\u043e \u0424\u0418 \u0441\u0434\u0435\u043b\u043a\u0438 (RE0033)",
      "steps": [
        {
          "state": 11,
          "id": "fm-calc-locked",
          "title": "\u041d\u0435\u0442 \u0424\u0418",
          "page": "Deal.preview.html?id=1026",
          "note": "\u00ab\u041e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442 \u0424\u0418 \u0434\u043b\u044f \u0440\u0430\u0441\u0447\u0435\u0442\u0430\u00bb \u0441\u0435\u0440\u044b\u043c, \u0431\u0435\u0437 \u043a\u043d\u043e\u043f\u043a\u0438. \u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0424\u0418 \u0432 \u0442\u0430\u0439\u043b\u0435 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b\u00bb \u2014 \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 12,
          "id": "fm-calc-default",
          "title": "\u041d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e",
          "page": "Deal.preview.html?id=1044",
          "note": "\u0424\u0418 \u0435\u0441\u0442\u044c, \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u043d\u0435 \u0431\u044b\u043b\u043e \u2014 \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 13,
          "id": "fm-calc-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
          "page": "Deal.preview.html?id=1036",
          "note": "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u043f\u043e\u043f\u044b\u0442\u043a\u0430 \u043d\u0435 \u043f\u043e\u0441\u0447\u0438\u0442\u0430\u043b\u0430 \u043d\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u0424\u0418 \u2014 \u0430\u043b\u0435\u0440\u0442 \u00ab\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d, \u043d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0432 \u0424\u0418\u00bb. \u0421\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u044b\u043c \u0440\u0430\u0441\u0447\u0435\u0442\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 14,
          "id": "fm-calc-running",
          "title": "\u0418\u0434\u0435\u0442 \u0440\u0430\u0441\u0447\u0435\u0442",
          "page": "Deal.preview.html?id=1044&fmCalc=ok",
          "note": "\u041b\u043e\u0430\u0434\u0435\u0440 \u043d\u0430 \u043a\u043d\u043e\u043f\u043a\u0435, \u0432\u0441\u0435 \u043a\u043d\u043e\u043f\u043a\u0438 \u0442\u0430\u0439\u043b\u0430 \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u044b.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-fm-calc [data-fm-act=\"CALCULATE\"]",
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
              "target": "#tile-fm-calc[data-state=\"updating\"]",
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
          "id": "fm-calc-done",
          "title": "\u0420\u0430\u0441\u0447\u0435\u0442 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d",
          "page": "Deal.preview.html?id=1044&fmCalc=ok",
          "note": "\u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e \u0424\u0418: N \u0438\u0437 M\u00bb, \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb, \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb, \u00ab\u041e\u0442\u0447\u0435\u0442\u044b \u2192\u00bb; \u0441\u043d\u0435\u043a \u00ab\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb. \u0418\u0441\u0445\u043e\u0434 \u043f\u043e \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u044e \u043d\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-fm-calc [data-fm-act=\"CALCULATE\"]",
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
              "target": "#tile-fm-calc[data-state=\"data\"]",
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
          "id": "fm-calc-partial",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e",
          "page": "Deal.preview.html?id=1027",
          "note": "\u041d\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0435 \u0424\u0418 \u0432 \u043e\u0442\u0447\u0435\u0442\u044b \u043d\u0435 \u043f\u043e\u043f\u0430\u0434\u0430\u044e\u0442. \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u0441\u043e \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0435\u043c ?fmCalc=partial \u0434\u0430\u0435\u0442 \u0441\u043d\u0435\u043a \u00ab\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430 \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 17,
          "id": "fm-calc-error-after",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u0441\u043b\u0435 \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
          "page": "Deal.preview.html?id=1028",
          "note": "\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043d\u0435 \u043f\u043e\u0441\u0447\u0438\u0442\u0430\u043b \u043d\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u0424\u0418 \u2014 \u0430\u043b\u0435\u0440\u0442 \u043e\u0448\u0438\u0431\u043a\u0438 \u043d\u0430\u0434 \u0432\u0438\u0434\u043e\u043c \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e\u00bb \u0441 \u043f\u0440\u0435\u0436\u043d\u0435\u0439 \u0434\u0430\u0442\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 18,
          "id": "fm-calc-view-status",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043f\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0443",
          "page": "Deal.preview.html?id=1024",
          "note": "\u0410\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430 \u2014 \u00ab\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0440\u0430\u0441\u0447\u0435\u0442\u00bb \u0438 \u00ab\u041e\u0442\u0447\u0435\u0442\u044b \u2192\u00bb, \u0431\u0435\u0437 \u043a\u043d\u043e\u043f\u043e\u043a.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 19,
          "id": "fm-calc-view-role",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043f\u043e \u0440\u043e\u043b\u0438",
          "page": "Deal.preview.html?id=1027&fmMode=view",
          "note": "\u0420\u043e\u043b\u044c \u0431\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u043d\u0430 \u0440\u0430\u0441\u0447\u0435\u0442 \u2014 \u0442\u043e\u0442 \u0436\u0435 \u0432\u0438\u0434 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u043f\u0440\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0435, \u0434\u043e\u043f\u0443\u0441\u043a\u0430\u044e\u0449\u0435\u043c \u043f\u0440\u0430\u0432\u043a\u0443.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 20,
          "id": "fm-calc-view-none",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440, \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e",
          "page": "Deal.preview.html?id=1044&fmMode=view",
          "note": "\u00ab\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u00bb \u0441\u0435\u0440\u044b\u043c, \u0431\u0435\u0437 \u043a\u043d\u043e\u043f\u043e\u043a.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "fm-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb",
      "desc": "\u041e\u0442\u0447\u0435\u0442\u044b \u041c\u0421\u0424\u041e, \u0420\u0421\u0411\u0423, KPI \u043f\u043e \u0424\u0418 \u0441\u0434\u0435\u043b\u043a\u0438; \u00ab\u041e\u0442\u0447\u0435\u0442\u044b \u2192\u00bb \u0438\u0437 \u0442\u0430\u0439\u043b\u0430 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb (RE0033)",
      "steps": [
        {
          "state": 21,
          "id": "fm-page-ifrs",
          "title": "\u041e\u0442\u0447\u0435\u0442 \u041c\u0421\u0424\u041e",
          "page": "FinancialMetrics.preview.html?id=1024",
          "note": "\u0410\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430 \u2014 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440, \u0431\u0435\u0437 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb \u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb. \u0413\u0440\u0443\u043f\u043f\u044b \u0424\u0418 \u0441\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u044e\u0442\u0441\u044f, \u043a\u043e\u043b\u043e\u043d\u043a\u0430 \u043c\u0435\u0442\u0440\u0438\u043a \u0437\u0430\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0430, \u0434\u0430\u0442\u044b \u043e\u0431\u0449\u0438\u0435, \u0443 \u0424\u0418 \u0431\u0435\u0437 \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u2014 \u043f\u0443\u0441\u0442\u0430\u044f \u044f\u0447\u0435\u0439\u043a\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 22,
          "id": "fm-page-ras-empty",
          "title": "\u041f\u0443\u0441\u0442\u0430\u044f \u0420\u0421\u0411\u0423",
          "page": "FinancialMetrics.preview.html?id=1037",
          "note": "\u041f\u043e\u0441\u0447\u0438\u0442\u0430\u043d \u043e\u0434\u0438\u043d \u0424\u0418 \u0441 \u041c\u0421\u0424\u041e \u2014 \u0432 \u0420\u0421\u0411\u0423 \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb, \u00ab\u0424\u0438\u043b\u044c\u0442\u0440\u00bb \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d, \u043a\u043e\u043b\u043e\u043d\u043e\u043a \u0434\u0430\u0442 \u043d\u0435\u0442.",
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
          "state": 23,
          "id": "fm-page-kpi",
          "title": "\u041e\u0442\u0447\u0435\u0442 KPI",
          "page": "FinancialMetrics.preview.html?id=1024",
          "note": "\u041f\u043e\u0434\u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u00ab\u041a\u0440\u0430\u0442\u043a\u0438\u0439\u00bb / \u00ab\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u044b\u0439\u00bb; \u0432 \u00ab\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u044b\u0439\u00bb \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430 \u043c\u0435\u0442\u0440\u0438\u043a\u0430 \u00ab\u0424\u043e\u043d\u0434\u0438\u0440\u0443\u0435\u043c\u044b\u0439 \u043e\u0431\u044a\u0435\u043c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-kpi",
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
              "target": "#panel-kpi:not([hidden])",
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
          "state": 24,
          "id": "fm-page-filter",
          "title": "\u041e\u043a\u043d\u043e \u0444\u0438\u043b\u044c\u0442\u0440\u0430",
          "page": "FinancialMetrics.preview.html?id=1024",
          "note": "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0424\u0418 \u2014 \u043f\u043e\u0434 \u043f\u0435\u0440\u0432\u044b\u043c \u043f\u043e\u043b\u0435\u043c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u043f\u043e\u043b\u0435 \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u043e\u0432 \u0434\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0433\u043e. \u00ab\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c\u00bb \u2014 \u0447\u0438\u043f \u00ab\u041f\u0440\u0438\u043c\u0435\u043d\u0435\u043d\u043e: N\u00bb \u0438 \u0442\u043e\u043b\u044c\u043a\u043e \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0435 \u0424\u0418.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#panel-ifrs .tfilter__open",
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
              "target": "#fm-filter-scrim:not([hidden])",
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
          "state": 25,
          "id": "fm-page-partial",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043e \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041d\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0435 \u0424\u0418 \u0432 \u043e\u0442\u0447\u0435\u0442\u0430\u0445 \u043d\u0435\u0442. \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u0441\u043e \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0435\u043c ?fmCalc=partial \u0434\u0430\u0435\u0442 \u0441\u043d\u0435\u043a \u00ab\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430 \u0447\u0430\u0441\u0442\u0438\u0447\u043d\u043e\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 26,
          "id": "fm-page-recalc",
          "title": "\u0418\u0434\u0435\u0442 \u043f\u0435\u0440\u0435\u0441\u0447\u0435\u0442",
          "page": "FinancialMetrics.preview.html?id=1027&fmCalc=ok",
          "note": "\u041b\u043e\u0430\u0434\u0435\u0440 \u043d\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb, \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u043d\u043e\u043f\u043a\u0438 \u0448\u0430\u043f\u043a\u0438 \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u044b; \u043f\u043e\u0441\u043b\u0435 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u2014 \u0441\u043d\u0435\u043a \u00ab\u041e\u043f\u0435\u0440\u0430\u0446\u0438\u044f \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb, \u0434\u0430\u0442\u0430 \u0432 \u043f\u043e\u0434\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0435 \u043e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u0442\u0441\u044f.",
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
              "target": "#fm-calc[aria-busy=\"true\"]",
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
          "id": "fm-page-not-calculated",
          "title": "\u0420\u0430\u0441\u0447\u0435\u0442\u0430 \u043d\u0435 \u0431\u044b\u043b\u043e",
          "page": "FinancialMetrics.preview.html?id=1044",
          "note": "\u0412\u0441\u0435 \u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb. \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u2014 \u043f\u043e\u0441\u043b\u0435 \u043d\u0435\u0433\u043e \u043e\u0442\u0447\u0435\u0442\u044b \u043d\u0430\u043f\u043e\u043b\u043d\u044f\u044e\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 28,
          "id": "fm-page-view-role",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043f\u043e \u0440\u043e\u043b\u0438",
          "page": "FinancialMetrics.preview.html?id=1037&fmMode=view",
          "note": "\u041f\u0440\u0430\u0432\u043a\u0430 \u043f\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0443 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0430, \u043d\u043e \u0440\u043e\u043b\u044c \u0431\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u043d\u0430 \u0440\u0430\u0441\u0447\u0435\u0442 \u2014 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb \u0438 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0435\u0442 \u043c\u0435\u0442\u0440\u0438\u043a\u00bb \u0441\u043a\u0440\u044b\u0442\u044b \u0438 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b; \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0438\u0437 \u043a\u0435\u0431\u0430\u0431\u0430 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 29,
          "id": "fm-page-fixations-by-fi",
          "title": "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0439 \u2014 \u041f\u043e \u0424\u0418",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u0413\u0440\u0443\u043f\u043f\u044b \u043f\u043e \u0424\u0418, \u0432 \u0433\u0440\u0443\u043f\u043f\u0435 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u043f\u043e \u0434\u0430\u0442\u0435 \u043f\u043e \u0432\u043e\u0437\u0440\u0430\u0441\u0442\u0430\u043d\u0438\u044e; \u00ab\u2116\u00bb \u2014 \u043d\u043e\u043c\u0435\u0440 \u0441\u0442\u0440\u043e\u043a\u0438 \u0432 \u0433\u0440\u0443\u043f\u043f\u0435, \u0443 \u0394 \u043f\u043b\u044e\u0441 \u0437\u0435\u043b\u0451\u043d\u044b\u043c \u0438 \u043c\u0438\u043d\u0443\u0441 \u043a\u0440\u0430\u0441\u043d\u044b\u043c. \u041a\u043d\u043e\u043f\u043a\u0430 \u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0434\u0430\u0442\u044b \u2014 \u043f\u043e \u043a\u0440\u0443\u0433\u0443.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-fixations",
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
              "target": "#panel-fixations:not([hidden])",
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
          "id": "fm-page-fixations-by-date",
          "title": "\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0439 \u2014 \u041f\u043e \u0434\u0430\u0442\u0435",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041f\u043b\u043e\u0441\u043a\u0438\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u0441 \u043a\u043e\u043b\u043e\u043d\u043a\u043e\u0439 \u00ab\u041d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 \u0424\u0418\u00bb \u0432\u0442\u043e\u0440\u043e\u0439, \u00ab\u2116\u00bb \u0441\u043a\u0432\u043e\u0437\u043d\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-fixations",
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
              "target": "#panel-fixations:not([hidden])",
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
              "target": "#fm-table-fixations [data-view=\"BY_DATE\"]",
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
              "target": "#fm-table-fixations[data-view=\"BY_DATE\"]",
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
          "state": 31,
          "id": "fm-page-fixations-remove-last",
          "title": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0439 \u2014 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0424\u0418. \u00ab\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb \u2014 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0443\u0445\u043e\u0434\u0438\u0442 \u0438\u0437 \u0442\u0430\u0431\u043b\u0438\u0446\u044b, \u0441\u0447\u0451\u0442\u0447\u0438\u043a \u0432\u043a\u043b\u0430\u0434\u043a\u0438 \u0443\u043c\u0435\u043d\u044c\u0448\u0430\u0435\u0442\u0441\u044f, \u0442\u0451\u043c\u043d\u044b\u0439 \u0442\u043e\u0441\u0442 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421 \u0443\u0434\u0430\u043b\u0435\u043d\u0430\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-fixations",
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
              "target": "#panel-fixations:not([hidden])",
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
              "target": "#fm-table-fixations [data-fh-act=\"REMOVE\"][data-fixation-id=\"FX-1027-2\"]",
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
              "target": "#fm-confirm-scrim:not([hidden])",
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
          "state": 32,
          "id": "fm-page-fixations-remove-not-last",
          "title": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u043d\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0439 \u2014 \u0441\u043d\u0435\u043a",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u0430\u043a\u0442\u0438\u0432\u043d\u0430 \u0443 \u0432\u0441\u0435\u0445 \u0441\u0442\u0440\u043e\u043a, \u0431\u0435\u0437 \u0442\u0443\u043b\u0442\u0438\u043f\u0430; \u0443 \u043d\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u043a\u043b\u0438\u043a \u0434\u0430\u0451\u0442 \u0441\u043d\u0435\u043a \u00ab\u041d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044e \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb, \u043e\u043a\u043d\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-fixations",
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
              "target": "#panel-fixations:not([hidden])",
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
              "target": "#fm-table-fixations [data-fh-act=\"REMOVE\"][data-fixation-id=\"FX-1027-1\"]",
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
            }
          ]
        },
        {
          "state": 33,
          "id": "fm-page-fixations-view",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u2014 \u0431\u0435\u0437 \u043a\u043e\u0440\u0437\u0438\u043d",
          "page": "FinancialMetrics.preview.html?id=1024",
          "note": "\u0410\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430 \u2014 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440, \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u043d\u0435\u0442 \u0432\u043e\u0432\u0441\u0435; \u0438\u0441\u0442\u043e\u0440\u0438\u044f \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u0432\u0438\u0434\u0438\u043c\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tab-fixations",
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
              "target": "#panel-fixations:not([hidden])",
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
      "id": "fm-fixation",
      "title": "\u041e\u043a\u043d\u043e \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb",
      "desc": "\u041e\u043a\u043d\u043e \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0441 \u0442\u0430\u0439\u043b\u0430 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb \u0438 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u043c\u0435\u0442\u0440\u0438\u043a \u2014 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u043f\u043e \u0424\u0418, \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442, \u043f\u0440\u0430\u0432\u0438\u043b\u0430 (RE0033)",
      "steps": [
        {
          "state": 34,
          "id": "fm-fix-empty",
          "title": "\u041f\u0443\u0441\u0442\u043e\u0435 \u043e\u043a\u043d\u043e",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041e\u0434\u043d\u0430 \u043f\u0443\u0441\u0442\u0430\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430; \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d, \u00ab\u2296\u00bb \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430, \u043f\u043e\u043a\u0430 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043e\u0434\u043d\u0430. \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0430\u043a\u0442\u0438\u0432\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
          "state": 35,
          "id": "fm-fix-filled",
          "title": "\u0424\u0418 \u0438 \u0434\u0430\u0442\u0430 \u2014 \u0434\u0430\u043d\u043d\u044b\u0435 \u043f\u043e\u0434\u0442\u044f\u043d\u0443\u043b\u0438\u0441\u044c",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u0424\u0418 \u0438 \u0434\u0430\u0442\u044b \u043f\u043e\u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u00ab\u0412\u0411\u0421 \u0434\u043e \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438\u00bb, \u0415\u0422\u0421 \u0438 \u0394 \u0415\u0422\u0421, \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"ok\"]",
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
          "id": "fm-fix-prelim-done",
          "title": "\u041f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0443 \u0437\u0430\u043c\u0435\u043d\u0438\u043b \u0447\u0438\u043f \u00ab\u0420\u0430\u0441\u0447\u0435\u0442 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u00bb, \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u0431\u043b\u043e\u043a\u0438 \u043d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0439 \u0438 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0439 \u043c\u043e\u0434\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438. \u0422\u0438\u043f \u0432\u044b\u0431\u0438\u0440\u0430\u044e\u0442 \u043f\u043e \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u0443.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-prelim-run]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-prelim=\"done\"]",
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
          "state": 37,
          "id": "fm-fix-initial",
          "title": "\u0422\u0438\u043f \u00ab\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0430\u044f\u00bb",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u0414\u0430\u0442\u0430 \u043e\u0447\u0438\u0449\u0435\u043d\u0430 \u0438 \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u0430, \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d, \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u2014 \u043f\u0440\u043e\u0447\u0435\u0440\u043a. \u0424\u0418 \u0431\u0435\u0437 \u043f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u2014 \u00ab127-\u0410\u043a\u0446\u0438\u0438-203\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u0410\u043a\u0446\u0438\u0438-203",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-initial=\"true\"]",
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
          "state": 38,
          "id": "fm-fix-validation",
          "title": "\u0412\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u043f\u043e\u043b\u0435\u0439",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0441 \u043f\u0443\u0441\u0442\u043e\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u043e\u0439 \u2014 \u043a\u0440\u0430\u0441\u043d\u044b\u0435 \u0440\u0430\u043c\u043a\u0438 \u0443 \u0424\u0418, \u0434\u0430\u0442\u044b \u0438 \u0442\u0438\u043f\u0430, \u0442\u0443\u043b\u0442\u0438\u043f \u00ab\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0435 \u043f\u043e\u043b\u0435\u00bb \u043d\u0430 \u0444\u043e\u043a\u0443\u0441\u0435; \u043e\u043a\u043d\u043e \u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-scrim .inp--error",
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
          "id": "fm-fix-duplicate",
          "title": "\u041f\u043e\u0432\u0442\u043e\u0440 \u0424\u0418",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u0422\u043e\u0442 \u0436\u0435 \u0424\u0418 \u0432\u043e \u0432\u0442\u043e\u0440\u043e\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u2014 \u043e\u0448\u0438\u0431\u043a\u0430 \u00ab\u041d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0431\u043e\u043b\u0435\u0435 \u043e\u0434\u043d\u043e\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u0434\u043b\u044f \u043e\u0434\u043d\u043e\u0433\u043e \u0424\u0418\u00bb. \u00ab\u2296\u00bb \u0443 \u043e\u0431\u0435\u0438\u0445 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u0430\u043a\u0442\u0438\u0432\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fix-add]",
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
              "verb": "fill",
              "target": "#fm-fix-scrim [data-fx-card]:nth-of-type(2) [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-card]:nth-of-type(2) [data-fx-field=\"fi\"].inp--error",
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
          "state": 40,
          "id": "fm-fix-prelim-fail",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
          "page": "FinancialMetrics.preview.html?id=1027&fmFix=prefail",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?fmFix=prefail. \u0410\u043b\u0435\u0440\u0442 \u00ab\u041f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u00bb \u043d\u0430\u0434 \u0442\u0435\u043b\u043e\u043c \u043e\u043a\u043d\u0430, \u043a\u043d\u043e\u043f\u043a\u0430 \u0441\u043d\u043e\u0432\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-prelim-run]",
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
              "target": "#fm-fix-scrim [data-fix-alert]:not([hidden])",
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
          "id": "fm-fix-prelim-no-initial",
          "title": "\u041f\u0440\u0435\u0434\u0440\u0430\u0441\u0447\u0435\u0442 \u0431\u0435\u0437 \u043f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u0410\u043b\u0435\u0440\u0442 \u043d\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u043f\u0440\u0438\u0447\u0438\u043d\u0443 \u2014 \u0443 \u0424\u0418 \u0435\u0449\u0451 \u043d\u0435\u0442 \u043f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u042d\u041f\u0421/\u0412\u0411\u0421. \u0422\u0438\u043f \u00ab\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f\u00bb \u0431\u0435\u0437 \u043f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e\u0439 \u043f\u0440\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0438 \u0434\u0430\u0451\u0442 \u0441\u043d\u0435\u043a \u0441 \u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u043e\u0439 \u00ab\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u0430\u044f\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u0410\u043a\u0446\u0438\u0438-203",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-prelim-run]",
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
              "target": "#fm-fix-scrim [data-fix-alert]:not([hidden])",
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
          "state": 42,
          "id": "fm-fix-confirm",
          "title": "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0434\u043e \u043a\u043e\u043d\u0446\u0430 \u043f\u0440\u0435\u0434\u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u2014 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435",
          "page": "FinancialMetrics.preview.html?id=1027",
          "note": "\u041f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0438\u0434\u0451\u0442 (\u0415\u0422\u0421 \u0443\u0436\u0435 \u043f\u043e\u0441\u0447\u0438\u0442\u0430\u043d), \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u00ab\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u00bb. \u00ab\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb \u2014 \u043e\u043a\u043d\u0430 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u044e\u0442\u0441\u044f, \u0442\u043e\u0441\u0442 \u00ab\u0420\u0430\u0441\u0447\u0435\u0442 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u0438 \u042d\u041f\u0421/\u0412\u0411\u0421 \u0437\u0430\u043f\u0443\u0449\u0435\u043d\u00bb, \u0437\u0430\u0442\u0435\u043c \u043d\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u043e\u043a\u0430 \u0432 \u0438\u0441\u0442\u043e\u0440\u0438\u0438 \u0438 \u0437\u0435\u043b\u0451\u043d\u044b\u0439 \u0441\u043d\u0435\u043a.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "02.02.2032",
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
              "target": "#fm-fix-scrim [data-fx-prelim-run]",
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
              "verb": "wait",
              "target": null,
              "text": null,
              "index": 0,
              "timeout": null,
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
              "ms": 800
            },
            {
              "verb": "click",
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-confirm-scrim:not([hidden])",
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
          "state": 43,
          "id": "fm-fix-deal-tile",
          "title": "\u041e\u043a\u043d\u043e \u0441 \u0442\u0430\u0439\u043b\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0441\u0434\u0435\u043b\u043a\u0438",
          "page": "Deal.preview.html?id=1027",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u042d\u041f\u0421/\u0412\u0411\u0421\u00bb \u0442\u0430\u0439\u043b\u0430 \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u043e \u0436\u0435 \u043e\u043a\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-fm-calc [data-fm-act=\"FIXATION\"]",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
          "id": "fm-fix-ets-loading",
          "title": "\u0415\u0422\u0421 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u2014 \u0441\u043a\u0435\u043b\u0435\u0442\u043e\u043d\u044b, \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0441 \u0430\u043b\u0435\u0440\u0442\u043e\u043c",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=slow",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?fmEts=slow (\u0440\u0430\u0441\u0447\u0451\u0442 \u0415\u0422\u0421 ~8 \u0441). \u041f\u043e\u0441\u043b\u0435 \u0424\u0418 \u0438 \u0434\u0430\u0442\u044b \u0432\u043c\u0435\u0441\u0442\u043e \u0415\u0422\u0421 \u0438 \u0394 \u0415\u0422\u0421 \u0441\u043a\u0435\u043b\u0435\u0442\u043e\u043d\u044b. \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0434\u043e \u043a\u043e\u043d\u0446\u0430 \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u2014 \u0430\u043b\u0435\u0440\u0442 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb / \u00ab\u0412\u044b\u043f\u043e\u043b\u043d\u044f\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0435\u0442 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u0415\u0422\u0421 \u0434\u043b\u044f \u0424\u0418\u00bb; \u0441\u0430\u043c \u0433\u0430\u0441\u043d\u0435\u0442, \u043a\u043e\u0433\u0434\u0430 \u0415\u0422\u0421 \u043f\u043e\u0441\u0447\u0438\u0442\u0430\u043b\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-scrim [data-fix-alert]:not([hidden])",
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
          "id": "fm-fix-ets-failed",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u0415\u0422\u0421",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=failed",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?fmEts=failed. \u0412\u043c\u0435\u0441\u0442\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043f\u0440\u043e\u0447\u0435\u0440\u043a \u0438 \u043a\u0440\u0430\u0441\u043d\u0430\u044f \u0438\u043a\u043e\u043d\u043a\u0430 \u0441 \u0442\u0443\u043b\u0442\u0438\u043f\u043e\u043c \u00ab\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u0415\u0422\u0421\u00bb, \u0440\u044f\u0434\u043e\u043c \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448 \u0434\u043b\u044f \u0440\u0443\u0447\u043d\u043e\u0433\u043e \u0432\u0432\u043e\u0434\u0430. \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u043d\u0435 \u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"error\"]",
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
          "state": 46,
          "id": "fm-fix-ets-empty",
          "title": "\u0415\u0422\u0421 \u043d\u0435\u0442 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u0430 0",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=empty",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?fmEts=empty. \u041f\u0440\u043e\u0447\u0435\u0440\u043a \u0438 \u0436\u0451\u043b\u0442\u044b\u0439 \u0442\u0440\u0435\u0443\u0433\u043e\u043b\u044c\u043d\u0438\u043a \u0441 \u0442\u0443\u043b\u0442\u0438\u043f\u043e\u043c \u00ab\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0415\u0422\u0421 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u043b\u0438 \u0440\u0430\u0432\u043d\u043e 0\u00bb, \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0440\u0443\u0447\u043d\u043e\u0439 \u0432\u0432\u043e\u0434. \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u043d\u0435 \u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"empty\"]",
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
          "id": "fm-fix-ets-multiple",
          "title": "\u0420\u0430\u0437\u043d\u044b\u0435 \u0415\u0422\u0421 \u0443 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u0424\u0418 \u2014 \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0441 \u0430\u043b\u0435\u0440\u0442\u043e\u043c",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=multiple",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?fmEts=multiple. \u0414\u043e \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb (\u0438\u043b\u0438 \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0433\u043e \u0440\u0430\u0441\u0447\u0451\u0442\u0430) \u0432 \u0431\u043b\u043e\u043a\u0435 \u0415\u0422\u0421 \u043f\u0440\u043e\u0447\u0435\u0440\u043a. \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u2014 \u0430\u043b\u0435\u0440\u0442 \u00ab\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb, \u043a\u0440\u0430\u0441\u043d\u0430\u044f \u0438\u043a\u043e\u043d\u043a\u0430 \u00ab\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0439 \u0415\u0422\u0421 \u0434\u043b\u044f \u0434\u0430\u043d\u043d\u043e\u0433\u043e \u0424\u0418\u00bb \u0438 \u0441\u043f\u0438\u0441\u043e\u043a \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0439 \u0438 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448; \u043e\u043a\u043d\u043e \u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"idle\"]",
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
              "verb": "wait",
              "target": null,
              "text": null,
              "index": 0,
              "timeout": null,
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
              "ms": 900
            },
            {
              "verb": "click",
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"error\"]",
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
          "state": 48,
          "id": "fm-fix-ets-edit",
          "title": "\u0420\u0443\u0447\u043d\u043e\u0439 \u0432\u0432\u043e\u0434 \u0415\u0422\u0421 \u2014 \u043f\u043e\u043b\u0435 \u0441 \u00ab%\u00bb \u0438 \u0433\u0430\u043b\u043e\u0447\u043a\u0430",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=multiple",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u0430 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043f\u043e\u043b\u0435 \u0441 \u043f\u043e\u0441\u0442\u0444\u0438\u043a\u0441\u043e\u043c \u00ab%\u00bb, \u0432\u043c\u0435\u0441\u0442\u043e \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u0430 \u0433\u0430\u043b\u043e\u0447\u043a\u0430. \u041f\u0443\u0441\u0442\u043e\u0435 \u043f\u043e\u043b\u0435 \u0438 \u0433\u0430\u043b\u043e\u0447\u043a\u0430 \u2014 \u0432\u043e\u0437\u0432\u0440\u0430\u0442 \u043a \u043f\u0440\u0435\u0436\u043d\u0435\u043c\u0443 \u0432\u0438\u0434\u0443.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "verb": "wait",
              "target": null,
              "text": null,
              "index": 0,
              "timeout": null,
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
              "ms": 900
            },
            {
              "verb": "click",
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"error\"]",
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
              "target": "#fm-fix-scrim [data-fx-ets-pencil]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets-edit=\"true\"]",
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
          "state": 49,
          "id": "fm-fix-ets-manual",
          "title": "\u0415\u0422\u0421 \u0432\u0432\u0435\u0434\u0435\u043d\u0430 \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u2014 \u0430\u043b\u0435\u0440\u0442 \u0441\u043a\u0440\u044b\u0442, \u0394 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u0430",
          "page": "FinancialMetrics.preview.html?id=1027&fmEts=multiple",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u0433\u0430\u043b\u043e\u0447\u043a\u0438 \u043f\u043e\u0434\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435, \u0394 \u0415\u0422\u0421 \u043f\u043e\u0441\u0447\u0438\u0442\u0430\u043d\u0430 \u043e\u0442 \u043f\u0440\u0435\u0436\u043d\u0435\u0439 \u0415\u0422\u0421, \u0438\u043a\u043e\u043d\u043a\u0430 \u0438 \u0430\u043b\u0435\u0440\u0442 \u0441\u043a\u0440\u044b\u0442\u044b, \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448 \u043e\u0441\u0442\u0430\u043b\u0441\u044f; \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0442\u0435\u043f\u0435\u0440\u044c \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-fixation",
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
              "target": "#fm-fix-scrim:not([hidden])",
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
              "target": "#fm-fix-scrim [data-fx-field=\"fi\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "127-\u041a\u0440\u0435\u0434\u0438\u0442-201",
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
              "target": "#fm-fix-scrim [data-fx-field=\"type\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041d\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u0430\u044f",
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
              "target": "#fm-fix-scrim [data-fx-field=\"date\"] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "01.01.2030",
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
              "verb": "wait",
              "target": null,
              "text": null,
              "index": 0,
              "timeout": null,
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
              "ms": 900
            },
            {
              "verb": "click",
              "target": "#fm-fix-scrim [data-fix-save]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"error\"]",
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
              "target": "#fm-fix-scrim [data-fx-ets-pencil]",
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
              "verb": "fill",
              "target": "#fm-fix-scrim [data-fx-ets-input] .inp__control",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "18,5",
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
              "target": "#fm-fix-scrim [data-fx-ets-ok]",
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
              "target": "#fm-fix-scrim [data-fx-card][data-fx-ets=\"manual\"]",
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
      "id": "fm-export",
      "title": "\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u043e\u0442\u0447\u0435\u0442\u0430",
      "desc": "\u041e\u043a\u043d\u043e \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u043e\u0442\u0447\u0435\u0442\u0430\u00bb \u0438\u0437 \u043a\u0435\u0431\u0430\u0431\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0435 \u043c\u0435\u0442\u0440\u0438\u043a\u0438\u00bb; \u0432\u0438\u0434 \u2014 \u043f\u043e \u0441\u0435\u0442\u0438 (RE0033, \u042d8)",
      "steps": [
        {
          "state": 50,
          "id": "fm-export-plain",
          "title": "\u0410\u043b\u044c\u0444\u0430 \u2014 \u0431\u0435\u0437 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "FinancialMetrics.preview.html?id=1024",
          "note": "\u0421\u0435\u0442\u044c \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u2014 \u0410\u043b\u044c\u0444\u0430 / \u041e\u043c\u0435\u0433\u0430. \u041e\u043a\u043d\u043e \u0441 \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435\u043c \u043e \u0434\u0430\u043d\u043d\u044b\u0445 \u041a2, \u0431\u0435\u0437 \u0432\u044b\u0431\u043e\u0440\u0430 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432; \u00ab\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c\u00bb \u0438 \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c\u00bb. \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c\u00bb \u2014 \u0441\u043d\u0435\u043a \u00ab\u0424\u0430\u0439\u043b \u0432\u044b\u0433\u0440\u0443\u0436\u0435\u043d\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-menu-btn",
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
              "verb": "click",
              "target": "#fm-export",
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
              "target": "#fm-download-scrim:not([hidden])",
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
          "state": 51,
          "id": "fm-export-encrypted",
          "title": "\u0421\u0438\u0433\u043c\u0430 \u2014 \u0441 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u0435\u043c",
          "page": "FinancialMetrics.preview.html?id=1024&net=sigma",
          "note": "\u0421\u0435\u0442\u044c \u0421\u0438\u0433\u043c\u0430 (\u0441 \u0432\u044b\u0445\u043e\u0434\u043e\u043c \u0432 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442) \u2014 \u0444\u0430\u0439\u043b \u0448\u0438\u0444\u0440\u0443\u0435\u0442\u0441\u044f. \u0422\u043e\u0442 \u0436\u0435 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a \u0438 \u043f\u043e\u0434\u0432\u0430\u043b, \u043f\u043b\u044e\u0441 \u0432\u044b\u0431\u043e\u0440 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432; \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c\u00bb \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0430, \u043f\u043e\u043a\u0430 \u043d\u0438\u043a\u0442\u043e \u043d\u0435 \u043e\u0442\u043c\u0435\u0447\u0435\u043d.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-menu-btn",
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
              "verb": "click",
              "target": "#fm-export",
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
              "target": "#fm-download-scrim:not([hidden])",
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
          "id": "fm-export-email",
          "title": "\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043f\u043e e-mail",
          "page": null,
          "note": "\u0410\u0434\u0440\u0435\u0441 \u0432\u043d\u0435 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0430 \u043f\u043e\u043f\u0430\u0434\u0430\u0435\u0442 \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0443 \u0441\u0432\u043e\u0435\u0433\u043e \u0434\u043e\u043c\u0435\u043d\u0430 (omega / alfa \u2014 \u0432\u043e \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0439); \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c\u00bb \u0441\u0442\u0430\u043b\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#fm-dl-email",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "PetrovAA@omega.sberbank.ru",
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
              "target": "[data-dl-add-email]",
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
              "target": "#fm-download-scrim [data-dl-rows] .tbl__row[data-key]",
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
          "id": "fm-export-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438",
          "page": "FinancialMetrics.preview.html?id=1024&download=fail",
          "note": "\u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0439 ?download=fail. \u041e\u043a\u043d\u043e \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f, \u043a\u0440\u0430\u0441\u043d\u044b\u0439 \u0441\u043d\u0435\u043a \u00ab\u041e\u0448\u0438\u0431\u043a\u0430\u00bb / \u00ab\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0432\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u0430\u0439\u043b. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437.\u00bb",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fm-menu-btn",
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
              "verb": "click",
              "target": "#fm-export",
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
              "verb": "click",
              "target": "#fm-download-scrim [data-dl-submit]",
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
              "target": ".snack--error",
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
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
