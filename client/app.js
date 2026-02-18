/**
 * Majority Rules – Student client
 * Complete the TODO blocks by implementing fetch() calls using .then() and .catch() only.
 * Use the API_BASE constant; do not hardcode localhost elsewhere.
 */

// Base URL for the API. Use this for all requests (e.g. API_BASE + '/api/join').
const API_BASE = "https://unpopulously-ungrimed-pilar.ngrok-free.dev";
const NGROK_HEADER = { 'ngrok-skip-browser-warning': 1 };


// -----------------------------------------------------------------------------
// State (set after join)
// -----------------------------------------------------------------------------
let playerId = null;
let playerName = null;
let pollInterval = null;

// -----------------------------------------------------------------------------
// TODO: Implement joinGame()
// POST /api/join with body: { "name": "..." }
// On success: store player_id and name, then call onJoined() and start polling.
// On error: call showJoinError(message).
// -----------------------------------------------------------------------------
function joinGame(name) {
  fetch(API_BASE + '/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', NGROK_HEADER },
    body: JSON.stringify({ name: name })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          showJoinError(data.error || 'Join failed');
        } else {
          playerId = data.player_id;
          playerName = data.name;
          console.log('joined');
          console.log('playerId:', playerId, 'name:', playerName);
          onJoined();
          startPolling();
        }
      });
    })
    .catch(function() {
      showJoinError('Join failed');
    });
}

function onJoined() {
  document.getElementById('join-section').hidden = true;
  document.getElementById('game-section').hidden = false;
  document.getElementById('join-status').textContent = 'Joined as ' + playerName;
  document.getElementById('join-status').className = 'status';
}

function showJoinError(message) {
  const el = document.getElementById('join-status');
  el.textContent = message;
  el.className = 'status error';
}

// -----------------------------------------------------------------------------
// TODO: Implement pollState()
// GET /api/state – returns phase, round_id, round_total, prompt, etc.
// Update the UI: phase display, prompt display, show/hide answer/guess/results areas.
// -----------------------------------------------------------------------------
function pollState() {
  fetch(API_BASE + '/api/state', { headers: NGROK_HEADER })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log('pollState data:', data);
      currentRoundId = data.round_id;
      document.getElementById('phase-display').textContent = 'Phase: ' + data.phase + '  Round ' + data.round_id + '/' + data.round_total;
      document.getElementById('prompt-display').textContent = data.prompt || '—';
      document.getElementById('answer-area').hidden = (data.phase !== 'ANSWER');
      document.getElementById('guess-area').hidden = (data.phase !== 'GUESS');
      document.getElementById('results-area').hidden = (data.phase !== 'RESULTS');
      return data;
    })
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollState();
  pollInterval = setInterval(pollState, 2000);
}

// -----------------------------------------------------------------------------
// TODO: Implement submitAnswer()
// POST /api/answer with body: { player_id, round_id, answer }
// You need round_id from the last pollState() – store it in a variable when you implement pollState().
// On success: clear answer input and show "Answer submitted". On error: show error message in #answer-status.
// -----------------------------------------------------------------------------
let currentRoundId = null; // set this in pollState() from data.round_id

function submitAnswer() {
  const answer = document.getElementById('answer').value.trim();
  if (!answer) return;
  console.log('submitAnswer called with:', answer, 'roundId:', currentRoundId);
  fetch(API_BASE + '/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, round_id: currentRoundId, answer: answer })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        console.log('submitAnswer response:', data);
        if (!response.ok) {
          document.getElementById('answer-status').textContent = data.error || 'Error';
          document.getElementById('answer-status').className = 'status error';
        } else {
          document.getElementById('answer').value = '';
          document.getElementById('answer-status').textContent = 'Answer submitted';
          document.getElementById('answer-status').className = 'status';
        }
      });
    })
}

// -----------------------------------------------------------------------------
// TODO: Implement submitGuess()
// POST /api/guess with body: { player_id, round_id, guess }
// On success: clear guess input and show "Guess submitted". On error: show error in #guess-status.
// -----------------------------------------------------------------------------
function submitGuess() {
  const guess = document.getElementById('guess').value.trim();
  if (!guess) return;
  console.log('submitGuess called with:', guess, 'roundId:', currentRoundId);
  fetch(API_BASE + '/api/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, round_id: currentRoundId, guess: guess })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        console.log('submitGuess response:', data);
        if (!response.ok) {
          document.getElementById('guess-status').textContent = data.error || 'Error';
          document.getElementById('guess-status').className = 'status error';
        } else {
          document.getElementById('guess').value = '';
          document.getElementById('guess-status').textContent = 'Guess submitted';
          document.getElementById('guess-status').className = 'status';
        }
      });
    })
}

// -----------------------------------------------------------------------------
// TODO: Implement fetchResults()
// GET /api/results?round_id=<currentRoundId>
// Display the returned breakdown and majority_answers in #results (e.g. JSON.stringify(data, null, 2)).
// -----------------------------------------------------------------------------
function fetchResults() {
  console.log('fetchResults called for roundId:', currentRoundId);
  fetch(API_BASE + '/api/results?round_id=' + currentRoundId, { headers: NGROK_HEADER })
    .then(function(response) {
      return response.json().then(function(data) {
        console.log('fetchResults response:', data);
        if (!response.ok) {
          document.getElementById('results').textContent = data.error || 'Results not available yet';
        } else {
          document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
      });
    })
}

// -----------------------------------------------------------------------------
// UI wiring (no TODOs)
// -----------------------------------------------------------------------------
document.getElementById('btn-join').addEventListener('click', function() {
  const name = document.getElementById('name').value.trim();
  if (!name) {
    showJoinError('Enter your name');
    return;
  }
  joinGame(name);
});

document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
document.getElementById('btn-submit-guess').addEventListener('click', submitGuess);
document.getElementById('btn-fetch-results').addEventListener('click', fetchResults);
