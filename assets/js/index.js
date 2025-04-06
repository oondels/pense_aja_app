import { checkUserEmail, showEmailPopup, closeEmailPopup } from "./email.js";
import ip from "./ip.js";

// Hover animação imagem cadastrar pense aja
const penseAjaButton = document.querySelector("#openMenu");
const img = document.querySelector("#imgPenseAja");

penseAjaButton.addEventListener("mouseover", () => {
  img.src = img.dataset.srcHover;
});

penseAjaButton.addEventListener("mouseleave", () => {
  img.src = img.dataset.srcNormal;
});

// Pega mês atual e atualiza banner
const month = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];
const data = new Date();
const dia = data.getDate();
const mes = data.getMonth();
const proximo = mes + 1;
const mesElement = document.querySelector("#mes");

if (dia >= 29) {
  let nomeMes = month[proximo % 12]; // Garantindo que não ultrapasse o índice máximo
  mesElement.innerText = nomeMes;
} else {
  let nomeMes = month[mes];
  mesElement.innerText = nomeMes;
}

// Sweet Alert
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
    document.getElementById("openUser").classList.remove("d-none");
    document.getElementById("openLista").classList.remove("d-none");
    document.getElementById("openMenu").classList.remove("d-none");
    document.getElementById("openLoja").classList.remove("d-none");
    /****************************************/
    if (document.getElementById("matriculaInput")) {
      menu.style.opacity = "0";
      menu.style.right = menu.offsetWidth * -1 + "px";
      menu.removeAttribute("style");
      openMenu.removeAttribute("style");
      // document.getElementById('total').style.display = 'flex';
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
  });
};

function showNotification(title, message, type = "info", duration = 3000) {
  const notification = document.getElementById("notification");
  const iconContainer = notification.querySelector(".notification-icon");
  const titleContainer = notification.querySelector(".notification-title");
  const messageContainer = notification.querySelector(".notification-message");

  const typeMapping = {
    success: {
      icon: '<i class="bi bi-check-circle-fill"></i>',
      bg: "linear-gradient(135deg, #56ab2f, #a8e063)",
    },
    error: {
      icon: '<i class="bi bi-x-circle-fill"></i>',
      bg: "linear-gradient(135deg, #e52d27, #b31217)",
    },
    info: {
      icon: '<i class="bi bi-info-circle-fill"></i>',
      bg: "linear-gradient(135deg, #1e3c72, #2a5298)",
    },
    warning: {
      icon: '<i class="bi bi-exclamation-triangle-fill"></i>',
      bg: "linear-gradient(135deg, #f7971e, #ffd200)",
    },
  };

  const config = typeMapping[type] || typeMapping.info;

  iconContainer.innerHTML = config.icon;
  titleContainer.textContent = title;
  messageContainer.textContent = message;
  notification.style.background = config.bg;

  notification.classList.remove("hidden");
  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 500);
  }, duration);
}

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
    location.reload();
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
    location.reload();
  });
};

