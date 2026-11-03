/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "funds-app",
    "title": "\u0424\u043e\u043d\u0434\u044b"
  },
  "sources": {
    "flows": "0dc025b9",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 \u0424\u043e\u043d\u0434\u044b \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 24,
  "flows": [
    {
      "id": "main",
      "title": "\u0421\u043f\u0438\u0441\u043e\u043a \u0444\u043e\u043d\u0434\u043e\u0432 \u0438 \u0430\u043a\u0442\u0438\u0432\u044b",
      "desc": "\u0421\u043f\u0438\u0441\u043e\u043a \u2192 \u0430\u043a\u0442\u0438\u0432\u044b \u0444\u043e\u043d\u0434\u0430 \u2192 \u043f\u0443\u0441\u0442\u044b\u0435 \u0430\u043a\u0442\u0438\u0432\u044b \u2192 \u043f\u043e\u0438\u0441\u043a \u2192 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043e\u0432 \u2192 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u0442\u0430\u0431\u043b\u0438\u0446\u044b",
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u043f\u0438\u0441\u043e\u043a \u0444\u043e\u043d\u0434\u043e\u0432",
          "page": "FundsPipeline.preview.html",
          "note": "\u0412\u0445\u043e\u0434 \u2014 \u043f\u043b\u0438\u0442\u043a\u0430 \u00ab\u0424\u043e\u043d\u0434\u044b\u00bb \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044f IB. \u0424\u043e\u043d\u0434\u044b \u0438\u0437 \u0415\u041f\u041a \u0438 \u043d\u0435 \u0438\u0437 \u0415\u041f\u041a \u0432 \u043e\u0434\u043d\u043e\u043c \u0441\u043f\u0438\u0441\u043a\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "fund-assets",
          "title": "\u0410\u043a\u0442\u0438\u0432\u044b \u0444\u043e\u043d\u0434\u0430 \u0418\u043d\u0442\u0435\u0440\u0440\u043e\u0441",
          "page": null,
          "note": "\u041a\u043b\u0438\u043a \u043f\u043e \u0444\u043e\u043d\u0434\u0443 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u043f\u0440\u0430\u0432\u0430 \u0435\u0433\u043e \u0430\u043a\u0442\u0438\u0432\u044b; \u0448\u0438\u0440\u0438\u043d\u0443 \u043f\u0430\u043d\u0435\u043b\u0435\u0439 \u043c\u0435\u043d\u044f\u0435\u0442 \u0441\u043f\u043b\u0438\u0442\u0442\u0435\u0440.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-fund-id=\"fnd-001\"]",
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
              "target": "#assetsTable[data-state=\"data\"]",
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
          "state": 3,
          "id": "fund-assets-empty",
          "title": "\u0423 \u0420\u0424\u041f\u0418 \u0430\u043a\u0442\u0438\u0432\u043e\u0432 \u043d\u0435\u0442",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-fund-id=\"fnd-004\"]",
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
              "target": "#assetsTable[data-state=\"empty\"]",
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
          "state": 4,
          "id": "assets-closed",
          "title": "\u041f\u0430\u043d\u0435\u043b\u044c \u0430\u043a\u0442\u0438\u0432\u043e\u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u0430",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#assetsTable [data-at-close]",
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
              "target": "#assetsTable",
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
          "state": 5,
          "id": "search",
          "title": "\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0431\u0435\u043d\u0435\u0444\u0438\u0446\u0438\u0430\u0440\u0443",
          "page": null,
          "note": "\u041f\u043e\u0438\u0441\u043a \u0438\u0434\u0451\u0442 \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e, \u043f\u0441\u0435\u0432\u0434\u043e\u043d\u0438\u043c\u0443, \u0431\u0435\u043d\u0435\u0444\u0438\u0446\u0438\u0430\u0440\u0443 \u0438 \u0418\u041d\u041d \u2014 \u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430 \u0443 \u0437\u043d\u0430\u0447\u043a\u0430 \u00abi\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#fundsFilters [data-ff-field=\"smartSearch\"] input",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041f\u043e\u0442\u0430\u043d\u0438\u043d",
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
              "target": "#fundsTable [data-fund-id=\"fnd-002\"]",
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
          "state": 24,
          "id": "priorities",
          "title": "\u041d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043e\u0432",
          "page": null,
          "note": "\u0424\u0438\u043b\u044c\u0442\u0440\u044b \u0441\u0442\u043e\u044f\u0442 \u0432 \u0442\u0443\u043b\u0431\u0430\u0440\u0435 \u0442\u0430\u0431\u043b\u0438\u0446\u044b. \u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043e\u0432 \u043c\u043e\u0436\u043d\u043e \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u2014 \u0447\u0435\u043a\u0431\u043e\u043a\u0441\u044b \u0438 \u0441\u0432\u043e\u0434\u043a\u0430 \u00ab\u0412\u044b\u0441\u043e\u043a\u0438\u0439, +1\u00bb. \u041f\u043e\u043b\u044f \u0442\u0438\u043f\u0430 \u0438 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0430 \u2014 \u043f\u043e \u0448\u0438\u0440\u0438\u043d\u0435 \u0441\u0430\u043c\u043e\u0433\u043e \u0434\u043b\u0438\u043d\u043d\u043e\u0433\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#fundsFilters [data-ff-field=\"smartSearch\"] input",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "",
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
              "target": "#fundsFilters [data-ff-field=\"priorityCodes\"] .inp__act--chev",
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
              "target": ".ddl[aria-label=\"\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b \u0444\u043e\u043d\u0434\u043e\u0432\"] .ddl__item[data-code=\"HIGH\"]",
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
              "target": ".ddl[aria-label=\"\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u044b \u0444\u043e\u043d\u0434\u043e\u0432\"] .ddl__item[data-code=\"LOW\"]",
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
              "target": "#fundsTable [data-fund-id=\"fnd-003\"]",
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
          "state": 6,
          "id": "table-settings",
          "title": "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u0442\u0430\u0431\u043b\u0438\u0446\u044b",
          "page": null,
          "note": "\u0428\u0435\u0441\u0442\u0435\u0440\u0451\u043d\u043a\u0430 \u0441\u043f\u0440\u0430\u0432\u0430 \u0432 \u0442\u0443\u043b\u0431\u0430\u0440\u0435 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u043d\u043e\u0435 \u043e\u043a\u043d\u043e \u0414\u0421 \u2014 \u0432\u0438\u0434\u0438\u043c\u043e\u0441\u0442\u044c, \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0438 \u0437\u0430\u043a\u0440\u0435\u043f\u043b\u0435\u043d\u0438\u0435 \u043a\u043e\u043b\u043e\u043d\u043e\u043a, \u00ab\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-table-settings]",
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
              "target": "[id^=\"ds-table-settings-scrim\"]",
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
      "id": "add-from-epk",
      "title": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0444\u043e\u043d\u0434 \u0438\u0437 \u0415\u041f\u041a",
      "desc": "\u041f\u043e\u0438\u0441\u043a \u0432 \u0431\u0430\u0437\u0430\u0445 \u2192 \u043a\u043b\u0438\u0435\u043d\u0442 \u0415\u041f\u041a \u2192 \u0444\u043e\u0440\u043c\u0430 \u0444\u043e\u043d\u0434\u0430 \u2192 \u0444\u043e\u043d\u0434 \u0432 \u0441\u043f\u0438\u0441\u043a\u0435",
      "steps": [
        {
          "state": 7,
          "id": "add-open",
          "title": "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0444\u043e\u043d\u0434 \u2014 \u043f\u043e\u0438\u0441\u043a",
          "page": "FundsPipeline.preview.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#btnAddFund",
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
              "target": "#addFundEntityFromUcpModal",
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
          "id": "add-found",
          "title": "\u041d\u0430\u0439\u0434\u0435\u043d\u043e \u0432 \u0431\u0430\u0437\u0435 \u0444\u043e\u043d\u0434\u043e\u0432 \u0438 \u0432 \u0415\u041f\u041a",
          "page": null,
          "note": "\u0418\u043d\u0442\u0435\u0440\u0440\u043e\u0441 \u0443\u0436\u0435 \u0435\u0441\u0442\u044c \u0432 \u0431\u0430\u0437\u0435 \u0444\u043e\u043d\u0434\u043e\u0432 \u2014 \u00ab\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c\u00bb \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#afe-name",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u0418\u043d\u0442\u0435\u0440\u0440\u043e\u0441",
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
              "target": "#afe-inn",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "0765",
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
              "target": "#addFundEntityFromUcpModal [data-afe-search]",
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
              "target": "#addFundEntityFromUcpModal [data-afe-id=\"pty-3001\"]",
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
          "state": 9,
          "id": "add-client",
          "title": "\u0412\u044b\u0431\u0440\u0430\u043d \u043a\u043b\u0438\u0435\u043d\u0442 \u0415\u041f\u041a",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#addFundEntityFromUcpModal [data-afe-id=\"pty-3001\"]",
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
              "target": "#addFundEntityFromUcpModal [data-detail=\"client\"]",
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
          "id": "add-form",
          "title": "\u0424\u043e\u0440\u043c\u0430 \u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0444\u043e\u043d\u0434\u00bb",
          "page": null,
          "note": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435, \u0418\u041d\u041d \u0438 \u041a\u041f\u041f \u043f\u0440\u0438\u0445\u043e\u0434\u044f\u0442 \u0438\u0437 \u0415\u041f\u041a \u0438 \u043d\u0435 \u043f\u0440\u0430\u0432\u044f\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#addFundEntityFromUcpModal [data-afe-next]",
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
              "target": "#editFundModal",
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
          "id": "add-done",
          "title": "\u0424\u043e\u043d\u0434 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#editFundModal [data-efm-save]",
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
              "target": "#editFundModal",
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
        }
      ]
    },
    {
      "id": "new-fund",
      "title": "\u041d\u043e\u0432\u044b\u0439 \u0444\u043e\u043d\u0434",
      "desc": "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e \u2192 \u00ab\u041d\u043e\u0432\u044b\u0439 \u0444\u043e\u043d\u0434\u00bb \u2192 \u0444\u043e\u0440\u043c\u0430",
      "steps": [
        {
          "state": 12,
          "id": "new-search",
          "title": "\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
          "page": "FundsPipeline.preview.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#btnAddFund",
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
              "target": "#addFundEntityFromUcpModal",
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
              "target": "#afe-name",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u0410\u043d\u0434\u0440\u043e\u043c\u0435\u0434\u0430",
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
              "target": "#afe-inn",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "",
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
              "target": "#addFundEntityFromUcpModal [data-afe-search]",
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
              "target": "#addFundEntityFromUcpModal [data-afe-create]",
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
          "id": "new-form",
          "title": "\u0424\u043e\u0440\u043c\u0430 \u00ab\u041d\u043e\u0432\u044b\u0439 \u0444\u043e\u043d\u0434\u00bb",
          "page": null,
          "note": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e \u0438\u0437 \u043f\u043e\u0438\u0441\u043a\u0430; \u0418\u041d\u041d \u0438 \u041a\u041f\u041f \u0443 \u0444\u043e\u043d\u0434\u0430 \u043d\u0435 \u0438\u0437 \u0415\u041f\u041a \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#addFundEntityFromUcpModal [data-afe-create]",
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
              "target": "#editFundModal",
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
          "state": 14,
          "id": "new-done",
          "title": "\u0424\u043e\u043d\u0434 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#editFundModal [data-efm-save]",
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
              "target": "#editFundModal",
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
        }
      ]
    },
    {
      "id": "edit-delete",
      "title": "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u043e\u043d\u0434",
      "desc": "\u041c\u0435\u043d\u044e \u0444\u043e\u043d\u0434\u0430 \u0438\u0437 \u0415\u041f\u041a \u0438 \u043d\u0435 \u0438\u0437 \u0415\u041f\u041a",
      "steps": [
        {
          "state": 15,
          "id": "menu-epk",
          "title": "\u041c\u0435\u043d\u044e \u0444\u043e\u043d\u0434\u0430 \u0438\u0437 \u0415\u041f\u041a",
          "page": "FundsPipeline.preview.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-menu][data-fund-id=\"fnd-001\"]",
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
              "target": "#fundActionsMenu",
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
          "id": "edit-epk",
          "title": "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0444\u043e\u043d\u0434 \u0438\u0437 \u0415\u041f\u041a",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundActionsMenu [data-fund-action=\"editFund\"]",
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
              "target": "#editFundModal",
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
          "state": 17,
          "id": "edit-epk-cancel",
          "title": "\u041e\u0442\u043c\u0435\u043d\u0430 \u043f\u0440\u0430\u0432\u043a\u0438",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#editFundModal [data-efm-cancel]",
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
              "target": "#editFundModal",
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
          "state": 22,
          "id": "menu-custom",
          "title": "\u041c\u0435\u043d\u044e \u0444\u043e\u043d\u0434\u0430 \u043d\u0435 \u0438\u0437 \u0415\u041f\u041a",
          "page": null,
          "note": "\u0412\u043c\u0435\u0441\u0442\u043e \u00ab\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043b\u0438\u0435\u043d\u0442\u0430\u00bb \u2014 \u00ab\u0421\u0432\u044f\u0437\u0430\u0442\u044c \u0441 \u0431\u0430\u0437\u043e\u0439 \u0415\u041f\u041a\u00bb; \u0432\u043e\u0440\u043a\u0444\u043b\u043e\u0443 \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0438 \u043f\u043e\u043a\u0430 \u043d\u0435 \u0434\u0435\u043b\u0430\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-menu][data-fund-id=\"fnd-008\"]",
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
              "target": "#fundActionsMenuCustom",
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
          "id": "edit-custom",
          "title": "\u0424\u043e\u043d\u0434 \u043d\u0435 \u0438\u0437 \u0415\u041f\u041a \u2014 \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435",
          "page": null,
          "note": "\u00ab\u041f\u0440\u0438\u0432\u044f\u0437\u0430\u0442\u044c\u00bb \u0432 \u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0438 \u2014 \u0431\u0435\u0437 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f, \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0432\u043e\u0440\u043a\u0444\u043b\u043e\u0443 \u0415\u041f\u041a.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundActionsMenuCustom [data-fund-action=\"editFund\"]",
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
              "target": "#editFundModal [data-efm-ucp-alert]",
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
          "state": 19,
          "id": "delete-open",
          "title": "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u043e\u043d\u0434",
          "page": "FundsPipeline.preview.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#fundsTable [data-menu][data-fund-id=\"fnd-001\"]",
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
              "target": "#fundActionsMenu",
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
              "target": "#fundActionsMenu [data-fund-action=\"deleteFund\"]",
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
              "target": "#deleteFundModal",
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
          "id": "delete-done",
          "title": "\u0424\u043e\u043d\u0434 \u0443\u0434\u0430\u043b\u0451\u043d",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#deleteFundModal [data-dfm-confirm]",
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
              "target": "#fundsTable [data-fund-id=\"fnd-001\"]",
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
              "state": "absent",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "empty",
      "title": "\u0424\u043e\u043d\u0434\u043e\u0432 \u043d\u0435\u0442",
      "desc": null,
      "steps": [
        {
          "state": 21,
          "id": "empty-list",
          "title": "\u041f\u0443\u0441\u0442\u043e\u0439 \u0441\u043f\u0438\u0441\u043e\u043a",
          "page": "FundsPipeline.preview.html?state=empty",
          "note": "\u0418\u043c\u043f\u043e\u0440\u0442\u0430 \u0443 \u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044f IB \u043d\u0435\u0442 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0444\u043e\u043d\u0434\u00bb; \u0444\u0438\u043b\u044c\u0442\u0440\u044b \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    }
  ],
  "flowErrors": [],
  "comments": [],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
