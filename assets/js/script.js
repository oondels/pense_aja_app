const unidade = localStorage.getItem("unidadeDass");
// import ip from "./ip.js"


let components = new Map();
function showLoadingComponent(element) {
  if (components.has(element)) {
    console.log("componente ja presente");
    return;
  }

  document.querySelector(".loading-cdata").classList.remove("hidden");
  components.set(element, true);
}

function hideLoading(element) {
  if (!components.get(element)) {
    return;
  }

  components.set(element, false);
  document.querySelector(".loading-cdata").classList.add("hidden");
  return;
}

function lerURL(URL) {
  var http = new XMLHttpRequest();
  http.open("GET", URL, false);
  http.send();

  return http.responseText;
}

function showLoading(estado = "flex") {
  if (!unidade) {
    return;
  }
  document.getElementById("loading-overlay").style.display = `${estado}`;
}

/*****************************************************************************/
const getCachedData = (cacheKey, _) => {
  const raw = localStorage.getItem(cacheKey);

  if (!raw) return false;

  if (_) return raw;

  try {
    const cachedData = JSON.parse(raw);
    return cachedData ?? false;
  } catch (error) {
    console.error("Erro ao buscar dados do cache", error);
    return false;
  }
};

const renderListaTable = (data) => {
  let tbody = document.getElementById("tbody");
  tbody.innerText = "";

  data.forEach((element) => {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_realizado = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_setor = tr.insertCell();
    let td_gerente = tr.insertCell();
    let td_nome_projeto = tr.insertCell();
    let td_turno = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = element.id;
    td_realizado.innerText = element.data_realizada;
    td_nome.innerText = element.nome;
    td_setor.innerText = element.setor;
    td_gerente.innerText = element.gerente;
    td_nome_projeto.innerHTML += `${element.nome_projeto} <div id="tool"><div id="tooltipTextBefore"><strong>SITUAÇÃO ANTERIOR: </strong>${element.situacao_anterior}</div><div id="tooltipTextAfter"><strong>SITUAÇÃO ATUAL: </strong>${element.situacao_atual}</div></div>`;
    td_turno.innerText = element.turno;
    td_acoes.innerHTML += `<i class="btnAcoes botaoInfo bi bi-clipboard-check" id="i${element.id}" data-bs-toggle="modal" data-bs-target="#staticBackdrop"></i>`;

    tr.classList.add("headConsulta", "active");
    tr.setAttribute("id", element.id);
    td_id.classList.add("thID");

    const data = new Date(element.criado);
    const hora = `${data.getHours() < 10 ? "0" + data.getHours() : data.getHours()}:${
      data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes()
    }:${data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds()}`;
    const criado = data.toLocaleDateString().replace(new RegExp("/", "g"), "-");

    td_realizado.classList.add("celula", "content", "colMaior", "center");
    td_realizado.setAttribute("id", "data");
    td_realizado.setAttribute("data-bs-toggle", "tooltip");
    td_realizado.setAttribute("data-bs-placement", "bottom");
    td_realizado.setAttribute("data-bs-custom-class", "custom-tooltip");
    td_realizado.setAttribute("title", `Criado em: ${criado} às ${hora}`);

    td_nome.classList.add("nomeNormal", "celula", "content", "colNome");
    td_setor.classList.add("celula", "content", "colMaiorX");
    td_gerente.classList.add("celula", "content", "colMaiorX");
    td_nome_projeto.classList.add("celula", "content", "colMaiorX");
    td_nome_projeto.setAttribute("id", "nomeProjeto");
    td_turno.classList.add("celula", "content", "colMaior", "center");
    td_acoes.classList.add("action", "celula", "content", "colMaior", "acoes", "center");

    /*Busca Aprovador*/
    let gerenteAprovador;
    let analistaAvaliador;
    let idLinha;
    let idTr;
    let statusGerente;
    let emEspera;
    gerenteAprovador = element.gerente_aprovador;
    analistaAvaliador = element.analista_avaliador;
    idLinha = element.id;
    statusGerente = element.status_gerente;
    emEspera = element.em_espera;
    idTr = document.getElementById(idLinha);
    if (gerenteAprovador == "" && analistaAvaliador != "") {
      idTr.classList.add("semGerente");
    } else {
      idTr.classList.remove("semGerente");
    }
    if (gerenteAprovador != "" && analistaAvaliador == "") {
      idTr.classList.add("semAnalista");
    } else {
      idTr.classList.remove("semAnalista");
    }
    if (gerenteAprovador == "" && analistaAvaliador == "") {
      idTr.classList.add("semAmbos");
    } else {
      idTr.classList.remove("semAmbos");
    }
    if (statusGerente == "REPROVAR") {
      idTr.classList.remove("semAnalista");
      idTr.classList.remove("semGerente");
      idTr.classList.remove("semAmbos");
      idTr.classList.add("reprovadoGerente");
    }
    if (emEspera == "1") {
      idTr.classList.remove("semAnalista");
      idTr.classList.remove("semGerente");
      idTr.classList.remove("semAmbos");
      idTr.classList.remove("reprovadoGerente");
      idTr.classList.add("emEspera");
    }
    if (gerenteAprovador != "" && analistaAvaliador != "") {
      idTr.classList.add("avaliado");
    }
  });

  const buscaPA = () => {
    if (!unidade) {
      console.log("Informe sua matricula para definição da unidade");
      return;
    }

    let line = document.querySelectorAll(".active").length;
    if (line !== 0) {
      filter_rows();
    }
    ativaBtn();
    document.querySelectorAll("i").forEach((button) => {
      if (!unidade) {
        console.log("Informe sua matricula para definição da unidade");
        return;
      }

      button.addEventListener("click", async function (event) {
        // Reseta Modal
        showLoadingComponent("buscaPa");
        limpaModal();

        let el = event.target.id.substring(1);
        let data = { identificador: el };
        let buscaPenseAja = await fetch("/pense_aja/server/apiBuscaPenseAja.php", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        });

        let tituloProjeto = document.getElementById("staticBackdropLabel");
        let matriculaModal = document.getElementById("matriculaModal");
        let nomeModal = document.getElementById("nomeModal");
        let setorModal = document.getElementById("setorModal");
        let liderModal = document.getElementById("liderModal");
        let turnoModal = document.getElementById("turnoModal");
        let dataModal = document.getElementById("dataModal");
        let anteriorModal = document.getElementById("anteriorModal");
        let atualModal = document.getElementById("atualModal");
        let elimPerdaModal = document.getElementById("elimPerdaModal");
        let amortizacaoModal = document.getElementById("amortizacaoModal");
        let outGanhosModal = document.getElementById("outGanhosModal");
        let ids = document.getElementById("id");
        let statusGerente = document.getElementById("status_gerente");
        let statusAnalista = document.getElementById("status_analista");
        let gerAprovador = document.getElementById("gerAprovador");
        let anaAprovador = document.getElementById("anaAprovador");
        let turno;

        let resBuscaPenseAja = await buscaPenseAja.json();

        if (resBuscaPenseAja.erro == false) {
          switch (resBuscaPenseAja.penseAja.turno) {
            case "A":
              turno = "1º";
              break;
            case "B":
              turno = "2º";
              break;
            case "C":
              turno = "3º";
              break;
            default:
              turno = "Comercial";
              break;
          }
          tituloProjeto.innerHTML = resBuscaPenseAja.penseAja.nome_projeto;
          matriculaModal.innerHTML = `<strong>Matrícula: </strong>${resBuscaPenseAja.penseAja.matricula}`;
          nomeModal.innerHTML = `<strong>Usuário: </strong>${resBuscaPenseAja.penseAja.nome}`;
          setorModal.innerHTML = `<strong>Setor: </strong>${resBuscaPenseAja.penseAja.setor}`;
          liderModal.innerHTML = `<strong>Líder: </strong>${resBuscaPenseAja.penseAja.lider}`;
          turnoModal.innerHTML = `<strong>Turno: </strong>${turno}`;
          dataModal.innerHTML = `<strong>Data Realização: </strong>${resBuscaPenseAja.penseAja.data_realizada}`;
          anteriorModal.innerHTML = `<strong>Situação Anterior: </strong>${resBuscaPenseAja.penseAja.situacao_anterior}`;
          atualModal.innerHTML = `<strong>Situação Atual: </strong>${resBuscaPenseAja.penseAja.situacao_atual}`;
          elimPerdaModal.innerHTML =
            "<strong>Eliminação de Perdas: </strong>" +
            `${
              resBuscaPenseAja.penseAja.super_producao != ""
                ? " | " + resBuscaPenseAja.penseAja.super_producao.toUpperCase()
                : ""
            }` +
            `${
              resBuscaPenseAja.penseAja.transporte != ""
                ? " | " + resBuscaPenseAja.penseAja.transporte.toUpperCase()
                : ""
            }` +
            `${
              resBuscaPenseAja.penseAja.processamento != ""
                ? " | " + resBuscaPenseAja.penseAja.processamento.toUpperCase()
                : ""
            }` +
            `${
              resBuscaPenseAja.penseAja.movimento != "" ? " | " + resBuscaPenseAja.penseAja.movimento.toUpperCase() : ""
            }` +
            `${
              resBuscaPenseAja.penseAja.estoque != "" ? " | " + resBuscaPenseAja.penseAja.estoque.toUpperCase() : ""
            }` +
            `${resBuscaPenseAja.penseAja.espera != "" ? " | " + resBuscaPenseAja.penseAja.espera.toUpperCase() : ""}` +
            `${
              resBuscaPenseAja.penseAja.talento != "" ? " | " + resBuscaPenseAja.penseAja.talento.toUpperCase() : ""
            }` +
            `${
              resBuscaPenseAja.penseAja.retrabalho != ""
                ? " | " + resBuscaPenseAja.penseAja.retrabalho.toUpperCase()
                : ""
            }`;
          if (parseInt(resBuscaPenseAja.penseAja.valor_a) != 0 || parseInt(resBuscaPenseAja.penseAja.valor_b) != 0) {
            amortizacaoModal.innerHTML = `<strong>Cálculo de Amortização: </strong>
          ${resBuscaPenseAja.penseAja.valor_a} / ${resBuscaPenseAja.penseAja.valor_b} = ${resBuscaPenseAja.penseAja.valor_amortizado}`;
          } else {
            amortizacaoModal.innerHTML = "";
          }
          if (resBuscaPenseAja.penseAja.outros_ganhos != "") {
            outGanhosModal.innerHTML = `<strong>Outros ganhos: </strong> ${resBuscaPenseAja.penseAja.outros_ganhos}`;
          }
          ids.innerHTML = `<strong>ID: </strong>${resBuscaPenseAja.penseAja.id}`;
          statusGerente.innerHTML = `${resBuscaPenseAja.penseAja.status_gerente}`;
          statusAnalista.innerHTML = `${resBuscaPenseAja.penseAja.status_analista}`;
          gerAprovador.innerHTML =
            '<strong class="strongM">Gerente: </strong>' +
            `${
              resBuscaPenseAja.penseAja.gerente_aprovador != ""
                ? resBuscaPenseAja.penseAja.gerente_aprovador
                : "Ainda não avaliou!"
            }`;
          anaAprovador.innerHTML =
            '<strong class="strongM">Analista: </strong>' +
            `${
              resBuscaPenseAja.penseAja.analista_avaliador != ""
                ? resBuscaPenseAja.penseAja.analista_avaliador
                : "Ainda não avaliou!"
            }`;
          if (
            resBuscaPenseAja.penseAja.classificacao == "A" ||
            resBuscaPenseAja.penseAja.classificacao == "B" ||
            resBuscaPenseAja.penseAja.classificacao == "C"
          ) {
            document.getElementById(resBuscaPenseAja.penseAja.classificacao.toLowerCase()).checked = true;
          } else {
            document.getElementById("a").checked = false;
            document.getElementById("b").checked = false;
            document.getElementById("c").checked = false;
          }
        }

        if (resBuscaPenseAja.penseAja.a3_mae != "") {
          document.getElementById("escolha").innerText = resBuscaPenseAja.penseAja.a3_mae;
        } else {
          document.getElementById("escolha").innerText = "Selecione";
        }

        if (
          document.getElementById("funcao").innerText === "ANALISTA!" &&
          gerAprovador.innerText != "Gerente: Ainda não avaliou!"
        ) {
          document.getElementById("a").disabled = true;
          document.getElementById("b").disabled = true;
          document.getElementById("c").disabled = true;
          document.getElementById("a3_mae").disabled = false;
        } else {
          document.getElementById("a").disabled = false;
          document.getElementById("b").disabled = false;
          document.getElementById("c").disabled = false;
          document.getElementById("a3_mae").disabled = false;
        }

        if (resBuscaPenseAja.penseAja.em_espera == "1") {
          document.getElementById("esperar").checked = true;
        } else {
          document.getElementById("esperar").checked = false;
        }

        if (resBuscaPenseAja.penseAja.replicavel == "1") {
          document.getElementById("replicar").checked = true;
        } else {
          document.getElementById("replicar").checked = false;
        }

        hideLoading("buscaPa");
        /*Pense e aja reprovado*/
        let reprovar = document.getElementById("reprovar");
        reprovar.addEventListener("click", async function (event) {
          if (!unidade) {
            console.log("Informe sua matricula para definição da unidade");
            return;
          }

          event.preventDefault();
          const dataR = {
            identificador: document.getElementById("id").innerText.substring(4),
            status: "reprovar",
            nome: sessionStorage.getItem("nome"),
            funcao: sessionStorage.getItem("funcao"),
          };
          let reprovado = await fetch(
            "http://" + ip + "/dass-penseaja-vdc/pense_aja/server/apiPostPenseAjaReprovado.php",
            {
              method: "POST",
              body: JSON.stringify(dataR),
              headers: {
                "Content-type": "aplication/json; charset=UTF-8",
              },
            }
          );
          let resReprovado = await reprovado.json();
          if (resReprovado.erro == false) {
            success("Avaliado");
          } else {
            error("Erro ao gravar avaliação, verifique!");
          }
        });

        /*Pense e aja aprovado*/
        let aprovar = document.getElementById("aprovar");
        aprovar.addEventListener("click", async function (event) {
          if (!unidade) {
            console.log("Informe sua matricula para definição da unidade");
            return;
          }

          event.preventDefault();
          let gerAprovou = document.getElementById("gerAprovador").innerText;
          let stsGerAprovou = document.getElementById("status_gerente").innerText;
          let stsAnaAprovou = document.getElementById("status_analista").innerText;
          let esperou = document.getElementById("esperar").checked;
          let op = document.getElementsByClassName("radio");
          let escolha = "";
          for (let i = 0; i < op.length; ++i) {
            if (op[i].checked == true) {
              escolha = op[i].value;
            }
          }
          if (escolha == "") {
            required("Classificação obrigatória, por favor selecione um tipo!");
            return false;
          }
          const dataA = {
            identificador: document.getElementById("id").innerText.substring(4),
            status: "aprovar",
            nome: sessionStorage.getItem("nome"),
            funcao: sessionStorage.getItem("funcao"),
            escolha: escolha,
            a3Mae:
              document.getElementById("a3_mae").childNodes[1].innerText == "Selecione"
                ? ""
                : document.getElementById("a3_mae").childNodes[1].innerText,
            em_espera: document.getElementById("esperar").checked,
            replicavel: document.getElementById("replicar").checked,
          };
          let aprovado = await fetch(
            "http://" + ip + "/dass-penseaja-vdc/pense_aja/server/apiPostPenseAjaAprovado.php",
            {
              method: "POST",
              body: JSON.stringify(dataA),
              headers: {
                "Content-type": "aplication/json; charset=UTF-8",
              },
            }
          );
          let resAprovado = await aprovado.json();
          if (resAprovado.erro == false) {
            success("Avaliado");
          } else {
            error("Erro ao gravar avaliação, verifique!");
          }

          let setFuncao = sessionStorage.getItem("funcao");
          const dataPonto = {
            idPenseAja: document.getElementById("id").innerText.substring(4),
            matricula: document.getElementById("matriculaModal").innerText.substring(11),
            nome:
              setFuncao == "GERENTE"
                ? sessionStorage.getItem("nome")
                : document.getElementById("nomeModal").innerText.substring(9),
            classificacao: escolha,
            gerente: gerAprovou.substring(9),
          };
          /*Se avaliação pelo gerente e pelo analista salva ponto*/
          if (setFuncao == "ANALISTA!" && esperou == false) {
            let pontos = await fetch("/pense_aja/server/apiPostPontos.php", {
              method: "POST",
              body: JSON.stringify(dataPonto),
              headers: {
                "Content-type": "aplication/json; charset=UTF-8",
              },
            });
            event.preventDefault();
          }
          if (setFuncao == "GERENTE" && stsAnaAprovou == "APROVAR" && esperou == false) {
            let pontos = await fetch("/pense_aja/server/apiPostPontos.php", {
              method: "POST",
              body: JSON.stringify(dataPonto),
              headers: {
                "Content-type": "aplication/json; charset=UTF-8",
              },
            });
            event.preventDefault();
          }
        });

        /*Pense e aja excluído*/
        let excluir = document.getElementById("excluir");
        excluir.addEventListener("click", function (event) {
          if (!unidade) {
            console.log("Informe sua matricula para definição da unidade");
            return;
          }

          delet
            .fire({
              title: "Você tem certeza?",
              text: "Não será possível reverter após confirmar!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Sim, excluir!",
              cancelButtonText: "Não, cancelar!",
              reverseButtons: true,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                const dataE = {
                  identificador: document.getElementById("id").innerText.substring(4),
                  gerente: sessionStorage.getItem("nome"),
                  funcao: sessionStorage.getItem("funcao"),
                };
                let excluir = await fetch(
                  "http://" + ip + "/dass-penseaja-vdc/pense_aja/server/apiPostPenseAjaExcluido.php",
                  {
                    method: "POST",
                    body: JSON.stringify(dataE),
                    headers: {
                      "Content-type": "aplication/json; charset=UTF-8",
                    },
                  }
                );
                let resExcluir = excluir.json();
                if (resExcluir.erro == false) {
                  success("Excluido");
                } else if (resExcluir.erro == true) {
                  error("Erro ao excluir, verifique!");
                } else {
                  warning("Apenas gerente possui permissão para excluir!");
                }
                event.preventDefault();
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                delet.fire("Cancelado", "<strong>Exclusão</strong> cancelada!", "error").then(function () {
                  location.reload();
                });
              }
            });
        });
      });
    });

    let btnClose = document.getElementById("btnClose");
    btnClose.addEventListener("click", () => {
      limpaModal();
    });

    function limpaModal() {
      document.getElementById("staticBackdropLabel").innerHTML = "";
      document.getElementById("matriculaModal").innerHTML = "";
      document.getElementById("nomeModal").innerHTML = "";
      document.getElementById("setorModal").innerHTML = "";
      document.getElementById("liderModal").innerHTML = "";
      document.getElementById("turnoModal").innerHTML = "";
      document.getElementById("dataModal").innerHTML = "";
      document.getElementById("anteriorModal").innerHTML = "";
      document.getElementById("atualModal").innerHTML = "";
      document.getElementById("elimPerdaModal").innerHTML = "";
      document.getElementById("amortizacaoModal").innerHTML = "";
      document.getElementById("outGanhosModal").innerHTML = "";
      document.getElementById("a3_mae").selectedIndex = null;
    }
  };
  buscaPA();
};

