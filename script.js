
/* =====================================================
   1 — PERSONAGENS REAIS DA RICK AND MORTY API
===================================================== */
const container = document.getElementById("personagens");
const mensagem = document.getElementById("mensagem-catalogo");
const catalogo = document.getElementById("catalogo");
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

const traduzir = (valor, tabela) => tabela[valor] || valor || "Não informado";
const statusPt = { Alive: "Vivo", Dead: "Morto", unknown: "Desconhecido" };
const generoPt = { Male: "Masculino", Female: "Feminino", Genderless: "Sem gênero", unknown: "Desconhecido" };
const especiePt = { Human: "Humano", Alien: "Alienígena", Humanoid: "Humanoide", Robot: "Robô", Animal: "Animal", Mythological: "Mitológico", unknown: "Desconhecida" };

async function carregarPersonagens() {
    if (!container) return;
    try {
        const resposta = await fetch("https://rickandmortyapi.com/api/character");
        if (!resposta.ok) throw new Error(`Falha HTTP ${resposta.status}`);
        const dados = await resposta.json();
        configurarPilotos(dados.results);
        container.replaceChildren();

        dados.results.forEach(personagem => {
            const linha = document.createElement("div");
            linha.className = "linha-personagem";

            const card = document.createElement("article");
            card.className = "card-personagem";
            const imagemArea = document.createElement("div");
            imagemArea.className = "imagem-area";
            const imagem = document.createElement("img");
            imagem.src = personagem.image;
            imagem.alt = `Retrato de ${personagem.name}`;
            imagem.loading = "lazy";
            imagemArea.appendChild(imagem);

            const nome = document.createElement("h3");
            nome.textContent = personagem.name;
            const status = document.createElement("p");
            status.textContent = `Status: ${traduzir(personagem.status, statusPt)}`;

            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "card-abrir";
            botao.setAttribute("aria-label", `Abrir informações sobre ${personagem.name}`);
            botao.addEventListener("click", () => abrirDetalhes(personagem, card, botao));

            card.append(imagemArea, nome, status, botao);
            linha.appendChild(card);
            container.appendChild(linha);
        });

        mensagem.hidden = true;
        catalogo.classList.add("catalogo-carregado");
        observarCards();
        atualizarCena();
    } catch (erro) {
        console.error("Erro ao consultar API:", erro);
        mensagem.hidden = false;
        mensagem.textContent = "Não foi possível carregar os personagens. Confira a conexão e atualize a página.";
    }
}

// Pilotos: IDs oficiais da API (Morty Smith = 2, Alien Morty = 14).
// O catálogo continua funcionando mesmo se as imagens dos pilotos falharem.
function configurarPilotos(personagens) {
    const morty = personagens.find(p => p.id === 2);
    const pilotoMorty = document.getElementById("piloto-fugitivo");
    const pilotoAlien = document.getElementById("piloto-perseguidor");
    if (pilotoMorty && morty) pilotoMorty.src = morty.image;
    if (pilotoAlien) {
        // Alien Morty é um personagem alienígena da própria série.
        pilotoAlien.src = "https://rickandmortyapi.com/api/character/avatar/14.jpeg";
    }
}

function observarCards() {
    const linhas = document.querySelectorAll(".linha-personagem");
    if (reduzirMovimento.matches || !("IntersectionObserver" in window)) {
        linhas.forEach(linha => linha.classList.add("visivel"));
        return;
    }
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visivel");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    linhas.forEach(linha => observador.observe(linha));
}

/* =====================================================
   2 — MODAL: DETALHES E RESUMO BASEADO NOS CAMPOS DA API
===================================================== */
const modal = document.getElementById("modal-personagem");
const fecharModalBotao = document.getElementById("fechar-modal");
let botaoDeOrigem = null;

function abrirDetalhes(personagem, card, botao) {
    botaoDeOrigem = botao;
    document.querySelectorAll(".card-personagem.selecionado")
        .forEach(item => item.classList.remove("selecionado"));
    card.classList.add("selecionado");

    const imagem = document.getElementById("modal-imagem");
    imagem.src = personagem.image;
    imagem.alt = `Retrato de ${personagem.name}`;
    document.getElementById("modal-nome").textContent = personagem.name;

    const especie = traduzir(personagem.species, especiePt);
    const origem = personagem.origin?.name || "Não informada";
    const local = personagem.location?.name || "Não informado";
    const quantidade = Array.isArray(personagem.episode) ? personagem.episode.length : 0;
    const descricao = `${personagem.name} é registrado(a) como ${especie.toLowerCase()}, com status ${traduzir(personagem.status, statusPt).toLowerCase()}. ` +
        `Sua origem registrada é ${origem}, e a última localização conhecida é ${local}. ` +
        `A API relaciona o personagem a ${quantidade} episódio(s).`;
    document.getElementById("modal-resumo").textContent = descricao;

    const dados = document.getElementById("modal-dados");
    dados.replaceChildren();
    const campos = [
        ["Status", traduzir(personagem.status, statusPt)],
        ["Espécie", especie],
        ["Tipo", personagem.type || "Não especificado"],
        ["Gênero", traduzir(personagem.gender, generoPt)],
        ["Origem", origem],
        ["Última localização", local],
        ["Episódios", String(quantidade)]
    ];
    campos.forEach(([titulo, valor]) => {
        const grupo = document.createElement("div");
        const dt = document.createElement("dt");
        dt.textContent = titulo;
        const dd = document.createElement("dd");
        dd.textContent = valor;
        grupo.append(dt, dd);
        dados.appendChild(grupo);
    });

    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-aberto");
    fecharModalBotao.focus();
}