/*--------------------------------------*/
let errorCracha = function (message) {
  Swal.fire({
    position: "center",
    icon: "error",
    title: "Matrícula não encotrada na lista de funcionário, verifique se digitou corretamente!",
    timer: 5000,
  });
};
let required = function (message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "center",
    showConfirmButton: false,
    timer: 3000,
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
import Cadastro from "./cadastro.js";
import Login from "./login.js";
const elemLogin = new Login();
const elemCadastro = new Cadastro();

openMenu.addEventListener("click", () => {
  menu.style.display = "flex";
  menu.style.right = menu.offsetWidth * -1 + "px";
  document.getElementById("openUser").classList.add("d-none");
  document.getElementById("openLista").classList.add("d-none");
  document.getElementById("openMenu").classList.add("d-none");
  document.getElementById("openLoja").classList.add("d-none");
  setTimeout(() => {
    menu.style.opacity = "1";
    menu.style.right = "0";
    // document.getElementById('total').style.display = 'none';
    elemCadastro.adcElemento();
    document.getElementById("matriculaInput").focus();
    const digMatricula = document.getElementById("matriculaInput");
    let divInputCompleteColaborador = document.getElementById("divInputCompleteColaborador");
    let dadosColaborador = document.getElementById("dadosColaborador");
    digMatricula.addEventListener("keyup", (e) => {
      let digitoMatricula = e.target.value;
      if (digitoMatricula == "") return;
      let ini = digitoMatricula.substring(0, 3);
      let iniFila = digitoMatricula.substring(0, 4);
      if (ini == "400" || ini == "401" || ini == "402" || iniFila == "2000") {
        if (digitoMatricula.length == 7) {
          fetch("/pense_aja/server/apiBuscaCadastrante.php?matricula=" + digitoMatricula)
            .then((response) => response.json())
            .then((data) => {
              if (data.erro == false) {
                document.getElementById("nomeInput").value = data.matricula.nome;
                document.getElementById("setorInput").value = data.matricula.setor;
                document.getElementById("codigoInput").value = data.matricula.codigo;
                document.getElementById("liderInput").value =
                  data.matricula.lider != null ? data.matricula.lider : data.matricula.gerente;
                document.getElementById("gerenteInput").value = data.matricula.gerente;
                if (data.matricula.valor == null) {
                  document.getElementById("pontosColab").innerText = "0";
                } else {
                  document.getElementById(
                    "pontosColab"
                  ).innerText = `Histórico total de pontos: ${data.matricula.valor}`;
                }
                //Surgir campos de verificação
                divInputCompleteColaborador.classList.add("surgeDeCima");
                dadosColaborador.classList.remove("inputSmall");
                dadosColaborador.classList.add("dadosColaborador");
              } else {
                return required("Matrícula não encotrada na lista de funcionário, verifique se digitou corretamente!");
              }
            });
        } else {
          document.getElementById("nomeInput").value = "";
          document.getElementById("setorInput").value = "";
          document.getElementById("codigoInput").value = "";
          document.getElementById("liderInput").value = "";
          document.getElementById("gerenteInput").value = "";
          document.getElementById("pontosColab").innerText = "0";
          //Retira campos de verificação
          divInputCompleteColaborador.classList.remove("surgeDeCima");
          dadosColaborador.classList.add("inputSmall");
          dadosColaborador.classList.remove("dadosColaborador");
        }
      }
      if (digitoMatricula.length == "4") {
        fetch("/pense_aja/server/apiBuscaCadastrante.php?matricula=400" + digitoMatricula)
          .then((response) => response.json())
          .then((data) => {
            if (data.erro == false) {
              document.getElementById("nomeInput").value = data.matricula.nome;
              document.getElementById("setorInput").value = data.matricula.setor;
              document.getElementById("codigoInput").value = data.matricula.codigo;
              document.getElementById("liderInput").value =
                data.matricula.lider != null ? data.matricula.lider : data.matricula.gerente;
              document.getElementById("gerenteInput").value = data.matricula.gerente;
              if (data.matricula.valor == null) {
                document.getElementById("pontosColab").innerText = "0";
              } else {
                document.getElementById("pontosColab").innerText = data.matricula.valor;
              }
              //Surgir campos de verificação
              divInputCompleteColaborador.classList.add("surgeDeCima");
              dadosColaborador.classList.remove("inputSmall");
              dadosColaborador.classList.add("dadosColaborador");
            }
          });
      } else {
        document.getElementById("nomeInput").value = "";
        document.getElementById("setorInput").value = "";
        document.getElementById("codigoInput").value = "";
        document.getElementById("liderInput").value = "";
        document.getElementById("gerenteInput").value = "";
        document.getElementById("pontosColab").innerText = "0";
        //Retira campos de verificação
        divInputCompleteColaborador.classList.remove("surgeDeCima");
        dadosColaborador.classList.add("inputSmall");
        dadosColaborador.classList.remove("dadosColaborador");
      }
      if (digitoMatricula.length == "5") {
        fetch("/pense_aja/server/apiBuscaCadastrante.php?matricula=40" + digitoMatricula)
          .then((response) => response.json())
          .then((data) => {
            if (data.erro == false) {
              document.getElementById("nomeInput").value = data.matricula.nome;
              document.getElementById("setorInput").value = data.matricula.setor;
              document.getElementById("codigoInput").value = data.matricula.codigo;
              //console.log(data.matricula.codigo);
              document.getElementById("liderInput").value =
                data.matricula.lider != null ? data.matricula.lider : data.matricula.gerente;
              document.getElementById("gerenteInput").value = data.matricula.gerente;
              if (data.matricula.valor == null) {
                document.getElementById("pontosColab").innerText = "0";
              } else {
                document.getElementById("pontosColab").innerText = data.matricula.valor;
              }
              //Surgir campos de verificação
              divInputCompleteColaborador.classList.add("surgeDeCima");
              dadosColaborador.classList.remove("inputSmall");
              dadosColaborador.classList.add("dadosColaborador");
            }
          });
      } else {
        document.getElementById("nomeInput").value = "";
        document.getElementById("setorInput").value = "";
        document.getElementById("codigoInput").value = "";
        document.getElementById("liderInput").value = "";
        document.getElementById("gerenteInput").value = "";
        document.getElementById("pontosColab").innerText = "0";
        //Retira campos de verificação
        divInputCompleteColaborador.classList.remove("surgeDeCima");
        dadosColaborador.classList.add("inputSmall");
        dadosColaborador.classList.remove("dadosColaborador");
      }
    });
    const enviar = document.getElementById("btnLogin");
    enviar.addEventListener("click", (e) => {
      if (document.getElementById("nomeInput").value == "") {
        errorCracha();
        return false;
      }
      e.preventDefault();
      let fabrica = document.getElementById("fabrica");
      let codigoFinalFabrica = document.getElementById("codigoInput").value.split(" ")[3].substring(1);
      let codigoInicioSetor = document.getElementById("codigoInput").value.split(" ")[1];

      if (codigoInicioSetor == "20") {
        fabrica.value = codigoFinalFabrica;
      }
      if (codigoInicioSetor == "01" || codigoInicioSetor == "05") {
        fabrica.value = "Apoio";
      }
      if (codigoInicioSetor == "05" && codigoFinalFabrica == "15") {
        fabrica.value = "Aprendizes";
      }
      let setor = document.getElementById("setorInput").value;
      let turno;
      switch (setor.slice(-1)) {
        case "A":
          turno = "A";
          break;
        case "B":
          turno = "B";
          break;
        case "C":
          turno = "C";
          break;
        default:
          turno = "N";
          break;
      }
      const data = {
        matricula: document.getElementById("matriculaInput").value,
        nome: document.getElementById("nomeInput").value,
        turno: turno,
        setor: document.getElementById("setorInput").value,
        fabrica: document.getElementById("fabrica").value,
        lider: document.getElementById("liderInput").value,
        gerente: document.getElementById("gerenteInput").value,
        nomeProjeto: document.getElementById("nomeProjeto").value,
        dataProjeto: document.getElementById("dataProjeto").value,
        situacaoAnterior: document.getElementById("situacaoAnterior").value,
        situacaoAtual: document.getElementById("situacaoAtual").value,
        superProducao: document.getElementById("superProducao").checked,
        transporte: document.getElementById("transporte").checked,
        processamento: document.getElementById("processamento").checked,
        movimento: document.getElementById("movimento").checked,
        estoque: document.getElementById("estoque").checked,
        espera: document.getElementById("espera").checked,
        talento: document.getElementById("talento").checked,
        retrabalho: document.getElementById("retrabalho").checked,
        valorA: document.getElementById("valorAInput").value,
        valorB: document.getElementById("valorBInput").value,
        valorAmortizado: document.getElementById("valorAmortizadoInput").value,
        outrosGanhos: document.getElementById("outGanhos").value,
      };
      //Verificação dos inputs
      if (data.nomeProjeto == "") {
        required("Informe o nome do projeto!");
        return false;
      }
      if (data.dataProjeto == "") {
        required("Informe a data que o projeto foi realizado");
        return false;
      }
      if (data.situacaoAnterior == "") {
        required("Descreva a situação anterior!");
        return false;
      }
      if (data.situacaoAtual == "") {
        required("Descreva a situação atual!");
        return false;
      }
      fetch("/pense_aja/server/apiPostPenseAja.php", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-type": "aplication/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message == "sucess") {
            window.location.reload();
            return success("Pense & Aja cadastrado");
          } else if (data.message == "error") {
            return error("Erro ao cadastrar, verifique!");
          } else if (data.message == "existe") {
            return warning("Pense & Aja já cadastrado com esse nome para o mesmo colaborador!");
          }
        });
      e.preventDefault();
    });
    let checkAmortizaGanho = document.getElementById("checkAmortizaGanho");
    let divInputsAmortiza = document.getElementById("divInputsAmortiza");
    let amortizacao = document.getElementById("amortizacao");

    checkAmortizaGanho.addEventListener("change", function () {
      if (checkAmortizaGanho.checked) {
        divInputsAmortiza.classList.add("surgeDaEsquerda");
        amortizacao.classList.remove("labelSmall");
        amortizacao.classList.add("amortizacao");
      } else {
        divInputsAmortiza.classList.remove("surgeDaEsquerda");
        amortizacao.classList.add("labelSmall");
        amortizacao.classList.remove("amortizacao");
      }
    });
    let checkOutrosGanho = document.getElementById("checkOutrosGanho");
    let divInputsOutrosGanhos = document.getElementById("divInputsOutrosGanhos");
    let outrosGanhos = document.getElementById("outrosGanhos");

    checkOutrosGanho.addEventListener("change", function () {
      if (checkOutrosGanho.checked) {
        divInputsOutrosGanhos.classList.add("surgeDaEsquerda");
        outrosGanhos.classList.remove("labelSmall");
        outrosGanhos.classList.add("outrosGanhos");
      } else {
        divInputsOutrosGanhos.classList.remove("surgeDaEsquerda");
        outrosGanhos.classList.add("labelSmall");
        outrosGanhos.classList.remove("outrosGanhos");
      }
    });
    let valorA = document.getElementById("valorAInput");
    let valorB = document.getElementById("valorBInput");
    valorA.addEventListener("keyup", (e) => {
      let valor_a = e.target.value;
      let valor_b = valorB.value;
      let amortiza = parseFloat(valor_a) / parseFloat(valor_b);
      document.getElementById("valorAmortizadoInput").value = amortiza.toFixed(2);
    });
    valorB.addEventListener("keyup", (e) => {
      let valor_b = e.target.value;
      let valor_a = valorA.value;
      let amortiza = parseFloat(valor_a) / parseFloat(valor_b);
      document.getElementById("valorAmortizadoInput").value = amortiza.toFixed(2);
    });
  }, 10);
});
closeMenu.addEventListener("click", () => {
  menu.style.opacity = "0";
  menu.style.right = menu.offsetWidth * -1 + "px";
  document.getElementById("openUser").classList.remove("d-none");
  document.getElementById("openLista").classList.remove("d-none");
  document.getElementById("openMenu").classList.remove("d-none");
  document.getElementById("openLoja").classList.remove("d-none");
  setTimeout(() => {
    menu.removeAttribute("style");
    openMenu.removeAttribute("style");
    // document.getElementById('total').style.display = 'block';
    elemCadastro.remElemento();
    document.getElementById("pontosColab").innerText = "0";
    dadosColaborador.classList.add("inputSmall");
  }, 200);
});

