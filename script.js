const addGameBtn = document.getElementById("addGameBtn");
const gameFormSection = document.getElementById("gameFormSection");
const gameForm = document.getElementById("gameForm");
const cancelBtn = document.getElementById("cancelBtn");
const gameList = document.getElementById("gameList");

let games = [];

addGameBtn.addEventListener("click", () => {
  gameFormSection.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
  gameFormSection.classList.add("hidden");
  gameForm.reset();
});

gameForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("titleInput").value;
  const startDate = document.getElementById("startDateInput").value;
  const notes = document.getElementById("notesInput").value;

  const game = {
    id: Date.now(),
    title,
    startDate,
    endDate: null,
    rating: null,
    notes
  };

  games.push(game);
  renderGame(game);
  gameForm.reset();
  gameFormSection.classList.add("hidden");
});

function renderGame(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  card.innerHTML = `
    <h3>${game.title}</h3>
    <p><strong>Start:</strong> ${game.startDate}</p>
    <p><strong>End:</strong> ${game.endDate || "—"}</p>
    <p><strong>Rating:</strong> ${game.rating || "—"}</p>
    <p><strong>Notes:</strong> ${game.notes || "—"}</p>
    <button onclick="addEndDate(${game.id})">Add Finish Date</button>
    <button onclick="addRating(${game.id})">Add Rating</button>
    <button onclick="editNotes(${game.id})">Edit Notes</button>
  `;

  gameList.appendChild(card);
}

function addEndDate(id) {
  const date = prompt("Enter finish date (YYYY-MM-DD):");
  const game = games.find(g => g.id === id);
  if (game && date) {
    game.endDate = date;
    refreshGames();
  }
}

function addRating(id) {
  const rating = prompt("Rate this game (1-10):");
  const num = parseFloat(rating);
  const game = games.find(g => g.id === id);
  if (game && !isNaN(num) && num >= 1 && num <= 10) {
    game.rating = num + "/10";
    refreshGames();
  } else {
    alert("Please enter a number from 1 to 10.");
  }
}

function editNotes(id) {
  const note = prompt("Edit your notes:");
  const game = games.find(g => g.id === id);
  if (game && note !== null) {
    game.notes = note;
    refreshGames();
  }
}

function refreshGames() {
  gameList.innerHTML = "";
  games.forEach(renderGame);
}
