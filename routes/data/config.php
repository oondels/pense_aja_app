<?php
$json = json_decode(file_get_contents("../routes/ip.json"));

$ip = $json->ip;

$ipPost = filter_input(INPUT_POST,'ip',FILTER_SANITIZE_SPECIAL_CHARS);
echo 'IP postado: '.$ipPost;
$json->ip = $ipPost;
$json_editado = file_put_contents("../routes/ip.json",json_encode($json));

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP - Json</title>
    <link rel="stylesheet" href="./ip.module.css">
</head>
<body>
    <h1>IP</h1>
    <form action="" method="post" id="form">
        <input type="text" name="ip" id="ip" value="<?=$ip;?>" autofocus>
    </form>
    <div class="btnForm">
        <button form="form">Enviar</button>
    </div>
</body>
</html>