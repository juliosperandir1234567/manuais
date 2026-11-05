(function(){
  var estado={marca:"Central de Manuais UAM",capa:"img/hero.jpg",categorias:[],manuais:[]};
  function enc(p){return p.split("/").map(encodeURIComponent).join("/");}
  estado.manuais=estado.manuais||[];estado.categorias=estado.categorias||[];
  var filtro={q:"",cat:null,tipo:(location.hash==="#guias"?"Guia rápido":"Manual")};
  function ehGuia(){return filtro.tipo==="Guia rápido";}
  window.addEventListener("hashchange",function(){var t=location.hash==="#guias"?"Guia rápido":"Manual";if(t!==filtro.tipo){filtro.tipo=t;filtro.cat=null;filtro.q="";montar();}});var TIPOS=["Manual","Guia rápido"];function tipoDe(m){return m.tipo||"Manual";}
  var assets=null, editavel=false, aba="manual";
  var app=document.getElementById("app");

  function el(tag,attrs,kids){var e=document.createElement(tag);for(var k in attrs||{}){var v=attrs[k];if(v==null)continue;if(k==="text")e.textContent=v;else if(k==="style")e.setAttribute("style",v);else if(k.indexOf("on")===0)e.addEventListener(k.slice(2),v);else e.setAttribute(k,v);}(kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==="string"?document.createTextNode(c):c)});return e;}
  function norm(s){return (s||"").toString().normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();}
  function tam(b){if(!b)return "";return b>1048576?(b/1048576).toFixed(1).replace(".",",")+" MB":Math.max(1,Math.round(b/1024))+" KB";}
  function data(iso){try{return new Date(iso).toLocaleDateString("pt-BR")}catch(e){return ""}}
  function urlFoto(f){if(!f)return null;return f.indexOf("data:")===0?f:enc(f);}
  function bg(f){var u=urlFoto(f);return u?"background-image:url('"+u+"')":null;}
  function contar(c){return estado.manuais.filter(function(m){return m.categoria===c&&tipoDe(m)===filtro.tipo}).length;}

  function escolherFoto(cb){
    var inp=el("input",{type:"file",accept:"image/*"});
    inp.addEventListener("change",function(){var f=inp.files[0];if(!f)return;
      if(f.size>20*1048576){aviso("A foto passa de 20 MB.");return;}
      assets.upload(f).then(function(r){cb(r.id);return salvar();}).catch(function(e){aviso("Não deu para trocar a foto ("+(e&&e.code||"erro")+").");});
    });
    inp.click();
  }
  function aviso(t){var m=document.getElementById("f-msg");if(m){m.className="msg erro";m.textContent=t;}}

  function montar(){
    app.innerHTML="";
    var mw=el("div",{class:"wrap"},[estado.logo?el("span",{class:"logo-chip"},[el("img",{class:"logo",src:urlFoto(estado.logo),alt:"Logo"})]):null,el("h1",{text:estado.marca||"Central de Manuais"}),el("span",{class:"selo",text:"Biblioteca digital"})]);
    if(editavel)mw.appendChild(el("button",{class:"por-logo",type:"button",text:estado.logo?"Trocar logo":"Colocar logo",onclick:function(){escolherFoto(function(id){estado.logo=id;});}}));
    app.appendChild(el("header",{class:"marca"},[mw]));
    app.appendChild(el("nav",{class:"telas","aria-label":"Escolher tipo"},[el("div",{class:"wrap"},[["Manual","Manuais","manuais"],["Guia rápido","Guias rápidos","guias"]].map(function(o){var n=estado.manuais.filter(function(m){return tipoDe(m)===o[0]}).length;return el("a",{href:"#"+o[2],class:"tela","aria-current":filtro.tipo===o[0]?"page":null,onclick:function(e){e.preventDefault();if(filtro.tipo===o[0])return;filtro.tipo=o[0];filtro.cat=null;filtro.q="";try{history.replaceState(null,"","#"+o[2]);}catch(_){}montar();window.scrollTo(0,0);}},[o[1],el("span",{class:"n",text:String(n)})]);}))]));
    var hero=el("section",{class:"hero","aria-label":"Apresentação"},[
      el("div",{class:"foto",style:bg(estado.capa),role:"img","aria-label":"Colhedora de cana na lavoura"}),
      el("div",{class:"wrap txt"},[
        el("h2",{text:ehGuia()?"Guias Rápidos":"Manuais de Equipamentos"}),
        el("p",{text:ehGuia()?"Consulta rápida para o dia a dia da operação.":"Encontre o manual da sua máquina."}),
        el("div",{class:"busca"},[el("label",{},[
          svgLupa(),
          el("input",{id:"busca",type:"search",placeholder:"Buscar equipamento","aria-label":"Buscar equipamento",value:filtro.q,oninput:function(e){filtro.q=e.target.value;listar();}})
        ])])
      ])
    ]);
    if(editavel)hero.appendChild(el("button",{class:"trocar",type:"button",text:"Trocar foto da faixa",onclick:function(){escolherFoto(function(id){estado.capa=id;});}}));
    app.appendChild(hero);
    var main=el("main",{},[el("div",{class:"wrap"},[
      el("div",{class:"cab-cat"},[el("h3",{class:"sec-titulo",text:"Explore por categoria"})]),
      el("p",{class:"aviso-ordem",id:"aviso-ordem",hidden:"hidden"}),
      el("section",{class:"bloco","aria-label":"Categorias"},[el("div",{class:"cats",id:"cats"})]),
      el("section",{class:"bloco",id:"secao-lista","aria-label":"Manuais"},[el("div",{id:"lista"})]),
      el("div",{id:"admin"}),
      el("footer",{text:"Atualizado em "+(estado.atualizado?data(estado.atualizado):"—")+" · Toque em uma categoria para ver os manuais."})
    ])]);
    app.appendChild(main);
    cats();listar();admin();
  }
  function svgLupa(){var s=document.createElementNS("http://www.w3.org/2000/svg","svg");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("aria-hidden","true");s.innerHTML='<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>';return s;}

  function tipos(){}
  function cats(){
    var box=document.getElementById("cats");box.innerHTML="";
    estado.categorias.forEach(function(c,ci){
      var n=contar(c.nome);
      var b=el("button",{class:"cat",type:"button","aria-pressed":String(filtro.cat===c.nome),onclick:function(){filtro.cat=filtro.cat===c.nome?null:c.nome;cats();listar();document.getElementById("secao-lista").scrollIntoView({behavior:"smooth",block:"start"});}},[
        el("div",{class:"img"+(c.foto?"":" sem"),style:bg(c.foto)}),
        el("div",{class:"nome"},[el("span",{text:c.nome}),n?el("span",{class:"qtd",text:n+(ehGuia()?(n===1?" guia":" guias"):(n===1?" manual":" manuais"))}):null])
      ]);
      var w=el("div",{class:"cat-wrap"},[b]);
      if(editavel){w.appendChild(el("button",{class:"trocar",type:"button",text:"Trocar foto",onclick:function(){escolherFoto(function(id){c.foto=id;});}}));
        var tot=estado.categorias.length;
        w.appendChild(el("div",{class:"ordem"},[
          el("button",{type:"button","aria-label":"Mover "+c.nome+" para antes",text:"←",disabled:ci===0?"disabled":null,onclick:function(e){moverCat(ci,-1,e.currentTarget);}}),
          el("button",{type:"button","aria-label":"Mover "+c.nome+" para depois",text:"→",disabled:ci===tot-1?"disabled":null,onclick:function(e){moverCat(ci,1,e.currentTarget);}})
        ]));}
      box.appendChild(w);
    });
  }

  var salvarOrdemT=null;
  function moverCat(i,d,btn){
    var j=i+d,a=estado.categorias;if(j<0||j>=a.length)return;
    var x=a[i];a[i]=a[j];a[j]=x;cats();
    var b=document.querySelectorAll(".cat-wrap")[j];if(b){var f=b.querySelector(d<0?".ordem button:first-child":".ordem button:last-child");if(f&&!f.disabled)f.focus();}
    var av=document.getElementById("aviso-ordem");if(av){av.hidden=false;av.textContent="Salvando a nova ordem…";}
    clearTimeout(salvarOrdemT);salvarOrdemT=setTimeout(function(){salvar().catch(function(e){if(av)av.textContent="Não deu para salvar a ordem ("+(e&&e.code||"erro")+").";});},1500);
  }
  function listar(){
    var box=document.getElementById("lista");box.innerHTML="";
    var q=norm(filtro.q);
    var vis=estado.manuais.filter(function(m){
      if(filtro.cat&&m.categoria!==filtro.cat)return false;
      if(filtro.tipo&&tipoDe(m)!==filtro.tipo)return false;
      return !q||norm([m.equipamento,m.marca,m.modelo,m.categoria].join(" ")).indexOf(q)>=0;
    }).sort(function(a,b){return a.equipamento.localeCompare(b.equipamento,"pt-BR")});
    var titulo=filtro.cat||(q?"Resultado da busca":(ehGuia()?"Guias rápidos":"Manuais"));
    var head=el("div",{class:"titulo-lista"},[el("h3",{text:titulo+" ("+vis.length+")"})]);
    if(filtro.cat||q)head.appendChild(el("button",{class:"limpar",type:"button",text:"Ver todos",onclick:function(){filtro.cat=null;filtro.q="";document.getElementById("busca").value="";cats();listar();}}));
    box.appendChild(head);
    tipos();
    if(!vis.length){
      box.appendChild(el("div",{class:"vazio"},estado.manuais.length?[el("strong",{text:"Nada encontrado"}),"Tente outro nome, marca ou modelo."]:[el("strong",{text:"Nenhum manual ainda"}),editavel?"Use o quadro \"Adicionar manual\" logo abaixo para enviar o primeiro PDF.":"Os manuais aparecem aqui assim que forem adicionados."]));
      return;
    }
    var l=el("div",{class:"lista"});
    vis.forEach(function(m){
      var meta=[m.categoria,m.marca,m.modelo,tam(m.tamanho)].filter(Boolean).join(" · ");
      var acoes=el("div",{class:"acoes"},[el("a",{class:"btn btn-pri",href:enc(m.id),target:"_blank",rel:"noopener",onclick:function(e){e.preventDefault();abrirPdf(m);},text:tipoDe(m)==="Guia rápido"?"Abrir guia":"Abrir manual"})]);
      if(editavel){
        var rem=el("button",{class:"btn btn-sec",type:"button",text:"Remover",onclick:function(){rem.hidden=true;
          acoes.appendChild(el("button",{class:"btn btn-perigo",type:"button",text:"Confirmar remoção",onclick:function(e){e.target.disabled=true;remover(m);}}));
          acoes.appendChild(el("button",{class:"btn btn-sec",type:"button",text:"Cancelar",onclick:listar}));}});
        acoes.appendChild(rem);
      }
      l.appendChild(el("article",{class:"item"},[el("div",{class:"info"},[el("span",{class:"tag"+(tipoDe(m)==="Guia rápido"?" guia":""),text:tipoDe(m)}),el("h4",{text:m.equipamento}),el("p",{class:"meta",text:meta})]),acoes]));
    });
    box.appendChild(l);
  }

  var leitorAtual=null;
  function abrirPdf(m){
    fecharPdf();
    var nome=(m.equipamento||"manual").replace(/[\\\/:*?"<>|]+/g," ").trim()+".pdf";
    var info=el("span",{class:"pg-info",text:"Carregando…"});
    var baixar=el("button",{class:"btn btn-claro",type:"button",text:"Baixar PDF",hidden:"hidden"});
    var fechar=el("button",{class:"btn btn-borda",type:"button",text:"Fechar",onclick:fecharPdf});
    var pags=el("div",{class:"paginas"},[el("p",{class:"estado",text:"Abrindo… arquivos grandes podem levar alguns segundos."})]);
    var bq=el("input",{type:"search",id:"pdf-busca",placeholder:"Buscar no PDF (ex.: óleo, filtro)","aria-label":"Buscar no PDF",disabled:"disabled"});
    var bAnt=el("button",{class:"btn btn-borda",type:"button",text:"‹","aria-label":"Resultado anterior"});
    var bProx=el("button",{class:"btn btn-borda",type:"button",text:"›","aria-label":"Próximo resultado"});
    var bForm=el("form",{class:"busca-pdf",role:"search",onsubmit:function(e){e.preventDefault();buscarPdf(ctx,bq.value);}},[bq,el("button",{class:"btn btn-claro",type:"submit",text:"Buscar"}),bAnt,bProx]);
    var resBox=el("div",{class:"resultados",hidden:"hidden"});
    var box=el("div",{class:"leitor",role:"dialog","aria-modal":"true","aria-label":m.equipamento},[el("div",{class:"barra"},[el("strong",{text:m.equipamento}),info,baixar,fechar,bForm]),resBox,pags]);
    document.body.appendChild(box);document.body.style.overflow="hidden";
    var ctx={box:box,vivo:true,obs:null,pags:pags,resBox:resBox,input:bq,textos:{},q:"",res:[],atual:-1};leitorAtual=ctx;
    bq.addEventListener("focus",function(){if(ctx.q&&ctx.resBox.childNodes.length)ctx.resBox.hidden=false;});bAnt.onclick=function(){irRes(ctx,ctx.atual-1);};bProx.onclick=function(){irRes(ctx,ctx.atual+1);};
    ctx.onKey=function(e){if(e.key==="Escape")fecharPdf();};document.addEventListener("keydown",ctx.onKey);
    fechar.focus();
    fetch(enc(m.id)).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.arrayBuffer();}).then(function(buf){
      if(!ctx.vivo)return;
      var blob=new Blob([buf.slice(0)],{type:"application/pdf"});
      baixar.hidden=false;baixar.onclick=function(){var a=document.createElement("a");a.href=enc(m.id);a.download=nome;document.body.appendChild(a);a.click();a.remove();};
      if(!window.pdfjsLib)throw new Error("leitor");
      return pdfjsLib.getDocument({data:new Uint8Array(buf),isEvalSupported:false}).promise.then(function(pdf){
        if(!ctx.vivo){pdf.destroy();return;}ctx.pdf=pdf;
        info.textContent=pdf.numPages+" páginas";bq.disabled=false;
        return pdf.getPage(1).then(function(p1){
          var vp=p1.getViewport({scale:1});pags.innerHTML="";
          var obs=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting&&!en.target.dataset.ok){en.target.dataset.ok="1";desenhar(pdf,+en.target.dataset.n,en.target,ctx);}});},{root:pags,rootMargin:"1200px 0px"});
          ctx.obs=obs;
          for(var i=1;i<=pdf.numPages;i++){var d=el("div",{class:"pg","data-n":String(i),style:"aspect-ratio:"+vp.width+"/"+vp.height});pags.appendChild(d);obs.observe(d);}
        });
      });
    }).catch(function(){
      if(!ctx.vivo)return;
      pags.innerHTML="";pags.appendChild(el("p",{class:"estado",text:"Não foi possível abrir o PDF aqui. Tente de novo ou use o botão Baixar PDF."}));info.textContent="";
    });
  }
  function desenhar(pdf,n,alvo,ctx){
    pdf.getPage(n).then(function(pg){
      if(!ctx.vivo)return;
      var w=alvo.clientWidth||800,dpr=Math.min(window.devicePixelRatio||1,2);
      var vp0=pg.getViewport({scale:1}),vp=pg.getViewport({scale:(w/vp0.width)*dpr});
      var c=document.createElement("canvas");c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
      alvo.appendChild(c);
      pg.render({canvasContext:c.getContext("2d"),viewport:vp}).promise.then(function(){marcar(ctx,n);}).catch(function(){});
    }).catch(function(){});
  }
  function textoPg(ctx,n){
    if(ctx.textos[n])return ctx.textos[n];
    ctx.textos[n]=ctx.pdf.getPage(n).then(function(pg){return pg.getTextContent().then(function(tc){
      var items=tc.items.filter(function(i){return i.str;});
      return {pg:pg,items:items,txt:items.map(function(i){return i.str;}).join(" ")};
    });});
    return ctx.textos[n];
  }
  function buscarPdf(ctx,q){
    q=(q||"").trim();ctx.q=norm(q);ctx.res=[];ctx.atual=-1;
    var box=ctx.resBox;box.innerHTML="";
    ctx.pags.querySelectorAll(".hl").forEach(function(h){h.remove();});
    if(!ctx.q||!ctx.pdf){box.hidden=true;return;}
    box.hidden=false;
    var st=el("p",{class:"st",text:"Procurando…"});box.appendChild(st);
    var lista=el("div");box.appendChild(lista);
    var token={};ctx.busca=token;var total=ctx.pdf.numPages,n=1;
    function prox(){
      if(!ctx.vivo||ctx.busca!==token)return;
      if(n>total){st.textContent=ctx.res.length?(ctx.res.length+(ctx.res.length===1?" página encontrada":" páginas encontradas")+" com “"+q+"”"):"Nada encontrado para “"+q+"”. Tente outra palavra.";return;}
      var lote=[];for(var k=0;k<8&&n<=total;k++,n++)lote.push(n);
      st.textContent="Procurando… página "+lote[lote.length-1]+" de "+total;
      Promise.all(lote.map(function(p){return textoPg(ctx,p).then(function(t){return [p,t];});})).then(function(rs){
        rs.forEach(function(r){
          var tn=norm(r[1].txt),i=tn.indexOf(ctx.q);if(i<0)return;
          var cont=0,j=i;while(j>=0){cont++;j=tn.indexOf(ctx.q,j+ctx.q.length);}
          var ini=Math.max(0,i-50),orig=r[1].txt;
          var trecho=(ini?"…":"")+orig.slice(ini,i);
          var idx=ctx.res.length;ctx.res.push(r[0]);
          var b=el("button",{class:"res",type:"button",onclick:function(){irRes(ctx,idx);if(window.innerWidth<700)ctx.resBox.hidden=true;}},[el("b",{text:"Pág. "+r[0]}),trecho,el("mark",{text:orig.slice(i,i+ctx.q.length)}),orig.slice(i+ctx.q.length,i+ctx.q.length+60)+"…"+(cont>1?" ("+cont+"×)":"")]);
          lista.appendChild(b);
          if(ctx.atual<0)irRes(ctx,0,true);
        });
        prox();
      }).catch(function(){n++;prox();});
    }
    prox();
    ctx.pags.querySelectorAll(".pg[data-ok]").forEach(function(d){marcar(ctx,+d.dataset.n);});
  }
  function irRes(ctx,i,semRolarLista){
    if(!ctx.res.length)return;i=(i+ctx.res.length)%ctx.res.length;ctx.atual=i;
    var bs=ctx.resBox.querySelectorAll(".res");bs.forEach(function(b,k){b.setAttribute("aria-current",String(k===i));});
    if(!semRolarLista&&bs[i])bs[i].scrollIntoView({block:"nearest"});
    var d=ctx.pags.querySelector('.pg[data-n="'+ctx.res[i]+'"]');if(d)d.scrollIntoView({block:"start"});
  }
  function marcar(ctx,n){
    var d=ctx.pags.querySelector('.pg[data-n="'+n+'"]');if(!d)return;
    d.querySelectorAll(".hl").forEach(function(h){h.remove();});
    if(!ctx.q)return;var q=ctx.q;
    textoPg(ctx,n).then(function(t){
      if(!ctx.vivo||ctx.q!==q)return;
      var vp0=t.pg.getViewport({scale:1}),vp=t.pg.getViewport({scale:d.clientWidth/vp0.width});
      t.items.forEach(function(it){
        var s=norm(it.str),i=s.indexOf(q);if(i<0)return;
        var tx=pdfjsLib.Util.transform(vp.transform,it.transform);
        var h=Math.hypot(tx[2],tx[3]),w=it.width*vp.scale,len=s.length||1;
        while(i>=0){
          var x=tx[4]+w*(i/len),ww=Math.max(6,w*(q.length/len));
          d.appendChild(el("div",{class:"hl",style:"left:"+x+"px;top:"+(tx[5]-h)+"px;width:"+ww+"px;height:"+(h*1.15)+"px"}));
          i=s.indexOf(q,i+q.length);
        }
      });
    });
  }
  function fecharPdf(){
    if(!leitorAtual)return;var ctx=leitorAtual;leitorAtual=null;ctx.vivo=false;
    if(ctx.obs)ctx.obs.disconnect();if(ctx.pdf)ctx.pdf.destroy();
    document.removeEventListener("keydown",ctx.onKey);ctx.box.remove();document.body.style.overflow="";
  }

  function admin(){
    var box=document.getElementById("admin");box.innerHTML="";if(!editavel)return;
    var msg=el("p",{class:"msg",id:"f-msg",role:"status"});
    var abas=el("div",{class:"abas",role:"tablist"},[["manual","Adicionar manual"],["cat","Nova categoria"]].map(function(a){return el("button",{type:"button",role:"tab","aria-selected":String(aba===a[0]),text:a[1],onclick:function(){aba=a[0];admin();}});}));
    var corpo;
    if(aba==="manual"){
      var sel=el("select",{id:"f-cat"});estado.categorias.forEach(function(c){sel.appendChild(el("option",{value:c.nome,text:c.nome}))});
      if(filtro.cat)sel.value=filtro.cat;
      var btn=el("button",{class:"btn btn-pri",type:"submit",text:"Adicionar manual"});
      corpo=el("form",{class:"form",onsubmit:function(e){e.preventDefault();enviar(corpo,btn,msg);}},[
        el("div",{class:"campo cheio"},[el("label",{for:"f-arq",text:"Arquivo PDF (manual ou guia rápido, até 20 MB)"}),el("input",{id:"f-arq",type:"file",accept:"application/pdf,.pdf",required:"required"})]),
        el("div",{class:"campo"},[el("label",{for:"f-eq",text:"Equipamento"}),el("input",{id:"f-eq",required:"required",placeholder:"Ex.: Trator 6110J"})]),
        el("div",{class:"campo"},[el("label",{for:"f-cat",text:"Categoria"}),sel]),
        el("div",{class:"campo"},[el("label",{for:"f-tipo",text:"Tipo"}),el("select",{id:"f-tipo"},TIPOS.map(function(x){return el("option",{value:x,text:x,selected:x===filtro.tipo?"selected":null});}))]),
        el("div",{class:"campo"},[el("label",{for:"f-marca",text:"Marca"}),el("input",{id:"f-marca",placeholder:"Ex.: John Deere"})]),
        el("div",{class:"campo"},[el("label",{for:"f-mod",text:"Modelo / ano"}),el("input",{id:"f-mod",placeholder:"Ex.: 6110J · 2021"})]),
        el("div",{class:"cheio"},[btn,msg])
      ]);
    }else{
      var btn2=el("button",{class:"btn btn-pri",type:"submit",text:"Criar categoria"});
      corpo=el("form",{class:"form",onsubmit:function(e){e.preventDefault();novaCat(corpo,btn2,msg);}},[
        el("div",{class:"campo"},[el("label",{for:"c-nome",text:"Nome da categoria"}),el("input",{id:"c-nome",required:"required",placeholder:"Ex.: Plantadeiras"})]),
        el("div",{class:"campo"},[el("label",{for:"c-foto",text:"Foto (opcional)"}),el("input",{id:"c-foto",type:"file",accept:"image/*"})]),
        el("div",{class:"cheio"},[btn2,msg])
      ]);
    }
    box.appendChild(el("section",{class:"admin bloco","aria-label":"Área do editor"},[el("h3",{text:"Área do editor"}),el("p",{class:"ajuda",text:"Só quem edita o site vê este quadro, os botões de trocar foto e as setas para mudar a ordem das categorias."}),abas,corpo]));
  }

  function falha(btn,msg,e){btn.disabled=false;msg.className="msg erro";msg.textContent=e&&e.code==="unsupported_type"?"Esse tipo de arquivo não é aceito.":"Não foi possível salvar agora ("+(e&&e.code||"erro")+"). Tente de novo.";}
  function enviar(f,btn,msg){
    var arq=f.querySelector("#f-arq").files[0];
    if(!arq){msg.className="msg erro";msg.textContent="Escolha um arquivo PDF.";return;}
    if(arq.size>20*1048576){msg.className="msg erro";msg.textContent="O arquivo passa de 20 MB. Comprima o PDF e tente de novo.";return;}
    btn.disabled=true;msg.className="msg";msg.textContent="Enviando o PDF…";
    assets.upload(arq).then(function(r){
      var agora=new Date().toISOString();
      estado.manuais.push({id:r.id,equipamento:f.querySelector("#f-eq").value.trim(),categoria:f.querySelector("#f-cat").value,tipo:f.querySelector("#f-tipo").value,marca:f.querySelector("#f-marca").value.trim(),modelo:f.querySelector("#f-mod").value.trim(),tamanho:r.sizeBytes||arq.size,criado:agora});
      msg.textContent="Salvando o site…";return salvar();
    }).catch(function(e){falha(btn,msg,e);});
  }
  function novaCat(f,btn,msg){
    var nome=f.querySelector("#c-nome").value.trim();if(!nome)return;
    if(estado.categorias.some(function(c){return norm(c.nome)===norm(nome)})){msg.className="msg erro";msg.textContent="Essa categoria já existe.";return;}
    var foto=f.querySelector("#c-foto").files[0];btn.disabled=true;msg.className="msg";msg.textContent="Salvando…";
    (foto?assets.upload(foto):Promise.resolve(null)).then(function(r){estado.categorias.push({nome:nome,foto:r?r.id:null});return salvar();}).catch(function(e){falha(btn,msg,e);});
  }
  function remover(m){
    estado.manuais=estado.manuais.filter(function(x){return x.id!==m.id});
    salvar().then(function(){try{assets.delete(m.id)}catch(e){}}).catch(function(){listar();});
  }
  function salvar(){
    estado.atualizado=new Date().toISOString();
    return claude.use("artifact").then(function(art){if(!art)throw {code:"not_granted"};return art.publish(gerar());});
  }
  function esc(s){return s.replace(/<\/script/gi,"<\\/script");}
  var reset="";try{var s0=document.head.querySelector("style");reset=s0?s0.textContent:"";}catch(e){}
  function gerar(){
    return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+reset+'</style></head><body>'+
      '<title>Central de Manuais UAM</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Source+Sans+3:wght@400;600;700&display=swap">\n'+
      '<style id="estilo">'+document.getElementById("estilo").textContent+'</style>\n<div id="app"></div>\n'+
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"><\/script>\n'+'<script type="application/json" id="dados">'+esc(JSON.stringify(estado))+'<\/script>\n'+
      '<script id="codigo">'+document.getElementById("codigo").textContent+'<\/script>\n';
  }

  fetch("lista.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){
    estado.logo=d.logo||null;estado.atualizado=d.atualizado;estado.categorias=d.categorias||[];
    estado.manuais=(d.manuais||[]).map(function(m){return {id:m.arquivo,equipamento:m.nome,categoria:m.categoria,tipo:m.tipo,tamanho:m.tamanho};});
    montar();
  }).catch(function(){montar();var l=document.getElementById("lista");if(l)l.innerHTML='<div class="vazio"><strong>Não foi possível carregar a lista</strong>Atualize a página em alguns segundos.</div>';});
})();
