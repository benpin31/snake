/* various function */

function positivMod(n, mod) {
    // classic n%mod operator gives a negative number when n < 0. This function give a positive modulo in such cases .
    return (n%mod+mod)%mod;
}

/* various object*/

class freeGrid {
    constructor(dimensions) {
        let yTree = [];
        for (let k = 0; k < dimensions[1]; k++) {
            yTree.push(k)
        }
        this._freeGrid = [] ;
        for (let k = 0; k < dimensions[0]; k++) {
            this._freeGrid.push([k,yTree.slice()])
        }
    }

    get freeGrid() {
        return this._freeGrid;
    }

    findXCoordinate(xCoordinate) {
        let xCpt = 0;

        while (xCpt < this._freeGrid.length && xCoordinate !== this._freeGrid[xCpt][0]) {
            xCpt++;
        } 

        if(xCpt === this._freeGrid.length) {
            return [];
        } else {
            return([xCpt]) ;
        }

    }

    findCoordinates(coordinates) {
        let yCpt = 0;

        let xCoordinate = this.findXCoordinate(coordinates[0])

        if(xCoordinate.length === 0) {
            return [];
        } else {
            while (yCpt < this._freeGrid[xCoordinate[0]][1].length && coordinates[1] != this._freeGrid[xCoordinate[0]][1][yCpt]) {
                yCpt++;
            }

            if(yCpt === this._freeGrid[xCoordinate[0]][1].length) {
                return xCoordinate;

            }
            else {
                xCoordinate.push(yCpt)
                return xCoordinate;
            }
        }
    }

    removeFreeCoordinates(coordinates) {
        let index = this.findCoordinates(coordinates) ;

        if (index.length == 2) {
            this._freeGrid[index[0]][1].splice(index[1], 1) ;
            if (this._freeGrid[index[0]][1].length === 0) {
                this._freeGrid.splice(index[0], 1) ;
            }
        }

    }

    addFreeCoordinates(coordinates) {
        let index = this.findCoordinates(coordinates) ;

        if(index.length !== 2) {
            if(index.length == 0) {
                this._freeGrid.push([coordinates[0], [coordinates[1]]]) ;
            } else {
                this._freeGrid[index[0]][1].push(coordinates[1]) ;
            }
        }

    }

    chooseRandomFreeCoordinates() {
        let xRand = Math.floor(Math.random() * this._freeGrid.length);
        let yRand = Math.floor(Math.random() * this._freeGrid[xRand][1].length);
        return [this._freeGrid[xRand][0],this._freeGrid[xRand][1][yRand]] ;
    }

}




/*  Object grid */

class grid extends freeGrid {
    constructor(dimensions, applePosition) {
        // all position = [absciss, ordinate]? More over, if a grid has dimension n,m, absisses corrdinates will be
        // index from 0 to n-1 and ordinates from 0 to m-1. If fact the grid is a Z/nZ x Z/mZ grid
        super(dimensions) ;
        this._dimensions = dimensions ;
        this._applePosition = applePosition ;
    }

    get dimensions() {
        return this._dimensions ;
    }

    get applePosition() {
        return this._applePosition ;
    }

    set dimensions(dimensions) {
        this._dimensions = dimensions ;
    }

    set applePosition(size) {
        this._applePosition = size ;
    }

    /*  */

    isAnApple(position) {
        return position[0] === this._applePosition[0] && position[1] === this._applePosition[1];
    }


}

/*  Object snake */


class snake {
    /* constructor */
    constructor(direction, position) {
        // all position = [absciss, ordinate]? More over, if a grid has dimension n,m, absisses corrdinates will be
        // index from 0 to n-1 and ordinates from 0 to m-1. If fact the grid is a Z/nZ x Z/mZ grid
        this._direction = direction ;
        // N, S, E, W
        this._position = position ;
        // last element of position is the head of the snake
        this._isDead = false ;
    }

    /* getters and setters */

    get direction() {
        return this._direction ;
    }

    get position() {
        return this._position ;
    }

    get isDead() {
        return this._isDead
    }

    getHeadPosition() {
        return(this._position[this._position.length-1])
    }

    set direction(direction) {
        this._direction = direction;
    }

    set position(position) {
        this._position = position;
    }

    set isDead(isDead) {
        this._isDead = isDead ;
    }

    /* Various */

    copySnakePosition() {
        let copy = [];
    
        this._position.forEach(cell => {
            copy.push(cell.slice()) ;
        }) ;
        return(copy) ;
    }

    /* Moving function */

    nextHeadPosition(gridInstance) {
        let nextHeadPosition ;
        let headPosition = this.getHeadPosition().slice();

        switch(this._direction) {
            case 'N':
                nextHeadPosition = [headPosition[0], positivMod(headPosition[1] + 1, gridInstance.dimensions[1])] ;
                break;
            case 'S':
                nextHeadPosition = [headPosition[0], positivMod(headPosition[1] - 1, gridInstance.dimensions[1])] ;
                break;
            case 'E':
                nextHeadPosition = [positivMod(headPosition[0] + 1, gridInstance.dimensions[0]), headPosition[1]] ;
                break ;
            case 'W':
                nextHeadPosition = [positivMod(headPosition[0] - 1, gridInstance.dimensions[0]), headPosition[1]] ;
                break ;
            default:
                nextHeadPosition = headPosition ;
        }

        return nextHeadPosition
    }

