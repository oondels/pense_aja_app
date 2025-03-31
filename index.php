<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=0.7, user-scalable=no">
  <link rel="manifest" href="./manifest.json">
  <link rel="stylesheet" href="./bootstrap/icons/font/bootstrap-icons.css">
  <link rel="stylesheet" type="text/css" href="assets/css/layout.css">
  <link rel="stylesheet" href="./bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="./assets/css/sweetalert2.min.css">
  <link rel="stylesheet" href="./assets/css/modal.css">
  <link rel="stylesheet" href="./assets/css/email.css">
  <link rel="stylesheet" href="./assets/css/unidade-dass.css">
  <link rel="stylesheet" href="./assets/css/main.css">
  <link rel="stylesheet" href="./assets/css/new.css">
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="./assets/js/sweetalert2.all.min.js"></script>

  <title>Pense&Aja</title>
</head>

<body onload="listaTable()">
  <header>
    <!-- Itens Menu Principal -->
    <div class="banner-wrapper">
      <div class="banner-container">
        <div class="banner-left">
          <div class="logo-container">
            <div class="logo-circle">
              <img src="./assets/img/lampada.png" alt="ideia" class="logo-img">
            </div>
          </div>

          <div class="banner-titles">
            <h1 class="main-title">Pense <span class="highlight">&</span> Aja</h1>
            <p class="tagline">Transformando ideias em <span class="highlight-text">ações</span></p>
            <div class="current-month">
              <span class="month-label">Mês atual: </span>
              <span id="mes" class="month-value"></span>
            </div>
          </div>
        </div>
        <div class="banner-right">
          <div class="button-group">
            <button id="openLoja" class="action-button" data-bs-toggle="tooltip" data-bs-placement="top"
              data-bs-custom-class="custom-tooltip" data-bs-title="CONSULTAR PONTOS E RETIRAR BRINDES">
              <div class="button-icon-container">
                <img src="./assets/img/icons/store.png" alt="loja" class="button-icon">
              </div>
              <span class="button-label">Loja</span>
            </button>

            <button id="openLista" class="action-button" onclick="obtemAnoAtualEMesAnterior()" data-bs-toggle="tooltip"
              data-bs-placement="bottom" data-custom-class="custom-tooltip" title="LISTAR PENSE E AJA ANTERIORES">
              <div class="button-icon-container">
                <img src="./assets/img/lista.png" alt="lista" class="button-icon">
              </div>
              <span class="button-label">Listagem</span>
            </button>

            <button id="openMenu" class="action-button" data-bs-toggle="tooltip" data-bs-placement="bottom"
              data-bs-custom-class="custom-tooltip" title="CADASTRAR PENSE E AJA">
              <div class="button-icon-container">
                <img src="./assets/img/icons/idea-off.png" alt="ideiaoff" class="button-icon">
              </div>
              <span class="button-label">Cadastrar</span>
            </button>

            <button id="openUser" class="action-button" data-bs-toggle="tooltip" data-bs-placement="bottom"
              data-bs-custom-class="custom-tooltip" title="LOGIN">
              <div class="button-icon-container">
                <!-- <img src="./assets/img/user.png" alt="user" class="button-icon"> -->
                <img src="./assets/img/icons/login.png" alt="user" class="button-icon">
              </div>
              <span class="button-label">Login</span>
            </button>
          </div>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <nav id="loja" class="loja">
      <div class="container-fluid itemsLoja text-center text-white font-weight-bold">
        <span>Pontuação sujeita a mudança após avaliação do gerente</span>
        <div class="col-12 d-flex justify-content-between mb-2">
          <div id="divLojaMatricula" class="col-4 d-flex">
            <input type="number" class="me-2 text-center rounded" placeholder="Matrícula" id="lojaMatricula">
            <i id="pesqLoja" class="fs-2 bi bi-search text-white"></i>
          </div>
          <div class="col-4">
            <p id="pontosLoja" class="fs-2"></p>
          </div>
          <div class="col-4 text-end">
            <i id="closeLoja" class="bi bi-x-circle-fill text-danger fs-2 cursor-pointer"></i>
          </div>
        </div>

        <div class="d-none">
          <span id="nomeLoja" class="nomeLoja">Nome: </span>
          <span id="setorLoja" class="setorLoja">Setor: </span>
          <span id="gerenteLoja" class="gerenteLoja">Gerente: </span>
          <span id="liderLoja" class="liderLoja">Líder: </span>
        </div>

        <div class="divItensLoja col-12">
          <div id="divSuperior" class="col-12 h-50 d-flex justify-content-between px-3 pt-3">
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="10" data-text="bloco de notas">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/bloco.png" alt="Bloco de Notas" data-value="10">
              </div>
              <div class="container">
                <p>BLOCO DE NOTAS</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="20" data-text="necessaire">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/bolsa.png" alt="Necessaire" data-value="20">
              </div>
              <div class="container">
                <p>NECESSAIRE</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="30" data-text="camisa">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/camisa.png" alt="Camisa" data-value="30">
              </div>
              <div class="container">
                <p>CAMISA</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="15" data-text="caneca">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/caneca.png" alt="Caneca" data-value="15">
              </div>
              <div class="container">
                <p>CANECA</p>
              </div>
            </div>
          </div>

          <div id="divInferior" class="col-12 h-50 d-flex justify-content-between px-3">
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="4" data-text="caneta">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/caneta.png" alt="Caneta" data-value="4">
              </div>
              <div class="container">
                <p>CANETA</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="5" data-text="chaveiro">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/chaveiro.png" alt="Chaveiro" data-value="5">
              </div>
              <div class="container">
                <p>CHAVEIRO</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="10" data-text="copo">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/copo.png" alt="Copo" data-value="10">
              </div>
              <div class="container">
                <p>COPO</p>
              </div>
            </div>
            <div class="polaroid pontosSEM col-3 d-flex justify-content-between flex-column align-items-center"
              data-value="40" data-text="tenis">
              <div class="d-flex justify-content-center align-items-center w-100 h-100">
                <img width="180" src="./assets/img/tenis.png" alt="Tênis" data-value="40">
              </div>
              <div class="container">
                <p>TÊNIS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <nav id="lista">
      <div class="navHeaderLista col-12">
        <div class="col-4 d-flex ">
          <div id="divMesLista" class="divMesLista text-center">
            <h6 class="fs-6 m-0 text-white">MÊS:</h6>
            <select name="mesLista" id="mesLista" onchange="busc()"></select>
          </div>
          <div id="divAnoLista" class="divAnoLista text-center">
            <h6 class="fs-6 m-0 text-white">ANO:</h6>
            <select name="anoLista" id="anoLista" onchange="busc()">
            </select>
          </div>
        </div>
        <div id="totalLista" class="totalLista col-4 ">
          <span id="valorTotalLista" class="valorTotal"></span>
        </div>
        <div class="col-4 text-end pe-2 ">
          <i id="closeLista" class="bi bi-x-circle-fill text-danger fs-2 cursor-pointer"></i>
        </div>
      </div>
      <div class="divGlossarioLista">
        <div class="coresGlossarioLista">
          <button id="exemploVermelho" class="exemploVermelho" onclick="filterReprovadoLista()"></button>
          <label for="exemploVermelho" class="labelVermelho">Reprovado</label>
        </div>
        <div class="coresGlossarioLista">
          <button id="exemploRoxo" class="exemploRoxo" onclick="filterAmbosLista()"></button>
          <label for="exemploRoxo" class="labelRoxo">Sem análises</label>
        </div>
        <div class="coresGlossarioLista">
          <button id="exemploLaranja" class="exemploLaranja" onclick="filterGerenteLista()"></button>
          <label for="exemploLaranja" class="labelLaranja">Visto pelo analista</label>
        </div>
        <div class="coresGlossarioLista">
          <button id="exemploAzul" class="exemploAzul" onclick="filterAnalistaLista()"></button>
          <label for="exemploAzul" class="labelAzul">Visto pelo gerente</label>
        </div>
        <div class="coresGlossarioLista">
          <button id="exemploBranco" class="exemploBranco" onclick="filterVisibleLista()"></button>
          <label for="exemploBranco" class="labelBranco">Aprovado</label>
        </div>
        <div class="coresGlossarioLista">
          <button id="exemploRose" class="exemploRose" onclick="filterRoseLista()"></button>
          <label for="exemploRose" class="labelRose">Em Espera</label>
        </div>
      </div>
      <div class="divTableLista">
        <table class="consulta" id="emp-tableLista">
          <thead id="headTheadLista">
            <tr id="headConsultaLista" class="trHeadListaTR">
              <th class="subtitles celulaLista colMenor thID">ID</th>
              <th class="subtitles text-center celulaLista colMaior" col-index=1>Realizado</th>
              <th class="ocult" col-index=2>Fábrica
                <select class="table-filterLista col colMai" autocomplete="off" id="fabricaSel" name="fabricaSel"
                  data-el="2" onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista nomeNormal colNome" col-index=3>Nome
                <select class="table-filterLista col colMaiX" autocomplete="off" id="nomeSel" name="nomeSel" data-el="3"
                  onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX" col-index=4>Setor
                <select class="table-filterLista col colMaiX" autocomplete="off" id="setorSel" name="setorSel"
                  data-el="4" onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX" col-index=5>Gerente
                <select class="table-filterLista col colMaiX" autocomplete="off" id="gerenteSel" name="gerenteSel"
                  data-el="5" onchange="filter_rowsLista()">
                  <option value="" id="selecionadoLista"></option>
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX print" col-index=6>Nome do projeto
                <select class="table-filterLista col colMaiX" autocomplete="off" id="projetoSel" name="projetoSel"
                  data-el="6" onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaior" col-index=7>Turno
                <select class="table-filterLista col colMai" autocomplete="off" id="turnoSel" name="turnoSel"
                  data-el="7" onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="action subtitles text-center celulaLista colMaior acoes">Ações
              </th>
            </tr>
          </thead>
          <tbody id="tbodyLista">
          </tbody>
        </table>
      </div>
      <div id="loading-overlay">
        <div id="loading-spinner"></div>
      </div>
    </nav>
    <nav id="menu">
      <div class="navConteudo container-fluid border">
        <div class="col-12 text-end">
          <i id="closeMenu" class="bi bi-x-circle-fill text-danger fs-2 cursor-pointer"></i>
        </div>

        <form id="cadastroForm">
          <div id="dadosColaborador" class="inputSmall"></div>
          <div id="cabProjeto" class="cabProjeto"></div>
          <div class="insereDados">
            <div id="sitAnterior" class="sitAnterior"></div>
            <div id="sitAtual" class="sitAtual"></div>
          </div>
          <div id="elimPerda" class="elimPerda"></div>
          <div class="col-12 d-flex opcionais mb-2">
            <div id="amortizacao" class="labelSmall col-6 d-flex justify-content-center flex-column"></div>
            <div id="outrosGanhos" class="labelSmall col-6 d-flex justify-content-center flex-column"></div>
          </div>
          <div id="saveCad"></div>
          <div class="codigoInput" id="codigoInput"></div>
          <input type="text" id="fabrica" class="ocult">
        </form>
      </div>
    </nav>
    <nav id="login">
      <img src="./assets/img/semFundo.png" class="imgFundo" alt="Pense">
      <div class="navHeader" class="flex-row-reverse">
        <button id="closeUser"><img src="./assets/img/userC.png" alt="userC" width="50" height="50"></button>
      </div>
      <div class="navConteudo container-fluid mt-4">
        <div id="container" class="row align-items-center">
          <div id="subContainer" class="col-md-10 mx-auto col-lg-5">
            <form id="loginForm" class="p-4 p-md-5 border rounded-3">
              <div id="user" class="form-floating mb-3"></div>
              <div id="pass" class="form-floating mb-3"></div>
              <div id="save"></div>
            </form>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <main>
    <section class="text-center">
      <div class="principal">
        <!-- Filtros Status -->
        <div class="divGlossario">
          <div class="coresGlossario">
            <button id="exemploVermelho" class="exemploVermelho" onclick="filterReprovado();"></button>
            <label for="exemploVermelho" class="labelVermelho">Reprovado</label>
          </div>
          <div class="coresGlossario">
            <button id="exemploRoxo" class="exemploRoxo" onclick="filterAmbos();"></button>
            <label for="exemploRoxo" class="labelRoxo">Sem análises</label>
          </div>
          <div class="coresGlossario">
            <button id="exemploLaranja" class="exemploLaranja" onclick="filterGerente();"></button>
            <label for="exemploLaranja" class="labelLaranja">Visto pelo analista</label>
          </div>
          <div class="coresGlossario">
            <button id="exemploAzul" class="exemploAzul" onclick="filterAnalista();"></button>
            <label for="exemploAzul" class="labelAzul">Visto pelo gerente</label>
          </div>
          <div class="coresGlossario">
            <button id="exemploBranco" class="exemploBranco" onclick="filterVisible();"></button>
            <label for="exemploBranco" class="labelBranco">Aprovado</label>
          </div>
          <div class="coresGlossario">
            <button id="exemploRose" class="exemploRose" onclick="filterRose()"></button>
            <label for="exemploRose" class="labelRose">Em Espera</label>
          </div>
        </div>

        <!-- Tabela -->
        <div class="divTable">
          <table class="consulta" id="emp-table">
            <thead id="headThead">
              <tr id="headConsulta" class="trHead">
                <th class="subtitles celula colMenor thID">ID</th>
                <th class="subtitles celula colMaior" col-index=1>Realizado</th>
                <th class="ocult" col-index=2>Fábrica
                  <select class="table-filter col colMai" autocomplete="off" id="realizadoSelLista"
                    name="realizadoSelLista" data-el="2" onchange="filter_rows()">
                    <option value="all"></option>
                  </select>
                </th>
                <th class="subtitles celula nomeNormal colNome" col-index=3>Nome
                  <select class="table-filter col colMaiX" autocomplete="off" id="nomeSelLista" name="nomeSelLista"
                    data-el="3" onchange="filter_rows()">
                    <option value="all"></option>
                  </select>
                </th>
                <th class="subtitles celula colMaiorX" col-index=4>Setor
                  <select class="table-filter col colMaiX" autocomplete="off" id="setorSelLista" name="setorSelLista"
                    data-el="4" onchange="filter_rows()">
                    <option value="all"></option>
                  </select>
                </th>
                <th class="subtitles celula colMaiorX" col-index=5>Gerente
                  <select class="table-filter col colMaiX" autocomplete="off" id="gerenteSelLista"
                    name="gerenteSelLista" data-el="5" onchange="filter_rows()">
                    <option value="" id="selecionado"></option>
                    <option value="all"></option>
                  </select>
                </th>
                <th class="subtitles celula colMaiorX print" col-index=6>Nome do projeto
                  <select class="table-filter col colMaiX" autocomplete="off" id="projetoSelLista"
                    name="projetoSelLista" data-el="6" onchange="filter_rows()">
                    <option value="all"></option>
                  </select>
                </th>
                <th class="subtitles celula colMaior" col-index=7>Turno
                  <select class="table-filter col colMai" autocomplete="off" id="turnoSelLista" name="turnoSelLista"
                    data-el="7" onchange="filter_rows()">
                    <option value="all"></option>
                  </select>
                </th>
                <th class="action subtitles celula colMaior acoes">Ações
                </th>
              </tr>
            </thead>
            <tbody id="tbody">
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-xl modal-dialog modal-dialog-scrollable modal-fullscreen-lg-down modalBack">
          <div class="modal-content modalForm">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body mBody">
              <div class="dadosCadastrante">
                <div id="colaborador" class="row text-start colaborador">
                  <div class="divisaoColaborador">
                    <span id="matriculaModal" class="rowW"></span>
                    <span id="nomeModal" class="rowW"></span>
                  </div>
                  <div class="divisaoColaborador">
                    <span id="setorModal" class="rowW"></span>
                    <span id="liderModal" class="rowW"></span>
                  </div>
                  <div class="divisaoColaborador">
                    <span id="turnoModal" class="rowW"></span>
                    <span id="dataModal" class="rowW"></span>
                  </div>
                </div>
                <div id="projeto" class="row text-start">
                  <div class="divisaoSituacao">
                    <span id="anteriorModal" class="rowW"></span>
                    <span id="atualModal" class="rowW"></span>
                  </div>
                  <div class="divisaoAmais">
                    <span id="elimPerdaModal" class="rowW"></span>
                    <span id="amortizacaoModal" class="rowW"></span>
                    <span id="outGanhosModal" class="rowW"></span>
                  </div>
                </div>
              </div>
              <hr>
              <div id="avaliadores" class="avaliadores">
                <span id="gerAprovador" class="gerAprovador"></span>
                <span id="anaAprovador" class="anaAprovador"></span>
              </div>
              <div id="avaliacao" class="avaliacao">
                <span id="id" class="d-none"></span>
                <span id="status_gerente" class="d-none"></span>
                <span id="status_analista" class="d-none"></span>
                <div class="avaliacaoInterior">
                  <div class="classificacao">
                    <h5 id="lblclass" class="lblclass">CLASSIFICAÇÃO</h5>
                    <div id="subClassificacao" class="subClassificacao">
                      <div id="classificacaoA" class="classificacaoA">
                        <label for="a"><i>(A)</i></label>&nbsp;
                        <input type='radio' id="a" class="radio" name='op' value='a'>
                      </div>
                      <div id="classificacaoB" class="classificacaoB">
                        <label for="b"><i>(B)</i></label>&nbsp;
                        <input type='radio' id="b" class="radio" name='op' value='b'>
                      </div>
                      <div id="classificacaoC" class="classificacaoC">
                        <label for="c"><i>(C)</i></label>&nbsp;
                        <input type='radio' id="c" class="radio" name='op' value='c'>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="avaliacaoInterior">
                  <div id="a3Mae" class="a3Mae">
                    <h5>A3 Mãe</h5>
                    <select name="a3_mae" id="a3_mae" class="a3_mae form-select form-select-lg">
                      <option value="" id="escolha">Selecione</option>
                      <option value="lean">LEAN</option>
                      <option value="pessoas">PESSOAS</option>
                      <option value="digitalizacao">DIGITALIZAÇÃO</option>
                      <option value="produtividade">PRODUTIVIDADE</option>
                      <option value="padronizacao">PADRONIZAÇÃO</option>
                      <option value="comunicacao">COMUNICAÇÃO</option>
                      <option value="comunicacao">SSMA</option>
                      <option value="comunicacao">ORÇAMENTO</option>
                      <option value="comunicacao">QUALIDADE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div id="flag" class="flag">
                <div id="flagEsperar" class="flagEsperar">
                  <label for="esperar">Em Espera
                    <input type="checkbox" name="esperar" id="esperar">
                  </label>
                </div>
                <div id="flagReplicar" class="flagReplicar">
                  <label for="replicar">Replicável
                    <input type="checkbox" name="replicar" id="replicar">
                  </label>
                </div>
              </div>
              <button type="button" id="aprovar" class="btn btn-outline-success">Aprovar</button>
              <button type="button" id="reprovar" class="btn btn-outline-danger">Reprovar</button>
              <button type="button" id="excluir" class="btn btn-outline-warning">Excluir</button>
              <button type="button" id="btnClose" class="btn btn-outline-secondary"
                data-bs-dismiss="modal">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="unidade-dass">
      <div class="unidade-popup-overlay"></div>
      <div class="unidade-popup">
        <div class="unidade-popup-content">
          <div class="unidade-popup-header">
            <div class="unidade-popup-icon">
              <img src="./assets/img/dass.png"></img>
            </div>
            <h3>Bem-vindo ao Sistema Pense & Aja!</h3>
          </div>
          <div class="unidade-popup-body">
            <p>Para prosseguirmos, por favor informe sua matrícula para identificarmos sua unidade Dass.</p>
            <div class="unidade-input-container">
              <input type="number" id="unidade-input" placeholder="Sua matrícula">
              <div class="unidade-validation-message"></div>
            </div>
          </div>
          <div class="unidade-popup-footer">
            <button class="unidade-popup-button primary" id="unidade-submit">
              <span>Continuar</span>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="email-colector">
      <div class="email-popup-overlay"></div>
      <div class="email-popup">
        <div class="email-popup-content">
          <div class="email-popup-header">
            <div class="email-popup-icon">
              <!-- <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,8l-8,5L4,8V6l8,5l8-5V8z"/>
              </svg> -->
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M12,22c1.1,0,2-0.9,2-2h-4C10,21.1,10.9,22,12,22z M18,16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-0.83-0.67-1.5-1.5-1.5 S10.5,3.17,10.5,4v0.68C7.63,5.36,6,7.92,6,11v5l-2,2v1h16v-1L18,16z" />
              </svg>
            </div>
            <h3>Mantenha-se conectado</h3>
            <button class="email-popup-close">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>

              </svg>
            </button>
          </div>
          <div class="email-popup-body">
            <p>Deseja receber notificações sobre o sistema Pense&Aja?</p>
            <div class="email-input-container">
              <input type="email" id="email-input" placeholder="Seu email">
              <div class="email-validation-message"></div>
            </div>
          </div>
          <div class="email-popup-footer">
            <button class="email-popup-button secondary" id="email-skip">Agora não</button>
            <button class="email-popup-button danger" id="email-no-email">Não tenho email!</button>
            <button class="email-popup-button primary" id="email-submit">Continuar</button>
          </div>
          <div class="email-popup-copyright">
            <div>
              <span>Dass - SEST</span> &copy; <span id="email-copyright-year"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-cdata hidden">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-core"></div>
        <div class="spinner-text">
          <span>C</span>
          <span>A</span>
          <span>R</span>
          <span>R</span>
          <span>E</span>
          <span>G</span>
          <span>A</span>
          <span>N</span>
          <span>D</span>
          <span>O</span>
        </div>
      </div>
    </div>
  </main>

  <footer class="footer h6">
    <p class="copy_right">
      <span>Desenvolvido por DASS SEST</span> &copy;
      <span class="copy_right_ano">
        <script>
          const date = new Date();
          document.querySelector('.copy_right_ano').innerText = date.getFullYear();
        </script>
      </span>
      </span>
    </p>
  </footer>

  <script src="assets/js/jquery.min.js"></script>
  <script src="assets/js/script.js"></script>
  <script src="assets/js/socket.js"></script>
  <script src="assets/js/loja.js"></script>
  <script src="assets/js/index.js" type="module"></script>
  <script src="assets/js/email.js" type="module"></script>
  <script src="assets/js/unidade-dass.js" type="module"></script>
  <script src="bootstrap/js/bootstrap.bundle.min.js"></script>
  <script>
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  </script>
</body>

</html>
