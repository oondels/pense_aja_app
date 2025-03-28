<?php
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);

    $identificadorPenseAja = $_arr["idPenseAja"];
    $matricula = $_arr["matricula"];
    $nome = mb_strtoupper($_arr["nome"]);
    $gerente = mb_strtoupper($_arr["gerente"]);
    $classificacao = mb_strtoupper($_arr["classificacao"]);
    switch ($classificacao) {
        case 'A':
            $valor = 3;
        break;
        case 'B':
            $valor = 2;
        break;
        case 'C':
            $valor = 1;
        break;
        default:
        break;
    }

    $queryCheck = "SELECT *FROM pense_aja.pontos_vdc WHERE id_pense_aja = :identificadorPenseAja";
    $resultCheck = $conn->prepare($queryCheck);
    $resultCheck->bindParam(':identificadorPenseAja', $identificadorPenseAja);
    $resultCheck->execute();

    if(($resultCheck) AND ($resultCheck->rowCount() != 0)) {
        $queryUp= "UPDATE pense_aja.pontos_vdc SET valor = :valor, gerente = :gerente, classificacao = :classificacao, updatedat = NOW() WHERE id_pense_aja = :identificadorPenseAja";
        echo $queryUp;
        $resultUp = $conn->prepare($queryUp);
        $resultUp->bindParam(':valor', $valor);
        $resultUp->bindParam(':gerente', $gerente);
        $resultUp->bindParam(':classificacao', $classificacao);
        $resultUp->bindParam(':identificadorPenseAja', $identificadorPenseAja);
        $resultUp->execute();
    } else {
        $queryIn = "INSERT INTO pense_aja.pontos_vdc
        (id_pense_aja, matricula, nome, valor, gerente, classificacao, createdat, updatedat)
        VALUES(:identificadorPenseAja, :matricula, :nome, :valor, :gerente, :classificacao, NOW(), NOW());";
        $resultIn = $conn->prepare($queryIn);
        $resultIn->bindParam(':identificadorPenseAja', $identificadorPenseAja);
        $resultIn->bindParam(':matricula', $matricula);
        $resultIn->bindParam(':nome', $nome);
        $resultIn->bindParam(':valor', $valor);
        $resultIn->bindParam(':gerente', $gerente);
        $resultIn->bindParam(':classificacao', $classificacao);
        $resultIn->execute();
    }
?>
