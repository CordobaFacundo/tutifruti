export const getRandomLetter = (letterHistory = []) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'.split('');
    const available = alphabet.filter(letter => !letterHistory.includes(letter));
    const options = available.length > 0 ? available : alphabet;

    const randomLetter = options[Math.floor(Math.random() * options.length)];
    return randomLetter;
}