function activeBtn(e) {
  // e.currentTarget.classList.toggle("active")
  const btnsGlossario = document.querySelectorAll(".coresGlossario");
  btnsGlossario.forEach((btn) => {
    if (btn !== e.currentTarget) {
      btn.classList.remove("active");
    } else {
      btn.classList.toggle("active");
    }
  });
}

const filterTable = (param, event, id) => {
  const rows = document.querySelectorAll(`${id} tbody tr`);
  activeBtn(event);
  const isActive = event.currentTarget.classList.contains("active");

  let countValues = 0;
  rows.forEach((row) => {
    if (isActive) {
      // Exibe apenas os que possuem a classe correspondente
      if (row.classList.contains(param)) {
        row.style.display = "table-row";
        countValues++;
      } else {
        row.style.display = "none";
      }
    } else {
      countValues = rows.length;
      row.style.display = "table-row";
    }
  });

  let valorTotal = document.getElementById("valorTotal");
  if (!valorTotal) {
    return;
  }
  valorTotal.innerHTML = `${countValues} Registros`;
};

async function listaTable() {
  let penseAjaCount = document.getElementById("valorTotal");
  const mesAnterior = new Date().getMonth() - 1;
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  if (!unidade) {
    console.log("Informe sua matricula para definição da unidade");
    return;
  }

  const cachedKey = `${mesAnterior}-${mesAtual}-${anoAtual}`;
  let cachedList = getCachedData("cachedList") || {};
  const currentDate = new Date().getTime();

  if (Object.keys(cachedList).length && cachedList[cachedKey] && cachedList[cachedKey].payload) {
    renderListaTable(cachedList[cachedKey].payload);
    updateSelectOptionsLista(cachedList[cachedKey].filters, ".table-filter");
    penseAjaCount.innerHTML = `${cachedList[cachedKey].payload.length} Registros`;
  } else {
    showLoadingComponent("listaTable");
  }

  let resBuscaDados
  try {
    const response = await axios.get("http://10.110.20.192:2512/pense-aja/SEST");

    resBuscaDados = response.data;
    if (resBuscaDados.dados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Aviso",
        html: `<div style = "display:flex;text-align:center;flex-direction:column">
                <div><strong>Registros não encontrados.</strong></div>
              </div>`,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 2100,
      });
      return;
    }
    if (resBuscaDados.erro == false) {
      const newCache = {
        payload: resBuscaDados.dados,
        timestamp: currentDate,
        filters: resBuscaDados.filters
      };

      if (!Object.keys(cachedList).length) {
        renderListaTable(resBuscaDados.dados);
        updateSelectOptionsLista(resBuscaDados.filters, ".table-filter");
        cachedList[cachedKey] = newCache;

        localStorage.setItem("cachedList", JSON.stringify(cachedList));
        return;
      }

      // Verifica se os dados do servidor são mais recentes que os do cache
      if (cachedList && resBuscaDados && resBuscaDados.dados.length > cachedList[cachedKey].payload.length) {
        console.log("Atualizando...");

        Swal.fire({
          icon: "success",
          title: "Sucesso",
          html: `<div style = "display:flex;text-align:center;flex-direction:column; z-index:2 !important;">
                  <div><strong>Novos registros encontrados.</strong> Atualizando lista!</div>
                </div>`,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 20000,
          customClass: {
            container: "swal-container-custom",
            popup: "swal-popup-custom",
          },
        });
        cachedList[cachedKey] = newCache;
        renderListaTable(resBuscaDados.dados);
        updateSelectOptionsLista(resBuscaDados.filters, ".table-filter");
      }

      localStorage.setItem("cachedList", JSON.stringify(cachedList));
    }
  } catch (error) {
    console.error("Erro ao buscar dados do pense aja!", error);
    return;
  } finally {
    hideLoading("listaTable");
    penseAjaCount.innerHTML = `${cachedList[cachedKey]?.payload.length || resBuscaDados.dados.length || 0}  Registros`;
  }
}

