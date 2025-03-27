export default class Cadastro {
    adcElemento () {
    var matricula = document.createElement("input");
    matricula.setAttribute("type", "number");
    matricula.setAttribute("class", "matricula");
    matricula.setAttribute("id", "matriculaInput");
    matricula.setAttribute("placeholder", "Matricula");
    matricula.setAttribute("required", "required");
    matricula.setAttribute("autocomplete", "off");

    var nome = document.createElement("input");
    nome.setAttribute("type", "text");
    nome.setAttribute("class", "nome textarea");
    nome.setAttribute("id", "nomeInput");
    nome.setAttribute("placeholder", "Nome");
    nome.setAttribute("disabled", "disabled");
    nome.setAttribute("required", "required");
    nome.setAttribute("autocomplete", "off");

    var setor = document.createElement("input");
    setor.setAttribute("type", "text");
    setor.setAttribute("class", "setor textarea");
    setor.setAttribute("id", "setorInput");
    setor.setAttribute("placeholder", "Setor");
    setor.setAttribute("disabled", "disabled");
    setor.setAttribute("autocomplete", "off");

    var lider = document.createElement("input");
    lider.setAttribute("type", "text");
    lider.setAttribute("class", "lider textarea");
    lider.setAttribute("id", "liderInput");
    lider.setAttribute("placeholder", "Lider");
    lider.setAttribute("disabled", "disabled");
    lider.setAttribute("autocomplete", "off");

    var gerente = document.createElement("input");
    gerente.setAttribute("type", "text");
    gerente.setAttribute("class", "gerente textarea");
    gerente.setAttribute("id", "gerenteInput");
    gerente.setAttribute("placeholder", "Gerente");
    gerente.setAttribute("disabled", "disabled");
    gerente.setAttribute("autocomplete", "off");

    var nomeProjeto = document.createElement("INPUT");
    nomeProjeto.setAttribute("type", "text");
    nomeProjeto.setAttribute("class", "nomeProjeto");
    nomeProjeto.setAttribute("id", "nomeProjeto");
    nomeProjeto.setAttribute("placeholder", "Nome do projeto");
    nomeProjeto.setAttribute("required", "required");
    nomeProjeto.setAttribute("autocomplete", "off");

    var dataProjeto = document.createElement("INPUT");
    dataProjeto.setAttribute("type", "date");
    dataProjeto.setAttribute("class", "dataProjeto");
    dataProjeto.setAttribute("id", "dataProjeto");
    dataProjeto.setAttribute("required", "required");

    var lblSituacaoAnterior= document.createElement("LABEL");
    lblSituacaoAnterior.setAttribute("for","situacaoAnterior");
    lblSituacaoAnterior.setAttribute("id", "lblSituacaoAnterior");
    var txtLblSituacaoAnterior= document.createTextNode("Situação anterior");
    lblSituacaoAnterior.appendChild(txtLblSituacaoAnterior);

    var situacaoAnterior = document.createElement("TEXTAREA");
    situacaoAnterior.setAttribute("class", "situacaoAnterior form-control");
    situacaoAnterior.setAttribute("id", "situacaoAnterior");
    situacaoAnterior.setAttribute("rows", "10");
    situacaoAnterior.setAttribute("cols", "30");
    situacaoAnterior.setAttribute("placeholder", "Situação Anterior");
    situacaoAnterior.setAttribute("required", "required");

    var lblSituacaoAtual= document.createElement("LABEL");
    lblSituacaoAtual.setAttribute("for","situacaoAtual");
    lblSituacaoAtual.setAttribute("id", "lblSituacaoAtual");
    var txtLblSituacaoAtual= document.createTextNode("Situação atual");
    lblSituacaoAtual.appendChild(txtLblSituacaoAtual);

    var situacaoAtual = document.createElement("TEXTAREA");
    situacaoAtual.setAttribute("class", "situacaoAtual form-control");
    situacaoAtual.setAttribute("id", "situacaoAtual");
    situacaoAnterior.setAttribute("rows", "10");
    situacaoAnterior.setAttribute("cols", "30");
    situacaoAtual.setAttribute("placeholder", "Situação Atual");
    situacaoAtual.setAttribute("required", "required");

    var lblSuperProducao= document.createElement("LABEL");
    lblSuperProducao.setAttribute("for","superProducao");
    lblSuperProducao.setAttribute("id", "lblSuperProducao");
    var txtLblSuperProducao= document.createTextNode("SUPERPRODUÇÃO");
    lblSuperProducao.appendChild(txtLblSuperProducao);

    var superProducao = document.createElement("INPUT");
    superProducao.setAttribute("type", "checkbox") ;
    superProducao.setAttribute("class", "elimPerda");
    superProducao.setAttribute("id","superProducao");

    var lblTransporte= document.createElement("LABEL");
    lblTransporte.setAttribute("for","transporte");
    lblTransporte.setAttribute("id", "lblTransporte");
    var txtLblTransporte= document.createTextNode("TRANSPORTE");
    lblTransporte.appendChild(txtLblTransporte);

    var transporte = document.createElement("INPUT");
    transporte.setAttribute("type", "checkbox") ;
    transporte.setAttribute("class", "elimPerda");
    transporte.setAttribute("id","transporte");

    var lblProcessamento= document.createElement("LABEL");
    lblProcessamento.setAttribute("for","processamento");
    lblProcessamento.setAttribute("id", "lblProcessamento");
    var txtLblProcessamento= document.createTextNode("PROCESSAMENTO");
    lblProcessamento.appendChild(txtLblProcessamento);

    var processamento = document.createElement("INPUT");
    processamento.setAttribute("type", "checkbox") ;
    processamento.setAttribute("class", "elimPerda");
    processamento.setAttribute("id","processamento");

    var lblMovimento= document.createElement("LABEL");
    lblMovimento.setAttribute("for","movimento");
    lblMovimento.setAttribute("id", "lblMovimento");
    var txtLblMovimento= document.createTextNode("MOVIMENTO");
    lblMovimento.appendChild(txtLblMovimento);

    var movimento = document.createElement("INPUT");
    movimento.setAttribute("type", "checkbox") ;
    movimento.setAttribute("class", "elimPerda");
    movimento.setAttribute("id","movimento");

    var lblEstoque= document.createElement("LABEL");
    lblEstoque.setAttribute("for","estoque");
    lblEstoque.setAttribute("id", "lblEstoque");
    var txtLblEstoque= document.createTextNode("ESTOQUE");
    lblEstoque.appendChild(txtLblEstoque);

    var estoque = document.createElement("INPUT");
    estoque.setAttribute("type", "checkbox") ;
    estoque.setAttribute("class", "elimPerda");
    estoque.setAttribute("id","estoque");

    var lblEspera= document.createElement("LABEL");
    lblEspera.setAttribute("for","espera");
    lblEspera.setAttribute("id", "lblEspera");
    var txtLblEspera= document.createTextNode("ESPERA");
    lblEspera.appendChild(txtLblEspera);

    var espera = document.createElement("INPUT");
    espera.setAttribute("type", "checkbox") ;
    espera.setAttribute("class", "elimPerda");
    espera.setAttribute("id","espera");

    var lblTalento= document.createElement("LABEL");
    lblTalento.setAttribute("for","talento");
    lblTalento.setAttribute("id", "lblTalento");
    var txtLblTalento= document.createTextNode("TALENTO");
    lblTalento.appendChild(txtLblTalento);

    var talento = document.createElement("INPUT");
    talento.setAttribute("type", "checkbox") ;
    talento.setAttribute("class", "elimPerda");
    talento.setAttribute("id","talento");

    var lblRetrabalho= document.createElement("LABEL");
    lblRetrabalho.setAttribute("for","retrabalho");
    lblRetrabalho.setAttribute("id", "lblRetrabalho");
    var txtLblRetrabalho= document.createTextNode("RETRABALHO");
    lblRetrabalho.appendChild(txtLblRetrabalho);

    var retrabalho = document.createElement("INPUT");
    retrabalho.setAttribute("type", "checkbox") ;
    retrabalho.setAttribute("class", "elimPerda");
    retrabalho.setAttribute("id","retrabalho");

    var lblAmortizaGanho= document.createElement("LABEL");
    lblAmortizaGanho.setAttribute("for","checkAmortizaGanho");
    lblAmortizaGanho.setAttribute("id", "lblAmortizaGanho");
    var txtlblAmortizaGanho= document.createTextNode("Quanto ganhei com essa melhoria?");
    lblAmortizaGanho.appendChild(txtlblAmortizaGanho);

    var checkAmortizaGanho = document.createElement("INPUT");
    checkAmortizaGanho.setAttribute("type", "checkbox") ;
    checkAmortizaGanho.setAttribute("class", "amortizacao");
    checkAmortizaGanho.setAttribute("id","checkAmortizaGanho");

    var valorA = document.createElement("INPUT");
    valorA.setAttribute("type", "number");
    valorA.setAttribute("class", "ganhoAmortizado valorA col-3");
    valorA.setAttribute("id", "valorAInput");
    valorA.setAttribute("placeholder", "Valor do investimento");
    valorA.setAttribute("required", "required");
    valorA.setAttribute("autocomplete", "off");

    var valorB = document.createElement("INPUT");
    valorB.setAttribute("type", "number");
    valorB.setAttribute("class", "ganhoAmortizado col-3 valorB");
    valorB.setAttribute("id", "valorBInput");
    valorB.setAttribute("placeholder", "Economia prevista");
    valorB.setAttribute("required", "required");
    valorB.setAttribute("autocomplete", "off");

    var valorAmortizado = document.createElement("INPUT");
    valorAmortizado.setAttribute("type", "number");
    valorAmortizado.setAttribute("class", "ganhoAmortizado col-3 valorAmortizado");
    valorAmortizado.setAttribute("id", "valorAmortizadoInput");
    valorAmortizado.setAttribute("placeholder", "Amortização");
    valorAmortizado.setAttribute("required", "required");
    valorAmortizado.setAttribute("autocomplete", "off");

	  var lblOutrosGanho= document.createElement("LABEL");
    lblOutrosGanho.setAttribute("for","checkOutrosGanho");
    lblOutrosGanho.setAttribute("id", "lblOutrosGanho");
    var txtlblOutrosGanho= document.createTextNode("Outros Ganhos");
    lblOutrosGanho.appendChild(txtlblOutrosGanho);

    var checkOutrosGanho = document.createElement("INPUT");
    checkOutrosGanho.setAttribute("type", "checkbox") ;
    checkOutrosGanho.setAttribute("class", "checkOutrosGanho");
    checkOutrosGanho.setAttribute("id","checkOutrosGanho");

    var outGanhos = document.createElement("TEXTAREA");
    outGanhos.setAttribute("class", "outGanhos form-control");
    outGanhos.setAttribute("id", "outGanhos");
    outGanhos.setAttribute("rows", "10");
    outGanhos.setAttribute("cols", "30");
    outGanhos.setAttribute("placeholder", "OUTROS GANHOS (Não mensurável em valores)");

    var salvar = document.createElement("BUTTON");
    salvar.setAttribute("type", "submit");
    salvar.setAttribute("id", "btnLogin");
    salvar.setAttribute("class", "btn btn-lg btn-success");
    var textSalvar=document.createTextNode('Salvar');
    salvar.appendChild(textSalvar);

    var divColaborador = document.getElementById("dadosColaborador");
    var cabProjeto = document.getElementById("cabProjeto");
    var sitAnterior = document.getElementById("sitAnterior");
    var sitAtual = document.getElementById("sitAtual");
    var elimPerda = document.getElementById("elimPerda");
    var amortizacao = document.getElementById("amortizacao");
    var outrosGanhos = document.getElementById("outrosGanhos");
    var saveCad = document.getElementById("saveCad");

    var divMatricula = document.createElement("DIV");
    divMatricula.setAttribute("id", "divMatricula");
    divMatricula.setAttribute("class", "divMatricula");
    divMatricula.appendChild(matricula);
    divColaborador.appendChild(divMatricula);

    var divInputCompleteColaborador = document.createElement("DIV");
    divInputCompleteColaborador.setAttribute("id", "divInputCompleteColaborador");
    divInputCompleteColaborador.setAttribute("class", "divInputCompleteColaborador");
    divInputCompleteColaborador.appendChild(nome);
    divInputCompleteColaborador.appendChild(setor);
    divInputCompleteColaborador.appendChild(lider);
    divInputCompleteColaborador.appendChild(gerente);
    divColaborador.appendChild(divInputCompleteColaborador);

    cabProjeto.appendChild(nomeProjeto);
    cabProjeto.appendChild(dataProjeto);

    sitAnterior.appendChild(lblSituacaoAnterior);
    sitAnterior.appendChild(situacaoAnterior);

    sitAtual.appendChild(lblSituacaoAtual);
    sitAtual.appendChild(situacaoAtual);

    var divMetadeUmPerdas = document.createElement("DIV");
    divMetadeUmPerdas.setAttribute("id", "divMetadeUmPerdas");
    divMetadeUmPerdas.setAttribute("class", "divMetadePerdas");
    elimPerda.appendChild(divMetadeUmPerdas);

    var divSuperProducao = document.createElement("DIV");
    divSuperProducao.setAttribute("id", "divSuperProducao");
    divSuperProducao.setAttribute("class", "perdas divSuperProducao");
    divSuperProducao.appendChild(lblSuperProducao);
    divSuperProducao.appendChild(superProducao);
    divMetadeUmPerdas.appendChild(divSuperProducao);

    var divTransporte = document.createElement("DIV");
    divTransporte.setAttribute("id", "divTransporte");
    divTransporte.setAttribute("class", "perdas divTransporte");
    divTransporte.appendChild(lblTransporte);
    divTransporte.appendChild(transporte);
    divMetadeUmPerdas.appendChild(divTransporte);

    var divProcessamento = document.createElement("DIV");
    divProcessamento.setAttribute("id", "divProcessamento");
    divProcessamento.setAttribute("class", "perdas divProcessamento");
    divProcessamento.appendChild(lblProcessamento);
    divProcessamento.appendChild(processamento);
    divMetadeUmPerdas.appendChild(divProcessamento);

    var divMovimento = document.createElement("DIV");
    divMovimento.setAttribute("id", "divMovimento");
    divMovimento.setAttribute("class", "perdas divMovimento");
    divMovimento.appendChild(lblMovimento);
    divMovimento.appendChild(movimento);
    divMetadeUmPerdas.appendChild(divMovimento);

    var divMetadeDoisPerdas = document.createElement("DIV");
    divMetadeDoisPerdas.setAttribute("id", "divMetadeDoisPerdas");
    divMetadeDoisPerdas.setAttribute("class", "divMetadePerdas");
    elimPerda.appendChild(divMetadeDoisPerdas);

    var divEstoque = document.createElement("DIV");
    divEstoque.setAttribute("id", "divEstoque");
    divEstoque.setAttribute("class", "perdas divEstoque");
    divEstoque.appendChild(lblEstoque);
    divEstoque.appendChild(estoque);
    divMetadeDoisPerdas.appendChild(divEstoque);

    var divEspera = document.createElement("DIV");
    divEspera.setAttribute("id", "divEspera");
    divEspera.setAttribute("class", "perdas divEspera");
    divEspera.appendChild(lblEspera);
    divEspera.appendChild(espera);
    divMetadeDoisPerdas.appendChild(divEspera);

    var divTalento = document.createElement("DIV");
    divTalento.setAttribute("id", "divTalento");
    divTalento.setAttribute("class", "perdas divTalento");
    divTalento.appendChild(lblTalento);
    divTalento.appendChild(talento);
    divMetadeDoisPerdas.appendChild(divTalento);

    var divRetrabalho = document.createElement("DIV");
    divRetrabalho.setAttribute("id", "divRetrabalho");
    divRetrabalho.setAttribute("class", "perdas divRetrabalho");
    divRetrabalho.appendChild(lblRetrabalho);
    divRetrabalho.appendChild(retrabalho);
    divMetadeDoisPerdas.appendChild(divRetrabalho);

    var divLabelAmortiza = document.createElement("DIV");
    divLabelAmortiza.setAttribute("id", "divLabelAmortiza");
    divLabelAmortiza.setAttribute("class", "divLabelAmortiza");
    divLabelAmortiza.appendChild(lblAmortizaGanho);
    divLabelAmortiza.appendChild(checkAmortizaGanho);
    amortizacao.appendChild(divLabelAmortiza);

    var divInputsAmortiza = document.createElement("DIV");
    divInputsAmortiza.setAttribute("id", "divInputsAmortiza");
    divInputsAmortiza.setAttribute("class", "divInputsAmortiza col-12 d-flex");
    divInputsAmortiza.appendChild(valorA);
    divInputsAmortiza.appendChild(valorB);
    divInputsAmortiza.appendChild(valorAmortizado);
    amortizacao.appendChild(divInputsAmortiza);

    var divLabelOutrosGanhos = document.createElement("DIV");
    divLabelOutrosGanhos.setAttribute("id", "divLabelOutrosGanhos");
    divLabelOutrosGanhos.setAttribute("class", "divLabelOutrosGanhos");
    divLabelOutrosGanhos.appendChild(lblOutrosGanho);
    divLabelOutrosGanhos.appendChild(checkOutrosGanho);
    outrosGanhos.appendChild(divLabelOutrosGanhos);

    var divInputsOutrosGanhos = document.createElement("DIV");
    divInputsOutrosGanhos.setAttribute("id", "divInputsOutrosGanhos");
    divInputsOutrosGanhos.setAttribute("class", "divInputsOutrosGanhos");
    divInputsOutrosGanhos.appendChild(outGanhos);
    outrosGanhos.appendChild(divInputsOutrosGanhos);

    saveCad.appendChild(salvar);
  }

  remElemento () {
    var elemMatricula = document.getElementById("matriculaInput");
    var elemNome = document.getElementById("nomeInput");
    var elemSetor = document.getElementById("setorInput");
    var elemLider = document.getElementById("liderInput");
    var elemGerente = document.getElementById("gerenteInput");
    var elemdivMatricula = document.getElementById("divMatricula");
    var elemNomeProjeto= document.getElementById("nomeProjeto");
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
}
