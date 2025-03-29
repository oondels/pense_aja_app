<?php
    error_reporting(0);

    header("Content-Type: application/json; charset=UT-8");
    $content = trim(file_get_contents("php://input"));
    $router = './config/ip.json';
    include_once('./config/connection.php');

    $_arr = json_decode($content, true);
    $mat = $_arr['matricula'];

    $response = "";

    //Instruções para a API
    $countMatricula = mb_strlen($mat);
    switch ($countMatricula) {
        case '4':
            $matricula = "300" . $mat;
            break;
        case '5':
            $matricula = "30" . $mat;
            break;
        default:
            $matricula = $mat;
            break;
    }

    $query ="WITH colaborador AS (
        SELECT lf.MATRICULA,lf.NOME,lf.SETOR, lf.GERENTE, lf.LIDER, lf.STATUS_ANALISTA
            FROM PENSE_AJA.pense_aja lf
            WHERE lf.MATRICULA = $matricula GROUP BY lf.NOME, lf.SETOR, lf.GERENTE,lf.MATRICULA,lf.LIDER,lf.STATUS_ANALISTA
        ), classificacao_a AS (
        SELECT MATRICULA, COUNT(CLASSIFICACAO) AS classific_a
        	FROM PENSE_AJA.pense_aja
        	WHERE MATRICULA = $matricula AND CLASSIFICACAO = 'A' GROUP BY CLASSIFICACAO,MATRICULA
        ), classificacao_b AS (
        SELECT MATRICULA, COUNT(CLASSIFICACAO) AS classific_b
        	FROM PENSE_AJA.pense_aja
        	WHERE MATRICULA = $matricula AND CLASSIFICACAO = 'B' GROUP BY CLASSIFICACAO,MATRICULA
        ),classificacao_c AS (
        SELECT MATRICULA, COUNT(CLASSIFICACAO) AS classific_c
        	FROM PENSE_AJA.pense_aja
        	WHERE MATRICULA = $matricula AND CLASSIFICACAO = 'C' GROUP BY CLASSIFICACAO,MATRICULA
        ),pontos AS (
        SELECT MATRICULA, SUM(valor)AS pontos
        	FROM PENSE_AJA.pontos_vdc
        	WHERE MATRICULA = $matricula GROUP BY MATRICULA
        ),pontos_premio AS (
        	SELECT MATRICULA, SUM(PONTOS_PREMIO_SOLICITADO) AS PONTO_PREMIO
        	FROM PENSE_AJA.premio_vdc
        	WHERE MATRICULA = $matricula GROUP BY MATRICULA
        )

		SELECT c.*, a.classific_a,b.classific_b,cc.classific_c,p.pontos,pp.ponto_premio FROM colaborador c
		LEFT JOIN classificacao_a a ON  c.matricula = a.matricula
		LEFT JOIN classificacao_b b ON  c.matricula = b.matricula
		LEFT JOIN classificacao_c cc ON  c.matricula = cc.matricula
		LEFT JOIN pontos p ON c.matricula = p.matricula
		LEFT JOIN pontos_premio pp ON c.matricula = pp.matricula;";

    $result = $conn->prepare($query);
    $result->execute();
    if (($result) and ($result->rowCount() != 0)) {
        $row = $result->fetch(PDO::FETCH_ASSOC);
        $matricula = [
            'nome' => $row['nome'],
            'setor' => $row['setor'],
            'gerente' => $row['gerente'],
            'status_analista' => $row['status_analista'],
            'valor' => $row['pontos'] == null ? 0 : $row['pontos'],
            'lider' => $row['lider'],
            'classificacao_a' => $row['classific_a'] == null ? 0 : $row['classific_a'],
            'classificacao_b' => $row['classific_b'] == null ? 0 : $row['classific_b'],
            'classificacao_c' => $row['classific_c'] == null ? 0 : $row['classific_c'],
            'valor_premio' => $row['ponto_premio'] == null ? 0 : $row['ponto_premio']
        ];
        $response = [
            "erro" => false,
            "matricula" => $matricula
        ];
    } else {
        $response = [
            "erro" => true,
            "matricula" => "Matrícula não encontrada",
        ];
    }
    http_response_code(200);
    echo (json_encode($response));
?>
