<?php
session_start();

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "error" => "Not authenticated."]);
  exit();
}

$user_id = $_SESSION['user_id'];

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$servername = "localhost";
$username = "root";
$password = "root"; // MAMP default
$dbname = "backlog_db";
$port = 8889;

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(["success" => false, "error" => $conn->connect_error]);
  exit();
}

$stmt = $conn->prepare("SELECT * FROM games WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();


$games = [];

if ($result->num_rows > 0) {
  while ($row = $result->fetch_assoc()) {
    $games[] = $row;
  }
}

echo json_encode(["success" => true, "games" => $games]);

$conn->close();
?>
