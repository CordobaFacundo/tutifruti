
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'.split('');

function getRandomLetter (letterHistory = []) {
    const available = alphabet.filter(letter => !letterHistory.includes(letter));
    const options = available.length > 0 ? available : alphabet;
    const randomLetter = options[Math.floor(Math.random() * options.length)];
    return randomLetter;
}

function pickAndPushLetter(letterHistory, maxHistory = 10) {
    const letter = getRandomLetter(letterHistory);

    letterHistory.push(letter);

    if (letterHistory.length > maxHistory) {
        letterHistory.shift();
    }

    return letter;
}

module.exports = { getRandomLetter, pickAndPushLetter };