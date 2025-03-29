<?php
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $response = "";
            $query = "SELECT DISTINCT EXTRACT(MONTH FROM createdat) AS mes, EXTRACT(YEAR FROM createdat) AS ano FROM pense_aja.pense_aja ORDER BY mes";
            $result = $conn->prepare($query);
            $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        while($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $dados[] = array(
                'mes' => $row['mes'],
                'ano' => $row['ano']
            );
       }
        $response = [
            "erro" => false,
            "dados" => $dados,
        ];

    } else {
        $response = [
            "erro"=>true,
            "dados"=>"Não há registro!",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
