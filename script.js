var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Intro/ending cards + variable
var titleCard;
var startButton = document.getElementById('startbutton');
var loseGame = document.getElementById('losegame');
var introTitle = document.getElementById('introscreen');
var winGame = document.getElementById('wingame');
var retryButton = document.getElementById('retry');
var hitScreen = document.getElementById('hitscreen');
hitScreen.style.display = "none";

// Sprite pre-loader from class
var spriteUrls = [
    "images/hikaru-standing.png",
    "images/hikaru-run1.png",
    "images/hikaru-run2.png",
    "images/hikaru-throw1.png",
    "images/hikaru-throw2.png",
    "images/hikaru-throw3.png",
    "images/shuriken.png",
    "images/sumo3.png",
    "images/sumo2.png",
    "images/sumo1.png",
    "images/sumo-armsup.png",
    "images/flyingmonster1.png",
    "images/flyingmonster2.png",
    "images/flyingmonster3.png",
    "images/background-new.png",
    "images/title.png",
    "images/hikaru-health-1.png",
    "images/hikaru-health-2.png",
    "images/hikaru-health-3.png",
    "images/uzai-health-1.png",
    "images/uzai-health-2.png",
    "images/uzai-health-3.png",
    "images/uzai-health-4.png",
    "images/uzai-health-5.png",
    "images/uzai-health-6.png",
    "images/uzai-health-7.png",
    "images/uzai-health-8.png",
    "images/uzai-health-9.png",
    "images/uzai-health-10.png",
    "images/losepage.png",
    "images/winpage.png"
];

var sprites = [];
var preloadCounter = 0;

function preloadSprites()
{
    sprites[preloadCounter] = new Image(); // Sets new image variable
    sprites[preloadCounter].src = spriteUrls[preloadCounter];
    sprites[preloadCounter].onload = function(){

        preloadCounter ++;

        // Check if all of the Sprite URLs have been counted
        if(preloadCounter != spriteUrls.length) 
        {
            preloadSprites();
        }
        else if (titleCard == 1)
        {
            window.requestAnimationFrame(frame);;
        }
}};

// Set background images. Swap from intro screen to canvas if button is pressed
loseGame.src = spriteUrls[29];
winGame.src = spriteUrls[30];
introTitle.src = spriteUrls[15];

window.addEventListener('load', function(){
    canvas.style.display = "none";
    introTitle.style.display = "block"
    titleCard = 0;
});

startButton.addEventListener('click', function(){
    titleCard = 1;
    preloadSprites();
    canvas.style.display = "block";
    introTitle.style.display = "none";
    introMusic.play();
});

// CHARACTER ARRAYS

// Main character array
var hikaru = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    velY: 0,
    width: canvas.width/20,
    height: canvas.height/6,
    lives: 3,
    direction: "right",
    counter: 0,
    isThrowing: false
};

// Flying monster array
var flyingMonster = {
    x: randomIntFromInterval(0, 1000),
    y: 5,
    velY: 1.5,
    velX: 1.5,
    width: 200,
    height: 160,
    counter: 11,
    direction: "right",
    lives: 4
};

// Sumo boss array
var sumo = {
    x: canvas.width*0.75,
    y: -150,
    width: 400,
    height: 400,
    counter: 7,
    velY: 0,
    lives: 10
};

var background = {
    x: 0,
    y: 0,
    width: canvas.width * 4,
    height: canvas.height
};

var healthBar = {
    x: 10,
    y: 10
}

// Character counters
var shuriken = new Array();
var jumpDelay = 0;
var runDelay = 0;
var throwDelay = 0;
var flyingMonsterDelay = 0;
var redrawDelay = 0;
var lifeTrackerDelay = 0;
var sumoJumpCounter = 0;
var sumoImageCounter = 0;

// Snagged from: https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// From W3 Schools 
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
};

var introMusic = new sound('sounds/soundtrack2.mp3');
var shurikenSound = new sound('sounds/shuriken.mp3');
var bossMusic = new sound('sounds/soundtrack.mp3');
introMusic.volume = 0.6;
var flyingMonsterSound = new sound('sounds/fm_death.wav');
var sumoHit = new sound('sounds/sumohit.wav')
var sumoDeath = new sound('sounds/sumodeath.wav');
var hikaruHit = new sound('sounds/hikaru_hit.wav');

// Basic movement. Example from class.
var pressedKeys = {};

document.addEventListener('keyup', function(e){
    pressedKeys[e.keyCode] = false;
});

document.addEventListener('keydown', function(e){
    pressedKeys[e.keyCode] = true;
});

