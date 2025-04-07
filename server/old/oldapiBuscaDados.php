<?php
    //Cabeçalho
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $response = "";
    $query = "SELECT *FROM pense_aja.pense_aja
              WHERE DATE_PART('MONTH',createdat) = DATE_PART('MONTH',current_date)
              ORDER BY id DESC";
    $result = $conn->prepare($query);
    $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $dados = [
            'data' => $row['data_realizada'],
            'nome' => $row['nome'],
            'setor' => $row['setor'],
            'projeto' => $row['nome_projeto'],
            'turno' => $row['turno'],
        ];
        $response = [
            "erro" => false,
            "matricula" => $dados,
        ];

    } else {
        $response = [
            "erro"=>true,
            "matricula"=>"Matrícula não encontrada",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
