// Hesab dəyişənləri
let playerScore = 0;
let computerScore = 0;

// Seçimlər massivi
const choices = ['das', 'kagiz', 'qayci'];

// Emojilər və tərcümə obyektləri
const choiceLabels = {
    das: '🪨 Daş',
    kagiz: '📄 Kağız',
    qayci: '✂️ Qayçı'
};

function play(playerChoice) {
    // Kompüter üçün təsadüfi seçim (0, 1 və ya 2)
    const randomIndex = Math.floor(Math.random() * 3);
    const computerChoice = choices[randomIndex];

    let result = '';
    let resultColor = '#38bdf8'; // Standart mavi rəng

    // Qalibiyyət məntiqi
    if (playerChoice === computerChoice) {
        result = 'Heç-heçə! 🤝';
        resultColor = '#facc15'; // Sarı
    } else if (
        (playerChoice === 'das' && computerChoice === 'qayci') ||
        (playerChoice === 'kagiz' && computerChoice === 'das') ||
        (playerChoice === 'qayci' && computerChoice === 'kagiz')
    ) {
        result = 'Qazandın! 🎉';
        resultColor = '#4ade80'; // Yaşıl
        playerScore++;
    } else {
        result = 'Kompüter qazandı! 🤖';
        resultColor = '#f87171'; // Qırmızı
        computerScore++;
    }

    // DOM Yeniləmələri (Arayüzü dəyişdirmə)
    document.getElementById('player-score').textContent = playerScore;
    document.getElementById('computer-score').textContent = computerScore;
    
    document.getElementById('details').textContent = 
        `Sən: ${choiceLabels[playerChoice]}  |  Kompüter: ${choiceLabels[computerChoice]}`;
    
    const resultElement = document.getElementById('result-text');
    resultElement.textContent = result;
    resultElement.style.color = resultColor;
}

// Oyunu sıfırlama funksiyası
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    
    document.getElementById('player-score').textContent = '0';
    document.getElementById('computer-score').textContent = '0';
    document.getElementById('details').textContent = 'Hesab sıfırlandı. Oyuna başla!';
    
    const resultElement = document.getElementById('result-text');
    resultElement.textContent = '';
}