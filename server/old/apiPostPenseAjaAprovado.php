<?php
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);

    $identificador = $_arr["identificador"];
    $status = mb_strtoupper($_arr["status"]);
    $nome = mb_strtoupper($_arr["nome"]);
    $funcao = mb_strtoupper($_arr["funcao"]);
    $escolha = mb_strtoupper($_arr["escolha"]);
    $a3_mae = mb_strtoupper($_arr["a3Mae"]);
    $em_espera = $_arr["em_espera"] == false ? 0 : $_arr["em_espera"];
    $replicavel = $_arr["replicavel"] == false ? 0 : $_arr["replicavel"];

    $response = "";

if ($funcao == 'ANALISTA' || $funcao == 'ASSISTENTE') {
    $query = "UPDATE pense_aja.pense_aja SET status_analista = :status1, analista_avaliador = :nome, classificacao = :escolha, a3_mae = :a3_mae, data_avaanalista = NOW(), updatedat = NOW(), em_espera = :em_espera, replicavel = :replicavel WHERE id = :identificador";
    $result = $conn->prepare($query);
    $result->bindParam(':identificador', $identificador);
    $result->bindParam(':status1', $status);
    $result->bindParam(':nome', $nome);
    $result->bindParam(':escolha', $escolha);
    $result->bindParam(':a3_mae', $a3_mae);
    $result->bindParam(':em_espera', $em_espera);
    $result->bindParam(':replicavel', $replicavel);

    if(($result->execute()) AND ($result->rowCount() != 0)) {
        $response = [
            "erro" => false,
            "message"=>"sucess"
        ];
    } else {
        $response = [
            "erro"=>true,
            "message"=>"error"
        ];
    }
    http_response_code(200);
    echo json_encode($response);
}
if ($funcao == 'GERENTE' || $funcao == 'GERENTE MARCA') {
    $query = "UPDATE pense_aja.pense_aja SET status_gerente = :status1, gerente_aprovador = :nome, classificacao = :escolha, a3_mae = :a3_mae, data_aprogerente = NOW(), updatedat = NOW(), em_espera = :em_espera, replicavel = :replicavel  WHERE id = :identificador";
    $result = $conn->prepare($query);
    $result->bindParam(':identificador', $identificador);
    $result->bindParam(':status1', $status);
    $result->bindParam(':nome', $nome);
    $result->bindParam(':escolha', $escolha);
    $result->bindParam(':a3_mae', $a3_mae);
    $result->bindParam(':em_espera', $em_espera);
    $result->bindParam(':replicavel', $replicavel);

    if(($result->execute()) AND ($result->rowCount() != 0)) {
        $response = [
            "erro" => false,
            "message"=>"sucess"
        ];
    } else {
        $response = [
            "erro"=>true,
            "message"=>"error"
        ];
    }
    http_response_code(200);
    echo json_encode($response);
}
?>
