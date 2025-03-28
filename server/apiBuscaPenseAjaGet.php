<?php
    //Cabeçalho
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);
    $identificador = $_arr['identificador'];

    $response = "";
    $query = "SELECT *FROM pense_aja.pense_aja_vdc
    WHERE id = :identificador";

    $result = $conn->prepare($query);
    $result->bindParam(':identificador', $identificador);
    $result->execute();

    if(($result) AND ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $dados = [
            'matricula' => $row['matricula'],
            'nome' => mb_strtoupper($row['nome']),
            'turno' => mb_strtoupper($row['turno']),
            'setor' => mb_strtoupper($row['setor']),
            'lider' => mb_strtoupper($row['lider']),
            'gerente' => mb_strtoupper($row['gerente']),
            'nome_projeto' => mb_strtoupper($row['nome_projeto']),
            'data_realizada' => implode("-", array_reverse(explode("-", $row['data_realizada']))),
            'situacao_anterior' => mb_strtoupper($row['situacao_anterior']),
            'situacao_atual' => mb_strtoupper($row['situacao_atual']),
            'super_producao' => $row['super_producao'] ? "super produção" : "",
            'transporte' => $row['transporte'] ? "transporte" : "",
            'processamento' => $row['processamento'] ? "processamento" : "",
            'movimento' => $row['movimento'] ? "movimento" : "",
            'estoque' => $row['estoque'] ? "estoque" : "",
            'espera' => $row['espera'] ? "espera" : "",
            'talento' => $row['talento'] ? "talento" : "",
            'retrabalho' => $row['retrabalho'] ? "retrabalho" : "",
            'valor_a' => $row['valor_a'],
            'valor_b' => $row['valor_b'],
            'valor_amortizado' => $row['valor_amortizado'],
            'status_gerente' => $row['status_gerente'],
            'outros_ganhos' => $row['outros_ganhos'],
            'gerente_aprovador' => $row['gerente_aprovador'],
            'analista_avaliador' => $row['analista_avaliador'],
            'classificacao' => $row['classificacao'],
            'a3_mae' => $row['a3_mae'],
            'id' => $row['id']
        ];
        $response = [
            "erro" => false,
            "penseAja" => $dados,
        ];

    } else {
        $response = [
            "erro"=>true,
            "penseAja"=>"Pense e aja não cadastrado",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
