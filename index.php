<!DOCTYPE html>
<html lang="pt-br">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=0.7, user-scalable=no">
  <link rel="manifest" href="./manifest.json">
  <link rel="icon" href="./assets/img/favicon.ico" type="image/x-icon">
  <link rel="stylesheet" href="./bootstrap/icons/font/bootstrap-icons.css">
  <link rel="stylesheet" type="text/css" href="assets/css/layout.css">
  <link rel="stylesheet" href="./bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="./assets/css/sweetalert2.min.css">
  <link rel="stylesheet" href="./assets/css/modal.css">
  <link rel="stylesheet" href="./assets/css/email.css">
  <link rel="stylesheet" href="./assets/css/unidade-dass.css">
  <link rel="stylesheet" href="./assets/css/main.css">
  <link rel="stylesheet" href="./assets/css/new.css">
  <link rel="stylesheet" href="./assets/css/table.css">
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
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
              <img src="./assets/img/icons/dass-penseaja.png" alt="Logo Dass" class="logo-img">
            </div>
          </div>

          <div class="banner-titles">
            <h1 class="main-title">Pense <span class="highlight">&</span> Aja</h1>
            <p class="tagline">Transformando ideias em <span class="highlight-text">ações</span></p>
            <div class="current-month">
              <span class="month-label">Mês atual: </span>
              <span id="mes" class="month-value"></span>
            </div>

            <div class="col-3 d-flex align-items-center">
              <span id="usuario" class="usuario"></span>
              <span id="nome" class="nome"></span>
              <span id="funcao" class="funcao">\</span>
              <span id="avaliacaoMensal" class="valorTotal"></span>
              <span id="valorTotal" class="valorTotal"></span>
            </div>
          </div>
        </div>

        <div class="banner-right">
          <div class="button-group">
            <button id="openLoja" class="action-button">
              <div class="button-icon-container">
                <img src="./assets/img/icons/store.png" alt="loja" class="button-icon">
              </div>
              <span class="button-label">Loja</span>
            </button>

            <button id="openLista" class="action-button" onclick="obtemAnoAtualEMesAnterior()">
              <div class="button-icon-container">
                <img src="./assets/img/lista.png" alt="lista" class="button-icon">
              </div>
              <span class="button-label">Listagem</span>
            </button>

            <button id="openMenu" class="action-button">
              <div class="button-icon-container">
                <img
                  id="imgPenseAja"
                  src="./assets/img/icons/idea-off.png"
                  alt="ideiaoff"
                  class="button-icon"
                  data-src-normal="./assets/img/icons/idea-off.png"
                  data-src-hover="./assets/img/icons/idea-on.png">
              </div>
              <span class="button-label">Cadastrar</span>
            </button>

            <button id="openUser" class="action-button">
              <div class="button-icon-container">
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

    <nav id="menu">
      <div class="navConteudo container-fluid border">
        <div class="col-12 text-end">
          <span id="closeMenu" class="bi bi-x-circle-fill text-danger fs-2 cursor-pointer"></span>
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
  </header>

  <main>
    <section class="text-center">
      <div class="principal">
        <!-- Filtros Status -->
        <div class="divGlossario">
          <div class="coresGlossario" onclick="filterTable('reprovadoGerente', event, '#emp-table');" data-count="12">
            <button id="exemploVermelho" class="exemploVermelho" aria-label="Filtrar itens reprovados"></button>
            Reprovado
          </div>

          <div class="coresGlossario" onclick="filterTable('semAmbos', event, '#emp-table');" data-count="8">
            <button id="exemploRoxo" class="exemploRoxo" aria-label="Filtrar itens sem análises"></button>
            Sem análises
          </div>

          <div class="coresGlossario" onclick="filterTable('semGerente', event, '#emp-table');" data-count="5">
            <button id="exemploLaranja" class="exemploLaranja" aria-label="Filtrar itens vistos pelo analista"></button>
            Visto pelo analista
          </div>

          <div class="coresGlossario" onclick="filterTable('semAnalista', event, '#emp-table');" data-count="3">
            <button id="exemploAzul" class="exemploAzul" aria-label="Filtrar itens vistos pelo gerente"></button>
            Visto pelo gerente
          </div>

          <div class="coresGlossario" onclick="filterTable('avaliado', event, '#emp-table');" data-count="28">
            <button id="exemploBranco" class="exemploBranco" aria-label="Filtrar itens aprovados"></button>
            Aprovado
          </div>

          <div class="coresGlossario" onclick="filterTable('emEspera', event, '#emp-table');" data-count="2">
            <button id="exemploRose" class="exemploRose" aria-label="Filtrar itens em espera"></button>
            Em Espera
          </div>
        </div>

        <!-- Tabela -->
        <div style="display: flex; justify-content: center;">
          <div class="divTable">
            <table class="consulta" id="emp-table">
              <thead id="headThead">
                <tr id="headConsulta" class="trHead">
                  <th class="subtitles celula colMenor thID">ID</th>
                  <th class="subtitles celula colMaior" col-index=1>Realizado</th>
                  <th class="subtitles celula nomeNormal colNome" col-index=3>Nome
                    <select class="table-filter select-modern col colMaiX" autocomplete="off" id="nomeSelLista" name="nomeSelLista" data-el="3" onchange="filter_rows('.table-filter', '#emp-table')" multiple>
                      <option value="all"></option>
                    </select>
                  </th>
                  <th class="subtitles celula colMaiorX" col-index=4>Setor
                    <select class="table-filter select-modern col colMaiX" autocomplete="off" id="setorSelLista" name="setorSelLista"
                      data-el="4" onchange="filter_rows('.table-filter', '#emp-table')" multiple>
                      <option value="all"></option>
                    </select>
                  </th>

                  <th class="subtitles celula colMaiorX" col-index=5>Gerente
                    <select class="table-filter select-modern col colMaiX" autocomplete="off" id="gerenteSelLista"
                      name="gerenteSelLista" data-el="5" onchange="filter_rows('multiple')" multiple>
                      <option value="" id="selecionado"></option>
                      <option value="all"></option>
                    </select>
                  </th>

                  <th class="subtitles celula colMaiorX print" col-index=6>Nome do projeto
                    <select class="table-filter select-modern col colMaiX" autocomplete="off" id="projetoSelLista"
                      name="projetoSelLista" data-el="6" onchange="filter_rows('.table-filter', '#emp-table')" multiple>
                      <option value="all"></option>
                    </select>
                  </th>
                  <th class="subtitles celula colMaior" col-index=7>Turno
                    <select class="table-filter select-modern col colMai" autocomplete="off" id="turnoSelLista" name="turnoSelLista"
                      data-el="7" onchange="filter_rows('.table-filter', '#emp-table')" multiple>
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
      </div>

      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-xl modal-dialog modal-dialog-scrollable modal-fullscreen-lg-down modalBack">
          <div class="modal-content modalForm">
            <div class="modal-header">
              <h5 class="modal-title" id="staticBackdropLabel"></h5>

              <button type="button" id="btnClose" class="btn-close"
                data-bs-dismiss="modal"><i class="bi bi-x"></i>
              </button>
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

    <!-- Login -->
    <div id="login-popup" class="login-popup hidden">
      <div class="login-overlay"></div>
      <div class="login-container">
        <div class="login-header">
          <div class="unidade-popup-icon login-imagem">
            <img src="./assets/img/dass.png"></img>
          </div>
          <h2>Login</h2>
          <button class="login-close" id="login-close">&times;</button>
        </div>

        <div class="login-form">
          <div class="login-field">
            <label for="login-user">Usuário</label>
            <div class="input-with-icon">
              <span class="bi bi-person-fill input-icon"></span>
              <input type="text" id="login-user" name="user" placeholder="Digite seu usuário">
            </div>
          </div>
          <div class="login-field">
            <label for="login-password">Senha</label>
            <div class="input-with-icon">
              <span class="bi bi-lock-fill input-icon"></span>
              <input type="password" id="login-password" name="password" placeholder="Digite sua senha">
              <span class="bi bi-eye-slash toggle-password" id="toggle-password"></span>
            </div>
            <div class="warning-container">
              <span class="warning-content hidden">Dados ausentes!</span>
            </div>
          </div>
          <div class="login-extra">
            <a href="#" class="forgot-password">Esqueci minha senha</a>
          </div>
          <div class="login-actions">
            <button class="login-btn">
              <span class="btn-text">Entrar</span>
              <span class="spinner hidden"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <div id="logout-popup" class="login-popup hidden">
      <div class="login-overlay"></div>
      <div class="login-container">
        <div class="login-header">
          <div class="unidade-popup-icon login-imagem">
            <img src="./assets/img/dass.png"></img>
          </div>
          <h2>Dass Pense&Aja</h2>
          <button class="login-close" id="logout-close">&times;</button>
        </div>

        <div class="login-form">
          <div class="login-field">
            <label for="login-user">Usuário: <span class="usuario-name"></span></label>
            <label for="login-user">Matrícula: <span class="user-matricula"></span></label>
          </div>

          <div class="login-actions">
            <button type="button" id="logout" class="btn btn-outline-danger">
              Sair
              <span class="spinner-logout hidden"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Esqueci minha senha -->
    <div class="forgot-container hidden">
      <div class="forgot-header">
        <h2>Recuperar Senha</h2>
        <button class="forgot-close" id="forgot-close">&times;</button>
      </div>

      <div class="forgot-form">
        <div class="forgot-field">
          <label for="forgot-matricula">Matrícula</label>
          <div class="input-with-icon">
            <span class="bi bi-person-fill input-icon"></span>
            <input type="number" id="forgot-matricula" name="matricula" placeholder="Digite sua matrícula">
          </div>
        </div>

        <div class="forgot-field">
          <label for="forgot-unidade">Unidade Dass</label>
          <div class="input-with-icon">
            <span class="bi bi-building input-icon"></span>
            <input type="text" id="forgot-unidade" name="unidade" placeholder="Digite sua Unidade Dass">
          </div>
        </div>

        <div class="forgot-field">
          <label for="forgot-codbarra">Código de Barras</label>
          <div class="input-with-icon">
            <span class="bi bi-upc-scan input-icon"></span>
            <input type="number" id="forgot-codbarra" name="codbarra" placeholder="Digite o código de barras">
          </div>
        </div>

        <div class="forgot-field">
          <label for="forgot-password">Nova Senha</label>
          <div class="input-with-icon">
            <span class="bi bi-lock-fill input-icon"></span>
            <input type="password" id="forgot-password" name="password" placeholder="Digite a nova senha">
            <span class="bi bi-eye-slash toggle-password forgot-pass" id="forgot-toggle-password"></span>
          </div>
        </div>

        <div class="forgot-field">
          <label for="forgot-password-confirm">Repetir Senha</label>
          <div class="input-with-icon">
            <span class="bi bi-lock-fill input-icon"></span>
            <input type="password" id="forgot-password-confirm" name="confirm_password" placeholder="Repita a nova senha">
            <span class="bi bi-eye-slash toggle-password forgot-pass" id="forgot-toggle-password-confirm"></span>
          </div>
        </div>

        <div class="forgot-actions">
          <button class="forgot-btn" id="changePassButton">Redefinir Senha</button>
        </div>
      </div>
    </div>

    <div id="loja" class="loja store-container">
      <div class="store-wrapper">
        <!-- Header com gradiente animado -->
        <div class="store-header red-theme">
          <div class="header-gradient-overlay"></div>
          <div class="store-title-container">
            <div class="store-logo">
              <img src="./assets/img/icons/dass-penseaja.png" alt="Dass Pense Aja Logo">
            </div>
            <div class="store-title-content">
              <h1>Loja de Recompensas</h1>
              <span class="store-subtitle">Sistema Pense & Aja</span>
            </div>
          </div>
          <div class="store-notification">
            <div class="notification-icon">
              <i class="bi bi-exclamation-circle-fill"></i>
            </div>
            <div class="notification-content">
              <span class="notification-title">Atenção</span>
              <span class="notification-text">Pontuação sujeita a avaliação do gerente</span>
            </div>
          </div>
        </div>

        <!-- Barra de pesquisa e pontos -->
        <div class="store-search-bar">
          <div class="search-container" id="divLojaMatricula">
            <i class="bi bi-person-badge search-icon"></i>
            <input type="number" placeholder="Digite sua matrícula" id="lojaMatricula" class="search-input">
            <button class="search-button" id="pesqLoja">
              <i class="bi bi-search"></i>
              <span>Buscar</span>
            </button>
          </div>
          <div class="points-container">
            <div class="points-badge">
              <i class="bi bi-star-fill"></i>
              <span id="pontosLoja" class="points-value">0</span>
              <span class="points-label">pontos</span>
            </div>
          </div>
          <button class="close-store-button" id="closeLoja">
            <span class="bi bi-x-lg"></span>
          </button>
        </div>

        <!-- Informações do usuário (inicialmente ocultas) -->
        <div class="user-details d-none">
          <div class="user-info-card">
            <div class="user-avatar">
              <i class="bi bi-person-circle text-primary"></i>
            </div>
            <div class="user-data">
              <p id="nomeLoja" class="nomeLoja">Nome: </p>
              <p id="setorLoja" class="setorLoja">Setor: </p>
              <p id="gerenteLoja" class="gerenteLoja">Gerente: </p>
              <p id="liderLoja" class="liderLoja">Líder: </p>
            </div>
          </div>
        </div>

        <!-- Produtos -->
        <div class="store-products">
          <h2 class="products-heading">Produtos Disponíveis</h2>

          <div class="products-grid">
            <!-- Linha 1 -->
            <div class="product-card polaroid pontosSEM" data-value="10" data-text="bloco de notas">
              <div class="product-badge">10 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/bloco.png" alt="Bloco de Notas" data-value="10" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Bloco de Notas</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM" data-value="20" data-text="necessaire">
              <div class="product-badge">20 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/bolsa.png" alt="Necessaire" data-value="20" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Necessaire</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM" data-value="30" data-text="camisa">
              <div class="product-badge">30 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/camisa.png" alt="Camisa" data-value="30" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Camisa</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM" data-value="15" data-text="caneca">
              <div class="product-badge">15 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/caneca.png" alt="Caneca" data-value="15" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Caneca</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <!-- Linha 2 -->
            <div class="product-card polaroid pontosSEM" data-value="4" data-text="caneta">
              <div class="product-badge">4 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/caneta.png" alt="Caneta" data-value="4" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Caneta</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM" data-value="5" data-text="chaveiro">
              <div class="product-badge">5 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/chaveiro.png" alt="Chaveiro" data-value="5" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Chaveiro</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM" data-value="10" data-text="copo">
              <div class="product-badge">10 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/copo.png" alt="Copo" data-value="10" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Copo</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <div class="product-card polaroid pontosSEM premium-product" data-value="40" data-text="tenis">
              <div class="product-badge premium-badge">40 pts</div>
              <div class="product-image-container">
                <img src="./assets/img/tenis.png" alt="Tênis" data-value="40" class="product-image">
              </div>
              <div class="product-info">
                <h3 class="product-name">Tênis</h3>
                <button class="product-button">
                  <span>Resgatar</span>
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="lista">
      <div class="navHeaderLista col-12 nav-header-modern">
        <div class="nav-header-content">
          <div class="col-4 d-flex nav-date-filters">
            <div id="divMesLista" class="divMesLista text-center filter-container">
              <div class="filter-label">
                <i class="bi bi-calendar-month filter-icon"></i>
                <h6 class="fs-6 m-0 text-white">MÊS</h6>
              </div>
              <div class="select-wrapper">
                <select name="mesLista" id="mesLista" onchange="busc()" class="modern-select"></select>
                <i class="bi bi-chevron-down select-arrow"></i>
              </div>
            </div>
            <div id="divAnoLista" class="divAnoLista text-center filter-container">
              <div class="filter-label">
                <i class="bi bi-calendar-year filter-icon"></i>
                <h6 class="fs-6 m-0 text-white">ANO</h6>
              </div>
              <div class="select-wrapper">
                <select name="anoLista" id="anoLista" onchange="busc()" class="modern-select"></select>
                <i class="bi bi-chevron-down select-arrow"></i>
              </div>
            </div>
          </div>
          <div id="totalLista" class="totalLista col-4 stats-container">
            <div class="stats-badge">
              <i class="bi bi-file-earmark-text stats-icon"></i>
              <span id="valorTotalLista" class="valorTotal"></span>
            </div>
          </div>
          <div class="col-4 text-end pe-2 close-container">
            <button class="close-button">
              <span id="closeLista" class="bi bi-x-circle-fill text-danger fs-2 cursor-pointer"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="divGlossario">
        <div class="coresGlossario" onclick="filterTable('reprovadoGerenteLista', event, '#emp-tableLista');" data-count="12">
          <button id="exemploVermelho" class="exemploVermelho" aria-label="Filtrar itens reprovados"></button>
          Reprovado
        </div>

        <div class="coresGlossario" onclick="filterTable('semAmbosLista', event, '#emp-tableLista');" data-count="8">
          <button id="exemploRoxo" class="exemploRoxo" aria-label="Filtrar itens sem análises"></button>
          Sem análises
        </div>

        <div class="coresGlossario" onclick="filterTable('semGerenteLista', event, '#emp-tableLista');" data-count="5">
          <button id="exemploLaranja" class="exemploLaranja" aria-label="Filtrar itens vistos pelo analista"></button>
          Visto pelo analista
        </div>

        <div class="coresGlossario" onclick="filterTable('semAnalistaLista', event, '#emp-tableLista');" data-count="3">
          <button id="exemploAzul" class="exemploAzul" aria-label="Filtrar itens vistos pelo gerente"></button>
          Visto pelo gerente
        </div>

        <div class="coresGlossario" onclick="filterTable('avaliadoLista', event, '#emp-tableLista');" data-count="28">
          <button id="exemploBranco" class="exemploBranco" aria-label="Filtrar itens aprovados"></button>
          Aprovado
        </div>

        <div class="coresGlossario" onclick="filterTable('emEsperaLista', event, '#emp-tableLista');" data-count="2">
          <button id="exemploRose" class="exemploRose" aria-label="Filtrar itens em espera"></button>
          Em Espera
        </div>
      </div>

      <div class="divTableLista">
        <table class="consulta" id="emp-tableLista">
          <thead id="headTheadLista">
            <tr id="headConsultaLista" class="trHeadListaTR">
              <th class="subtitles celulaLista colMenor thID">ID</th>
              <th class="subtitles text-center celulaLista colMaior" col-index=1>Realizado</th>
              <th class="subtitles text-center celulaLista nomeNormal colNome" col-index=3>Nome
                <select class="table-filterLista select-modern col colMaiX" autocomplete="off" id="nomeSel" name="nomeSel" data-el="3"
                  onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX" col-index=4>Setor
                <select class="table-filterLista select-modern col colMaiX" autocomplete="off" id="setorSel" name="setorSel"
                  data-el="4" onchange="filter_rows('.table-filterLista', '#emp-tableLista')" multiple>
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX" col-index=5>Gerente
                <select class="table-filterLista select-modern col colMaiX" autocomplete="off" id="gerenteSel" name="gerenteSel"
                  data-el="5" onchange="filter_rowsLista()" multiple>
                  <option value="" id="selecionadoLista"></option>
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaiorX print" col-index=6>Nome do projeto
                <select class="table-filterLista select-modern col colMaiX" autocomplete="off" id="projetoSel" name="projetoSel"
                  data-el="6" onchange="filter_rowsLista()">
                  <option value="all"></option>
                </select>
              </th>
              <th class="subtitles text-center celulaLista colMaior" col-index=7>Turno
                <select class="table-filterLista select-modern col colMai" autocomplete="off" id="turnoSel" name="turnoSel"
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
    </div>

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

    <div id="notification" class="notification hidden">
      <div class="notification-inner">
        <div class="notification-icon"></div>
        <div class="notification-content">
          <h3 class="notification-title"></h3>
          <p class="notification-message"></p>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="footer-container">
      <span>Desenvolvido por <strong>DASS Santo Estêvão</strong></span>
      <span>&copy; <span class="current_copyright_year"></span> Todos os direitos reservados.</span>
    </div>
  </footer>

  <script src="assets/js/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
  <script type="module" src="assets/js/script.js"></script>
  <script src="assets/js/socket.js"></script>
  <script src="assets/js/loja.js"></script>
  <script src="assets/js/index.js" type="module"></script>
  <script src="assets/js/email.js" type="module"></script>
  <script src="assets/js/unidade-dass.js" type="module"></script>
  <script src="bootstrap/js/bootstrap.bundle.min.js"></script>
  <script>
    // Ano Copyright
    const date = new Date();
    document.querySelector('.current_copyright_year').innerText = date.getFullYear();

    $(document).ready(function() {
      $('.table-filter').select2({
        placeholder: "Selecione",
        allowClear: true,
        width: 'resolve'
      });

      $('.table-filterLista').select2({
        placeholder: "Selecione",
        allowClear: true,
        width: 'resolve'
      });
    });
  </script>
</body>

</html>