const obtemAnoAtualEMesAnterior = () => {
  var selectAnoLista = document.getElementById("anoLista");
  let mesLista = document.getElementById("mesLista");

  var dataAtual = new Date();
  var anoAtual = dataAtual.getFullYear();
  var mesAnterior = dataAtual.getMonth();
  console.log(mesAnterior);

  selectAnoLista.innerHTML = "";
  for (let ano = anoAtual; ano >= 2024; ano--) {
    var optionAno = document.createElement("option");
    optionAno.value = ano;
    optionAno.text = ano;
    selectAnoLista.add(optionAno);
  }

  var nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  var optionMes = document.createElement("option");
  optionMes.value = mesAnterior;
  optionMes.text = nomesMeses[mesAnterior];
  mesLista.innerHTML = "";
  mesLista.add(optionMes);
};

const buscaPA_Lista = (listaSize) => {
  let selecionadoLista = document.getElementById("selecionadoLista");
  let nomesLista = sessionStorage.getItem("nome");
  let colabLista = sessionStorage.getItem("funcao");

  if (listaSize !== 0) {
    if (colabLista == "GERENTE") {
      selecionadoLista.innerText = nomesLista;
      selecionadoLista.value = nomesLista;
    } else {
      if (selecionadoLista) {
        selecionadoLista.innerText = "";
        selecionadoLista.value = "";
      }
    }
    filter_rowsLista();
    hideLoading();
  }

  ativaBtn();
  document.querySelectorAll(".iLista").forEach(function (buttons) {
    buttons.addEventListener("click", async function (events) {
      let el = events.target.id.substring(6);
      let data = { identificador: el };
      let buscaPenseAjaLista = await fetch("/pense_aja/server/apiBuscaPenseAja.php", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-type": "aplication/json; charset=UTF-8",
        },
      });
      let resBuscaPenseAjaLista = await buscaPenseAjaLista.json();
      let tituloProjeto = document.getElementById("staticBackdropLabel");
      let matriculaModal = document.getElementById("matriculaModal");
      let nomeModal = document.getElementById("nomeModal");
      let setorModal = document.getElementById("setorModal");
      let liderModal = document.getElementById("liderModal");
      let turnoModal = document.getElementById("turnoModal");
      let dataModal = document.getElementById("dataModal");
      let anteriorModal = document.getElementById("anteriorModal");
      let atualModal = document.getElementById("atualModal");
      let elimPerdaModal = document.getElementById("elimPerdaModal");
      let amortizacaoModal = document.getElementById("amortizacaoModal");
      let outGanhosModal = document.getElementById("outGanhosModal");
      let turno;
      let ids = document.getElementById("id");
      let statusGerente = document.getElementById("status_gerente");
      let statusAnalista = document.getElementById("status_analista");
      let gerAprovador = document.getElementById("gerAprovador");
      let anaAprovador = document.getElementById("anaAprovador");
      if (resBuscaPenseAjaLista.erro == false) {
        switch (resBuscaPenseAjaLista.penseAja.turno) {
          case "A":
            turno = "1º";
            break;
          case "B":
            turno = "2º";
            break;
          case "C":
            turno = "3º";
            break;
          default:
            turno = "Comercial";
            break;
        }
        tituloProjeto.innerHTML = resBuscaPenseAjaLista.penseAja.nome_projeto;
        matriculaModal.innerHTML = `<strong>Matrícula: </strong>${resBuscaPenseAjaLista.penseAja.matricula}`;
        nomeModal.innerHTML = `<strong>Usuário: </strong>${resBuscaPenseAjaLista.penseAja.nome}`;
        setorModal.innerHTML = `<strong>Setor: </strong>${resBuscaPenseAjaLista.penseAja.setor}`;
        liderModal.innerHTML = `<strong>Líder: </strong>${resBuscaPenseAjaLista.penseAja.lider}`;
        turnoModal.innerHTML = `<strong>Turno: </strong>${turno}`;
        dataModal.innerHTML = `<strong>Data Realização: </strong>${resBuscaPenseAjaLista.penseAja.data_realizada}`;
        anteriorModal.innerHTML = `<strong>Situação Anterior: </strong>${resBuscaPenseAjaLista.penseAja.situacao_anterior}`;
        atualModal.innerHTML = `<strong>Situação Atual: </strong>${resBuscaPenseAjaLista.penseAja.situacao_atual}`;
        elimPerdaModal.innerHTML =
          "<strong>Eliminação de Perdas: </strong>" +
          `${
            resBuscaPenseAjaLista.penseAja.super_producao != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.super_producao.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.transporte != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.transporte.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.processamento != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.processamento.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.movimento != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.movimento.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.estoque != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.estoque.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.espera != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.espera.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.talento != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.talento.toUpperCase()
              : ""
          }` +
          `${
            resBuscaPenseAjaLista.penseAja.retrabalho != ""
              ? " | " + resBuscaPenseAjaLista.penseAja.retrabalho.toUpperCase()
              : ""
          }`;

        if (
          parseInt(resBuscaPenseAjaLista.penseAja.valor_a) != 0 ||
          parseInt(resBuscaPenseAjaLista.penseAja.valor_b) != 0
        ) {
          amortizacaoModal.innerHTML = `<strong>Cálculo de Amortização: </strong>
          ${resBuscaPenseAjaLista.penseAja.valor_a} / ${resBuscaPenseAjaLista.penseAja.valor_b} = ${resBuscaPenseAjaLista.penseAja.valor_amortizado}`;
        } else {
          amortizacaoModal.innerHTML = "";
        }
        if (resBuscaPenseAjaLista.penseAja.outros_ganhos != "") {
          outGanhosModal.innerHTML = `<strong>Outros ganhos: </strong>
          ${resBuscaPenseAjaLista.penseAja.outros_ganhos}`;
        }
        ids.innerHTML = `<strong>ID: </strong>${resBuscaPenseAjaLista.penseAja.id}`;
        statusGerente.innerHTML = `${resBuscaPenseAjaLista.penseAja.status_gerente}`;
        statusAnalista.innerHTML = `${resBuscaPenseAjaLista.penseAja.status_analista}`;
        gerAprovador.innerHTML =
          '<strong class="strongM">Gerente: </strong>' +
          `${
            resBuscaPenseAjaLista.penseAja.gerente_aprovador != ""
              ? resBuscaPenseAjaLista.penseAja.gerente_aprovador
              : "Ainda não avaliou!"
          }`;
        anaAprovador.innerHTML =
          '<strong class="strongM">Analista: </strong>' +
          `${
            resBuscaPenseAjaLista.penseAja.analista_avaliador != ""
              ? resBuscaPenseAjaLista.penseAja.analista_avaliador
              : "Ainda não avaliou!"
          }`;
        if (
          resBuscaPenseAjaLista.penseAja.classificacao == "A" ||
          resBuscaPenseAjaLista.penseAja.classificacao == "B" ||
          resBuscaPenseAjaLista.penseAja.classificacao == "C"
        ) {
          document.getElementById(resBuscaPenseAjaLista.penseAja.classificacao.toLowerCase()).checked = true;
        } else {
          document.getElementById("a").checked = false;
          document.getElementById("b").checked = false;
          document.getElementById("c").checked = false;
        }
      }
      if (resBuscaPenseAjaLista.penseAja.a3_mae != "") {
        document.getElementById("escolha").innerText = resBuscaPenseAjaLista.penseAja.a3_mae;
      } else {
        document.getElementById("escolha").innerText = "Selecione";
      }
      if (
        document.getElementById("funcao").innerText === "ANALISTA!" &&
        gerAprovador.innerText != "Gerente: Ainda não avaliou!"
      ) {
        document.getElementById("a").disabled = true;
        document.getElementById("b").disabled = true;
        document.getElementById("c").disabled = true;
        document.getElementById("a3_mae").disabled = false;
      } else {
        document.getElementById("a").disabled = false;
        document.getElementById("b").disabled = false;
        document.getElementById("c").disabled = false;
        document.getElementById("a3_mae").disabled = false;
      }
      if (resBuscaPenseAjaLista.penseAja.em_espera == "1") {
        document.getElementById("esperar").checked = true;
      } else {
        document.getElementById("esperar").checked = false;
      }
      if (resBuscaPenseAjaLista.penseAja.replicavel == "1") {
        document.getElementById("replicar").checked = true;
      } else {
        document.getElementById("replicar").checked = false;
      }
      //Pense e aja reprovado
      let reprovar = document.getElementById("reprovar");
      reprovar.addEventListener("click", async function (event) {
        event.preventDefault();
        const dataR = {
          identificador: document.getElementById("id").innerText.substring(4),
          status: "reprovar",
          nome: sessionStorage.getItem("nome"),
          funcao: sessionStorage.getItem("funcao"),
        };
        let reprovadoLista = await fetch(
          "http://" + ip + "/dass-penseaja-vdc/pense_aja/server/apiPostPenseAjaReprovado.php",
          {
            method: "POST",
            body: JSON.stringify(dataR),
            headers: {
              "Content-type": "aplication/json; charset=UTF-8",
            },
          }
        );
        let resReprovadoLista = await reprovadoLista.json();
        if (resReprovadoLista.erro == false) {
          successLista("Avaliado");
        } else {
          errorLista("Erro ao gravar avaliação, verifique!");
        }
      });
      //Pense e aja aprovado

      let aprovar = document.getElementById("aprovar");
      aprovar.addEventListener("click", async function (event) {
        event.preventDefault();
        let gerAprovouLista = gerAprovador.innerText;
        let stsGerAprovouLista = document.getElementById("status_gerente").innerText;
        let stsAnaAprovouLista = document.getElementById("status_analista").innerText;
        let esperouLista = document.getElementById("esperar").checked;
        let op = document.getElementsByClassName("radio");
        let escolha = "";
        let a3_maeLista = document.getElementById("a3_mae").childNodes[1].innerText;
        for (let i = 0; i < op.length; ++i) {
          if (op[i].checked == true) {
            escolha = op[i].value;
          }
        }
        if (escolha == "") {
          required("Classificação obrigatória, por favor selecione um tipo!");
          return false;
        }
        const dataA = {
          identificador: document.getElementById("id").innerText.substring(4),
          status: "aprovar",
          nome: sessionStorage.getItem("nome"),
          funcao: sessionStorage.getItem("funcao"),
          escolha: escolha,
          a3Mae: a3_maeLista != "Selecione" ? a3_maeLista : "",
          em_espera: document.getElementById("esperar").checked,
          replicavel: document.getElementById("replicar").checked,
        };
        let response = await fetch("/pense_aja/server/apiPostPenseAjaAprovado.php", {
          method: "POST",
          body: JSON.stringify(dataA),
          headers: {
            "Content-type": "aplication/json; charset=UTF-8",
          },
        });
        let userData = await response.json();
        if (userData.erro == false) {
          successLista("Avaliado");
        } else {
          errorLista("Erro ao gravar avaliação, verifique!");
        }
        let setFuncaoLista = sessionStorage.getItem("funcao");
        const dataPonto = {
          idPenseAja: document.getElementById("id").innerText.substring(4),
          matricula: document.getElementById("matriculaModal").innerText.substring(11),
          nome:
            setFuncaoLista == "GERENTE"
              ? sessionStorage.getItem("nome")
              : document.getElementById("nomeModal").innerText.substring(9),
          classificacao: escolha,
          gerente: gerAprovouLista.substring(9),
        };
        if (setFuncaoLista == "ANALISTA!" && esperouLista == false) {
          let pontosLista = await fetch("/pense_aja/server/apiPostPontos.php", {
            method: "POST",
            body: JSON.stringify(dataPonto),
            headers: {
              "Content-type": "aplication/json; charset=UTF-8",
            },
          });
          event.preventDefault();
        }
        if (setFuncaoLista == "GERENTE" && stsAnaAprovouLista == "APROVAR" && esperouLista == false) {
          let pontosLista = await fetch("/pense_aja/server/apiPostPontos.php", {
            method: "POST",
            body: JSON.stringify(dataPonto),
            headers: {
              "Content-type": "aplication/json; charset=UTF-8",
            },
          });
          event.preventDefault();
        }
      });
      //Pense e aja excluído
      let excluir = document.getElementById("excluir");
      excluir.addEventListener("click", async function (event) {
        if (!unidade) {
          console.log("Informe sua matricula para definição da unidade");
          return;
        }

        delet
          .fire({
            title: "Você tem certeza?",
            text: "Não será possível reverter após confirmar!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Não, cancelar!",
            reverseButtons: true,
          })
          .then((result) => {
            if (result.isConfirmed) {
              const dataE = {
                identificador: document.getElementById("id").innerText.substring(4),
                gerente: sessionStorage.getItem("nome"),
                funcao: sessionStorage.getItem("funcao"),
              };
              fetch("http://" + ip + "/dass-penseaja-vdc/pense_aja/server/apiPostPenseAjaExcluido.php", {
                method: "POST",
                body: JSON.stringify(dataE),
                headers: {
                  "Content-type": "aplication/json; charset=UTF-8",
                },
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.erro == false) {
                    successLista("Excluido");
                  } else if (data.erro == true) {
                    errorLista("Erro ao excluir, verifique!");
                  } else {
                    warningLista("Apenas gerente possui permissão para excluir!");
                  }
                });
              event.preventDefault();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              delet.fire("Cancelado", "<strong>Exclusão</strong> cancelada!", "error").then(function () {
                location.reload();
              });
            }
          });
      });
    });
  });
  let btnClose = document.getElementById("btnClose");
  btnClose.addEventListener("click", () => {
    limpaModal();
  });
  function limpaModal() {
    document.getElementById("staticBackdropLabel").innerHTML = "";
    document.getElementById("matriculaModal").innerHTML = "";
    document.getElementById("nomeModal").innerHTML = "";
    document.getElementById("setorModal").innerHTML = "";
    document.getElementById("liderModal").innerHTML = "";
    document.getElementById("turnoModal").innerHTML = "";
    document.getElementById("dataModal").innerHTML = "";
    document.getElementById("anteriorModal").innerHTML = "";
    document.getElementById("atualModal").innerHTML = "";
    document.getElementById("elimPerdaModal").innerHTML = "";
    document.getElementById("amortizacaoModal").innerHTML = "";
    document.getElementById("outGanhosModal").innerHTML = "";
    document.getElementById("a3_mae").selectedIndex = null;
  }
};

