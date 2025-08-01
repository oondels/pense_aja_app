<?php
error_reporting(E_ALL & ~E_DEPRECATED);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Configurações de CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Conexão com banco de dados
$router = './config/ip.json';
include_once('./config/connection.php');

$queryMesAno = "SELECT DISTINCT EXTRACT(MONTH FROM createdat) AS mes, EXTRACT(YEAR FROM createdat) AS ano FROM pense_aja.pense_aja ORDER BY mes";

$mesAtual = '';
$mesAnterior = '';

// Função para construir a query com parâmetros seguros
function construirQuery($params)
{
    // Queries para obter filtros distintos
    $queryFilterGerentes = "SELECT DISTINCT gerente FROM pense_aja.pense_aja WHERE excluido = ''";
    $queryFilterNomes = "SELECT DISTINCT nome FROM pense_aja.pense_aja WHERE excluido = ''";
    $queryFilterSetores = "SELECT DISTINCT setor FROM pense_aja.pense_aja WHERE excluido = ''";
    $queryFilterProjetos = "SELECT DISTINCT nome_projeto FROM pense_aja.pense_aja WHERE excluido = ''";
    $queryFilterTurnos = "SELECT DISTINCT turno FROM pense_aja.pense_aja WHERE excluido = ''";

    $query = "SELECT * FROM pense_aja.pense_aja WHERE excluido = ''";

    if (!empty($params['ano'])) {
        $query .= " AND DATE_PART('year', createdat) = :ano";
        $queryFilterGerentes .= " AND DATE_PART('year', createdat) = :ano";
        $queryFilterNomes .= " AND DATE_PART('year', createdat) = :ano";
        $queryFilterSetores .= " AND DATE_PART('year', createdat) = :ano";
        $queryFilterProjetos .= " AND DATE_PART('year', createdat) = :ano";
        $queryFilterTurnos .= " AND DATE_PART('year', createdat) = :ano";
    }

    if (!empty($params['mes'])) {
        $query .= " AND DATE_PART('month', createdat) = :mes";
        $queryFilterGerentes .= " AND DATE_PART('month', createdat) = :mes";
        $queryFilterNomes .= " AND DATE_PART('month', createdat) = :mes";
        $queryFilterSetores .= " AND DATE_PART('month', createdat) = :mes";
        $queryFilterProjetos .= " AND DATE_PART('month', createdat) = :mes";
        $queryFilterTurnos .= " AND DATE_PART('month', createdat) = :mes";
    }

    if (!empty($params['dataInicio']) && !empty($params['dataFim'])) {
        $query .= " AND createdat BETWEEN :dataInicio AND :dataFim";
        $queryFilterGerentes .= " AND createdat BETWEEN :dataInicio AND :dataFim";
        $queryFilterNomes .= " AND createdat BETWEEN :dataInicio AND :dataFim";
        $queryFilterSetores .= " AND createdat BETWEEN :dataInicio AND :dataFim";
        $queryFilterProjetos .= " AND createdat BETWEEN :dataInicio AND :dataFim";
        $queryFilterTurnos .= " AND createdat BETWEEN :dataInicio AND :dataFim";
    }

    // Ordenação
    $query .= " ORDER BY createdat DESC";
    $queryFilterGerentes .= " ORDER BY gerente ASC";
    $queryFilterNomes .= " ORDER BY nome ASC";
    $queryFilterSetores .= " ORDER BY setor ASC";
    $queryFilterProjetos .= " ORDER BY nome_projeto ASC";
    $queryFilterTurnos .= " ORDER BY turno ASC";

    return [
        'query' => $query,
        'queryFilterGerentes' => $queryFilterGerentes,
        'queryFilterNomes' => $queryFilterNomes,
        'queryFilterSetores' => $queryFilterSetores,
        'queryFilterProjetos' => $queryFilterProjetos,
        'queryFilterTurnos' => $queryFilterTurnos
    ];
}

