"use strict";

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

const canvas = document.getElementById('mainRenderCanvas');
assert(canvas != null, "Can't get canvas");
assert(canvas.getContext != undefined, "mainRenderCanvas is not a canvas");

canvas.width = 1000;
canvas.height = 500;

window.addEventListener('resize', function () {
    canvas.style.width = window.innerWidth - (window.innerWidth % cellSize);
    canvas.style.height = window.innerHeight - (window.innerHeight % cellSize);
}, false);

const ctx = canvas.getContext("2d");
assert(ctx != null, "Can't get 2D context");
console.log(ctx);

const cellCount = 50;
const cellSize = Math.floor(canvas.clientWidth / cellCount - 2);
var gameOver = false;
var restart = false;

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function toCellPading(value) {
    return value - value % cellSize;
}

class Apple {
    constructor(x, y) {
        this.x = toCellPading(randInt(0, canvas.width));
        this.y = toCellPading(randInt(0, canvas.height));
    }

    NewPos() {
        this.x = toCellPading(randInt(0, canvas.width));
        this.y = toCellPading(randInt(0, canvas.height));
    }
}

class SnekBlock {
    constructor(x, y) {
        this.x = toCellPading(x);
        this.y = toCellPading(y);
    }
}

const Directions = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };
class Snek {
    constructor() {
        this.snekBody = []
        this.snekDirection = randInt(Directions.UP, Directions.RIGHT);
        this.snekBodyLen = 0;

        this.snekHeadX = toCellPading(canvas.width / 2);
        this.snekHeadY = toCellPading(canvas.height / 2);
    }

    UpdatePos() {
        switch (this.snekDirection) {
            case Directions.UP:
                this.snekHeadY -= cellSize;
                break;
            case Directions.DOWN:
                this.snekHeadY += cellSize;
                break;
            case Directions.LEFT:
                this.snekHeadX -= cellSize;
                break;
            case Directions.RIGHT:
                this.snekHeadX += cellSize;
                break;
        }

        for (let i = 0; i < this.snekBody.length; i++) {
            let part = this.snekBody[i];
            if (part.x === this.snekHeadX && part.y === this.snekHeadY) {
                gameOver = true;
                break;
            }
        }

        if (this.snekHeadY > canvas.height)
            this.snekHeadY = 0;
        else if (this.snekHeadY < 0)
            this.snekHeadY = canvas.height;

        if (this.snekHeadX > canvas.width)
            this.snekHeadX = 0;
        else if (this.snekHeadX < 0)
            this.snekHeadX = canvas.width;
    }

    Update() {
        ctx.fillStyle = 'green';
        for (let i = 0; i < this.snekBody.length; i++) {
            let part = this.snekBody[i];
            ctx.fillRect(part.x, part.y, cellSize - 1, cellSize - 1);
        }

        this.snekBody.push(new SnekBlock(this.snekHeadX, this.snekHeadY));
        if (this.snekBody.length > this.snekBodyLen) {
            this.snekBody.shift();
        }

        ctx.fillStyle = 'orange';
        ctx.fillRect(this.snekHeadX, this.snekHeadY, cellSize - 1, cellSize - 1);
    }
}

const snek = new Snek();
const apple = new Apple();

document.body.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            if (snek.snekDirection != Directions.DOWN)
                snek.snekDirection = Directions.UP;
            break;
        case 'KeyS':
        case 'ArrowDown':
            if (snek.snekDirection != Directions.UP)
                snek.snekDirection = Directions.DOWN;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            if (snek.snekDirection != Directions.RIGHT)
                snek.snekDirection = Directions.LEFT;
            break;
        case 'KeyD':
        case 'ArrowRight':
            if (snek.snekDirection != Directions.LEFT)
                snek.snekDirection = Directions.RIGHT;
            break;
        case 'Space':
            if (gameOver)
                restart = true;
            break;
    }
});

const tickCount = 5;
setInterval(function renderCallback() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear the canvas with black color

    if (!gameOver)
        snek.UpdatePos();
    snek.Update();

    if (apple.x == snek.snekHeadX && apple.y == snek.snekHeadY) {
        apple.NewPos();
        snek.snekBodyLen += 1;
    }

    // Apple update
    {
        ctx.fillStyle = "red";
        ctx.fillRect(apple.x, apple.y, cellSize - 1, cellSize - 1);
    }

    if (gameOver) {
        function getTextWidth(text, font) {
            ctx.font = font;
            const metrics = ctx.measureText(text);
            return [metrics.width, metrics.height];
        }

        const fontSize = cellSize * 2;
        const gameOverText = 'FUCK';
        const continueText = '(press Space to restart)';
        ctx.fillStyle = 'red';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(gameOverText, canvas.width / 2 - getTextWidth(gameOverText)[0] / 2, canvas.height / 2);
        ctx.font = `bold ${fontSize / 2}px Arial`;
        ctx.fillText(continueText, canvas.width / 2 - getTextWidth(continueText)[0] / 2, canvas.height / 2 + fontSize);

        if (restart == true)
            location.reload();
    }

}, 1000 / tickCount);
