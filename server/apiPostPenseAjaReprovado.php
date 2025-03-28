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

    $response = "";

if ($funcao == 'ANALISTA') {
    $query = "UPDATE pense_aja.pense_aja_vdc SET status_analista = :status1, analista_avaliador = :nome, classificacao = '', a3_mae = '', data_avaanalista = NOW(), updatedat = NOW(), em_espera = DEFAULT, replicavel = DEFAULT WHERE id = :identificador";
    $result = $conn->prepare($query);
    $result->bindParam(':identificador', $identificador);
    $result->bindParam(':status1', $status);
    $result->bindParam(':nome', $nome);

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
if ($funcao == 'GERENTE') {
    $query = "UPDATE pense_aja.pense_aja_vdc SET status_gerente = :status1, gerente_aprovador = :nome, classificacao = '', a3_mae = '', data_aprogerente = NOW(), updatedat = NOW(), em_espera = DEFAULT, replicavel = DEFAULT  WHERE id = :identificador";
    $result = $conn->prepare($query);
    $result->bindParam(':identificador', $identificador);
    $result->bindParam(':status1', $status);
    $result->bindParam(':nome', $nome);

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
