<?php

$json = json_decode(file_get_contents($router));
$ip = $json->ip;

$host = "$ip";
$user = "postgres";
$pass = "gdti5s11se";
$dbname = "sest";
$port = 5432;
try {
    //Conexão com a porta
    $conn = new PDO("pgsql:host=$host;port=5432;dbname=" . $dbname, $user, $pass);
    /* echo "Conexão com banco de dados realizado com sucesso.";
    $check = true;
    echo 'Try'.$check; */
} catch (PDOException $err) {
    /* echo "Erro: Conexão com banco de dados não realizado com sucesso. Erro gerado " . $err->getMessage();
    $check = false;
    echo 'Catch'.$check; */
}
