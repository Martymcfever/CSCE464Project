<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "root", "backlog_db", 8889);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$sql = "SELECT * FROM sessions";
$result = $conn->query($sql);

$sessionsByGame = [];

while ($row = $result->fetch_assoc()) {
    $gameId = $row['game_id'];
    if (!isset($sessionsByGame[$gameId])) {
        $sessionsByGame[$gameId] = [];
    }

    $sessionsByGame[$gameId][] = [
        "start" => $row["start_time"],
        "end" => $row["end_time"],
        "notes" => $row["notes"]
    ];
}

echo json_encode(["success" => true, "sessions" => $sessionsByGame]);

$conn->close();
?>
