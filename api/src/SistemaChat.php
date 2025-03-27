<?php
  namespace Api\Websocket;
  use Exception;
  use Ratchet\ConnectionInterface;
  use Ratchet\WebSocket\MessageComponentInterface;
  class SistemaChat implements MessageComponentInterface
  {
    protected $cliente;
    public function __construct()
    {
      $this->cliente = new \SplObjectStorage;
      echo "Pense e Aja. \n";
    }
    public function onOpen(ConnectionInterface $conn)
    {
      $this->cliente->attach($conn);
      echo "Pense e Aja: {$conn->resourceId}. \n";
    }
    public function onMessage(ConnectionInterface $from, $msg)
    {
      foreach ($this->cliente as $cliente) {
        if ($from !== $cliente) {
          $cliente->send($msg);
        }
      }
      echo "Pense e Aja: {$from->resourceId} enviou uma mensagem. \n";
    }
    public function onClose(ConnectionInterface $conn)
    {
      $this->cliente->detach($conn);
      echo "Pense e Aja: {$conn->resourceId} desconectou. \n";
    }
    public function onError(ConnectionInterface $conn, Exception $e)
    {
      $conn->close();
      echo "Ocorreu um erro: {$e->getMessage()}. \n";
    }
  }
?>