async function listaTableLista() {
  if (!unidade) {
    console.log("Informe sua matricula para definição da unidade");
    return;
  }

  let tbody = document.getElementById("tbodyLista");
  tbody.innerText = "";
  let selectMes = document.getElementById("mesLista").value;
  let selectAno = document.getElementById("anoLista").value;

  const renderListaTableLista = (data) => {
    tbody.innerHTML = "";
    data.forEach((element) => {
      let tr = tbody.insertRow();
      let td_id = tr.insertCell();
      let td_realizado = tr.insertCell();
      let td_nome = tr.insertCell();
      let td_setor = tr.insertCell();
      let td_gerente = tr.insertCell();
      let td_nome_projeto = tr.insertCell();
      let td_turno = tr.insertCell();
      let td_acoes = tr.insertCell();

      td_id.innerText = element.id;
      td_realizado.innerText = element.data_realizada;
      td_nome.innerText = element.nome;
      td_setor.innerText = element.setor;
      td_gerente.innerText = element.gerente;
      td_nome_projeto.innerHTML += `${element.nome_projeto} <div id="toolLista"><div id="tooltipTextBeforeLista"><strong>SITUAÇÃO ANTERIOR: </strong>${element.situacao_anterior}</div><div id="tooltipTextAfterLista"><strong>SITUAÇÃO ATUAL: </strong>${element.situacao_atual}</div></div>`;
      td_turno.innerText = element.turno;
      td_acoes.innerHTML += `<i class="btnAcoes botaoInfo bi bi-info-square iLista" id="iLista${element.id}" data-bs-toggle="modal" data-bs-target="#staticBackdrop"></i>`;

      tr.classList.add("headConsultaLista", "activeLista");
      tr.setAttribute("id", element.id);
      td_id.classList.add("thID");

      const data = new Date(element.criado);
      const hora = `${data.getHours() < 10 ? "0" + data.getHours() : data.getHours()}:${
        data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes()
      }:${data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds()}`;
      const criado = data.toLocaleDateString().replace(new RegExp("/", "g"), "-");

      td_realizado.classList.add("celula", "content", "colMaior", "center");
      td_realizado.setAttribute("id", "data");
      td_realizado.setAttribute("data-bs-toggle", "tooltip");
      td_realizado.setAttribute("data-bs-placement", "bottom");
      td_realizado.setAttribute("data-bs-custom-class", "custom-tooltip");
      td_realizado.setAttribute("title", `Criado em: ${criado} às ${hora}`);

      td_nome.classList.add("nomeNormal", "celula", "content", "colNome");
      td_setor.classList.add("celula", "content", "colMaiorX");
      td_gerente.classList.add("celula", "content", "colMaiorX");
      td_nome_projeto.classList.add("celula", "content", "colMaiorX");
      td_nome_projeto.setAttribute("id", "nomeProjetos");
      td_turno.classList.add("celula", "content", "colMaior", "center");
      td_acoes.classList.add("action", "celula", "content", "colMaior", "acoes", "center");

      setTimeout(() => {
        let gerenteAprovadorLista;
        let analistaAvaliadorLista;
        let idLinhaLista;
        let idTrLista;
        let statusGerenteLista;
        let emEsperaLista;
        gerenteAprovadorLista = element.gerente_aprovador;
        analistaAvaliadorLista = element.analista_avaliador;
        idLinhaLista = element.id;
        statusGerenteLista = element.status_gerente;
        emEsperaLista = element.em_espera;
        idTrLista = document.getElementById(idLinhaLista);

        if (!gerenteAprovadorLista && analistaAvaliadorLista !== "") {
          idTrLista.classList.add("semGerenteLista");
        } else {
          idTrLista.classList.remove("semGerenteLista");
        }
        if (gerenteAprovadorLista !== "" && analistaAvaliadorLista === "") {
          idTrLista.classList.add("semAnalistaLista");
        } else {
          idTrLista.classList.remove("semAnalistaLista");
        }
        if (!gerenteAprovadorLista && !analistaAvaliadorLista) {
          const row = document.getElementById(element.id);
          row.classList.add("semAmbosLista");
        } else {
          idTrLista.classList.remove("semAmbosLista");
        }
        if (statusGerenteLista === "REPROVAR") {
          idTrLista.classList.remove("semAnalistaLista");
          idTrLista.classList.remove("semGerenteLista");
          idTrLista.classList.remove("semAmbosLista");
          idTrLista.classList.add("reprovadoGerenteLista");
        }
        if (emEsperaLista === "1") {
          idTrLista.classList.remove("semAnalistaLista");
          idTrLista.classList.remove("semGerenteLista");
          idTrLista.classList.remove("semAmbosLista");
          idTrLista.classList.remove("reprovadoGerenteLista");
          idTrLista.classList.add("emEsperaLista");
        }
        if (gerenteAprovadorLista !== "" && analistaAvaliadorLista !== "") {
          idTrLista.classList.add("avaliadoLista");
        }
      }, 150);
    });
  };

  // Dados do filtro para evitar spans desnecessários
  const currentTime = new Date().getTime();
  const cachedListKey = `cachedListTable-${selectMes}-${selectAno}`;
  const queryCache = JSON.parse(localStorage.getItem("filterCache")) || {};

  if (queryCache && Object.keys(queryCache).length > 0 && queryCache[cachedListKey]) {
    renderListaTableLista(queryCache[cachedListKey]?.payload);
    updateSelectOptionsLista(queryCache[cachedListKey]?.filters, ".table-filterLista");
  } else {
    showLoadingComponent("listaTableLista");
  }

  // Atualizar Quantidade de registros aqui e nao na funcao somaLista()
  let listaSize = queryCache[cachedListKey]?.payload.length || 0;
  let valorTotal = document.getElementById("valorTotalLista");
  valorTotal.innerHTML = `${listaSize} Registros`;

  await axios
    .get("http://10.110.20.192:2512/pense-aja/history/SEST", {
      params: {
        selectedMonth: Number(selectMes),
        selectedYear: selectAno,
      },
    })
    .then((response) => {
      const newCache = response.data;

      if (newCache.dados.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Erro",
          html: `<div style = "display:flex;text-align:center;flex-direction:column">
                  <div><strong>Registros não encontrados.</strong></div>
                </div>`,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 2100,
        });
        return;
      }

      if (typeof newCache !== "object") {
        throw new Error("Formato de resposta inválido");
      }

      if (
        cachedListKey &&
        ((!queryCache[cachedListKey] && newCache && newCache.dados) ||
          newCache.dados.length > queryCache[cachedListKey].payload.length)
      ) {
        Swal.fire({
          icon: "success",
          title: "Sucesso",
          html: `<div style = "display:flex;text-align:center;flex-direction:column">
                  <div><strong>Novos registros encontrados.</strong> Atualizando lista!</div>
                </div>`,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 2100,
        });

        queryCache[cachedListKey] = { payload: newCache.dados, timestamp: currentTime, filters: newCache.filters };
        localStorage.setItem("filterCache", JSON.stringify(queryCache));
        renderListaTableLista(queryCache[cachedListKey].payload);
        updateSelectOptionsLista(newCache.filters, ".table-filterLista");
        listaSize = queryCache[cachedListKey].payload.length;
      }

      listaSize = newCache.dados.length;
      valorTotal.innerHTML = `${listaSize} Registros`;
      buscaPA_Lista(listaSize);
    })
    .catch((error) => {
      buscaPA_Lista(listaSize);
      required("Filtro inválido");
      console.error("Erro ao buscar dados da lista do pense aja: ", error);
    })
    .finally(() => {
      hideLoading("listaTableLista");
    });
}

