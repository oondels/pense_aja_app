export default class Login {
  adcElemento () {
    var usuario = document.createElement("INPUT");
    usuario.setAttribute("type", "text");
    usuario.setAttribute("class", "usuario form-control");
    usuario.setAttribute("id", "usuarioInput");
    usuario.setAttribute("placeholder", "User");
    usuario.setAttribute("required", "required");
    usuario.setAttribute("autocomplete", "off");

    var lblUser = document.createElement("LABEL");
    lblUser.setAttribute("for","usuarioInput");
    lblUser.setAttribute("id", "lblUser");
    var txtLblUser = document.createTextNode("Usuario");
    lblUser.appendChild(txtLblUser);

    var senha = document.createElement("INPUT");
    senha.setAttribute("type", "password");
    senha.setAttribute("class", "password form-control");
    senha.setAttribute("id", "password");
    senha.setAttribute("placeholder", "Pass");
    senha.setAttribute("required", "required");

    var lblPass = document.createElement("LABEL");
    lblPass.setAttribute("for","password");
    lblPass.setAttribute("id", "lblPass");
    var txtLblPass = document.createTextNode("Senha");
    lblPass.appendChild(txtLblPass);

    var salvar = document.createElement("BUTTON");
    salvar.setAttribute("type", "submit");
    salvar.setAttribute("id", "btnLogin");
    salvar.setAttribute("class", "btn btn-lg btn-success");
    var textSalvar=document.createTextNode('Entrar');
    salvar.appendChild(textSalvar);


    var divUser = document.getElementById("user");
    var divPass = document.getElementById("pass");
    var divBtn = document.getElementById("save");

    divUser.appendChild(usuario);
    divUser.appendChild(lblUser);

    divPass.appendChild(senha);
    divPass.appendChild(lblPass);

    divBtn.appendChild(salvar);

  }

  remElemento () {
    var elemUser = document.getElementById("usuarioInput");
    var elemLblUser = document.getElementById("lblUser");
    var elemPass = document.getElementById("password");
    var elemLblPass = document.getElementById("lblPass");
    var elemSalvar = document.getElementById("btnLogin");
    if (elemUser.parentNode) {
      elemUser.parentNode.removeChild(elemUser);
      elemLblUser.parentNode.removeChild(elemLblUser);
      elemPass.parentNode.removeChild(elemPass);
      elemLblPass.parentNode.removeChild(elemLblPass);
      elemSalvar.parentNode.removeChild(elemSalvar);
    }
  }

}
