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
        this._stepDirection = direction;
        this._position = position ;
        // last element of position is the head of the snake
        this._isDead = false ;
        this._diffAfterMove = {toDraw:position[0], toErase:[]};
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

    get diffAfterMove() {
        return this._diffAfterMove
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

    set diffAfterMove(diffAfterMove) {
        this._diffAfterMove = diffAfterMove ;
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
            this.diffAfterMove.toDraw = nextHeadPosition ;
            gridInstance.removeFreeCoordinates(nextHeadPosition) ;

            if (gridInstance.isAnApple(nextHeadPosition)) {
                this.diffAfterMove.toErase = [] ;
                nextPosition.push(nextHeadPosition) ;
                gridInstance.applePosition = gridInstance.chooseRandomFreeCoordinates() ;
                if(gameInstance.stepSpeed > gameInstance.maxSpeed) {
                    gameInstance.stepSpeed -= (gameInstance.stepSpeed-gameInstance.maxSpeed)/((gameInstance.nbCells/4) ** 2)
                    console.log(gameInstance.stepSpeed)
                };
            } else {
                this.diffAfterMove.toErase = nextPosition[0] ;       
                gridInstance.addFreeCoordinates(nextPosition[0]) ;
                nextPosition.push(nextHeadPosition) ;
                nextPosition.shift() ; 
            }
    
            if (snake.willCrashed(nextPosition, gridInstance)) {
                this._isDead = true ;
                this.diffAfterMove.toDraw = this._position[this.position.length-1] ;
                this.diffAfterMove.toErase = [] ;  
            } else {
                this._position = nextPosition ;
            }

            this.stepDirection = this._direction;

        }

    }
}

class game {
    constructor(nbCells, minSpeed, maxSpeed, snakeDirection) {
        let gridDimension = [nbCells,nbCells] ;
        let snakePosition = [Math.floor(gridDimension[0]/2), Math.floor(gridDimension[1]/2)] ;
        this._snake = new snake(snakeDirection, [snakePosition]) ;
        this._grid = new grid(gridDimension, [0,0]) ;
        this._grid.removeFreeCoordinates(snakePosition) ;
        this._grid.applePosition = this._grid.chooseRandomFreeCoordinates() ;
        this._stepSpeed = minSpeed;
        this._maxSpeed = maxSpeed;
        this._minSpeed = minSpeed;
        this._gameStatus = "gameOn" ;
        this._nbCells = nbCells;
        this._interval = [] ;
        this._snakeSprite = {
            left: document.getElementById("snake-left"),
            right: document.getElementById("snake-right"),
            up: document.getElementById("snake-up"),
            down: document.getElementById("snake-down")
        } ;
        this._appleSpriteChoice = 1 ;
        this._appleSprite = {
            boss1: document.getElementById("boss-1"),
            boss2: document.getElementById("boss-2"),
            boss3: document.getElementById("boss-3")

        }
        this._unity = 0;

    }

    newGame(snakeDirection) {
        let gridDimension = [this.nbCells,this.nbCells] ;
        let snakePosition = [Math.floor(gridDimension[0]/2), Math.floor(gridDimension[1]/2)] ;
        this._snake = new snake(snakeDirection, [snakePosition]) ;
        this._grid = new grid(gridDimension, [0,0]) ;
        this._grid.removeFreeCoordinates(snakePosition) ;
        this._grid.applePosition = this._grid.chooseRandomFreeCoordinates() ;
        this._stepSpeed = this.minSpeed;
        this._gameStatus = "gameOn" ;
        this._interval = [] ;
    }

    get grid() {
        return this._grid ;
    }

    get snake() {
        return this._snake ;
    }

    get gameStatus() {
        return this._gameStatus ;
    }

    get stepSpeed() {
        return this._stepSpeed;
    }

    get maxSpeed() {
        return this._maxSpeed ;
    }

    get minSpeed() {
        return this._minSpeed ;
    }

    get nbCells() {
        return this._nbCells ;
    }

    get interval() {
        return this._interval ;
    }

    get snakeSprite() {
        return this._snakeSprite ;
    }

    get appleSpriteChoice() {
        return this._appleSpriteChoice ;
    }

    get appleSprite() {
        return this._appleSprite ;
    }

    get unity() {
        return this._unity ;
    }

    set maxSpeed(maxSpeed) {
        this._maxSpeed = maxSpeed ;
    }

    set minSpeed(minSpeed) {
        this._minSpeed = minSpeed ;
    }

    set nbCells(nbCells) {
        this._nbCells = nbCells ;
    }

    set interval(interval) {
        this._interval = interval ;
    }

    set stepSpeed(stepSpeed) {
        this._stepSpeed = stepSpeed;
    }

    set unity(unity) {
        this._unity = unity ;
    }

    setExecution() {
        this._snake.move(this._grid);

        if (this._snake.isDead) {
            this._gameStatus = "gameOver"
        } 
    }

