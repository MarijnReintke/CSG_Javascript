const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Spelinstellingen & Constanten
const GRAVITY = 0.25;
const FLAP_STRENGTH = -5.5;
const PIPE_SPEED = 2.5;
const PIPE_GAP = 150;
const PIPE_SPAWN_RATE = 100; // Hoeveel frames tussen nieuwe buizen

// Spelvariabelen
let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

// Vogel (Bird) Klasse
class Bird {
    constructor() {
        this.x = 50;
        this.y = canvas.height / 2;
        this.velocity = 0;
        this.radius = 16;
    }

    flap() {
        this.velocity = FLAP_STRENGTH;
    }

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;

        // Grond en plafond botsing detectie
        if (this.y + this.radius >= canvas.height) {
            this.y = canvas.height - this.radius;
            gameOver = true;
        }
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.velocity = 0;
        }
    }

    draw() {
        // Gele cirkel (lichaam)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#f7d433";
        ctx.fill();
        ctx.closePath();

        // Wit oog
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();

        // Zwarte pupil
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y - 4, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.closePath();
    }
}

// Buis (Pipe) Klasse
class Pipe {
    constructor() {
        this.x = canvas.width;
        this.width = 70;
        // Bepaal de hoogte van de opening willekeurig
        this.gapY = Math.floor(Math.random() * (canvas.height - 200 - PIPE_GAP)) + 100;
        this.topHeight = this.gapY;
        this.bottomY = this.gapY + PIPE_GAP;
        this.bottomHeight = canvas.height - this.bottomY;
        this.passed = false;
    }

    update() {
        this.x -= PIPE_SPEED;
    }

    draw() {
        ctx.fillStyle = "#73bf2e";
        ctx.strokeStyle = "#5a9623";
        ctx.lineWidth = 3;

        // Bovenste buis
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, 0, this.width, this.topHeight);

        // Onderste buis
        ctx.fillRect(this.x, this.bottomY, this.width, this.bottomHeight);
        ctx.strokeRect(this.x, this.bottomY, this.width, this.bottomHeight);
    }

    collidesWith(bird) {
        // Maak een hit-box die net iets kleiner is dan de cirkel voor een betere gameplay ervaring
        let birdLeft = bird.x - bird.radius + 3;
        let birdRight = bird.x + bird.radius - 3;
        let birdTop = bird.y - bird.radius + 3;
        let birdBottom = bird.y + bird.radius - 3;

        // Check bovenste buis
        if (birdRight > this.x && birdLeft < this.x + this.width) {
            if (birdTop < this.topHeight || birdBottom > this.bottomY) {
                return true;
            }
        }
        return false;
    }
}

// Start of Herstart het spel
function resetGame() {
    bird = new Bird();
    pipes = [];
    score = 0;
    gameOver = false;
    frameCount = 0;
}

// Teken de score op het scherm
function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(score, canvas.width / 2, 60);
    
    // Reset schaduw voor andere elementen
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Hoofdlus van het spel (Game Loop)
function gameLoop() {
    // Scherm leegmaken
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        bird.update();

        // Genereer periodiek nieuwe buizen
        frameCount++;
        if (frameCount % PIPE_SPAWN_RATE === 0) {
            pipes.push(new Pipe());
        }

        // Update en controleer buizen
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();

            // Check voor botsing
            if (pipes[i].collidesWith(bird)) {
                gameOver = true;
            }

            // Score verhogen als de vogel voorbij de buis vliegt
            if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
                pipes[i].passed = true;
                score++;
            }

            // Verwijder buizen buiten het scherm
            if (pipes[i].x + pipes[i].width < 0) {
                pipes.splice(i, 1);
            }
        }
    }

    // Alles tekenen
    pipes.forEach(pipe => pipe.draw());
    bird.draw();
    drawScore();

    // Game Over scherm tonen
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#c81e1e";
        ctx.font = "bold 34px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText("Klik of druk op Spatie om te herstarten", canvas.width / 2, canvas.height / 2 + 30);
    }

    requestAnimationFrame(gameLoop);
}

// Input Handling (Besturing)
function handleInput() {
    if (gameOver) {
        resetGame();
    } else {
        bird.flap();
    }
}

// Luister naar de spatiebalk
window.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        e.preventDefault(); // Voorkomt dat de pagina naar beneden scrolt
        handleInput();
    }
});

// Luister naar muisklikken of tikken op mobiel
canvas.addEventListener("click", function() {
    handleInput();
});

// Start het spel voor de eerste keer op
resetGame();
gameLoop();