<?php
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $hoje = date('d');
    if ($hoje >= 29 && $hoje <= 31) {
        $mesAnterior = date('Y-m-28');
        $mesAtual= date('Y-m-27', strtotime('+1 month'));
    } else {
        $mesAtual = date('Y-m-29');
        $mesAnterior = date('Y-m-29', strtotime('-1 month'));
    }

    $response = "";
            $query = "SELECT DISTINCT gerente FROM pense_aja.pense_aja_vdc ORDER BY gerente ASC";
            $result = $conn->prepare($query);
            $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        while($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $dados[] = array(
                'gerente' => $row['gerente']
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
