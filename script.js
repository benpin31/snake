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
            if (gridInstance.isAnApple(nextHeadPosition)) {
                optimAffichage.toDraw = nextHeadPosition ;
                optimAffichage.toErase = [] ;
                gridInstance.removeFreeCoordinates(nextHeadPosition) ;
                nextPosition.push(nextHeadPosition) ;
                gridInstance.applePosition = gridInstance.chooseRandomFreeCoordinates() ;
            } else {
                optimAffichage.toDraw = nextHeadPosition ;
                optimAffichage.toErase = nextPosition[0] ;       
                gridInstance.removeFreeCoordinates(nextHeadPosition) ;
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
            console.log(optimAffichage.toErase)
            console.log(this._isDead)

        }

    }

}

class game {
    constructor(dimensions) {
        let snakePosition = [] ;
for (let k = 0; k < 28; k++) {
    for (let l = 0; l < 30; l++) {
        if (k%2 === 1) {
            snakePosition.push([k,l])
        } else {
            snakePosition.push([k,30-l-1])
        }
    }
}//[Math.floor(dimensions[0]/2), Math.floor(dimensions[1]/2)] ;
console.log(snakePosition)

        this._snake = new snake('E', snakePosition) ;

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
const nbCase = 30;
const gameInstance = new game([nbCase,nbCase]);
const optimAffichage = {toDraw:[], toErase:[]};



function toDoWhenSceenModified() {
    getUnity();
    drawGrid(ctx, nbCase*unity.unity, nbCase*unity.unity) ;
    drawMove(ctx, gameInstance) ;
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function drawGrid(ctx, h, w) {
    /* Draw the grid on wich the rover is moving */
    ctx.canvas.width  = w;
    ctx.canvas.height = h;
    drawCompletedGrid(ctx, gameInstance) ;
}


function drawCompletedGrid(ctx, game) {
    let absciss ;
    let ordinate ;

    game.snake.position.forEach(position => {[game.snake.position.length-1] ;
        ordinate= (game.grid.dimensions[1] - position[1]-1)*unity.unity ;
        absciss = (position[0])*unity.unity ;
        ctx.beginPath();
        ctx.rect(absciss, ordinate, unity.unity, unity.unity);
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.stroke(); }) 
}

function drawMove(ctx, game) {
    /* plot rover sprite and obstacle given there position and direction (for rover) */
    let absciss ;
    let ordinate ;

    if(optimAffichage.toDraw.length > 0) {
        ordinate= (game.grid.dimensions[1] - optimAffichage.toDraw[1]-1)*unity.unity ;
        absciss = (optimAffichage.toDraw[0])*unity.unity ;
        ctx.beginPath();
        ctx.rect(absciss, ordinate, unity.unity, unity.unity);
        ctx.fillStyle = "black";
        ctx.fill(); 
        ctx.stroke(); 

        if(optimAffichage.toErase.length > 0) {
            ordinate= (game.grid.dimensions[1] - optimAffichage.toErase[1]-1)*unity.unity ;
            absciss = (optimAffichage.toErase[0])*unity.unity ;
            ctx.clearRect(absciss,ordinate,unity.unity, unity.unity) ;
            ctx.strokeStyle="#000000";
            ctx.stroke();
        }

    } else {
        game.snake.position.forEach(position => {[game.snake.position.length-1] ;
            ordinate= (game.grid.dimensions[1] - position[1]-1)*unity.unity ;
            absciss = (position[0])*unity.unity ;
            ctx.beginPath();
            ctx.rect(absciss, ordinate, unity.unity, unity.unity);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.stroke(); }) 
    }

    ordinate= (game.grid.dimensions[1] - game.grid.applePosition[1]-1)*unity.unity ;
    absciss = (game.grid.applePosition[0])*unity.unity ;
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(absciss+unity.unity/2, ordinate+unity.unity/2, unity.unity/2, 0, 2 * Math.PI);
    ctx.fill(); 

}

function getUnity() {
    
    let documentDimension={width:document.body.clientWidth, height:document.body.clientHeight } ;
  
    unity.unity = Math.min(documentDimension.width, documentDimension.height*0.8)/nbCase
    document.getElementById("user-interface").style.width = nbCase*unity.unity+"px";

}


window.onload = toDoWhenSceenModified;
window.onresize = toDoWhenSceenModified;

function onTheTop() {
    gameInstance.snake.direction = 'N';
    gameInstance.setExecution() ;
    drawMove(ctx, gameInstance) ;
    console.log(gameInstance.gameStatus) ;
}

function down() {
    gameInstance.snake.direction = 'S';
    gameInstance.setExecution() ;
    drawMove(ctx, gameInstance) ;
    console.log(gameInstance.gameStatus) ;
}

function toTheLeft() {
    gameInstance.snake.direction = 'W';
    gameInstance.setExecution() ;
    drawMove(ctx, gameInstance) ;    
    console.log(gameInstance.gameStatus) ;
}

function toTheRight() {
    gameInstance.snake.direction = 'E';
    gameInstance.setExecution() ;
    drawMove(ctx, gameInstance) ;
    console.log(gameInstance.gameStatus) ;
}





