/* СГЕНЕРИРОВАН screen-map.mjs из map.yaml — руками не править; пересобрать:
   node .agents/tools/screen-map.mjs (сверка — --check).
   Карта экранов раздела: экраны, связи «откуда куда» и ключевые состояния.
   Адреса — от каталога apps/; обычный <script>: по file:// fetch не работает. */
(window.ScreenMaps = window.ScreenMaps || {})["ib"] = {
  "format": 1,
  "section": "ib",
  "title": "\u041a\u0430\u0440\u0442\u0430 \u044d\u043a\u0440\u0430\u043d\u043e\u0432 IB",
  "desc": "\u0412\u0441\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b IB \u0432 \u043e\u0434\u0438\u043d \u043a\u043b\u0438\u043a \u2014 \u043e\u0442 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0434\u043e \u043d\u0438\u0442\u0438 \u0437\u0430\u043f\u0440\u043e\u0441\u0430 AI Pitcher",
  "apps": [
    {
      "dir": "core/host-app",
      "id": "home",
      "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
      "track": "product",
      "panel": false
    },
    {
      "dir": "ib/banker-app",
      "id": "banker-app",
      "title": "AI Pitcher",
      "track": "product",
      "panel": false
    },
    {
      "dir": "ib/funds-app",
      "id": "funds-app",
      "title": "\u0424\u043e\u043d\u0434\u044b",
      "track": "product",
      "panel": true
    }
  ],
  "nodes": [
    {
      "id": "main",
      "app": "core/host-app",
      "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u2014 \u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c IB",
      "page": "HomePage.html?role=director_ib",
      "href": "core/host-app/pages/HomePage.html?role=director_ib",
      "parent": null,
      "note": null,
      "passport": "local-components/core/host-app/HomePage.page.html",
      "states": []
    },
    {
      "id": "thread",
      "app": "ib/banker-app",
      "title": "\u041d\u043e\u0432\u044b\u0439 \u043e\u0442\u0447\u0451\u0442",
      "page": "RequestThread.html",
      "href": "ib/banker-app/pages/RequestThread.html",
      "parent": "main",
      "note": null,
      "passport": "local-components/ib/banker-app/RequestThread.page.html",
      "states": [
        {
          "id": "example",
          "kind": "do",
          "title": "\u041f\u0440\u0438\u043c\u0435\u0440 \u0437\u0430\u043f\u0440\u043e\u0441\u0430 \u0432 \u043f\u043e\u043b\u0435",
          "page": "RequestThread.html",
          "href": "ib/banker-app/pages/RequestThread.html#ppmap=thread/example",
          "note": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#btnExample",
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
          "id": "ready",
          "kind": "do",
          "title": "\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0433\u043e\u0442\u043e\u0432",
          "page": "RequestThread.html?id=1",
          "href": "ib/banker-app/pages/RequestThread.html?id=1",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "running",
          "kind": "do",
          "title": "\u0418\u0434\u0451\u0442 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430",
          "page": "RequestThread.html?id=2",
          "href": "ib/banker-app/pages/RequestThread.html?id=2",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "answered",
          "kind": "do",
          "title": "\u041e\u0442\u0432\u0435\u0442 \u0432 \u0434\u0438\u0430\u043b\u043e\u0433\u0435",
          "page": "RequestThread.html?id=4",
          "href": "ib/banker-app/pages/RequestThread.html?id=4",
          "note": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "funds",
      "app": "ib/funds-app",
      "title": "\u0424\u043e\u043d\u0434\u044b",
      "page": "FundsPipeline.preview.html",
      "href": "ib/funds-app/pages/FundsPipeline.preview.html",
      "parent": "main",
      "note": null,
      "passport": "local-components/ib/funds-app/FundsPipeline.page.html",
      "states": [
        {
          "id": "assets",
          "kind": "do",
          "title": "\u0410\u043a\u0442\u0438\u0432\u044b \u0444\u043e\u043d\u0434\u0430 (\u0418\u043d\u0442\u0435\u0440\u0440\u043e\u0441)",
          "page": "FundsPipeline.preview.html?fund=fnd-001",
          "href": "ib/funds-app/pages/FundsPipeline.preview.html?fund=fnd-001",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "assets-empty",
          "kind": "do",
          "title": "\u0423 \u0444\u043e\u043d\u0434\u0430 \u043d\u0435\u0442 \u0430\u043a\u0442\u0438\u0432\u043e\u0432 (\u0420\u0424\u041f\u0418)",
          "page": "FundsPipeline.preview.html?fund=fnd-004",
          "href": "ib/funds-app/pages/FundsPipeline.preview.html?fund=fnd-004",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "empty",
          "kind": "do",
          "title": "\u0424\u043e\u043d\u0434\u043e\u0432 \u043d\u0435\u0442",
          "page": "FundsPipeline.preview.html?state=empty",
          "href": "ib/funds-app/pages/FundsPipeline.preview.html?state=empty",
          "note": null,
          "issues": [],
          "do": []
        }
      ]
    }
  ]
};
