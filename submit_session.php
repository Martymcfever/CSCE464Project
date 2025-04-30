<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['game_id'], $data['start'], $data['end'], $data['notes'])) {
    echo json_encode(["success" => false, "error" => "Missing data"]);
    exit;
}

$gameId = $data['game_id'];
$start = $data['start'];
$end = $data['end'];
$notes = $data['notes'];

$conn = new mysqli("localhost", "root", "root", "backlog_db", 8889);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO sessions (game_id, start_time, end_time, notes) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $gameId, $start, $end, $notes);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
