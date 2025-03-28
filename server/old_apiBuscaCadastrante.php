<?php
    //Cabeçalho
    //error_reporting(0);

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
            $query = "SELECT lf.nome, lf.nome_setor, lf.setor_folha, lf.gerente, lf.funcao,sum(p.valor) AS valor
            FROM colaborador.lista_funcionario lf
            LEFT JOIN pense_aja.pontos_vdc p
            ON lf.matricula = p.matricula
            WHERE lf.matricula = $matricula GROUP BY lf.nome, lf.nome_setor, lf.setor_folha, lf.gerente, lf.funcao";
            $result = $conn->prepare($query);
            $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $matricula = [
            'nome' => $row['nome'],
            'setor' => $row['nome_setor'],
            'codigo' => $row['setor_folha'],
            'gerente' => $row['gerente'],
            'funcao' => $row['funcao'],
            'valor' => $row['valor']
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
