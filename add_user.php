<?php
session_start();
$host = 'localhost';
$username = 'root';
$password = 'root';
$dbname = 'backlog_db';
$port = 8889;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $username = trim($_POST["username"]);
  $email = trim($_POST["email"]);
  $password = $_POST["password"];
  $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

  // ✅ Duplicate check added here (NEW)
  $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
  $checkStmt->bind_param("ss", $username, $email);
  $checkStmt->execute();
  $checkStmt->store_result();
  if ($checkStmt->num_rows > 0) {
    $checkStmt->close();
    header("Location: signup.html?error=taken");
    exit();
  }
  $checkStmt->close();
  // ✅ End of duplicate check

  $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())");
  $stmt->bind_param("sss", $username, $email, $hashedPassword);

  if ($stmt->execute()) {
    $_SESSION['user_id'] = $stmt->insert_id;
    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    header("Location: index.php");
    exit();
  } else {
    header("Location: signup.html?error=invalid");
    exit();
  }

  $stmt->close();
  $conn->close();
}
?>
