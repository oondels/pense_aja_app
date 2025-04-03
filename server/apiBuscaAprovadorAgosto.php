<?php
//Cabeçalho
error_reporting(0);

header("Content-Type: application/json; charset=UT-8");
$router = './config/ip.json';
include_once('./config/connection.php');

        $hoje = date('d');
        $mesVirgente = date('m');
        if ($hoje >= 29) {
            $mesAnt = $mes - 1;
            $mesAtual= date('Y-'.$mes.'-29');
            $mesAnterior = date('Y-'.$mesAnt.'-29');
        } else {
            $mesAnt = $mes - 1;
            $mesAtual = date('Y-'.$mes.'-29');
            $mesAnterior = date('Y-'.$mesAnt.'-29');
        }

$response = "";
            $query = "SELECT *FROM pense_aja.pense_aja
            WHERE createdat BETWEEN '$mesAnterior' AND '$mesAtual' AND excluido = ''
            ORDER BY id DESC";
$result = $conn->prepare($query);
$result->execute();
    if (($result) and ($result->rowCount() != 0)) {
        $rows = $result->fetchAll(PDO::FETCH_ASSOC);
        $dadoss = array();

        foreach ($rows as $row) {
            $dados = [
                'gerente_aprovador' => $row['gerente_aprovador'],
                'analista_avaliador' => $row['analista_avaliador'],
                'status_gerente' => $row['status_gerente'],
                'status_analista' => $row['status_analista'],
                'id' => $row['id']
            ];

            array_push($dadoss, $dados);
        }

        $response = [
            "erro" => false,
            "dados" => $dadoss
        ];
    } else {
        $response = [
            "erro" => true,
            "penseAja" => "Pense e aja não cadastrado",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