try {
    // Validação da entrada
    $content = json_decode(file_get_contents("php://input"), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON inválido');
    }

    $mes = filter_var($content['selectMes'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 12]
    ]);

    $ano = filter_var($content['selectAno'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 2000, 'max_range' => (int)date('Y') + 1]
    ]);

    $mesAtual = $content['mesAtual'];
    $mesAnterior = $content['mesAnterior'];

    // Determinar período
    $hoje = new DateTime();
    $diaAtual = $hoje->format('d');
    $params = [];
    $params['dataInicio'] = $mesAnterior;
    $params['dataFim'] = $mesAtual;

    // Preparar e executar query
    $queries = construirQuery($params);
    $stmt = $conn->prepare($queries['query']);
    $stmtGerentes = $conn->prepare($queries['queryFilterGerentes']);
    $stmtNomes = $conn->prepare($queries['queryFilterNomes']);
    $stmtSetores = $conn->prepare($queries['queryFilterSetores']);
    $stmtProjetos = $conn->prepare($queries['queryFilterProjetos']);
    $stmtTurnos = $conn->prepare($queries['queryFilterTurnos']);
    $stmtMesAno = $conn->prepare($queryMesAno);

    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
        $stmtGerentes->bindValue(":$key", $value);
        $stmtNomes->bindValue(":$key", $value);
        $stmtSetores->bindValue(":$key", $value);
        $stmtProjetos->bindValue(":$key", $value);
        $stmtTurnos->bindValue(":$key", $value);
    }

    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Executar queries de filtros
    $stmtGerentes->execute();
    $stmtNomes->execute();
    $stmtSetores->execute();
    $stmtProjetos->execute();
    $stmtTurnos->execute();
    $stmtMesAno->execute();

    // Buscar resultados de cada filtro
    $filtroGerentes = array_column($stmtGerentes->fetchAll(PDO::FETCH_ASSOC), 'gerente');
    $filtroNomes = array_column($stmtNomes->fetchAll(PDO::FETCH_ASSOC), 'nome');
    $filtroSetores = array_column($stmtSetores->fetchAll(PDO::FETCH_ASSOC), 'setor');
    $filtroProjetos = array_column($stmtProjetos->fetchAll(PDO::FETCH_ASSOC), 'nome_projeto');
    $filtroTurnos = array_column($stmtTurnos->fetchAll(PDO::FETCH_ASSOC), 'turno');
    $filtroMesAno = array_column($stmtMesAno->fetchAll(PDO::FETCH_ASSOC), 'mes_ano');

    // Processar resultados
    $dados = [];
    foreach ($resultados as $row) {
        // Converter turno
        $turno = match ($row['turno']) {
            'A' => '1º Turno',
            'B' => '2º Turno',
            'C' => '3º Turno',
            default => 'Comercial'
        };

        // Converter data_realizada de Y-m-d para d-m-Y, mas evitando erro caso seja inválida
        $dataRealizadaObj = DateTime::createFromFormat('Y-m-d', $row['data_realizada']);
        if ($dataRealizadaObj instanceof DateTime) {
            $dataRealizadaFormatted = $dataRealizadaObj->format('d-m-Y');
        } else {
            $dataRealizadaFormatted = $row['data_realizada'] ?: 'Data inválida';
        }

        $dados[] = [
            'id' => $row['id'],
            'data_realizada' => $dataRealizadaFormatted,
            'fabrica' => $row['fabrica'],
            'nome' => $row['nome'],
            'setor' => $row['setor'],
            'gerente' => $row['gerente'],
            'nome_projeto' => $row['nome_projeto'],
            'turno' => $turno,
            'situacao_anterior' => $row['situacao_anterior'],
            'situacao_atual' => $row['situacao_atual'],
            'gerente_aprovador' => $row['gerente_aprovador'],
            'analista_avaliador' => $row['analista_avaliador'],
            'status_gerente' => $row['status_gerente'],
            'status_analista' => $row['status_analista'],
            'em_espera' => $row['em_espera'],
            'criado' => $row['createdat']
        ];
    }

    foreach ($filtroTurnos as $key => $data) {
        $filtroTurnos[$key] = match ($data) {
            'A' => '1º Turno',
            'B' => '2º Turno',
            'C' => '3º Turno',
            default => 'Comercial'
        };
    }

    // Enviar resposta
    http_response_code(200);
    echo json_encode([
        'erro' => false,
        'dados' => $dados,
        'filters' => [
            '2' => $filtroMesAno,
            '3' => $filtroNomes,
            '4' => $filtroSetores,
            '5' => $filtroGerentes,
            '6' => $filtroProjetos,
            '7' => $filtroTurnos
        ],
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => true,
        'mensagem' => 'Erro no banco de dados: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'erro' => true,
        'mensagem' => $e->getMessage()
    ]);
}
