(function () {
  var MARCA = "Central de Manuais UAM";
  var dados = { categorias: [], manuais: [] };
  var filtro = { q: "", cat: null, tipo: null };
  var app = document.getElementById("app");

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      var v = attrs[k]; if (v == null) continue;
      if (k === "text") e.textContent = v;
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function norm(s) { return (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function tam(b) { if (!b) return ""; return b > 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }
  function url(p) { return p.split("/").map(encodeURIComponent).join("/"); }
  function bg(p) { return p ? "background-image:url('" + url(p) + "')" : null; }
  function data(iso) { try { return new Date(iso).toLocaleDateString("pt-BR"); } catch (e) { return ""; } }
  function contar(c) { return dados.manuais.filter(function (m) { return m.categoria === c; }).length; }

  function lupa() {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>';
    return s;
  }

  function montar() {
    app.innerHTML = "";
    app.appendChild(el("header", { class: "marca" }, [el("div", { class: "wrap" }, [
      dados.logo ? el("img", { class: "logo", src: url(dados.logo), alt: "Logo" }) : null,
      el("h1", { text: MARCA })
    ])]));
    app.appendChild(el("section", { class: "hero", "aria-label": "Apresentação" }, [
      el("div", { class: "foto", style: "background-image:url('img/hero.jpg')", role: "img", "aria-label": "Máquinas agrícolas na lavoura" }),
      el("div", { class: "fio" }),
      el("div", { class: "wrap txt", style: "width:100%;max-width:1180px" }, [el("div", {}, [
        el("h2", { text: "Manuais de Equipamentos" }),
        el("p", { text: "Encontre o manual da sua máquina." })
      ])])
    ]));
    app.appendChild(el("main", {}, [el("div", { class: "wrap" }, [
      el("div", { class: "busca" }, [el("label", {}, [lupa(),
        el("input", { id: "busca", type: "search", placeholder: "Buscar equipamento, marca ou modelo", "aria-label": "Buscar equipamento",
          oninput: function (e) { filtro.q = e.target.value; listar(); } })])]),
      el("div", { class: "tipos topo", id: "tipos", role: "group", "aria-label": "Filtrar por tipo" }),
      el("section", { class: "bloco", "aria-label": "Categorias" }, [el("div", { class: "cats", id: "cats" })]),
      el("section", { class: "bloco", id: "secao-lista", "aria-label": "Manuais" }, [el("div", { id: "lista" })]),
      el("footer", { text: "Atualizado em " + (dados.atualizado ? data(dados.atualizado) : "—") + " · Toque em uma categoria para ver os manuais." })
    ])]));
    cats(); listar();
  }

  function tipos() {
    var tp = document.getElementById("tipos"); tp.innerHTML = "";
    [[null, "Todos"], ["Manual", "Manuais"], ["Guia rápido", "Guias rápidos"]].forEach(function (o) {
      tp.appendChild(el("button", { type: "button", "aria-pressed": String(filtro.tipo === o[0]), text: o[1],
        onclick: function () { filtro.tipo = o[0]; listar(); } }));
    });
  }

  function cats() {
    var box = document.getElementById("cats"); box.innerHTML = "";
    dados.categorias.forEach(function (c) {
      var n = contar(c.nome);
      box.appendChild(el("div", { class: "cat-wrap" }, [el("button", {
        class: "cat", type: "button", "aria-pressed": String(filtro.cat === c.nome),
        onclick: function () {
          filtro.cat = filtro.cat === c.nome ? null : c.nome; cats(); listar();
          document.getElementById("secao-lista").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, [
        el("div", { class: "img" + (c.foto ? "" : " sem"), style: bg(c.foto) }),
        el("div", { class: "nome" }, [el("span", { text: c.nome }), n ? el("span", { class: "qtd", text: n + (n === 1 ? " arquivo" : " arquivos") }) : null])
      ])]));
    });
  }

  function listar() {
    tipos();
    var box = document.getElementById("lista"); box.innerHTML = "";
    var q = norm(filtro.q);
    var vis = dados.manuais.filter(function (m) {
      if (filtro.cat && m.categoria !== filtro.cat) return false;
      if (filtro.tipo && m.tipo !== filtro.tipo) return false;
      return !q || norm([m.nome, m.categoria, m.tipo].join(" ")).indexOf(q) >= 0;
    }).sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });
    var head = el("div", { class: "titulo-lista" }, [el("h3", { text: (filtro.cat || (q ? "Resultado da busca" : "Manuais e guias")) + " (" + vis.length + ")" })]);
    if (filtro.cat || q || filtro.tipo) head.appendChild(el("button", { class: "limpar", type: "button", text: "Ver todos",
      onclick: function () { filtro = { q: "", cat: null, tipo: null }; document.getElementById("busca").value = ""; cats(); listar(); } }));
    box.appendChild(head);
    if (!vis.length) {
      box.appendChild(el("div", { class: "vazio" }, dados.manuais.length
        ? [el("strong", { text: "Nada encontrado" }), "Tente outro nome, marca ou modelo."]
        : [el("strong", { text: "Nenhum manual ainda" }), "Os manuais aparecem aqui assim que forem adicionados."]));
      return;
    }
    var l = el("div", { class: "lista" });
    vis.forEach(function (m) {
      var guia = m.tipo === "Guia rápido";
      l.appendChild(el("article", { class: "item" }, [
        el("div", { class: "info" }, [
          el("span", { class: "tag" + (guia ? " guia" : ""), text: m.tipo }),
          el("h4", { text: m.nome }),
          el("p", { class: "meta", text: [m.categoria, tam(m.tamanho)].filter(Boolean).join(" · ") })
        ]),
        el("div", { class: "acoes" }, [el("a", { class: "btn btn-pri", href: url(m.arquivo), target: "_blank", rel: "noopener", text: guia ? "Abrir guia" : "Abrir manual" })])
      ]));
    });
    box.appendChild(l);
  }

  fetch("lista.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { dados = d; montar(); })
    .catch(function () { montar(); document.getElementById("lista").innerHTML = '<div class="vazio"><strong>Não foi possível carregar a lista</strong>Atualize a página em alguns segundos.</div>'; });
})();
