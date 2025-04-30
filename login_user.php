<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection
$host = 'localhost';
$dbUser = 'root';
$dbPass = 'root'; // adjust if needed
$dbName = 'backlog_db';
$conn = new mysqli($host, $dbUser, $dbPass, $dbName, 8889);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$usernameOrEmail = trim($_POST['username']);
$password = $_POST['password'];

if (empty($usernameOrEmail) || empty($password)) {
    die("Both fields are required.");
}

// Search for user by username or email
$stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $usernameOrEmail, $usernameOrEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password_hash'])) {
        // Valid login — set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        // Redirect to backlog page
        header("Location: backlog.php");
        exit();
    } else {
        header("Location: login.html?error=invalid");
        exit();

    }
} else {
    header("Location: login.html?error=invalid");
    exit();

}

$stmt->close();
$conn->close();
?>
