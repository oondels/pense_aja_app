/*const mensagemProducao ={
    celula:document.getElementById('celula'),
    lider:document.getElementById('lider'),
    modelo:document.getElementById('selecaoModelo'),
    modeloUm:document.getElementById('modelo'),
    modeloDiferente:document.getElementById('modeloDiferente'),
    meta:document.getElementById('meta'),
    metaDiferente:document.getElementById('metaDiferente'),
    projecao:document.getElementById('producaoProjetada'),
    eficiencia:document.getElementById('eficiencia'),
    realizado:document.getElementById('producaoRealizada'),
    justificativa:document.getElementById('justificativa'),
    abastecedor:document.getElementById('abastecedor'),
    matricula:document.getElementById('matricula'),
    turno:'A',
    data:new Date()
}*/
const mensagemProducao = document.getElementById('retTBody');
const ws = new WebSocket('ws://10.110.20.200:8080');
ws.onopen = (e) => {
    console.log('Conectado!');
}
ws.onmessage = (mensagemRecebida) => {
    let resultado = JSON.parse(mensagemRecebida.data);
    if (resultado.mensagem.status === true) {
        window.location.reload();
    }
    /*let resMsg = [resultado.mensagem];
    console.log(resMsg);
    const tableBody = resMsg.map((result) => {
        return `<tr class="headConsulta active" id="dadosResposta">
            <td class="celula content colMedio" style="text-align: center" id="data">${result.data}</td>
            <td class="celula content colMaior">${result.celula} - ${result.lider}</td>
            <td class="celula content colMaior">Costura</td>
            <td class="celula content colMedio">${result.turno}</td>
            <td class="celula content colMaior">Gilvan Barros</td>
            <td class="celula content colMaior" style="text-align: center">Camila Goncalves</td>
            <td class="celula content colMaior" style="text-align: center">${result.modeloUm}</td>
            <td class="celula content colMedio" style="text-align: center">${result.meta}</td>
            <td class="celula content colMedio" style="text-align: center">${result.projecao}</td>
            <td class="celula content colMedio" style="text-align: center" id="saldo">0</td>
            <td class="celula content colMedio" style="text-align: center" id="eficiencia">${result.eficiencia}</td>
            <td class="celula content colMedio" id="modDif">${result.modeloDiferente}</td>
            <td class="celula content colMedio" id="metDif">${result.metaDiferente}</td>
            <td class="celula content colMaiorX" id="justificativa">${result.justificativa}</td>
            <td class="celula content colMaior" id="abastecedor">${result.abastecedor}</td>
            <td class="celula content colMedio" id="prioridade">Prioridade</td>
        </tr>`
    }).join('')

    const table = `
        ${tableBody}
    `;

    mensagemProducao.insertAdjacentHTML('beforeend', table);*/

    //mensagemProducao.insertAdjacentHTML('beforeend', `${resultado.mensagem.usuario} diz: ${resultado.mensagem.texto}<br>`);
}
const enviar = () => {
    /*let celula = document.getElementById('celula');
    let lider = document.getElementById('lider');
    let modelo = document.getElementById('selecaoModelo');
    let modeloUm = document.getElementById('modelo');
    let modeloDiferente = document.getElementById('modeloDiferente');
    let meta = document.getElementById('meta');
    let metaDiferente = document.getElementById('metaDiferente');
    let projecao = document.getElementById('producaoProjetada');
    let eficiencia = document.getElementById('eficiencia');
    let realizado = document.getElementById('producaoRealizada');
    let justificativa = document.getElementById('justificativa');
    let abastecedor = document.getElementById('abastecedor');
    let matricula = document.getElementById('matricula');
    let turno = 'A';
    let data = new Date();*/
    let dados = {
        mensagem: {
            status:true
            /*celula:celula.value,
            lider:lider.value,
            modelo:modelo.value,
            modeloUm:modeloUm.value,
            modeloDiferente:modeloDiferente.checked,
            meta:meta.value,
            metaDiferente:metaDiferente.checked,
            projecao:projecao.value,
            eficiencia:eficiencia.value,
            realizado:realizado.value,
            justificativa:justificativa.value,
            abastecedor:abastecedor.value,
            matricula:matricula.value,
            turno:turno,
            data:data*/
        }//'usuario: ${nomeUsuario}${mensagem.value}'
    }
    ws.send(JSON.stringify(dados));
    //mensagemProducao.insertAdjacentHTML('beforeend', `${nomeUsuario}: ${mensagem.value}<br>`);
    mensagem.value = '';
}