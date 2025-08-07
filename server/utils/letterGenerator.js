
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'.split('');

function getRandomLetter (letterHistory = []) {
    const available = alphabet.filter(letter => !letterHistory.includes(letter));
    const options = available.length > 0 ? available : alphabet;
    const randomLetter = options[Math.floor(Math.random() * options.length)];
    return randomLetter;
}

function pickAndPushLetter(roomId, letterHistoryPerRoom, maxHistory = 10) {
    if (!letterHistoryPerRoom[roomId]) letterHistoryPerRoom[roomId] = [];
    const history = letterHistoryPerRoom[roomId];
    const letter = getRandomLetter(history);
    history.push(letter);
    if (history.length > maxHistory) history.shift();
    return letter;   
}

module.exports = { getRandomLetter, pickAndPushLetter };