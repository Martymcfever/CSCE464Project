const addGameBtn = document.getElementById("addGameBtn");
const gameFormPopup = document.getElementById("gameFormPopup");
const cancelBtn = document.getElementById("cancelBtn");
const gameForm = document.getElementById("gameForm");
const gameList = document.getElementById("gameList");

const notesPopup = document.getElementById("notesPopup");
const notesForm = document.getElementById("notesForm");
const notesTextarea = document.getElementById("notesTextarea");
const cancelNotesBtn = document.getElementById("cancelNotesBtn");

const sessionPopup = document.getElementById("sessionPopup");
const sessionForm = document.getElementById("sessionForm");
const sessionStartInput = document.getElementById("sessionStartInput");
const sessionEndInput = document.getElementById("sessionEndInput");
const sessionNotesInput = document.getElementById("sessionNotesInput");
const cancelSessionBtn = document.getElementById("cancelSessionBtn");

const endDatePopup = document.getElementById("endDatePopup");
const endDateForm = document.getElementById("endDateForm");
const endDateInput = document.getElementById("endDateInput");
const cancelEndDateBtn = document.getElementById("cancelEndDateBtn");

const rateGamePopup = document.getElementById("rateGamePopup");
const rateGameForm = document.getElementById("rateGameForm");
const ratingSlider = document.getElementById("ratingSlider");
const ratingInput = document.getElementById("ratingInput");
const cancelRatingBtn = document.getElementById("cancelRatingBtn");

let currentGameForRating = null;


let currentGameForEndDate = null;


let currentGameForNotes = null;
let currentGameForSession = null;
let games = [];

loadGamesFromServer();

function formatDateTime(datetimeString, options = {}) {
  if (!datetimeString) return "—";

  // Normalize to ISO format if needed
  const normalized = datetimeString.includes("T")
    ? datetimeString
    : datetimeString.replace(" ", "T");

  const date = new Date(normalized);

  if (isNaN(date.getTime())) return "Invalid Date";

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  if (options.includeTime) {
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  }

  return formattedDate;
}






// Show form popup
addGameBtn.addEventListener("click", () => {
  gameFormPopup.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
  gameFormPopup.classList.add("hidden");
  gameForm.reset();
});

// Notes popup
cancelNotesBtn.addEventListener("click", () => {
  notesPopup.classList.add("hidden");
  notesForm.reset();
  currentGameForNotes = null;
});

notesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentGameForNotes) {
    currentGameForNotes.notes = notesTextarea.value;
    updateGameInServer(currentGameForNotes); // <-- NEW LINE
  }
  notesPopup.classList.add("hidden");
  notesForm.reset();
  currentGameForNotes = null;
});

// Session popup
cancelSessionBtn.addEventListener("click", () => {
  sessionPopup.classList.add("hidden");
  sessionForm.reset();
  currentGameForSession = null;
});

const RAWG_API_KEY = "2ecafaff43a94609a6cbf81a8760d18d"; // replace with your key

async function fetchCoverImage(title) {
  const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(title)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].background_image || null;
    }
  } catch (error) {
    console.error("Error fetching cover art:", error);
  }
  return null;
}


sessionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (currentGameForSession) {
    const newSession = {
      start: sessionStartInput.value,
      end: sessionEndInput.value,
      notes: sessionNotesInput.value
    };

    currentGameForSession.sessions.push(newSession);
    console.log("Submitting session for game ID:", currentGameForSession.id);


    // 🔽 THIS IS WHERE THE FETCH TO THE PHP FILE HAPPENS
    fetch("http://localhost:8888/Project/submit_session.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_id: currentGameForSession.id, // ⬅ make sure this is defined
        start: newSession.start,
        end: newSession.end,
        notes: newSession.notes
      })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.error("❌ Failed to save session:", data.error);
      }
    });
  }

  sessionForm.reset();
  sessionPopup.classList.add("hidden");
  currentGameForSession = null;

  showSessionAddedNotification();
});


// Handle form submission
gameForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("titleInput").value;
  const startDate = document.getElementById("startDateInput").value.trim();
  const notes = document.getElementById("notesInput").value;
  const cover = await fetchCoverImage(title);

  const game = {
    title,
    startDate,
    notes,
    cover: cover || "https://via.placeholder.com/100x150?text=No+Cover",
    endDate: null,
    rating: null,
    sessions: []
  };

  try {
    const response = await fetch("http://localhost:8888/Project/submit_game.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(game)
    });

    const resultText = await response.text();
    const result = JSON.parse(resultText);

    if (result.success) {
      game.id = result.id; // ✅ use server-assigned ID
      games.push(game);    // ✅ now it's safe
      renderGameCard(game); // ✅ now it has an ID for session tracking
    } else {
      console.error("❌ Server error:", result.error);
    }

  } catch (err) {
    console.error("❌ Failed to send game:", err);
  }

  gameForm.reset();
  gameFormPopup.classList.add("hidden");
});



