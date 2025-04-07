<?php
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);

    $identificador = $_arr["identificador"];
    $nome = mb_strtoupper($_arr["gerente"]);
    $funcao = mb_strtoupper($_arr["funcao"]);

    if ($funcao == 'ANALISTA') {
        $response = [
            "erro"=>"warning",
            "message"=>"warning"
        ];
        http_response_code(200);
        echo json_encode($response);
    } else {
        $response = "";
        $query = "UPDATE pense_aja.pense_aja SET excluido = 'S', gerente_aprovador = :nome, deletedat = NOW(), data_aprogerente = NOW(), em_espera = DEFAULT, replicavel = DEFAULT  WHERE id = :identificador";
        $result = $conn->prepare($query);
        $result->bindParam(':identificador', $identificador);
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
