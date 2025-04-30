<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "error" => "Not authenticated."]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$game_id = $data['game_id'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$game_id) {
  echo json_encode(["success" => false, "error" => "Missing game ID."]);
  exit;
}

$conn = new mysqli("localhost", "root", "root", "backlog_db", 8889);
if ($conn->connect_error) {
  echo json_encode(["success" => false, "error" => "Database connection failed."]);
  exit;
}

// Ensure users can only delete their own games
$stmt = $conn->prepare("DELETE FROM games WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $game_id, $user_id);

if ($stmt->execute()) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