const delet = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger",
  },
  buttonsStyling: false,
});

let success = function (message) {
  Swal.fire({
    icon: "success",
    title: "Sucesso",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong> com sucesso!</div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2100,
  }).then(function () {
    listaTable();
    enviar();
    /****************************************/
    if (document.getElementById("matriculaInput")) {
      menu.style.opacity = "0";
      menu.style.right = menu.offsetWidth * -1 + "px";
      menu.removeAttribute("style");
      openMenu.removeAttribute("style");
      document.getElementById("total").style.display = "flex";
      document.getElementById("pontosColab").innerText = "0";
      dadosColaborador.classList.add("inputSmall");
      var elemMatricula = document.getElementById("matriculaInput");
      var elemNome = document.getElementById("nomeInput");
      var elemSetor = document.getElementById("setorInput");
      var elemLider = document.getElementById("liderInput");
      var elemGerente = document.getElementById("gerenteInput");
      var elemdivMatricula = document.getElementById("divMatricula");
      var elemNomeProjeto = document.getElementById("nomeProjeto");
      var elemDataProjeto = document.getElementById("dataProjeto");
      var elemLblSituacaoAnterior = document.getElementById("lblSituacaoAnterior");
      var elemSituacaoAnterior = document.getElementById("situacaoAnterior");
      var elemLblSituacaoAtual = document.getElementById("lblSituacaoAtual");
      var elemSituacaoAtual = document.getElementById("situacaoAtual");
      var elemBtnLogin = document.getElementById("btnLogin");
      var elemDivSuperProducao = document.getElementById("divSuperProducao");
      var elemDivTransporte = document.getElementById("divTransporte");
      var elemDivProcessamento = document.getElementById("divProcessamento");
      var elemDivMovimento = document.getElementById("divMovimento");
      var elemDivEstoque = document.getElementById("divEstoque");
      var elemDivEspera = document.getElementById("divEspera");
      var elemDivTalento = document.getElementById("divTalento");
      var elemDivRetrabalho = document.getElementById("divRetrabalho");
      var elemDivLabelAmortiza = document.getElementById("divLabelAmortiza");
      var elemDivOutrosGanhos = document.getElementById("divLabelOutrosGanhos");
      var elemValorAInput = document.getElementById("valorAInput");
      var elemValorBInput = document.getElementById("valorBInput");
      var elemValorAmortizado = document.getElementById("valorAmortizadoInput");
      var elemOutGanhos = document.getElementById("outGanhos");
      var elemdivInputCompleteColaborador = document.getElementById("divInputCompleteColaborador");
      var elemdivMetadeUmPerdas = document.getElementById("divMetadeUmPerdas");
      var elemdivMetadeDoisPerdas = document.getElementById("divMetadeDoisPerdas");
      var elemdivInputsAmortiza = document.getElementById("divInputsAmortiza");
      var elemdivInputsOutrosGanhos = document.getElementById("divInputsOutrosGanhos");
      if (elemMatricula.parentNode) {
        elemdivInputsOutrosGanhos.parentNode.removeChild(elemdivInputsOutrosGanhos);
        elemdivInputsAmortiza.parentNode.removeChild(elemdivInputsAmortiza);
        elemdivMatricula.parentNode.removeChild(elemdivMatricula);
        elemMatricula.parentNode.removeChild(elemMatricula);
        elemNome.parentNode.removeChild(elemNome);
        elemSetor.parentNode.removeChild(elemSetor);
        elemLider.parentNode.removeChild(elemLider);
        elemGerente.parentNode.removeChild(elemGerente);
        elemNomeProjeto.parentNode.removeChild(elemNomeProjeto);
        elemDataProjeto.parentNode.removeChild(elemDataProjeto);
        elemLblSituacaoAnterior.parentNode.removeChild(elemLblSituacaoAnterior);
        elemSituacaoAnterior.parentNode.removeChild(elemSituacaoAnterior);
        elemLblSituacaoAtual.parentNode.removeChild(elemLblSituacaoAtual);
        elemSituacaoAtual.parentNode.removeChild(elemSituacaoAtual);
        elemBtnLogin.parentNode.removeChild(elemBtnLogin);
        elemDivSuperProducao.parentNode.removeChild(elemDivSuperProducao);
        elemDivTransporte.parentNode.removeChild(elemDivTransporte);
        elemDivProcessamento.parentNode.removeChild(elemDivProcessamento);
        elemDivMovimento.parentNode.removeChild(elemDivMovimento);
        elemDivEstoque.parentNode.removeChild(elemDivEstoque);
        elemDivEspera.parentNode.removeChild(elemDivEspera);
        elemDivTalento.parentNode.removeChild(elemDivTalento);
        elemDivRetrabalho.parentNode.removeChild(elemDivRetrabalho);
        elemDivLabelAmortiza.parentNode.removeChild(elemDivLabelAmortiza);
        elemDivOutrosGanhos.parentNode.removeChild(elemDivOutrosGanhos);
        elemValorAInput.parentNode.removeChild(elemValorAInput);
        elemValorBInput.parentNode.removeChild(elemValorBInput);
        elemValorAmortizado.parentNode.removeChild(elemValorAmortizado);
        elemOutGanhos.parentNode.removeChild(elemOutGanhos);
        elemdivInputCompleteColaborador.parentNode.removeChild(elemdivInputCompleteColaborador);
        elemdivMetadeUmPerdas.parentNode.removeChild(elemdivMetadeUmPerdas);
        elemdivMetadeDoisPerdas.parentNode.removeChild(elemdivMetadeDoisPerdas);
      }
    }
    $("#staticBackdrop").modal("hide");
    if (document.getElementsByClassName("show") == undefined && document.getElementsByClassName("show") > 0) {
      if (document.getElementsByClassName("show")[0].classList.contains("modal-backdrop")) {
        document.getElementsByClassName("show")[0].classList.remove("modal-backdrop");
        document.getElementsByClassName("show")[1].classList.remove("modal-backdrop");
      }
    }
  });
};

