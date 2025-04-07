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
    $query = "WITH colaborador AS (
        SELECT lf.nome, lf.nome_setor, lf.setor_folha, lf.gerente, lf.funcao,SUM(p.valor) AS valor
                    FROM colaborador.lista_funcionario  lf
                    LEFT JOIN pense_aja.pontos  p
                    ON lf.matricula = p.matricula
                    WHERE lf.matricula = $matricula GROUP BY lf.nome, lf.nome_setor, lf.setor_folha, lf.gerente, lf.funcao
        ), lider AS (
        SELECT DISTINCT lf.nome AS nome_lider, lf.nome_setor AS setor_lider FROM colaborador.lista_funcionario  lf LEFT JOIN colaborador.lista_funcionario  lf2 ON lf.nome_setor = lf2.nome_setor WHERE lf.funcao LIKE 'LIDER%'
        AND lf.nome_setor IN (SELECT nome_setor FROM colaborador.lista_funcionario  WHERE matricula = $matricula))
        SELECT DISTINCT c.*, l.nome_lider FROM colaborador c LEFT JOIN lider l ON  c.nome_setor = l.setor_lider;";

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
            'valor' => $row['valor'],
            'lider' => $row['nome_lider']
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
