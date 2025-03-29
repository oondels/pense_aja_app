<?php
    // error_reporting(0);
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    header("Content-Type: application/json; charset=UTF-8");

    $router = './config/ip.json';
    include_once('./config/connection.php');

    $response = "";

    $hoje = date('d');
    $anoAtual = date('Y');
    $mesAtualNum = date('m');
    if ($hoje >= 29) {
        $mesAnterior = date('Y-m-29');
        $mesAtual = date('Y-m-28', strtotime('+1 month'));
    }
    else {
        $mesAtual = date('Y-m-29');
        $mesAnterior = date('Y-m-29', strtotime('-1 month'));
    }

// Verifica se o mês anterior é fevereiro e ajusta para 28
if ($mesAtualNum == 3) {
    $mesAnterior = "$anoAtual-02-28";
}

// Verifica se o mês atual é fevereiro e ajusta para 28
if ($mesAtualNum == 2) {
    $mesAtual = "$anoAtual-02-28";
}

    $query = "SELECT * FROM pense_aja.pense_aja
                WHERE createdat BETWEEN '$mesAnterior' AND '$mesAtual' AND excluido = ''
                ORDER BY id DESC";
    $result = $conn->prepare($query);
    $result->execute();
    if (($result) and ($result->rowCount() != 0)) {
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
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
                'status_analista' => $row['status_analista'],
                'em_espera' => $row['em_espera'],
                'criado' => $row['createdat']
            );
        }
        $response = [
            "erro" => false,
            "dados" => $dados,
        ];
    } else {
        $response = [
            "erro" => true,
            "dados" => "Não há registro!",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
?>
