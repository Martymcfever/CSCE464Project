<?php require_once 'auth_check.php'; ?>
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Backlog List</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="list-page">
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

  


  <header class="list-page">
    <h1>My Game Backlog</h1>
    <button id="addGameBtn">+ Add Game</button>
  </header>

  <main>
    <div id="gameList" class="game-list"></div>
  </main>

      <!-- View Sessions Popup (Styled Like Other Popups) -->
  <div id="viewSessionsPopup" class="popup hidden">
    <form class="popup-content no-submit">
      <h2>Sessions for <span id="viewSessionsTitle"></span></h2>
      <div id="sessionListContainer" class="session-list-container"></div>

      <div class="form-buttons">
        <button type="button" id="closeSessionsBtn">Close</button>
      </div>
    </form>   
  </div>



  <!-- Game Form Popup -->
  <div id="gameFormPopup" class="popup hidden">
    <form id="gameForm">
      <h2>Add New Game</h2>

      <label>Title:</label>
      <input type="text" id="titleInput" required />

      <label>Start Date:</label>
      <input type="date" id="startDateInput" required />

      <label>Notes:</label>
      <textarea id="notesInput" rows="3"></textarea>

      <div class="form-buttons">
        <button type="submit">Add Game</button>
        <button type="button" id="cancelBtn">Cancel</button>
      </div>
    </form>
  </div>

  <!-- Notes Popup -->
  <div id="notesPopup" class="popup hidden">
    <form id="notesForm">
      <h2>Edit Notes</h2>
      <textarea id="notesTextarea" rows="6"></textarea>
      <div class="form-buttons">
        <button type="submit">Save</button>
        <button type="button" id="cancelNotesBtn">Cancel</button>
      </div>
    </form>
  </div>

  <!-- Play Session Popup -->
  <div id="sessionPopup" class="popup hidden">
    <form id="sessionForm">
      <h2>Add Play Session</h2>

      <label>Start Time:</label>
      <input type="datetime-local" id="sessionStartInput" required />

      <label>End Time:</label>
      <input type="datetime-local" id="sessionEndInput" required />

      <label>Notes:</label>
      <textarea id="sessionNotesInput" rows="3"></textarea>

      <div class="form-buttons">
        <button type="submit">Add Session</button>
        <button type="button" id="cancelSessionBtn">Cancel</button>
      </div>
    </form>
  </div>

  <!-- End Date Popup -->
  <div id="endDatePopup" class="popup hidden">
    <form id="endDateForm">
      <h2>Set Finish Date</h2>

      <label for="endDateInput">End Date:</label>
      <input type="date" id="endDateInput" required />

      <div class="form-buttons">
        <button type="submit">Set Date</button>
        <button type="button" id="cancelEndDateBtn">Cancel</button>
      </div>
    </form>
  </div>

  <!-- Rate Game Popup (Slider + Input) -->
  <div id="rateGamePopup" class="popup hidden">
    <form id="rateGameForm">
      <h2>Rate Game</h2>

      <label for="ratingSlider">Rating:</label>
      <input type="range" id="ratingSlider" min="1" max="10" step="0.1" value="5" />

      <input type="number" id="ratingInput" min="1" max="10" step="0.1" value="5" />

      <div class="form-buttons">
        <button type="submit">Set Rating</button>
        <button type="button" id="cancelRatingBtn">Cancel</button>
      </div>
    </form>
  </div>

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
    




    <!-- Session Notification -->
  <div id="sessionAddedNotification" class="popup-message hidden">
    Game session added!
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

  


  <script src="script.js"></script>
</body>
</html>
