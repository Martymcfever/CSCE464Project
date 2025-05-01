<?php
session_start();

// If logged in, fetch the user's username and email
$username = null;
$email = null;

if (isset($_SESSION['user_id'])) {
  $conn = new mysqli("localhost", "root", "root", "backlog_db", 8889);
  if (!$conn->connect_error) {
    $stmt = $conn->prepare("SELECT username, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $stmt->bind_result($username, $email);
    $stmt->fetch();
    $stmt->close();
    $conn->close();
  }
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backlog Tracker</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="landing-page">
<nav class="navbar">
  <button class="hamburger" id="hamburgerBtn">&#9776;</button>

  <div class="nav-menu" id="navMenu">
    <a href="index.php">Home</a>
    <a href="backlog.php">Backlog</a>
  </div>

  <div class="nav-left always-visible">
    <?php if ($username && $email): ?>
      <span class="user-email"><?= htmlspecialchars($username) ?> (<?= htmlspecialchars($email) ?>)</span>
      <button id="logoutBtn" class="logout-btn">Logout</button>
    <?php else: ?>
      <a href="login.html" class="signin-link">Sign In</a>
    <?php endif; ?>
  </div>

  
</nav>

  
  <header class="landing-page">
    <h1>Backlog Tracker</h1>
    <p>Track the games you're playing, rate them, log sessions, and more!</p>
  </header>

  <section class="intro-section">
    <img src="game_banner.webp" alt="Gaming Banner" class="banner-img">
    <p>
      Welcome to your personalized video game backlog manager. Easily add your games, track your play sessions, rate them.
    </p>
    <button id="startBtn" onclick="window.location.href='backlog.php'">Start Backlog</button>
  </section>

    <!-- Logout Confirmation Popup -->
    <div id="logoutModal" class="popup hidden">
      <div class="popup-content">
        <div class="logout-box">
          <h3>Are you sure you want to log out?</h3>
          <div class="logout-buttons">
            <button id="confirmLogout">Yes, Log Out</button>
            <button id="cancelLogout">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    

    <script>
      const logoutBtn = document.getElementById("logoutBtn");
      const logoutConfirmPopup = document.getElementById("logoutModal");
      const confirmLogoutBtn = document.getElementById("confirmLogout");
      const cancelLogoutBtn = document.getElementById("cancelLogout");
    
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          logoutConfirmPopup.classList.remove("hidden");
        });
      }
    
      if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", () => {
          window.location.href = "logout.php";
        });
      }
    
      if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener("click", () => {
          logoutConfirmPopup.classList.add("hidden");
        });
      }
    </script>

    <script>
      const hamburgerBtn = document.getElementById("hamburgerBtn");
      const navMenu = document.getElementById("navMenu");

      hamburgerBtn.addEventListener("click", () => {
        navMenu.classList.toggle("show");
      });
    </script>

    
  

  
</body>
</html>
