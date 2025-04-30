<?php
session_start();

if (!isset($_SESSION['user_id'])) {
  // Redirect to login page if not signed in
  header("Location: login.html");
  exit();
}
?>
