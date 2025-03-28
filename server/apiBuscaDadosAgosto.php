<?php
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $hoje = date('d');
    if ($hoje >= 29) {
        $mesAnterior = date('Y-m-29');
        $mesAtual= date('Y-m-28', strtotime('+1 month'));
    } else {
        $mesAtual = date('Y-m-29');
        $mesAnterior = date('Y-m-29', strtotime('-1 month'));
    }

    $response = "";
            $query = "SELECT *
            FROM pense_aja.pense_aja_vdc
            WHERE
                (createdat >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '2 MONTHS') + INTERVAL '29 DAYS'
                AND createdat <= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH') + INTERVAL '28 DAYS')
                AND excluido = ''
            ORDER BY id DESC;";
            $result = $conn->prepare($query);
            $result->execute();
    if(($result) AND ($result->rowCount() != 0)) {
        while($row = $result->fetch(PDO::FETCH_ASSOC)) {
            switch ($row['turno']) {
                case 'A':
                    $turno = '1º Turno';
                break;
                case 'B':
                    $turno = '2º Turno';
                break;
                case 'C':
                    $turno = '3º Turno';
                break;
                default:
                    $turno = 'Comercial';
                break;
            }
            $dados[] = array(
                'id' => $row['id'],
                'data_realizada' => implode("-", array_reverse(explode("-", $row['data_realizada']))),
                'fabrica' => $row['fabrica'],
                'nome' => $row['nome'],
                'setor' => $row['setor'],
                'gerente' => $row['gerente'],
                'nome_projeto' => $row['nome_projeto'],
                'turno' => $turno,
                'situacao_anterior' => $row['situacao_anterior'],
                'situacao_atual' => $row['situacao_atual'],
                'gerente_aprovador' => $row['gerente_aprovador'],
                'analista_avaliador' => $row['analista_avaliador'],
                'status_gerente' => $row['status_gerente'],
                'status_analista' => $row['status_analista']
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