function fecharDetalhes() {
    if (!modal.classList.contains("aberto")) return;
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-aberto");
    document.querySelectorAll(".card-personagem.selecionado")
        .forEach(item => item.classList.remove("selecionado"));
    botaoDeOrigem?.focus();
}

fecharModalBotao.addEventListener("click", fecharDetalhes);
modal.querySelector("[data-fechar]").addEventListener("click", fecharDetalhes);
document.addEventListener("keydown", evento => {
    if (!modal.classList.contains("aberto")) return;
    if (evento.key === "Escape") fecharDetalhes();
    if (evento.key === "Tab") {
        // Nesta janela, o único controle interativo é Fechar.
        evento.preventDefault();
        fecharModalBotao.focus();
    }
});

/* =====================================================
   3 — TRANSIÇÃO AO CLICAR EM "ENTRAR NO MULTIVERSO"
===================================================== */
const transicao = document.getElementById("transicao-dimensional");
let transicaoAtiva = false;
document.querySelectorAll("[data-transicao]").forEach(link => {
    link.addEventListener("click", evento => {
        if (reduzirMovimento.matches) return; // âncora normal e acessível
        evento.preventDefault();
        if (transicaoAtiva) return;
        transicaoAtiva = true;
        transicao.classList.add("ativo");

        window.setTimeout(() => {
            const comportamentoOriginal = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            catalogo.scrollIntoView({ behavior: "auto", block: "start" });
            document.documentElement.style.scrollBehavior = comportamentoOriginal;
            // Mantém o endereço da seção sem provocar novo salto de rolagem.
            try { history.replaceState(null, "", "#catalogo"); } catch (_) { /* file:/// pode limitar histórico */ }
        }, 400);
        window.setTimeout(() => {
            transicao.classList.remove("ativo");
            transicaoAtiva = false;
        }, 920);
    });
});

/* =====================================================
   4 — PERSEGUIÇÃO CARTUNESCA + PORTAL FINAL
   O efeito é visual e decorativo, sem atingir personagens.
===================================================== */
const portalViajante = document.getElementById("portal-viajante");
const nave = document.getElementById("nave");
const perseguidora = document.getElementById("nave-perseguidora");
const cenaEspacial = document.querySelector(".viagem-espacial");
const claraoRasante = document.getElementById("clarao-rasante");
const portalFuga = document.getElementById("portal-fuga");
let portalPosY = null;
let ultimoTempo = 0;

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}

function suavizar(valor) {
    const t = limitar(valor, 0, 1);
    return t * t * (3 - 2 * t);
}

