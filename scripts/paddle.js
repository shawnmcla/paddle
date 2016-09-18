var Direction = {
    "TOP": 0,
    "RIGHT": 1,
    "BOTTOM": 2,
    "LEFT": 3
}

class Stage extends createjs.Stage {

    constructor(canvasWidth, canvasHeight, canvasId) {
        super(canvasId);
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    get top() { return -this.height / 2; }
    get bottom() { return this.height / 2; }
    get left() { return -this.width / 2; }
    get right() { return this.width / 2; }
}

let stage = new Stage(800, 600, "gameCanvas");
stage.on("click", function (e) {
    game.addBall(e.stageX, e.stageY);
    console.log(e);
    console.log(`CRICK! x ${e.stageX}, y ${e.stageY}`);
});

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class ShapeGameObject extends createjs.Shape {
    constructor(startX, startY, width, height, moveable = true, gravity = 1500) {
        super();
        this.width = width;
        this.height = height;
        this.x = startX;
        this.y = startY;
        this.vel = new Vector();
        this.moveable = moveable;
        this.gravity = gravity;
    }

    get left() { return this.x - (this.width / 2); }
    get right() { return this.x + (this.width / 2); }
    get top() { return this.y - (this.height / 2); }
    get bottom() { return this.y + (this.height / 2); }

    update(deltaTime) {
        if (this.moveable) {
            this.vel.y += this.gravity * deltaTime;
            this.x += this.vel.x * deltaTime;
            this.y += this.vel.y * deltaTime;
        }
    }
}

class GameObject extends createjs.Shape {
    constructor(startX, startY, width, height, moveable = true, gravity = 1500) {
        super();
        this.width = width;
        this.height = height;
        this.x = startX;
        this.y = startY;
        this.vel = new Vector();
        this.moveable = moveable;
        this.gravity = gravity;
    }

    get left() { return this.x - (this.width / 2); }
    get right() { return this.x + (this.width / 2); }
    get top() { return this.y - (this.height / 2); }
    get bottom() { return this.y + (this.height / 2); }

    update(deltaTime) {
        if (this.moveable) {
            this.vel.y += this.gravity * deltaTime;
            this.x += this.vel.x * deltaTime;
            this.y += this.vel.y * deltaTime;
        }
    }
}

class Background extends createjs.Bitmap {
    constructor(bgstring) {
        super(bgstring);
    }
}

class Ball extends GameObject {
    constructor(startX, startY, radius = 10) {
        super(startX, startY, radius, radius);
        this.graphics
            .setStrokeStyle(2)
            .beginStroke("#000")
            .beginFill("#F00")
            .drawCircle(0, 0, radius);
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    collide(direction) {
        console.log(`COLLISION!! DIRECTION: ${direction}`);
        if (direction == null) {
            return;
        }
        else if (direction === Direction.TOP || direction === Direction.BOTTOM) {
            this.vel.y = -this.vel.y;
        }
        else {
            this.vel.x = - this.vel.x;
        }
    }
}

class Border extends GameObject {
    constructor(startX, startY, width, height) {
        super(startX, startY, width, height, false, 0);
        this.graphics.beginFill("Blue").drawRect(0, 0, this.width, this.height);
    }
}

class Game {
    constructor(canvasWidth, canvasHeight) {
        //staticObjects do not move and thus do not require an update() call
        this.staticObjects = [];
        this.staticObjects.push(new Background("assets/images/background1.jpg"));
        //Side borders
        this.staticObjects.push(new Border(-25, -25, 25, stage.height + 50));//left
        this.staticObjects.push(new Border(stage.width, -25, 25, stage.height + 50)); //right

        this.staticObjects.push(new Border(-25, -25, stage.width + 50, 25)); //top
        this.staticObjects.push(new Border(-25, stage.height, stage.width + 50, 25));

        this.staticObjects.forEach(obj => stage.addChild(obj));
        //gameObjects are objects which move and/or are interactive
        this.gameObjects = {};
        this.gameObjects.balls = [];
        this.gameObjects.balls.push(new Ball(100, 250));
        this.gameObjects.balls.forEach(obj => stage.addChild(obj));
        //values needed for keeping track of time
        this._accumulator = 0;
        let lastTime;
        this.step = 1 / 120;

        //used to handle update cycles
        const callback = time => {
            if (lastTime) {
                this.update((time - lastTime) / 1000);
            }
            lastTime = time;
            requestAnimationFrame(callback);
        }
        callback();
    }

    checkCollision(first, second) {
        var vectorX = (first.x + (first.width / 2)) - (second.x + (second.width / 2)),
            vectorY = (first.y + (first.height / 2)) - (second.y + (second.height / 2)),
            halfWidths = (first.width / 2) + (second.width / 2),
            halfHeights = (first.height / 2) + (second.height / 2),
            direction = null;

        if (Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights) { //if is colliding
            var offsetX = halfWidths - Math.abs(vectorX),
                offsetY = halfHeights - Math.abs(vectorY);
            //Figure the direction of the collision, and then adjust shapes as to not penetrate each other
            if (offsetX >= offsetY) {
                if (vectorY > 0) {
                    direction = Direction.TOP;
                    first.y += offsetY;
                } else {
                    direction = Direction.BOTTOM;
                    first.y -= offsetY;
                }
            } else {
                if (vectorX > 0) {
                    direction = Direction.LEFT;
                    first.x += offsetX;
                } else {
                    direction = Direction.RIGHT;
                    first.x -= offsetX;
                }
            }
        }
        if (first.collide && direction != null) {
            first.collide(direction);
        }
        return direction;
    }

    start() {

    }

    draw() {
        stage.update();
    }

    simulate(deltaTime) {
        this.gameObjects.balls.forEach(ball => ball.update(deltaTime));
        this.gameObjects.balls.forEach(ball => this.staticObjects.forEach(staticobj => this.checkCollision(ball, staticobj)));
    }

    update(deltaTime) {
        this._accumulator += deltaTime;
        while (this._accumulator > this.step) {
            this.simulate(this.step);
            this._accumulator -= this.step;
        }
        this.draw();
    }

    addBall(x, y) {
        let ball = new Ball(x, y);
        this.gameObjects.balls.push(ball);
        stage.addChild(ball);
    }
}

let game = new Game();
game.start();