// Login
const loginContainer = document.querySelector("#login-popup");
const logoutContainer = document.querySelector("#logout-popup");
const userButton = document.querySelector("#openUser");
userButton.addEventListener("click", () => {
  let container;
  const userData = sessionStorage.getItem("usuario");

  if (userData) {
    setTimeout(() => {
      document.querySelector(".usuario-name").innerHTML = userData;
      document.querySelector(".user-matricula").innerHTML = sessionStorage.getItem("matricula");
    }, 100);

    container = logoutContainer;
  } else {
    container = loginContainer;
  }

  container.classList.remove("hidden");
});

const closeLogin = document.querySelector("#login-close");
closeLogin.addEventListener("click", () => {
  loginContainer.classList.add("hidden");
});

const revealPassword = document.querySelector("#toggle-password");
revealPassword.addEventListener("click", () => {
  const passwordInput = document.querySelector("#login-password");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

// Realizar Login
const login = () => {
  const loading = document.querySelector(".spinner");
  const warning = document.querySelector(".warning-content");
  const username = document.querySelector("#login-user").value;
  const password = document.querySelector("#login-password").value;

  if (!username || !password) {
    warning.classList.remove("hidden");
    setTimeout(() => {
      warning.classList.add("hidden");
    }, 2000);
    return;
  }
  loading.classList.remove("hidden");

  axios
    .post(`http://192.168.1.16:2399/auth/login`, { usuario: username, senha: password })
    .then((response) => {
      const data = response.data;

      const decoded = JSON.parse(atob(data.userData));
      sessionStorage.setItem("matricula", decoded.matricula);
      sessionStorage.setItem("haveEmail", decoded.haveEmail);
      sessionStorage.setItem("usuario", decoded.usuario);
      sessionStorage.setItem("nome", decoded.nome);
      sessionStorage.setItem("funcao", decoded.funcao);
      // sessionStorage.setItem("avaliacao_mensal", decoded.avaliacao_mensal);

      checkUserEmail();
      showNotification("Sucesso!", "Login realizado com sucesso!", "success", 1500);

      // setTimeout(() => {
      //   window.location.reload();
      // }, 1500);
    })
    .catch((error) => {
      showNotification("Errp", "Usuario ou senha incorretos", "warning", 1500);

      console.error("Falha ao executar login:", error);
    })
    .finally(() => {
      loading.classList.add("hidden");
    });
};

const loginButton = document.querySelector(".login-btn");
const loginPassInput = document.querySelector("#login-password");
loginButton.addEventListener("click", login);
loginPassInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login();
  }
});

