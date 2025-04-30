<?php

session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "error" => "User not logged in."]);
  exit();
}

$user_id = $_SESSION['user_id'];

header('Content-Type: application/json');

// Ensure the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['title']) || !isset($data['startDate']) || !isset($data['cover'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$title = $data['title'];
$startDate = $data['startDate'];
$notes = isset($data['notes']) ? $data['notes'] : null;
$cover = $data['cover'];
$endDate = isset($data['endDate']) ? $data['endDate'] : null;
$rating = isset($data['rating']) ? $data['rating'] : null;

$conn = new mysqli("localhost", "root", "root", "backlog_db", 8889);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "DB connection failed"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO games (user_id, title, start_date, notes, cover_url, end_date, rating) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssssd", $user_id, $title, $startDate, $notes, $cover, $endDate, $rating);


if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
