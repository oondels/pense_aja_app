<?php
require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// $host   = $_ENV['DB_HOST'];
// $user   = $_ENV['DB_USER'];
// $pass   = $_ENV['DB_PASS'];
// $dbname = $_ENV['DB_NAME'];
// $port   = $_ENV['DB_PORT'];

$dsn = 'pgsql:host=pense_aja-database;port=5432;dbname=sest;';
$user = 'postgres';
$password = 'wa0i4Ochu#@*';

//Conexão com a banco de dados
try {
    $conn = new PDO($dsn, $user, $password);
    // echo "Conexão com banco de dados realizado com sucesso.";
    // $check = true;
    // echo 'Try'.$check;
} catch (PDOException $err) {
    echo 'Conexão falhou: ' . $err->getMessage();
}