    updateGridSize(ctx) {
        let documentDimension={width:document.body.clientWidth, height:document.body.clientHeight } ;
        this.unity = Math.min(documentDimension.width, documentDimension.height*0.8)/this.nbCells ;
        document.getElementById("game-interface").style.width = this.nbCells*this.unity+"px";

        ctx.canvas.width  = this.nbCells*this.unity;
        ctx.canvas.height = this.nbCells*this.unity;
    
    }
    

    drawGameStep(ctx) {
    /* plot rover sprite and obstacle given there position and direction (for rover) */
        let absciss ;
        let ordinate ;

        if (this.gameStatus !== "gameOver") {
            if(this.snake.diffAfterMove.toDraw.length > 0) {
                if(this.snake.diffAfterMove.toErase.length > 0) {
                    ordinate= (this.grid.dimensions[1] - this.snake.diffAfterMove.toErase[1]-1)*this.unity ;
                    absciss = (this.snake.diffAfterMove.toErase[0])*this.unity ;
                    ctx.beginPath();
                    ctx.clearRect(absciss, ordinate,this.unity, this.unity) ;
                } else {
                    this._appleSpriteChoice = Math.floor(Math.random() * 3) +1;
                }

                ordinate= (this.grid.dimensions[1] - this.snake.diffAfterMove.toDraw[1]-1)*this.unity ;
                absciss = (this.snake.diffAfterMove.toDraw[0])*this.unity ;
                ctx.beginPath();
                ctx.clearRect(absciss, ordinate,this.unity, this.unity) ;
                ctx.drawImage(this.snakeSpriteAccordingDirection(),absciss, ordinate, this.unity,this.unity);
                ; 
        
            } 
        
            ordinate= (this.grid.dimensions[1] - this.grid.applePosition[1]-1)*this.unity ;
            absciss = (this.grid.applePosition[0])*this.unity ;
            ctx.beginPath();
            ctx.drawImage(this.chooseAppleSprite(),absciss, ordinate, this.unity,this.unity);

        } else {
            gameOver() ;
        }
    
        document.getElementById("score-value").innerHTML = this.snake.position.length;
        document.getElementById("speed").innerHTML = Math.floor(10000/this.stepSpeed)/10 + " moves/second" ;

    }

    snakeSpriteAccordingDirection() {
        let sprite ; 
        switch(this.snake.direction) {
            case 'N':
                sprite = this.snakeSprite.up ;
                break;
            case 'S':
                sprite = this.snakeSprite.down ;
                break;
            case 'E':
                sprite = this.snakeSprite.right ;
                break;
            case 'W':
                sprite = this.snakeSprite.left ;
                break;
        }
    
        return sprite ;
    }

    chooseAppleSprite() {
        let sprite ;
        switch(this.appleSpriteChoice) {
            case 1:
                sprite = this.appleSprite.boss1 ;
                break ;
            case 2:
                sprite = this.appleSprite.boss2 ;
                break ;
            case 3:
                sprite = this.appleSprite.boss3 ;
                break ;
        }
    
        return sprite;
    }



}



/* Interaction utilisateur */

function newGame() {
    canPressButton.start = true
    clearTimeout(gameInstance.interval) ;
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height) ;
    gameInstance.newGame('E');
    gameInstance.drawGameStep(ctx) ;
}

const canPressButton = {new: true, start: true, pause: 0} ;


function stop() {

    if(canPressButton.pause%2 === 0) {
        clearTimeout(gameInstance.interval) ;
        canPressButton.pause++;
        ctx2.fillStyle = "#00000080";
        ctx2.fillRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    } else {
        canPressButton.pause++;
        ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
        if (!canPressButton.start) {
            activateGame() ;
        }
    }
}

function gameOver() {
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height) ;
}

function activateGame() {
    gameInstance.setExecution() ;
    gameInstance.drawGameStep(ctx) ;

    if(gameInstance.gameStatus !== "gameOver") {
        gameInstance.interval = setTimeout(activateGame, gameInstance.stepSpeed);
    }
}

function pressStart() {
    if (canPressButton.start) {
        canPressButton.start = false ;
        activateGame() ;
    }
}

function onTheTop() {
    if(gameInstance.snake.stepDirection !== 'S') {
        gameInstance.snake.direction = 'N';
    }
}

function down() {
    if(gameInstance.snake.stepDirection !== 'N') {
        gameInstance.snake.direction = 'S';
    }
}

function toTheLeft() {
    if(gameInstance.snake.stepDirection !== 'E') {
        gameInstance.snake.direction = 'W';
    }
}

function toTheRight() {
    if(gameInstance.snake.stepDirection !== 'W') {
        gameInstance.snake.direction = 'E';
    }}

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
    }

function whenRefresh() {
    gameInstance.updateGridSize(ctx) ;
    gameInstance.drawGameStep(ctx) ;
}

window.onload = whenRefresh;
window.onresize = whenRefresh;

/* main */


const canvasGame = document.getElementById("canvas-game");
const canvasPause = document.getElementById("canvas-pause");
const ctx = canvasGame.getContext("2d");
const ctx2 = canvasPause.getContext("2d");


const gameInstance = new game(20, 400, 50, 'E');
gameInstance.updateGridSize(ctx);
gameInstance.updateGridSize(ctx2) ;


console.log(game.snakeSprite) ;