function renderGameCard(game) {
  const card = document.createElement("div");
  card.classList.add("game-card");
  


  card.innerHTML = `
    <div class="game-cover">
      <img src="${game.cover}" alt="${game.title} Cover" class="game-cover-img">
    </div>
    <div class="game-info">
      <h3>${game.title}</h3>
      <p><strong>Start:</strong> ${formatDateTime(game.startDate)}</p>
      <p><strong>End:</strong> <span class="end-date">${formatDateTime(game.endDate)}</span></p>
      <p><strong>Rating:</strong> <span class="game-rating">${game.rating ? game.rating + "/10" : "—"}</span></p>
      <div class="game-actions">
        <button class="finish-btn" title="Add End Date">⏰</button>
        <button class="rate-btn" title="Rate Game">⭐</button>
        <button class="notes-btn" title="View/Add Notes">📝</button>
        <button class="session-btn" title="Add Play Session">➕</button>
      </div>
    </div>
    <div class="session-preview-button-container">
      <button class="view-sessions-btn">📋 View my game sessions</button>
    </div>
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.title = "Delete Game";
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this game?")) {
      deleteGameFromServer(game.id);
    }
  });
  card.querySelector(".game-actions").appendChild(deleteBtn);

  // End date logic
  card.querySelector(".finish-btn").addEventListener("click", () => {
    currentGameForEndDate = game;
    endDatePopup.classList.remove("hidden");
  });
  

  // Rating logic
  card.querySelector(".rate-btn").addEventListener("click", () => {
    currentGameForRating = game;
  
    // If game already has a rating, preload the slider/input
    const initialValue = game.rating ? parseFloat(game.rating) : 5;
    ratingSlider.value = initialValue;
    ratingInput.value = initialValue;
  
    rateGamePopup.classList.remove("hidden");
  });
  

  // Notes logic
  card.querySelector(".notes-btn").addEventListener("click", () => {
    notesTextarea.value = game.notes || "";
    currentGameForNotes = game;
    notesPopup.classList.remove("hidden");
  });

  // Session logic
  card.querySelector(".session-btn").addEventListener("click", () => {
    currentGameForSession = game;
    sessionPopup.classList.remove("hidden");
  });

  const viewBtn = card.querySelector(".view-sessions-btn");
  viewBtn.addEventListener("click", () => openSessionsPopup(game));



  
  gameList.appendChild(card);
}

async function updateGameInServer(game) {
  try {
    const response = await fetch("http://localhost:8888/Project/update_game.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: game.title,
        endDate: game.endDate,
        rating: game.rating,
        notes: game.notes,
      })
    });

    const result = await response.json();
    if (!result.success) {
      console.error("Failed to update game:", result.error);
    }
  } catch (err) {
    console.error("Update error:", err);
  }
}



async function sendGameToServer(game) {
  try {
    const response = await fetch("http://localhost:8888/Project/submit_game.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(game)
    });

    const text = await response.text();
    try {
      const result = JSON.parse(text);
      console.log("✅ Server response:", result);
    } catch (err) {
      console.error("❌ Failed to parse server JSON:", err);
      console.log("RAW response was:", text);
    }

  } catch (err) {
    console.error("❌ Failed to send game to server:", err);
  }
}

async function loadGamesFromServer() {
  try {
    const response = await fetch("http://localhost:8888/Project/get_games.php");
    const result = await response.json();

    if (result.success && result.games) {
      games = result.games.map(dbGame => ({
        id: dbGame.id,
        title: dbGame.title,
        startDate: dbGame.start_date, // fix field name
        notes: dbGame.notes || "",
        cover: dbGame.cover_url,      // fix field name
        endDate: dbGame.end_date,
        rating: dbGame.rating,
        sessions: [] // you'll support loading sessions later
      }));
      

      games.forEach(renderGameCard);
    } else {
      console.error("Failed to load games:", result.error || "Unknown error");
    }
  } catch (err) {
    console.error("Error fetching games from server:", err);
  }

  const sessionsResponse = await fetch("http://localhost:8888/Project/get_sessions.php");
  const sessionsResult = await sessionsResponse.json();

  if (sessionsResult.success && sessionsResult.sessions) {
    games.forEach(game => {
      const gameSessions = sessionsResult.sessions[game.id];
      game.sessions = gameSessions || [];
    });
  }

}

function openSessionsPopup(game) {
  const popup = document.getElementById("viewSessionsPopup");
  const title = document.getElementById("viewSessionsTitle");
  const list = document.getElementById("sessionListContainer");

  title.textContent = game.title;
  list.innerHTML = "";

  if (!game.sessions || game.sessions.length === 0) {
    list.innerHTML = "<p><em>No sessions available.</em></p>";
  } else {
    game.sessions.forEach((session, i) => {
      const item = document.createElement("div");
      item.className = "session-popup-item";

      item.innerHTML = `
        <div><strong>Session ${i + 1}</strong> – ${formatDateTime(session.start, { includeTime: true })} → ${formatDateTime(session.end, { includeTime: true })}</div>
        <div class="session-details">
          <p><strong>Notes:</strong> ${session.notes || "—"}</p>
        </div>
      `;

      item.addEventListener("click", () => {
        item.classList.toggle("expanded");
      });

      list.appendChild(item);
    });
  }

  popup.classList.remove("hidden");
}

document.getElementById("closeSessionsBtn").addEventListener("click", () => {
  document.getElementById("viewSessionsPopup").classList.add("hidden");
});


function showSessionAddedNotification() {
  const notification = document.getElementById("sessionAddedNotification");

  notification.classList.remove("hidden");

  // Hide after 2 seconds OR on click
  const dismiss = () => {
    notification.classList.add("hidden");
    notification.removeEventListener("click", dismiss);
  };

  notification.addEventListener("click", dismiss);

  setTimeout(() => {
    if (!notification.classList.contains("hidden")) {
      dismiss();
    }
  }, 2000);
}

endDateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (currentGameForEndDate) {
    const newDate = endDateInput.value;
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      currentGameForEndDate.endDate = newDate;
      updateGameInServer(currentGameForEndDate); // <-- NEW LINE


      // Update the visible game card
      document.querySelectorAll(".game-card").forEach(card => {
        const title = card.querySelector("h3").textContent;
        if (title === currentGameForEndDate.title) {
          const endSpan = card.querySelector(".end-date");
          endSpan.textContent = formatDateTime(newDate);
        }
      });
    }
  }

  endDateForm.reset();
  endDatePopup.classList.add("hidden");
  currentGameForEndDate = null;
});

cancelEndDateBtn.addEventListener("click", () => {
  endDatePopup.classList.add("hidden");
  endDateForm.reset();
  currentGameForEndDate = null;
});


// Sync slider and input field
ratingSlider.addEventListener("input", () => {
  ratingInput.value = ratingSlider.value;
});

ratingSlider.addEventListener("change", () => {
  // Trigger pulse animation
  ratingSlider.classList.remove("pulse");
  void ratingSlider.offsetWidth; // force reflow
  ratingSlider.classList.add("pulse");
});


ratingInput.addEventListener("input", () => {
  const val = parseFloat(ratingInput.value);
  if (!isNaN(val) && val >= 1 && val <= 10) {
    ratingSlider.value = val;
  }
});

rateGameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = parseFloat(ratingInput.value);
  if (currentGameForRating && !isNaN(val) && val >= 1 && val <= 10) {
    currentGameForRating.rating = val.toFixed(1);
    updateGameInServer(currentGameForRating); // <-- NEW LINE


    // Update card
    document.querySelectorAll(".game-card").forEach(card => {
      const title = card.querySelector("h3").textContent;
      if (title === currentGameForRating.title) {
        const ratingSpan = card.querySelector(".game-rating");
        ratingSpan.textContent = `${val.toFixed(1)}/10`;
      }
    });
  }

  rateGameForm.reset();
  rateGamePopup.classList.add("hidden");
  currentGameForRating = null;
});

cancelRatingBtn.addEventListener("click", () => {
  rateGamePopup.classList.add("hidden");
  currentGameForRating = null;
});


async function updateGameInServer(game) {
  try {
    const response = await fetch("http://localhost:8888/Project/update_game.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: game.title,
        endDate: game.endDate,
        rating: game.rating,
        notes: game.notes,
      })
    });

    const result = await response.json();
    if (!result.success) {
      console.error("❌ Failed to update game:", result.error);
    } else {
      console.log("✅ Game updated:", result);
    }
  } catch (err) {
    console.error("❌ Error updating game:", err);
  }
}

function deleteGameFromServer(gameId) {
  fetch("http://localhost:8888/Project/delete_game.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Remove the deleted game from the games array
      games = games.filter(game => game.id !== gameId);

      // Remove the card from the DOM
      const cardToRemove = [...document.querySelectorAll(".game-card")].find(card => {
        const title = card.querySelector("h3")?.textContent;
        const match = games.find(g => g.title === title && g.id !== gameId);
        return !match;
      });

      if (cardToRemove) {
        cardToRemove.remove();
      }

    } else {
      console.error("Failed to delete game:", data.error);
    }
  })
  .catch(err => console.error("Error deleting game:", err));
}




