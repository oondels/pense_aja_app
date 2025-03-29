<?php
//error_reporting(0);
error_reporting(E_ALL);
    ini_set('display_errors', '1');

$content = trim(file_get_contents("php://input"));
$router = './config/ip.json';
include_once('./config/connection.php');

$_arr = json_decode($content, true);

$usuario = mb_strtoupper($_arr["usuario"]);
$senha = md5($_arr["senha"]);

$response = "";

if ($usuario == null) {
    $response = [
        "erro" => true,
        "message" => "error"
    ];
    http_response_code(200);
    echo json_encode($response);
    exit();
}

$query = "
WITH data_interval AS (
    SELECT
        date_trunc('month', current_date - interval '1 month') AS inicio_mes_anterior,
        date_trunc('month', current_date) - interval '1 day' AS fim_mes_anterior
)
SELECT
    au.nome,
    au.usuario,
    au.funcao,
    au.matricula,
    au.unidade,
    ae.confirmed,
    ae.email,
    COUNT(pa.*) AS avaliacao_mensal
FROM
    autenticacao.usuarios au
LEFT JOIN
    pense_aja.pense_aja pa
ON
    au.nome = pa.analista_avaliador
    AND pa.data_avaanalista BETWEEN (SELECT inicio_mes_anterior FROM data_interval)
                               AND (SELECT fim_mes_anterior FROM data_interval)
LEFT JOIN
    autenticacao.emails ae
    ON au.matricula = ae.matricula
WHERE
    au.usuario = :usuario
    AND au.senha = :senha
GROUP BY
    au.nome,
    au.usuario,
    au.funcao,
    au.matricula,
    au.unidade,
    au.id,
    ae.email,
    ae.confirmed
    ;
    ";

$result = $conn->prepare($query);
$result->bindParam(':usuario', $usuario);
$result->bindParam(':senha', $senha);


if (($result->execute()) and ($result->rowCount() != 0)) {
    $row = $result->fetch(PDO::FETCH_ASSOC);
    $matricula = [
        'nome' => mb_strtoupper($row['nome']),
        'usuario' => mb_strtolower($row['usuario']),
        'funcao' => mb_strtoupper($row['funcao']),
        'avaliacao_mensal' => mb_strtoupper($row['avaliacao_mensal']),
        'matricula' => $row['matricula'],
        'haveEmail' => $row['confirmed'],
        'email' => $row['email'],
        'unidade' => mb_strtoupper($row['unidade'])
    ];
    $response = [
        "erro" => false,
        "message" => 'sucess',
        "matricula" => $matricula
    ];
} else {
    $response = [
        "erro" => true,
        "message" => "error"
    ];
}
http_response_code(200);
echo json_encode($response);
