<?php
    error_reporting(0);
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

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
    $turno = mb_strtoupper($_arr["turno"]);
    $setor = $_arr["setor"];
    $fabrica = $_arr["fabrica"];
    $lider = mb_strtoupper($_arr["lider"]);
    $gerente = mb_strtoupper($_arr['gerente']);
    $nomeProjeto = mb_strtoupper($_arr['nomeProjeto']);
    $dataProjeto = $_arr['dataProjeto'];
    $situacaoAnterior = mb_strtoupper($_arr['situacaoAnterior']);
    $situacaoAtual = mb_strtoupper($_arr['situacaoAtual']);
	$superproducao = $_arr['superProducao'];
	$transporte = $_arr['transporte'];
	$processamento = $_arr['processamento'];
	$movimento = $_arr['movimento'];
	$estoque = $_arr['estoque'];
	$espera = $_arr['espera'];
	$talento = $_arr['talento'];
	$retrabalho = $_arr['retrabalho'];
	$valorA = $_arr['valorA'] =='' ? 0 : $_arr['valorA'];
	$valorB = $_arr['valorB'] =='' ? 0 : $_arr['valorB'];
	$valorAmortizado = $_arr['valorAmortizado'] =='' ? 0 : $_arr['valorAmortizado'];
    $outrosGanhos = mb_strtoupper($_arr['outrosGanhos']);

    $response = "";

    $hoje = date('Y-m-d');
    $query = "SELECT *FROM pense_aja.pense_aja WHERE CAST(createdat AS DATE ) = :dataCriacao AND nome_projeto = :nomeProjeto AND matricula = :matricula";
    $result = $conn->prepare($query);
    $result->bindParam(':dataCriacao', $hoje);
    $result->bindParam(':nomeProjeto', $nomeProjeto);
    $result->bindParam(':matricula', $matricula);
    $result->execute();
    if (($result) and ($result->rowCount() != 0)) {
        $response = [
            "erro"=>true,
            "message"=>"existe"
        ];
        http_response_code(200);
        echo json_encode($response);
        exit();
    }

    if($matricula == null){
        $response = [
            "erro"=>true,
            "message"=>"error"
        ];
        http_response_code(200);
        echo json_encode($response);
        exit();
    }

    $query = "INSERT INTO pense_aja.pense_aja
    (matricula, nome, turno, setor, fabrica, lider, gerente, nome_projeto, data_realizada, situacao_anterior, situacao_atual, super_producao, transporte, processamento, movimento, estoque, espera, talento, retrabalho, valor_a, valor_b, valor_amortizado, outros_ganhos, gerente_aprovador, analista_avaliador, a3_mae, createdat, updatedat, excluido)
    VALUES(:matricula, :nome, :turno, :setor, :fabrica, :lider, :gerente, :nomeProjeto, :dataProjeto, :situacaoAnterior, :situacaoAtual, :superProducao, :transporte, :processamento, :movimento, :estoque, :espera, :talento, :retrabalho, :valorA, :valorB, :valorAmortizado, :outrosGanhos, '', '', '', NOW(), NOW(), '');";
    $result = $conn->prepare($query);
    $result->bindParam(':matricula', $matricula);
    $result->bindParam(':nome', $nome);
    $result->bindParam(':turno', $turno);
    $result->bindParam(':setor', $setor);
    $result->bindParam(':fabrica', $fabrica);
    $result->bindParam(':lider', $lider);
    $result->bindParam(':gerente', $gerente);
    $result->bindParam(':nomeProjeto', $nomeProjeto);
    $result->bindParam(':dataProjeto', $dataProjeto);
    $result->bindParam(':situacaoAnterior', $situacaoAnterior);
    $result->bindParam(':situacaoAtual', $situacaoAtual);
    $result->bindParam(':superProducao', $superproducao);
    $result->bindParam(':transporte', $transporte);
    $result->bindParam(':processamento', $processamento);
    $result->bindParam(':movimento', $movimento);
    $result->bindParam(':estoque', $estoque);
    $result->bindParam(':espera', $espera);
    $result->bindParam(':talento', $talento);
    $result->bindParam(':retrabalho', $retrabalho);
    $result->bindParam(':valorA', $valorA);
    $result->bindParam(':valorB', $valorB);
    $result->bindParam(':valorAmortizado', $valorAmortizado);
    $result->bindParam(':outrosGanhos', $outrosGanhos);

    if(($result->execute()) AND ($result->rowCount() != 0)) {
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