let successLista = function (message) {
  Swal.fire({
    icon: "success",
    title: "Sucesso",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong> com sucesso!</div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2100,
  }).then(function () {
    listaTableLista();
    enviar();
    $("#staticBackdrop").modal("hide");
    if (document.getElementsByClassName("show") == undefined && document.getElementsByClassName("show") > 0) {
      if (document.getElementsByClassName("show")[0].classList.contains("modal-backdrop")) {
        document.getElementsByClassName("show")[0].classList.remove("modal-backdrop");
        document.getElementsByClassName("show")[1].classList.remove("modal-backdrop");
      }
    }
  });
};
let error = function (message) {
  Swal.fire({
    icon: "error",
    title: "Erro",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong></div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2100,
  }).then(function () {
    listaTable();
  });
};
let errorLista = function (message) {
  Swal.fire({
    icon: "error",
    title: "Erro",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong></div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 2100,
  }).then(function () {
    listaTableLista();
  });
};
let warning = function (message) {
  Swal.fire({
    icon: "warning",
    title: "Atenção",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong></div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3100,
  }).then(function () {
    listaTable();
  });
};
let warningLista = function (message) {
  Swal.fire({
    icon: "warning",
    title: "Atenção",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong></div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3100,
  }).then(function () {
    listaTableLista();
  });
};
let warningLoja = function (message) {
  Swal.fire({
    icon: "warning",
    title: "Atenção",
    html: `<div style = "display:flex;text-align:center;flex-direction:column">
            <div><strong>${message}</strong></div>
          </div>`,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 5100,
  }).then(function () {
    document.getElementById("lojaMatricula").value = "";
    document.getElementById("pontosLoja").innerHTML = "";
    document.getElementById("nomeLoja").innerText = `Nome: `;
    document.getElementById("setorLoja").innerText = `Setor: `;
    document.getElementById("gerenteLoja").innerText = `Gerente: `;
    document.getElementById("liderLoja").innerText = `Líder: `;
    document.getElementById("total_PeA").innerText = "";
    const allElements = document.querySelectorAll(".polaroid");
    allElements.forEach((element) => {
      element.classList.remove("pontosOK");
      element.classList.remove("pontosSEM");
      element.classList.add("pontosSEM");
    });
    const allElementsImg = document.querySelectorAll("img");
    allElementsImg.forEach((element) => {
      element.classList.remove("pontosOk");
      element.classList.remove("pontosSem");
      element.classList.add("pontosSem");
    });
  });
};

