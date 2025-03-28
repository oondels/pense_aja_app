<?php
require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host   = $_ENV['DB_HOST'];
$user   = $_ENV['DB_USER'];
$pass   = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$port   = $_ENV['DB_PORT'];

//Conexão com a banco de dados
try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=" . $dbname, $user, $pass);
    /*echo "Conexão com banco de dados realizado com sucesso.";
    $check = true;
    echo 'Try'.$check;*/
} catch (PDOException $err) {
    echo "Erro: Conexão com banco de dados não realizado com sucesso. Erro gerado " . $err->getMessage();
    $check = false;
    echo 'Catch' . $check;
}
