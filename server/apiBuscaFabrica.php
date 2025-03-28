<?php
    //Cabeçalho
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    //Instruções para a API
    $mat = filter_input(INPUT_GET, 'matricula', FILTER_SANITIZE_SPECIAL_CHARS);
    $countMatricula = mb_strlen($mat);
    switch ($countMatricula) {
        case '4':
            $matricula = "300".$mat;
        break;
        case '5':
            $matricula = "30".$mat;
        break;
        default:
            $matricula = $mat;
        break;
    }
    $response = "";
            $query = "SELECT matricula, nome, setor_folha, funcao, fabrica FROM pense_aja.analistas WHERE matricula = $matricula";
            $result = $conn->prepare($query);
            $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $matricula = [
            'matricula' => $row['matricula'],
            'nome' => $row['nome'],
            'codigo' => $row['setor_folha'],
            'funcao' => $row['funcao'],
            'fabrica' => $row['fabrica']
        ];
        $response = [
            "erro" => false,
            "matricula" => $matricula
        ];
    } else {
        $response = [
            "erro"=>true,
            "matricula"=>"Matrícula não encontrada",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