let required = function (message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "center",
    showConfirmButton: false,
    timer: 3100,
    timerProgressBar: true,
    inputValue: message,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({
    icon: "error",
    title: `${message}`,
  });
  return false;
};

function updateSelectOptions(unique_col_values_dict) {
  const allFilters = document.querySelectorAll(".table-filter");
  allFilters.forEach((filter_i) => {
    const col_index = filter_i.parentElement.getAttribute("col-index");
    unique_col_values_dict[col_index].sort().forEach((i) => {
      filter_i.innerHTML = filter_i.innerHTML + `\n\n<option value="${i}">${i}</option>`;
    });
  });
}

function filter_rows(tableSelect, tableId) {
  let valorTotalLista = document.getElementById("valorTotalLista");

  const allFilters = document.querySelectorAll(tableSelect);
  const filter_value_dict = {};

  allFilters.forEach((filter_i) => {
    const col_index = filter_i.parentElement.getAttribute("col-index");
    const selectedOptions = Array.from(filter_i.selectedOptions).map((opt) => opt.value);

    // Só adiciona se houver seleções e não incluir apenas 'all'
    if (selectedOptions.length > 0 && !selectedOptions.includes("all")) {
      filter_value_dict[col_index] = selectedOptions;
    }
  });
  const rows = document.querySelectorAll(tableId + " tbody tr");

  let count = 0;
  rows.forEach((row) => {
    let display_row = true;

    for (const col_index in filter_value_dict) {
      const selected_values = filter_value_dict[col_index];
      const cell_value = row.querySelector("td:nth-child(" + col_index + ")").innerText;

      // Verifica se o valor da célula casa com pelo menos um dos selecionados
      const match = selected_values.some((value) => cell_value.includes(value));
      if (!match) {
        display_row = false;
        break;
      }
    }

    if (display_row) {
      count++;
      row.style.display = "table-row";
      row.classList.add("active");
    } else {
      row.style.display = "none";
      row.classList.remove("active");
    }
  });

  if (tableId === "#emp-table") {
    soma();
  } else {
    valorTotalLista.innerHTML = `${count} Registros`;
  }
}

