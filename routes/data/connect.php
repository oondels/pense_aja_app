<?php
  $json = json_decode(file_get_contents($router));
  $ip = $json->ip;
  $host = "$ip";

  $con_string = "host=$host port=5432 dbname=sest user=postgres password=gdti5s11se";
  $connect = pg_connect($con_string);
?>