// Esqueci Senha
const forgotPassword = document.querySelector(".forgot-password");
forgotPassword.addEventListener("click", () => {
  document.querySelector(".forgot-container").classList.remove("hidden");
});

const closeForgotPass = document.querySelector("#forgot-close");
closeForgotPass.addEventListener("click", () => {
  document.querySelector(".forgot-container").classList.add("hidden");
});

const passwordInput = document.querySelector("#forgot-password");
const passwordInputConfirm = document.querySelector("#forgot-password-confirm");
const revealForgotPass = document.querySelectorAll(".forgot-pass");
revealForgotPass.forEach((element) => {
  element.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordInputConfirm.type = "text";
    } else {
      passwordInput.type = "password";
      passwordInputConfirm.type = "password";
    }
  });
});

// Verifica se senhas estão iguais
function checkPasswordsEqual() {
  const changePassword = document.querySelector("#changePassButton");
  if (passwordInput.value !== passwordInputConfirm.value) {
    passwordInputConfirm.classList.add("diff");
    passwordInput.classList.add("diff");
    changePassword.classList.add("diff");
  } else {
    passwordInputConfirm.classList.remove("diff");
    passwordInput.classList.remove("diff");
    changePassword.classList.remove("diff");
  }
}
passwordInput.addEventListener("input", checkPasswordsEqual);
passwordInputConfirm.addEventListener("input", checkPasswordsEqual);

