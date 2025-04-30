<?php
session_start();
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$password = "root";
$db = "backlog_db";
$port = 8889;

$conn = new mysqli($host, $user, $password, $db, $port);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed"]);
    exit;
}

$userId = $_SESSION['user_id'] ?? null;
$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'] ?? null;
$endDate = $data['endDate'] ?? null;
$rating = $data['rating'] ?? null;
$notes = $data['notes'] ?? null; // ✅ NEW

if (!$userId || !$title) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

// ✅ Updated query includes notes
$stmt = $conn->prepare("UPDATE games SET end_date = ?, rating = ?, notes = ? WHERE title = ? AND user_id = ?");
$stmt->bind_param("sdssi", $endDate, $rating, $notes, $title, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
