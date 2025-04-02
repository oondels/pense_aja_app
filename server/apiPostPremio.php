<?php
//    error_reporting(0);
error_reporting(E_ALL); // Ativa a exibição de todos os erros
ini_set('display_errors', 1); // Exibe os erros na saída
ini_set('display_startup_errors', 1);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $response = "";

    $_arr = json_decode($content, true);

    $mat = $_arr["matricula"];
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

    $nome = mb_strtoupper($_arr["nome"]);
    $premio = mb_strtoupper($_arr["premio"]);
    $ponto = $_arr["ponto"];
    $usuarioEntregador = $_arr["usuarioEntregador"];
    $nomeEntregador = $_arr["nomeEntregador"];


    $queryIn = "INSERT INTO pense_aja.premio
    (matricula, nome, premio_solicitado, data_solicitacao, usuario_entregador, nome_entregador, data_entrega, pontos_premio_solicitado, createdat, updatedat)
    VALUES(:matricula, :nome, :premio, NOW(), :usuarioEntregador, :nomeEntregador, NOW(), :ponto, NOW(), NOW());";
    $resultIn = $conn->prepare($queryIn);
    $resultIn->bindParam(':matricula', $matricula);
    $resultIn->bindParam(':nome', $nome);
    $resultIn->bindParam(':premio', $premio);
    $resultIn->bindParam(':usuarioEntregador', $usuarioEntregador);
    $resultIn->bindParam(':nomeEntregador', $nomeEntregador);
    $resultIn->bindParam(':ponto', $ponto);
    $resultIn->execute();

    if(($resultIn) AND ($resultIn->rowCount() != 0)) {
        $response = [
            "erro" => false,
            "message"=>"sucess"
        ];
    } else {
        $response = [
            "erro"=>true,
            "message"=>"error"
        ];
    }
    http_response_code(200);
    echo json_encode($response);
?>
