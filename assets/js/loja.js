const pesquisar = document.getElementById('pesqLoja');
pesquisar.addEventListener('click', () => {
  buscaColab();
})

const lojaMatricula = document.getElementById('lojaMatricula');
lojaMatricula.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    buscaColab();
  }
})
/**********************************************************************/
document.querySelectorAll("img").forEach(function (div) {
  div.addEventListener("click", (event) => {
    if (event.target.classList.value == "pontosOk") {
      let item = {
        "matricula": document.getElementById('lojaMatricula').value,
        "nome": document.getElementById('nomeLoja').innerText,
        "premio": event.target.alt,
        "ponto": event.target.dataset.value,
        "usuarioEntregador": sessionStorage.getItem("usuario"),
        "nomeEntregador": sessionStorage.getItem("nome")
      }
      let funcaoLoja = sessionStorage.getItem("funcao");
      if ((funcaoLoja == "ANALISTA") || (funcaoLoja == "ASSISTENTE")) {
        Swal.fire({
          title: "Têm certeza da escolha?",
          html: `<div style="border:1px solid black;border-radius:5px;text-align:left;padding:10px;margin-bottom:5px;">
            <p>Matrícula: ${item.matricula}.</p>
            <hr>
            <p>Nome: ${item.nome}.</p>
            <hr>
            <p><strong>${item.premio}</strong> como brinde escolhido.
            <hr>
            <p><strong>${item.ponto}</strong> pontos serão descontados.</p>
            </div>
            <div style="border:1px solid black;border-radius:5px;padding:10px;">
            <p>Brinde entregue por: <br><strong>${item.nomeEntregador}</strong>.</p>
            </div>
          `,
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: "SIM",
          denyButtonText: `NÃO`
        }).then(async (result) => {
console.log(item)
          if (result.isConfirmed) {
            let brinde = await fetch("http://" + ip + "/routes/pense_aja_vdc/apiPostPremio.php", {
              method: "POST",
              body: JSON.stringify(item),
              headers: {
                "Content-type": "aplication/json; charset=UTF-8"
              }
            })
            let resBrinde = await brinde.json();
            if (resBrinde.erro == false) {
              Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                html: `<div style = "display:flex;text-align:center;flex-direction:column">
                      <div><strong>Entrega do brinde realizada com sucesso!</strong></div>
                    </div>`,
                showConfirmButton: true,
                showCloseButton: true,
                timer: 3100
              });
              buscaColab();
            }
          } else if (result.isDenied) {
            Swal.fire({
              icon: 'info',
              title: 'Cancelado',
              html: `<div style = "display:flex;text-align:center;flex-direction:column">
                      <div><strong>Entrega do brinde cancelada!</strong></div>
                    </div>`,
              showConfirmButton: true,
              showCloseButton: true,
              timer: 3100
            });
          }
        });
      }
    }
  });
});

/*
  A FUNÇÃO BUSCACOLAB RETORNA OS DADOS DA MATRÍCULA INFORMADA PELO COLABORADOR E IMPRIME NA TELA
*/
async function buscaColab() {
  let matricula = document.getElementById('lojaMatricula').value;
  let data = { "matricula": matricula };
  let buscaDadosColaboradorLoja = await fetch("http://" + ip + "/routes/pense_aja_vdc/apiBuscaColaboradorLoja.php", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "aplication/json; charset=UTF-8"
    }
  })
  let resBuscaDadosColaboradorLoja = await buscaDadosColaboradorLoja.json();
  if (resBuscaDadosColaboradorLoja.erro == false) {
    const totalPontos = parseInt(resBuscaDadosColaboradorLoja.matricula.valor) - parseInt(resBuscaDadosColaboradorLoja.matricula.valor_premio);

    document.getElementById('pontosLoja').innerHTML = `${totalPontos} <strong class="text-success fs-6">Pontos</strong>`;
    document.getElementById('nomeLoja').innerText = resBuscaDadosColaboradorLoja.matricula.nome;
    document.getElementById('setorLoja').innerText = resBuscaDadosColaboradorLoja.matricula.setor;
    document.getElementById('gerenteLoja').innerText = resBuscaDadosColaboradorLoja.matricula.gerente;
    document.getElementById('liderLoja').innerText = resBuscaDadosColaboradorLoja.matricula.lider;
    pontos(totalPontos);
  } else if (resBuscaDadosColaboradorLoja.erro == true) {
    warningLoja("Nenhum pense e aja avaliado, encontrado para a matrícula informada.");
  }
}

/*
  A FUNÇÃO PONTOS COMPARA TOTAL DE PONTOS DO COLABORADOR AO VALOR DE PONTO DO ITEM,
  INSERINDO A CLASS QUE MOSTRA OS ITENS QUE O MESMO PODE RETIRAR
*/
function pontos(totalPontos) {
  let polaroid = document.querySelectorAll('.polaroid');
  let imagem = document.querySelectorAll('.polaroid img');

  const allElements = document.querySelectorAll('.polaroid')
  allElements.forEach((element) => {
    element.classList.remove('pontosOK');
  });

  for (let index = 0; index < polaroid.length; index++) {
    let dataValue = polaroid[index].attributes['data-value'].nodeValue;

    if (totalPontos >= parseInt(dataValue)) {
      polaroid[index].classList.remove('pontosSEM');
      polaroid[index].classList.add('pontosOK');
      imagem[index].classList.remove('pontosSem');
      imagem[index].classList.add('pontosOk');
    } else if (totalPontos < parseInt(dataValue)) {
      polaroid[index].classList.remove('pontosOk');
      polaroid[index].classList.add('pontosSEM');
      imagem[index].classList.remove('pontosOk');
      imagem[index].classList.add('pontosSem');
    }
  }
}
