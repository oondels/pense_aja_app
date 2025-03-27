document.addEventListener("DOMContentLoaded", function () {
  // Elementos do popup
  const emailPopup = document.querySelector(".email-popup");
  const emailOverlay = document.querySelector(".email-popup-overlay");
  const emailInput = document.getElementById("email-input");
  const emailSubmit = document.getElementById("email-submit");
  const emailSkip = document.getElementById("email-skip");
  const emailClose = document.querySelector(".email-popup-close");
  const emailNoEmail = document.querySelector(".email-no-email");
  const validationMessage = document.querySelector(".email-validation-message");
  const userData = sessionStorage.getItem("userData");

  // Verificar se o email já foi coletado
  const hasProvidedEmail = localStorage.getItem("emailProvided");

  // Mostrar popup após 3 segundos se o email ainda não foi fornecido
  const yert = { nome: "Fulano", idade: 30 };
  console.log(userData);

  // if (userData && !hasProvidedEmail) {
  //   setTimeout(() => {
  //     showEmailPopup();
  //   }, 0);
  // }

  // Função para mostrar o popup
  function showEmailPopup() {
    emailOverlay.classList.add("active");
    setTimeout(() => {
      emailPopup.classList.add("active");
    }, 100);
  }

  // Função para fechar o popup
  function closeEmailPopup() {
    emailPopup.classList.remove("active");
    setTimeout(() => {
      emailOverlay.classList.remove("active");
    }, 300);
  }

  // Validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidDassEmail(email) {
    return email.includes("@grupodass");
  }

  // Função para submeter email
  function submitEmail() {
    const email = emailInput.value.trim();

    if (!email) {
      validationMessage.textContent = "Por favor, informe seu email";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    if (!isValidEmail(email)) {
      validationMessage.textContent = "Email inválido";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }
    console.log(isValidDassEmail(email));

    if (!isValidDassEmail(email)) {
      validationMessage.textContent = "Insira um email do Grupo Dass!";
      emailInput.classList.add("error");
      animateShake(emailInput);
      return;
    }

    const testeFunc = async () => {
      axios
        .put("http://localhost:3041/api/user-email", {
          newEmail: email,
          matricula: "4020495",
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Erro ao cadastrar email do usuário: ", error);
        });
    };
    // testeFunc();



    // Aqui você pode adicionar código para enviar o email para seu servidor
    // Por exemplo, usando fetch() para uma API

    // Salvar na localStorage que o email foi fornecido
    // localStorage.setItem('emailProvided', 'true');
    // localStorage.setItem('userEmail', email);

    // // Mostra confirmação
    // emailInput.value = '';
    // validationMessage.textContent = '';
    // validationMessage.style.color = '#34c759';
    // validationMessage.textContent = 'Email salvo com sucesso!';

    // Fecha o popup após 1.5 segundos
    setTimeout(() => {
      // closeEmailPopup();
    }, 1500);
  }

  // Função para animar shake no input quando inválido
  function animateShake(element) {
    element.style.animation = "shake 0.4s ease";
    setTimeout(() => {
      element.style.animation = "";
    }, 400);
  }

  // Event listeners
  emailSubmit.addEventListener("click", submitEmail);
  emailInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      submitEmail();
    }
  });

  // Resetar validação ao digitar
  emailInput.addEventListener("input", function () {
    emailInput.classList.remove("error");
    validationMessage.textContent = "";
  });

  // Fechar popup
  emailClose.addEventListener("click", closeEmailPopup);
  emailSkip.addEventListener("click", function () {
    closeEmailPopup();
  });

  // Sem Email
  emailNoEmail.addEventListener("click", function () {
    localStorage.setItem("emailProvided", "true");
    closeEmailPopup();
  });

  // Fechar ao clicar fora
  emailOverlay.addEventListener("click", function (e) {
    if (e.target === emailOverlay) {
      closeEmailPopup();
    }
  });
});