// Logout
const logoutButton = document.querySelector("#logout");
logoutButton.addEventListener("click", () => {
  const loading = document.querySelector(".spinner-logout");
  loading.classList.remove("hidden");

  sessionStorage.clear();
  // axios.post("http://192.168.1.16:2399/auth/logout");
});

const closeLogout = document.querySelector("#logout-close");
closeLogout.addEventListener("click", () => {
  logoutContainer.classList.add("hidden");
});

const listaHistorico = document.getElementById("lista");
openLista.addEventListener("click", () => {
  listaHistorico.classList.add("show");

  setTimeout(() => {
    listaTableLista();
    dadosFiltroLista();
  }, 100);
});

closeLista.addEventListener("click", () => {
  listaHistorico.classList.remove("show");

  const selectM = document.getElementById("mesLista");
  for (let i = -1; i <= selectM.options.length; i++) {
    selectM.remove(0);
  }
  const selectA = document.getElementById("anoLista");
  for (let i = -1; i <= selectA.options.length; i++) {
    selectA.remove(0);
  }

  lista.style.opacity = "0";
  lista.style.top = lista.offsetHeight * -1 + "px";
  document.getElementById("openUser").classList.remove("d-none");
  document.getElementById("openLista").classList.remove("d-none");
  document.getElementById("openMenu").classList.remove("d-none");
  document.getElementById("openLoja").classList.remove("d-none");

  setTimeout(() => {
    lista.removeAttribute("style");
    openLista.removeAttribute("style");
  }, 200);
});

const lojaContainer = document.querySelector("#loja");
openLoja.addEventListener("click", () => {
  lojaContainer.classList.add("active");

  document.getElementById("openUser").classList.add("d-none");
  document.getElementById("openLista").classList.add("d-none");
  document.getElementById("openMenu").classList.add("d-none");
  document.getElementById("openLoja").classList.add("d-none");
  document.getElementById("lojaMatricula").focus();
});

