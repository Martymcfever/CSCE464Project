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

let currentGameForNotes = null;
let currentGameForSession = null;
let games = [];

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
    updateSessionDropdown(currentGameForSession);
  }

  sessionForm.reset();
  sessionPopup.classList.add("hidden");
  currentGameForSession = null;
});

// Handle form submission
gameForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("titleInput").value;
  const startDate = document.getElementById("startDateInput").value;
  const notes = document.getElementById("notesInput").value;

  const cover = await fetchCoverImage(title); // 🔥

  const game = {
    id: Date.now(),
    title,
    startDate,
    notes,
    cover: cover || "https://via.placeholder.com/100x150?text=No+Cover",
    endDate: null,
    rating: null,
    sessions: []
  };

  games.push(game);
  renderGameCard(game);
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
      <p><strong>Start:</strong> ${game.startDate}</p>
      <p><strong>End:</strong> <span class="end-date">${game.endDate || "—"}</span></p>
      <p><strong>Rating:</strong> <span class="game-rating">${game.rating ? game.rating + "/10" : "—"}</span></p>
      <div class="game-actions">
        <button class="finish-btn" title="Add End Date">⏰</button>
        <button class="rate-btn" title="Rate Game">⭐</button>
        <button class="notes-btn" title="View/Add Notes">📝</button>
        <button class="session-btn" title="Add Play Session">➕</button>
      </div>
    </div>
    <div class="session-dropdown hidden" id="sessions-${game.id}">
      <p><em>No sessions added yet.</em></p>
    </div>
  `;

  // End date logic
  card.querySelector(".finish-btn").addEventListener("click", () => {
    const inputDate = prompt("Enter finish date (YYYY-MM-DD):");
    if (inputDate && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      game.endDate = inputDate;
      card.querySelector(".end-date").textContent = inputDate;
    } else if (inputDate) {
      alert("Please enter the date in YYYY-MM-DD format.");
    }
  });

  // Rating logic
  card.querySelector(".rate-btn").addEventListener("click", () => {
    const rating = prompt("Rate this game (1 to 10):");
    const num = parseFloat(rating);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      game.rating = num;
      card.querySelector(".game-rating").textContent = `${num}/10`;
    } else if (rating) {
      alert("Please enter a number between 1 and 10.");
    }
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

  
  gameList.appendChild(card);
  updateSessionDropdown(game);
}

function updateSessionDropdown(game) {
  const container = document.getElementById(`sessions-${game.id}`);
  container.innerHTML = "";

  if (game.sessions.length === 0) {
    container.innerHTML = "<p><em>No sessions added yet.</em></p>";
  } else {
    game.sessions.forEach((session, index) => {
      const div = document.createElement("div");
      div.classList.add("session-entry");
      div.innerHTML = `
        <p><strong>Session ${index + 1}</strong></p>
        <p>🕒 ${session.start} → ${session.end}</p>
        <p>📝 ${session.notes}</p>
        <hr/>
      `;
      container.appendChild(div);
    });
  }

  container.classList.remove("hidden");
}