function atualizarCena(tempo = 0) {
    if (!catalogo || !nave || !perseguidora || !cenaEspacial) return;
    const segundos = tempo / 1000;
    const area = catalogo.getBoundingClientRect();
    const inicioCatalogo = catalogo.getBoundingClientRect().top + scrollY;
    const fimCatalogo = inicioCatalogo + catalogo.offsetHeight - innerHeight;
    const progresso = limitar((scrollY - inicioCatalogo) / Math.max(1, fimCatalogo - inicioCatalogo), 0, 1);
    const emCatalogo = area.top < -60 && area.bottom > innerHeight * .05;
    const animar = !reduzirMovimento.matches;

    // O portal grande acompanha a exploração do catálogo.
    if (portalViajante && catalogo.classList.contains("catalogo-carregado")) {
        const primeiroY = container.offsetTop + 65;
        const ultimoY = Math.max(primeiroY, container.offsetTop + container.offsetHeight - 170);
        const alvoY = limitar(innerHeight * .52 - area.top, primeiroY, ultimoY);
        if (portalPosY === null || !animar) portalPosY = alvoY;
        else portalPosY += (alvoY - portalPosY) * .09;
        const curvaX = animar ? Math.sin(segundos * .75 + progresso * 18) * (innerWidth <= 820 ? 5 : 23) : 0;
        const flutuarY = animar ? Math.sin(segundos * 1.1 + progresso * 19) * (innerWidth <= 820 ? 12 : 30) : 0;
        portalViajante.style.transform = `translate3d(calc(-50% + ${curvaX}px), ${portalPosY + flutuarY}px, 0)`;
    }

    const w = innerWidth;
    const h = innerHeight;
    // Dois pequenos desvios rápidos, com suavização para não parecerem travamentos.
    const fase = (segundos * .24 + progresso * 1.7) % 1;
    const desvioUm = Math.exp(-Math.pow((fase - .27) / .065, 2));
    const desvioDois = Math.exp(-Math.pow((fase - .70) / .075, 2));
    const desvio = animar ? (desvioUm * -h * .16 + desvioDois * h * .13) : 0;

    const mortyX = w * (.48 + (animar ? .13 * Math.sin(segundos * .8 + progresso * 9) : 0));
    const mortyY = h * (.30 + (animar ? .13 * Math.sin(segundos * 1.25 + progresso * 13) : 0)) + desvio;
    const alienX = mortyX - 165 + (animar ? Math.cos(segundos * 1.15) * 23 : 0);
    const alienY = mortyY + 80 + (animar ? Math.sin(segundos * 1.7) * 18 : 0);
    const angulo = animar ? Math.sin(segundos * 1.9 + progresso * 10) * 16 - (desvioUm - desvioDois) * 15 : 0;

    // No último trecho surge o miniportal. Cada nave voa até ele e diminui.
    const abrir = suavizar((progresso - .79) / .10);
    const entrarMorty = suavizar((progresso - .88) / .09);
    const entrarAlien = suavizar((progresso - .91) / .09);
    const centroX = w * (w <= 600 ? .65 : .77);
    const centroY = h * .30;
    const portalTamanho = w <= 600 ? 110 : 165;

    if (portalFuga) {
        portalFuga.style.left = `${centroX}px`;
        portalFuga.style.top = `${centroY}px`;
        portalFuga.style.width = `${portalTamanho}px`;
        portalFuga.style.height = `${portalTamanho}px`;
        portalFuga.style.opacity = String(abrir * (1 - suavizar((progresso - .985) / .015)));
        portalFuga.style.transform = `translate(-50%, -50%) scale(${.2 + .8 * abrir}) rotate(${animar ? segundos * 12 : 0}deg)`;
    }

    const fatorMorty = 1 - entrarMorty * .94;
    const fatorAlien = .8 * (1 - entrarAlien * .94);
    const xMorty = mortyX + (centroX - mortyX - 65) * entrarMorty;
    const yMorty = mortyY + (centroY - mortyY - 45) * entrarMorty;
    const xAlien = alienX + (centroX - alienX - 65) * entrarAlien;
    const yAlien = alienY + (centroY - alienY - 45) * entrarAlien;
    nave.style.transform = `translate3d(${xMorty}px, ${yMorty}px, 0) rotate(${angulo}deg) scale(${fatorMorty})`;
    perseguidora.style.transform = `translate3d(${xAlien}px, ${yAlien}px, 0) rotate(${angulo + 8}deg) scale(${fatorAlien})`;
    nave.style.opacity = String(1 - entrarMorty);
    perseguidora.style.opacity = String(1 - entrarAlien);

    // Clarão não violento: feixe passa perto da nave, sem contato com Morty.
    if (claraoRasante) {
        const pulso = Math.exp(-Math.pow((fase - .22) / .035, 2));
        claraoRasante.style.left = `${mortyX - 35}px`;
        claraoRasante.style.top = `${mortyY + 53}px`;
        claraoRasante.style.opacity = String(animar && progresso < .79 ? pulso * .85 : 0);
        claraoRasante.style.transform = `translate(-50%, -50%) scale(${.4 + pulso * 1.4})`;
    }

    // A cena sai naturalmente quando termina o catálogo.
    cenaEspacial.classList.toggle("ativo", emCatalogo && progresso < 1);
}

function animarContinuamente(tempo) {
    if (!document.hidden && tempo - ultimoTempo >= 15) {
        ultimoTempo = tempo;
        atualizarCena(tempo);
    }
    requestAnimationFrame(animarContinuamente);
}
window.addEventListener("scroll", () => { if (reduzirMovimento.matches) atualizarCena(); }, { passive: true });
window.addEventListener("resize", () => { portalPosY = null; atualizarCena(); });
reduzirMovimento.addEventListener?.("change", () => { portalPosY = null; atualizarCena(); });
atualizarCena();
requestAnimationFrame(animarContinuamente);

/* =====================================================
   5 — PORTAL DA ABERTURA RESPONDE AO CURSOR
===================================================== */
const hero = document.querySelector(".hero");
const portalCena = document.querySelector(".portal-cena");
if (hero && portalCena && matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    hero.addEventListener("pointermove", evento => {
        const retangulo = hero.getBoundingClientRect();
        const x = ((evento.clientX - retangulo.left) / retangulo.width - .5) * 24;
        const y = ((evento.clientY - retangulo.top) / retangulo.height - .5) * 24;
        portalCena.style.setProperty("--movimento-x", `${x}px`);
        portalCena.style.setProperty("--movimento-y", `${y}px`);
    });
    hero.addEventListener("pointerleave", () => {
        portalCena.style.setProperty("--movimento-x", "0px");
        portalCena.style.setProperty("--movimento-y", "0px");
    });
}

carregarPersonagens();