closeLoja.addEventListener("click", () => {
  lojaContainer.classList.remove("active");
  document.querySelector(".user-details").classList.add("d-none");

  document.getElementById("openUser").classList.remove("d-none");
  document.getElementById("openLista").classList.remove("d-none");
  document.getElementById("openMenu").classList.remove("d-none");
  document.getElementById("openLoja").classList.remove("d-none");

  setTimeout(() => {
    loja.removeAttribute("style");
    openLoja.removeAttribute("style");
    /**************************************************************** */
    document.getElementById("lojaMatricula").value = "";
    document.getElementById("pontosLoja").innerHTML = "";
    document.getElementById("nomeLoja").innerText = `Nome: `;
    document.getElementById("setorLoja").innerText = `Setor: `;
    document.getElementById("gerenteLoja").innerText = `Gerente: `;
    document.getElementById("a").innerText = `A: `;
    document.getElementById("b").innerText = `B: `;
    document.getElementById("c").innerText = `C: `;
    // document.getElementById("informe").style.display = "none";
    /**************************************************************** */
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
    /**************************************************************** */
  }, 200);
});

/*Alterar senha*/
function alterarSenha(dados) {
  const data = {
    usuario: dados.usuario,
    senha: dados.senha,
  };
  fetch("/pense_aja/server/apiCheckLogin.php", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "aplication/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.message == "sucess") {
        const { value: formValues } = await Swal.fire({
          title: "Altere a senha!",
          html: `<div class="divAlterar" id="divAlterar">
          <label for="swal-input1" class="swal2-label">Matrícula:</label>
          <input type="number" id="swal-input1" class="swal2-input" required>
          <label for="swal-input2" class="swal2-label">Nova senha:</label>
          <input type="password" id="swal-input2" class="swal2-input" required>
          </div>`,
          focusConfirm: true,
          showConfirmButton: true,
          confirmButtonText: "Alterar",
          preConfirm: () => {
            return [document.getElementById("swal-input1").value, document.getElementById("swal-input2").value];
          },
        });
        if (formValues[0] === "") {
          let inform = function (message) {
            Swal.fire({
              icon: "info",
              title: "Atenção",
              html: `<div style = "display:flex;text-align:center;flex-direction:column">
                    <div><strong>${message}</strong></div>
                  </div>`,
              showConfirmButton: false,
              showCloseButton: true,
              timer: 2100,
            }).then(function () {
              const datas = {
                usuario: document.getElementById("usuarioInput").value.trim(),
                senha: document.getElementById("password").value,
              };
              alterarSenha(datas);
            });
          };
          inform("Necessário informar a matrícula!");
          return false;
        } else if (formValues[1] === "") {
          let inform = function (message) {
            Swal.fire({
              icon: "info",
              title: "Atenção",
              html: `<div style = "display:flex;text-align:center;flex-direction:column">
                    <div><strong>${message}</strong></div>
                  </div>`,
              showConfirmButton: false,
              showCloseButton: true,
              timer: 2100,
            }).then(function () {
              const datas = {
                usuario: document.getElementById("usuarioInput").value.trim(),
                senha: document.getElementById("password").value,
              };
              alterarSenha(datas);
            });
          };
          inform("Necessário preencher a senha!");
          return false;
        } else {
          const data = {
            usuario: document.getElementById("usuarioInput").value,
            matricula: formValues[0],
            senha: formValues[1],
          };
          fetch("/pense_aja/server/apiPutLogin.php", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-type": "aplication/json; charset=UTF-8",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message == "sucess") {
                document.getElementById("loginForm").reset();
                return success("Senha atualizada");
              } else {
                return error("Não foi possível atualizar a senha, verifique a matrícula digitada e tente novamente!");
              }
            });
        }
      } else {
        return error("Usuário ou senha não conferem, verifique!");
      }
    });
}

function sessao() {
  let user = sessionStorage.getItem("usuario");
  let nomes = sessionStorage.getItem("nome");
  let colab = sessionStorage.getItem("funcao");
  let selecionado = document.getElementById("selecionado");
  if (user) {
    document.getElementById("usuario").innerText = `Olá ${
      user.split("")[0].toUpperCase() + user.split(".")[0].substring(1)
    }`;
    document.getElementById("nome").innerText = `${nomes.toUpperCase()}`;
    document.getElementById("funcao").innerText = `${colab.toUpperCase()}!`;
  } else {
    document.getElementById("usuario").innerText = "Olá, Usuário!";
    document.getElementById("nome").innerText = "Nome gerente!";
    document.getElementById("funcao").innerText = "Função!";
  }
  if (colab == "GERENTE") {
    selecionado.innerText = nomes;
    selecionado.value = nomes;
  } else {
    selecionado.innerText = "";
    selecionado.value = "";
  }
}
sessao();