    static willCrashed(nextPosition) {
        let cpt = 0 ;
        let headPosition = nextPosition[nextPosition.length-1] ;

        nextPosition.slice(0, nextPosition.length-1).forEach(part => {
            if (part[0] === headPosition[0] && part[1] === headPosition[1]) {
                cpt++;
            }
        });
        return cpt > 0;
    }



    move(gridInstance) {
        let nextHeadPosition = this.nextHeadPosition(gridInstance) ;
        let nextPosition = this.copySnakePosition() ;

        if (!this._isDead) {
            optimAffichage.toDraw = nextHeadPosition ;
            gridInstance.removeFreeCoordinates(nextHeadPosition) ;

            if (gridInstance.isAnApple(nextHeadPosition)) {
                optimAffichage.toErase = [] ;
                nextPosition.push(nextHeadPosition) ;
                gridInstance.applePosition = gridInstance.chooseRandomFreeCoordinates() ;
                if(gameState.speed > 100) {
                    gameState.speed -= (gameState.speed-50)/((gameState.nbCells/4) ** 2)
                    console.log(gameState.speed)
                };
                bossChoose.choice = Math.floor(Math.random() * 3) +1;
            } else {
                optimAffichage.toErase = nextPosition[0] ;       
                gridInstance.addFreeCoordinates(nextPosition[0]) ;
                nextPosition.push(nextHeadPosition) ;
                nextPosition.shift() ; 
            }
    
            if (snake.willCrashed(nextPosition, gridInstance)) {
                this._isDead = true ;
                optimAffichage.toDraw = this._position[this.position.length-1] ;
                optimAffichage.toErase = [] ;  
            } else {
                this._position = nextPosition ;
            }

        }

    }

}

class game {
    constructor(dimensions) {
        let snakePosition = [Math.floor(dimensions[0]/2), Math.floor(dimensions[1]/2)] ;

        this._snake = new snake('E', [snakePosition]) ;

        this._grid = new grid(dimensions, [0,0]) ;
        snakePosition.forEach(pos => {
            this._grid.removeFreeCoordinates(pos) ;
        } )
        this._grid.applePosition = this._grid.chooseRandomFreeCoordinates() ;

        this._gameStatus = "gameOn" ;
    }

    newGame(dimensions) {
        let snakePosition = [Math.floor(dimensions[0]/2), Math.floor(dimensions[1]/2)] ;

        this._snake = new snake('E', [snakePosition]) ;

        this._grid = new grid(dimensions, [0,0]) ;
        snakePosition.forEach(pos => {
            this._grid.removeFreeCoordinates(pos) ;
        } )
        this._grid.applePosition = this._grid.chooseRandomFreeCoordinates() ;

        this._gameStatus = "gameOn" ;    
    }

    get grid() {
        return this._grid ;
    }

    get snake() {
        return this._snake ;
    }

    get gameStatus() {
        return(this._gameStatus) ;
    }

    setExecution() {
        this._snake.move(this._grid);

        if (this._snake.isDead) {
            this._gameStatus = "gameOver"
        } 
    }

}


/* main */

const unity = {unity:0};
const optimAffichage = {toDraw:[], toErase:[]};

const speed = 400;
const gameState = {interval:[], speed: speed, nbCells:30}
const gameInstance = new game([gameState.nbCells,gameState.nbCells]);

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const snakeLeft = document.getElementById("snake-left");
const snakeRight = document.getElementById("snake-right");
const snakeUp = document.getElementById("snake-up");
const snakeDown = document.getElementById("snake-down");

const boss1 = document.getElementById("boss-1");
const boss2 = document.getElementById("boss-2");
const boss3 = document.getElementById("boss-3");

const bossChoose = {choice:1} ;

function snakeSprite(game) {
    let sprite ; 
    switch(game.snake.direction) {
        case 'N':
            sprite = snakeUp ;
            break;
        case 'S':
            sprite = snakeDown ;
            break;
        case 'E':
            sprite = snakeRight ;
            break;
        case 'W':
            sprite = snakeLeft ;
            break;
    }

    return sprite ;
}

function bossSprite() {
    let sprite ;
    switch(bossChoose.choice) {
        case 1:
            sprite = boss1 ;
            break ;
        case 2:
            sprite = boss2 ;
            break ;
        case 3:
            sprite = boss3 ;
            break ;
    }

    return sprite;
}

const roverSprite = document.getElementById("rover");

function getUnity() {
    
    let documentDimension={width:document.body.clientWidth, height:document.body.clientHeight } ;
  
    unity.unity = Math.min(documentDimension.width, documentDimension.height*0.8)/gameState.nbCells
    document.getElementById("game-interface").style.width = gameState.nbCells*unity.unity+"px";

}

function UpdateGridSize(ctx, h, w) {
    /* Draw the grid on wich the rover is moving */
    ctx.canvas.width  = w;
    ctx.canvas.height = h;
}

