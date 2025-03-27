const ws = new WebSocket('ws://10.100.1.43:9111');
ws.onopen = (e) => {
    //console.log('Conectado!');
}
ws.onmessage = (mensagemRecebida) => {
  let resultado = JSON.parse(mensagemRecebida.data);
  if (resultado.mensagem.status === true) {
    listaTable();
    listaTableLista();
  }
}
const enviar = () => {
  let dados = {
    mensagem: {
      status: true
    }
  }
  ws.send(JSON.stringify(dados));
  //mensagem.value = '';
}
