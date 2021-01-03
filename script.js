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

    removeCoordinates(coordinates) {
        let index = this.findCoordinates(coordinates) ;

        if (index.length == 2) {
            this._freeGrid[index[0]][1].splice(index[1], 1) ;
            if (this._freeGrid[index[0]][1].length === 0) {
                this._freeGrid.splice(index[0], 1) ;
            }
        }

    }

    addCoordinates(coordinates) {
        let index = this.findCoordinates(coordinates) ;

        if(index.length !== 2) {
            if(index.length == 0) {
                this._freeGrid.push([coordinates[0], [coordinates[1]]]) ;
            } else {
                this._freeGrid[index[0]][1].push(coordinates[1]) ;
            }
        }

    }

    chooseRandomCoordinates() {
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

        if (gridInstance.isAnApple(nextHeadPosition)) {
            nextPosition.push(nextHeadPosition) ;
        } else {
            nextPosition.push(nextHeadPosition) ;
            nextPosition.shift() ;
        }

        if (snake.willCrashed(nextPosition, gridInstance)) {
            this._isDead = true ;
        } else {
            this._position = nextPosition ;
        }

    }

}

class game {
    constructor(dimensions) {
        this._grid = new grid(dimensions, [floor(dimensions[0]/2), floor(dimensions[1]/2)]) ;
        this._snake = new snake('E', [floor(dimensions[0]/2), floor(dimensions[1]/2)]) ;
    }
}


/* main */

/*let snakeInstance = new snake('E', [[8,5]]);//, [6,6], [5,6], [4,6], [4,5]]) ;
let gridInstance = new grid([10,10], [0,5]) ;

/*a = snakeInstance.copySnakePosition() ;
a[2] = 1;
console.log(a)
console.log(snakeInstance._position) ;*/

/*snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;/*
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;
snakeInstance.move(gridInstance);
console.log(snakeInstance) ;*/

/*a = [1,2,3,3] ;
cpt = 0 ;
b = a[a.length-1];
a.slice(0,a.length-1).forEach(element => {
    if(element === b) {
        cpt++
    }
}) ;
console.log(cpt)*/

let a = new grid([5,5], [0,5]);
console.log(a)
a.removeCoordinates([0,2]) ; 
console.log(a.freeGrid) ;