function updateSelectOptionsLista(unique_col_values_dict, param) {
  const allFilters = document.querySelectorAll(param);
  allFilters.forEach((filter_i) => {
    // Limpa as opções atuais
    filter_i.innerHTML = "";

    filter_i.innerHTML += `<option value="all"></option>`;

    const col_index = filter_i.parentElement.getAttribute("col-index");
    unique_col_values_dict[col_index].sort().forEach((i) => {
      filter_i.innerHTML += `<option value="${i}">${i}</option>`;
    });
  });
}

function filter_rowsLista() {
  const filters = Array.from(document.querySelectorAll(".table-filterLista"));
  // Cria um dicionário com os filtros ativos (que não estão em "all")
  const filterValues = {};
  filters.forEach((filter) => {
    const colIndex = filter.parentElement.getAttribute("col-index");
    const value = filter.value;
    if (value !== "all") {
      filterValues[colIndex] = value;
    }
  });

  // Busca as linhas da tabela apenas uma vez
  const rows = document.querySelectorAll("#emp-tableLista tbody tr");
  rows.forEach((row) => {
    let displayRow = true;
    // Para cada coluna filtrada, verifica se o valor da célula contém o valor do filtro
    for (const colIndex in filterValues) {
      const cell = row.querySelector(`td:nth-child(${colIndex})`);
      const cellValue = cell ? cell.innerHTML : "";
      if (cellValue.indexOf(filterValues[colIndex]) === -1) {
        displayRow = false;
        break;
      }
    }
    if (displayRow) {
      row.style.display = "table-row";
      row.classList.add("activeLista");
    } else {
      row.style.display = "none";
      row.classList.remove("activeLista");
    }
  });

  somaLista();
  showLoading("none");
}

/*FIM FILTRO LISTA*/
function soma() {
  let valorTotal = document.getElementById("valorTotal");
  if (!valorTotal) {
    return;
  }
  valorTotal.innerHTML = `${document.querySelectorAll(".active").length} Registros`;
}

function somaLista() {
  let valorTotal = document.getElementById("valorTotalLista");
  if (!valorTotal) {
    return;
  }
  valorTotal.innerHTML = `${document.querySelectorAll(".activeLista").length} Registros`;
}

function filterAmbos() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("semAmbos") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}
function filterAnalista() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("semAnalista") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}
function filterGerente() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("semGerente") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}

function filterReprovado() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("reprovadoGerente") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}
function filterRose() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("emEspera") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}

function filterVisible() {
  let lines = document.querySelectorAll("tr");
  for (let index = 0; index < lines.length; index++) {
    if (
      !lines[index].classList.contains("avaliado") &&
      !lines[index].classList.contains("ocult") &&
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "none";
      lines[index].classList.add("ocult");
      lines[index].classList.remove("active");
    } else if (
      !lines[index].classList.contains("trHead") &&
      !lines[index].classList.contains("trHeadListaTR") &&
      !lines[index].classList.contains("activeLista")
    ) {
      lines[index].style.display = "table-row";
      lines[index].classList.remove("ocult");
      lines[index].classList.add("active");
    }
  }
  soma();
}

/*GLOSSARIO FILTROS LISTA*/
function filterAmbosLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("semAmbosLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
function filterAnalistaLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("semAnalistaLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
function filterGerenteLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("semGerenteLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
function filterReprovadoLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("reprovadoGerenteLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
function filterRoseLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("emEsperaLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
function filterVisibleLista() {
  let linesLista = document.querySelectorAll("tr");
  for (let index = 0; index < linesLista.length; index++) {
    if (
      !linesLista[index].classList.contains("avaliadoLista") &&
      !linesLista[index].classList.contains("ocult") &&
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "none";
      linesLista[index].classList.add("ocult");
      linesLista[index].classList.remove("activeLista");
    } else if (
      !linesLista[index].classList.contains("trHead") &&
      !linesLista[index].classList.contains("trHeadListaTR") &&
      !linesLista[index].classList.contains("active")
    ) {
      linesLista[index].style.display = "table-row";
      linesLista[index].classList.remove("ocult");
      linesLista[index].classList.add("activeLista");
    }
  }
  somaLista();
}
/*FIM GLOSSÁRIO FILTROS*/

/*ATIVA BTN LISTA */
let empTableLista = document.getElementById("emp-tableLista");
let nomeNormalLista = document.getElementsByClassName("nomeNormalLista");
function ativaBtnLista() {
  let funcao = document.getElementById("funcao").innerText;
  let acoes = document.getElementsByClassName("action");
  if (funcao == "Função!") {
    for (let i = 0; i < acoes.length; i++) {
      acoes[i].classList.add("acoes");
      empTable.classList.remove("consulta");
      empTable.classList.add("consultaComLogin");
    }
    for (let x = 0; x < nomeNormal.length; x++) {
      nomeNormal[x].classList.add("colNome");
      nomeNormal[x].classList.remove("colNomeComLogin");
    }
  }
  if (funcao == "ANALISTA!" || funcao == "GERENTE!" || funcao == "GERENTE MARCA!") {
    for (let i = 0; i < acoes.length; i++) {
      acoes[i].classList.remove("acoes");
      empTable.classList.add("consulta");
      empTable.classList.remove("consultaComLogin");
    }
    for (let x = 0; x < nomeNormal.length; x++) {
      nomeNormal[x].classList.remove("colNome");
      nomeNormal[x].classList.add("colNomeComLogin");
    }
  }
}

/*ATIVA BTN*/
let empTable = document.getElementById("emp-table");
let nomeNormal = document.getElementsByClassName("nomeNormal");
function ativaBtn() {
  let funcao = document.getElementById("funcao").innerText;
  let acoes = document.getElementsByClassName("action");
  if (funcao == "Função!") {
    for (let i = 0; i < acoes.length; i++) {
      acoes[i].classList.add("acoes");
      empTable.classList.remove("consulta");
      empTable.classList.add("consultaComLogin");
    }
    for (let x = 0; x < nomeNormal.length; x++) {
      nomeNormal[x].classList.add("colNome");
      nomeNormal[x].classList.remove("colNomeComLogin");
    }
  }
  if (funcao == "ANALISTA!") {
    document.getElementById("avaliacaoMensal").innerHTML = `${sessionStorage.getItem(
      "avaliacao_mensal"
    )} <strong class="text-success fs-6">Avaliações</strong> <br>`;
  }
  if (funcao == "ANALISTA!" || funcao == "GERENTE!" || funcao == "GERENTE MARCA!") {
    for (let i = 0; i < acoes.length; i++) {
      acoes[i].classList.remove("acoes");
      empTable.classList.add("consulta");
      empTable.classList.remove("consultaComLogin");
    }
    for (let x = 0; x < nomeNormal.length; x++) {
      nomeNormal[x].classList.remove("colNome");
      nomeNormal[x].classList.add("colNomeComLogin");
    }
  }
}

function dadosFiltroLista() {
  const anoLista = document.getElementById("anoLista");
  const mesLista = document.getElementById("mesLista");

  const selectedYear = parseInt(anoLista.value);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const previousSelectedMes = mesLista.value;
  let opcoes = ``;

  if (isNaN(selectedYear)) {
    mesLista.innerHTML = opcoes;
    return;
  }

  // Se o ano for inferior ao atual, retorna todos os meses
  if (selectedYear < currentYear) {
    for (let m = 0; m <= 11; m++) {
      opcoes += `<option value="${m}">${meses[m]}</option>`;
    }
  } else if (selectedYear === currentYear) {
    // Ano atual: retorna somente os meses até o mês corrente
    for (let m = 0; m <= currentMonth; m++) {
      opcoes += `<option value="${m}">${meses[m]}</option>`;
    }
  }

  mesLista.innerHTML = opcoes;

  mesLista.value = previousSelectedMes;
}

// Atualiza os meses sempre que o ano for alterado
document.getElementById("anoLista").addEventListener("change", dadosFiltroLista);

function busc() {
  let tbodyL = document.getElementById("tbodyLista");
  tbodyL.innerText = "";
  listaTableLista();
}