function drawImage(ctx,image, x, y, w, h, radian){
    /* Improbe the drawImage function of canvasContect object allowing it to rotate and image */
    ctx.save();
    ctx.translate(x+w/2, y+h/2);
    ctx.rotate(radian);
    ctx.translate(-x-w/2, -y-h/2);
    ctx.drawImage(image, x, y, w, h);
    ctx.restore();
} 

function drawGame(ctx, game) {
    let absciss ;
    let ordinate ;

    game.snake.position.forEach(position => {[game.snake.position.length-1] ;
        ordinate= (game.grid.dimensions[1] - position[1]-1)*unity.unity ;
        absciss = (position[0])*unity.unity ;
        ctx.beginPath();
        /*ctx.fillStyle = "black";
        ctx.arc(absciss+unity.unity/2, ordinate+unity.unity/2, unity.unity/2.3, 0, 2 * Math.PI);
    ctx.fill() */
    drawImage(ctx,snakeSprite(game),absciss, ordinate, unity.unity,unity.unity, 0);}) 
}

function drawMove(ctx, game) {
    /* plot rover sprite and obstacle given there position and direction (for rover) */
    let absciss ;
    let ordinate ;

    if (game.gameStatus !== "gameOver") {
        if(optimAffichage.toDraw.length > 0) {
            ordinate= (game.grid.dimensions[1] - optimAffichage.toDraw[1]-1)*unity.unity ;
            absciss = (optimAffichage.toDraw[0])*unity.unity ;
            ctx.beginPath();
            /*ctx.fillStyle = "black";
            ctx.arc(absciss+unity.unity/2, ordinate+unity.unity/2, unity.unity/2.3, 0, 2 * Math.PI);
            ctx.fill()*/
            drawImage(ctx,snakeSprite(game),absciss, ordinate, unity.unity,unity.unity, 0);
            ; 

            if(optimAffichage.toErase.length > 0) {
                ordinate= (game.grid.dimensions[1] - optimAffichage.toErase[1]-1)*unity.unity ;
                absciss = (optimAffichage.toErase[0])*unity.unity ;
                ctx.beginPath();
                ctx.clearRect(absciss, ordinate,unity.unity, unity.unity) ;
            }
    
        } else {
            drawGame(ctx, game)
        }
    
        ordinate= (game.grid.dimensions[1] - game.grid.applePosition[1]-1)*unity.unity ;
        absciss = (game.grid.applePosition[0])*unity.unity ;
        ctx.beginPath();
        /*ctx.fillStyle = "red";
        ctx.arc(absciss+unity.unity/2, ordinate+unity.unity/2, unity.unity/2.3, 0, 2 * Math.PI);
        ctx.fill()*/
        console.log(bossChoose) ;
        drawImage(ctx,bossSprite(),absciss, ordinate, unity.unity,unity.unity, 0);
    } else {
        gameOver() ;
    }
 
    document.getElementById("score-value").innerHTML = gameInstance.snake.position.length;
    document.getElementById("speed").innerHTML = Math.floor(1000/gameState.speed) + "moves/second" ;


}


function onTheTop() {
    gameInstance.snake.direction = 'N';
}

function down() {
    gameInstance.snake.direction = 'S';
}

function toTheLeft() {
    gameInstance.snake.direction = 'W';
}

function toTheRight() {
    gameInstance.snake.direction = 'E';
}


function whenRefresh() {
    getUnity();
    UpdateGridSize(ctx, gameState.nbCells*unity.unity, gameState.nbCells*unity.unity) ;
    drawGame(ctx, gameInstance) ;
    drawMove(ctx, gameInstance) ;
    document.getElementById("score-value").innerHTML = gameInstance.snake.position.length;
    document.getElementById("speed").innerHTML = Math.floor(10000/gameState.speed)/10 + " moves/second" ;

}

window.onload = whenRefresh;
window.onresize = whenRefresh;


function startGame() {
    gameInstance.setExecution() ;
    drawMove(ctx, gameInstance) ;

    if(gameInstance.gameStatus !== "gameOver") {
        gameState.interval = setTimeout(startGame, gameState.speed);
    }

}

function stop() {
    clearTimeout(gameState.interval) ;
}

function gameOver() {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height) ;
}

function newGame() {
    clearTimeout(gameState.interval) ;
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height) ;

    gameState.interval = [] ;
    gameState.speed = speed;
    gameState.nbCells = 30;

    optimAffichage.toDraw = [] ;
    optimAffichage.toErase = [] ;

    gameInstance.newGame([gameState.nbCells,gameState.nbCells]) ;

    drawGame(ctx, gameInstance) ;
    drawMove(ctx, gameInstance) ;
}


window.addEventListener('keydown',check,false);

function check(e) {
    var code = e.keyCode;
    //Up arrow pressed
    switch(code) {
        case 37:
            toTheLeft();
            break;
        case 38:
            onTheTop();
            break;
        case 39:
            toTheRight();
            break;
        case 40:
            down();
            break;
    }
    console.log(gameInstance.snake.direction)
}