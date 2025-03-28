<?php
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);

    $mat = mb_strtoupper($_arr["matricula"]);
    $senha = md5($_arr["senha"]);
    $usuario = mb_strtoupper($_arr["usuario"]);

    $response = "";

    if($mat == null){
        $response = [
            "erro"=>true,
            "message"=>"error"
        ];
        http_response_code(200);
        echo json_encode($response);
        exit();
    }
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
$query = "UPDATE autenticacao.usuarios SET senha = :senha, updatedat = NOW() WHERE matricula = :matricula AND usuario = :usuario";
    $result = $conn->prepare($query);
    $result->bindParam(':matricula', $matricula);
    $result->bindParam(':senha', $senha);
    $result->bindParam(':usuario', $usuario);

    if(($result->execute()) AND ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $response = [
            "erro" => false,
            "message" => 'sucess'
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