function frame(e){

    // Clears canvas every time function runs, allowing object to be re-drawn
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(sprites[14], background.x, background.y, background.width, background.height);

    // Draw healthbar
    switch (hikaru.lives){
        case 3:
            ctx.drawImage(sprites[16], healthBar.x, healthBar.y, 400, 35);
            break;
        case 2: 
            ctx.drawImage(sprites[17], healthBar.x, healthBar.y, 400, 35);
            break;
        case 1:
            ctx.drawImage(sprites[18], healthBar.x, healthBar.y, 400, 35);
    };
    
    // Slight background shift fix
    if (background.x >= 0)
    {
        background.x = -3;
    };

    // Arrow key movements
    if (pressedKeys[39] == true) {
        if (background.x < -4650){ //  fix for running past the background at the end of the level
            background.x = background.x;
        } else {
            background.x -= 5;
            flyingMonster.x -= 3; // Roughly djusts the flying monster according to background changes, otherwise it got pretty disorienting
            hikaru.direction = "right";
            runDelay--;
        };
        
        // If between the middle and the beginning of the background, move hikaru, not the background
        if (hikaru.x <= (canvas.width/2)){
            background.x -= 0;
            hikaru.x += 3;
        };

        // Makes his running legs look a little less crazy. Same concept as jumpDelay.
        if (runDelay < 0){
            hikaru.counter++;
            runDelay = 15;
        };

        if (hikaru.counter == 3) 
        {
            hikaru.counter = 1;
        };
    }  
    
    else if (pressedKeys[37] == true) {
        background.x += 5;
        flyingMonster.x += 3; // Roughly adjusts the flying monster according to background changes, otherwise it got pretty disorienting
        hikaru.direction = "left";
        runDelay--;

        // If between the middle and the beginning of the background, move hikaru, not the background
        if (hikaru.x <= (canvas.width/2)){
            background.x += 0;
            hikaru.x -= 3;
        };

        // Makes his running legs look a little less crazy. Same concept as jumpDelay.
        if (runDelay < 0){
            hikaru.counter++;
            runDelay = 15;
        };

        if (hikaru.counter > 2) 
        {
            hikaru.counter = 1;
        };
    }

    else {hikaru.counter = 0};

    // Sets Hikaru facing which ever direction he is moving
    // Used from class example
    if (hikaru.direction == "right"){
        ctx.drawImage(sprites[hikaru.counter], hikaru.x - hikaru.width, hikaru.y, hikaru.width, hikaru.height);
    }

    else {
        ctx.scale(-1, 1);
        ctx.drawImage(sprites[hikaru.counter], - hikaru.x, hikaru.y, hikaru.width, hikaru.height);
        ctx.scale(-1, 1);
    };

    // Keeps character on canvas
    if (hikaru.x < 50) hikaru.x = 50;
    if (hikaru.x > canvas.width - hikaru.width) hikaru.x = canvas.width - hikaru.width;
    if (hikaru.y > canvas.height - hikaru.height*1.75) hikaru.y = canvas.height - hikaru.height*1.75;

    // Creates shurikens and sends them across the screen
    for (i = 0; i < shuriken.length; i++){
        ctx.drawImage(sprites[6], shuriken[i]['x'], shuriken[i]['y'], 30, 30);
        shurikenSound.play();

        // I tried a few of ways of getting character to animate his throwing but they all seemed to conflict too much with the running animation
        // hikaru.counter = 5;

        // Conditional statement to have Shuriken match Hikaru's direction
        if (shuriken[i].direction == "left"){
            shuriken[i].x -= 10;
        } else {
            shuriken[i].x += 10;
        }
    };
    
    // Removes unneccessary shuriken's
    for (i = 0; i < shuriken.length; i++){
        if (shuriken[i].x > canvas.width || shuriken[i].x < 0) shuriken.shift();
    };

    // Shuriken hit detection 
    for (i = 0; i < shuriken.length; i++){

        var a = Math.abs(shuriken[i].x - flyingMonster.x);
        var b = Math.abs(shuriken[i].y - flyingMonster.y);
        var shurikenDistance = Math.sqrt(Math.pow(a, 2) -  + Math.pow(b, 2));

        // I tried to make this a little more accurate, but it seemed to present a new bug where the shuriken can sometimes be count hitting the flying monster numerous times in a row with one shuriken
        if (flyingMonster.direction == 'left'){
            a -= flyingMonster.width * 0.5;
        } else if (flyingMonster.direction == 'right'){
            b += flyingMonster.width * 0.5;
        };

        if (shurikenDistance <= 60){
            shuriken.shift();
            flyingMonster.lives -= 1;
        }
    };

    // Hikaru hit by flying monster detection -- Example from class
    var c = Math.abs(flyingMonster.x - hikaru.x);
    var d = Math.abs(flyingMonster.y - hikaru.y);
    var distance = Math.sqrt(Math.pow(c, 2) + Math.pow(d, 2));

    // This seemed to make it more accurate to account for the changes in the X position when flipping the flying monster image
    if (flyingMonster.direction == 'left'){
        c -= flyingMonster.width * 0.5;
    } else if (flyingMonster.direction == 'right'){
        d += flyingMonster.width * 0.5;
    };

    lifeTrackerDelay --;

    if (distance <= 60 && lifeTrackerDelay < 0 && redrawDelay < 0) {
        hikaru.lives --;
        lifeTrackerDelay = 80;
        hikaruHit.play();
    };

    // Hikaru's Gravity - Everytime statement is true, it adds one to velocity Y
    if (hikaru.y < canvas.height - hikaru.height*1.75){
        hikaru.velY += 1
    };

    // The higher up on the canvas your character goes, the higher velocityY goes, therefore decreasing the jumping power of box.y 
    hikaru.y += hikaru.velY;

    // Resets the value of velocity Y when the character is standing on the ground
    if (hikaru.y > canvas.height - hikaru.height){
        hikaru.velY = 0;
    };

    // Hikaru jump with jump delay
    jumpDelay --;
    if (pressedKeys[32] && jumpDelay < 0){
        hikaru.velY = -18;
        jumpDelay = 60;
    };
    
    // Flying monster code
    // Flying monster - direction change + re-draw delay
    redrawDelay --;

    if (flyingMonster.direction == "left")
    {
        // If lives are at zero, start the delay counter
        if (flyingMonster.lives == 0)
        {
            flyingMonsterSound.play();
            flyingMonster.lives = 4;
            redrawDelay = 600;
        }
        else if (flyingMonster.lives > 0 && redrawDelay < 0) 
        {
            ctx.drawImage(sprites[flyingMonster.counter], 
            flyingMonster.x - flyingMonster.width,
            flyingMonster.y, 
            flyingMonster.width, 
            flyingMonster.height);
        }
    }
    else 
    {
        // If lives are at zero, start the delay counter
        if (flyingMonster.lives == 0)
        {
            flyingMonsterSound.play();            
            flyingMonster.lives = 4;
            redrawDelay = 600;
        }
        else if (flyingMonster.lives > 0 && redrawDelay < 0)         
        {
            ctx.scale(-1, 1);
            ctx.drawImage(sprites[flyingMonster.counter], 
            - flyingMonster.x - flyingMonster.width, 
            flyingMonster.y, 
            flyingMonster.width, 
            flyingMonster.height);
            ctx.scale(-1, 1);
        }  
    };

    // Flying monster wall collision detector - Example used from class
    flyingMonster.x += (flyingMonster.velX * 3);
    flyingMonster.y += (flyingMonster.velY * 3);

    if (flyingMonster.y > canvas.height - flyingMonster.height || flyingMonster.y < 0){
        flyingMonster.velY *= -1
    };

    // There's a bug here that I haven't figured out. 
    // The enemy gets caught in a loop swapping between a negative and postive value velX every once in a while, and just stays glued to the right or left borders of the canvas 
    if (flyingMonster.x > canvas.width){
        flyingMonster.velX *= -1;
        flyingMonster.direction = "left";
    } else if (flyingMonster.x < 0){
        flyingMonster.velX *= -1;
        flyingMonster.direction = "right";
    };

    // Flying monster image change 
    flyingMonsterDelay--;
    if (flyingMonsterDelay < 0){
        flyingMonsterDelay = 20;
        flyingMonster.counter++
    };

    if (flyingMonster.counter > 13){
        flyingMonster.counter = 11;
    };

    // UZAI (sumo boss)
    // Only show sumo once end of map is reached
    if (background.x < -3000 && sumo.lives > 0){

        sumoImageCounter --;

        ctx.drawImage(sprites[sumo.counter], sumo.x, sumo.y, sumo.width, sumo.height);
        
        // Animation
        if (sumoImageCounter < 0)
        {
                sumo.counter++;
                sumoImageCounter = 15;
    
                if (sumo.counter > 9)
                {
                    sumo.counter = 7;
                }
        };

        // Wait until sumo has landed on the canvas, then adjust the sumo's x position according to the background's position
        if (sumoJumpCounter > 1){
            if (pressedKeys[39] == true){
                if (background.x < -4650){
                    sumo.x = sumo.x
                } else {
                    sumo.x -= 5
                }
                }
                else if (pressedKeys[37] == true){
                sumo.x += 5;
            };
        };

        // Draw healthbar based on lives
        switch (sumo.lives){
            case 10:
                ctx.drawImage(sprites[19], canvas.width * 0.48, 10, 800, 35);
                break;
            case 9: 
                ctx.drawImage(sprites[20], canvas.width * 0.48, 10, 800, 35);
                break;
            case 8:
                ctx.drawImage(sprites[21], canvas.width * 0.48, 10, 800, 35);
                break;
            case 7:
                ctx.drawImage(sprites[22], canvas.width * 0.48, 10, 800, 35);
                break;
            case 6: 
                ctx.drawImage(sprites[23], canvas.width * 0.48, 10, 800, 35);
                break;
            case 5: 
                ctx.drawImage(sprites[24], canvas.width * 0.48, 10, 800, 35);
                break;
            case 4: 
                ctx.drawImage(sprites[25], canvas.width * 0.48, 10, 800, 35);
                break;
            case 3: 
                ctx.drawImage(sprites[26], canvas.width * 0.48, 10, 800, 35);
                break;
            case 2: 
                ctx.drawImage(sprites[27], canvas.width * 0.48, 10, 800, 35);
                break;
            case 1: 
                ctx.drawImage(sprites[28], canvas.width * 0.48, 10, 800, 35);
                break;
        };

        // Sumo gravity
        if (sumo.y < canvas.height - (sumo.height + hikaru.height)){
            sumo.velY += 0.3
        };

        // Jump up in the air 
        if (sumoJumpCounter >= 75 && sumoJumpCounter <= 125){
            sumo.y -= sumo.velY;
            sumoJumpCounter += 0.6;
            if (sumo.y <= 0 - sumo.height){ // Wait until sumo is above the line of visibility to change his X position randomly between 100 and 1000
                sumo.x = randomIntFromInterval(-600, 1600);
            };
        } else if (sumoJumpCounter > 125 || sumoJumpCounter < 75){
            sumo.y += sumo.velY;
        };

        if (sumoJumpCounter > 175){
            sumoJumpCounter = 0;
        };

        // Keeps sumo landing on the same platform as main character -- Increases jump counter as long as he's on the platform
        if (sumo.y > canvas.height - (sumo.height + (hikaru.height / 2))) {
                sumo.y = canvas.height - (sumo.height + (hikaru.height / 2)); 
                sumoJumpCounter += 0.6;
        };

        // Shuriken hit detection -- sumo version.
        for (i = 0; i < shuriken.length; i++){

            var a = Math.abs(shuriken[i].x - sumo.x);
            var b = Math.abs(shuriken[i].y - sumo.y);
            var shurikenDistance = Math.sqrt((Math.pow(a, 2) - sumo.width) + (Math.pow(b, 2) - (sumo.height * 0.5)));

            if (shurikenDistance <= 300){
                sumoHit.play();
                shuriken.shift();
                sumo.lives -= 1;
            }
        };

        // Hikaru hit by sumo detection -- Adjusted for character dimensions
        var e = Math.abs(sumo.x + (sumo.width * 0.5) - hikaru.x);
        var f = Math.abs((sumo.y + (sumo.height * 0.5) - (hikaru.y + (hikaru.height * 0.5))));
        var distance = Math.sqrt(Math.pow(e, 2) + Math.pow(f, 2));

        lifeTrackerDelay --;

        if (distance <= 150 && lifeTrackerDelay < 0) {
            hikaruHit.play();
            hikaru.lives --;
            lifeTrackerDelay = 200;
        };

    }; //Sumo code end

    // End game
    if (sumo.lives == 0 || hikaru.lives == 0){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.cancelAnimationFrame(frame);
        startButton.style.display = "none";
        canvas.style.display = "none";
        bossMusic.stop();

        // Win
        if (sumo.lives == 0)
        {
            sumoDeath.play();
            winGame.style.display = "block";
            loseGame.style.display = "none";
            retryButton.style.display = "block";
        } 
        // Lose
        else if (hikaru.lives == 0)
        {
            loseGame.style.display = "block";
            winGame.style.display = "none";
            retryButton.style.display = "block";
        }
    } 
    else
    {
        window.requestAnimationFrame(frame);
    };
};

// Shuriken throw
document.addEventListener('keypress', function(e){
    if (pressedKeys[81]) {
        if (shuriken.direction == "right"){
            shuriken.push({x: hikaru.x + hikaru.width, y: hikaru.y + hikaru.height/2, direction: hikaru.direction});
        }
        else {
            shuriken.push({x: (hikaru.x - 20), y: hikaru.y + hikaru.height/2, direction: hikaru.direction});
        }
}});