/* eslint-disable indent */
/* eslint-disable quotes */
document.addEventListener('DOMContentLoaded', () => {

const d = document;
let pregame = true;
let gameover = false;

// create basic divs
let overall = d.getElementById('overall');
let gridcontainer = d.getElementById('gridcontainer');
const playergrid = d.createElement('div');
playergrid.setAttribute('id', 'playergrid');
gridcontainer.appendChild(playergrid);
const cpugrid = d.createElement('div');
cpugrid.setAttribute('id', 'cpugrid');
gridcontainer.appendChild(cpugrid);
const msg = d.createElement('h1');
overall.appendChild(msg);
msg.setAttribute('id', 'mainmsg');


// make grid
let fullarr = [];
let cpuarr = [];





let gridFactory = (grid) => {
  for (let i = 0; i < 10; i++) {
    const row = [];
    for (let j = 0; j < 10; j++) {
      row.push({
        status: "fresh",
        ship: "none",
        receiveAttack() {
          if (this.ship == "none") {
            this.status = "miss";
          } else {
            this.status = "hit";
            return `${this.ship}.hit()`;
          }
        },
      });
    }
    grid.push(row);
  };
};

gridFactory(fullarr);
gridFactory(cpuarr);

// preview ship on grid for mouseover
let shipPreview = (e) => {
  const squares = playergrid.querySelectorAll('humansquare');
  if (orient == 'horiz' && !spaceInvalid(nowPlacing.length, parseInt(e.target.dataset.column), parseInt(e.target.dataset.row), fullarr)) {
    const column = parseInt(e.target.dataset.column);
    const row = parseInt(e.target.dataset.row);
    for (let i = 0; i < nowPlacing.length; i++) {
      const square = playergrid.querySelector(`[data-column="${column + i}"][data-row="${row}"]`);
      if (square) { // Only apply the class to existing cells
        square.classList.add('active');
      }
    }
  }
  if (orient == 'vert' && !spaceInvalid(nowPlacing.length, parseInt(e.target.dataset.column), parseInt(e.target.dataset.row), fullarr)) {
    const column = parseInt(e.target.dataset.column);
    const row = parseInt(e.target.dataset.row);
    for (let i = 0; i < nowPlacing.length; i++) {
      const square = playergrid.querySelector(`[data-column="${column}"][data-row="${row + i}"]`);
      if (square) { // Only apply the class to existing cells
        square.classList.add('active');
      }
    }
  }
};




let removeshipPreview = (e) => {
  const squares = playergrid.querySelectorAll('humansquare');
  const column = parseInt(e.target.dataset.column);
  const row = parseInt(e.target.dataset.row);
    
  if (orient=='horiz') {
    for (let i = 0; i < nowPlacing.length; i++) {
      const square = playergrid.querySelector(`[data-column="${column + i}"][data-row="${row}"]`);
      if (square) { // Only apply the class to existing cells
        square.classList.remove('active');
      }
    }
  }
  if (orient=='vert') {
    for (let i = 0; i < nowPlacing.length; i++) {
      const square = playergrid.querySelector(`[data-column="${column}"][data-row="${row+i}"]`);
      if (square) { // Only apply the class to existing cells
        square.classList.remove('active');
      }
    }
  }
};



// make grid DOM
const gridRefresh = (who, grid, array) => {
  grid.innerHTML = '';
  let i; let j;
  for (i = 0; i < array.length; i++) {
    for (j = 0; j < array[i].length; j++) {
      const column = j;
      const row = i;
      const square = d.createElement('div');
      grid.appendChild(square);
      square.classList.add(`${who}square`);
      square.dataset.column = column;
      square.dataset.row = row;

      // some event listeners only for the ship-deploying stage
      if (pregame == true) {
        square.addEventListener('mouseover', shipPreview);
        square.addEventListener('mouseout', removeshipPreview);
        square.addEventListener('click', () => {
          placeShip(column, row);
        });
      }

      if (!pregame && who == 'cpu' && array[i][j].status == 'fresh') {
        square.addEventListener('click', attackCell);
      };


      // coloring based on ship or empty, hit or not
      if (array[i][j].ship == 'none') {
        square.classList.add('noship');
      }
      if (array[i][j].ship != 'none') {
        square.classList.add('yesship');
      }
      if (array[i][j].status == 'hit' && array[i][j].ship == 'none') {
        square.classList.add('miss');
      }
      if (array[i][j].status == 'hit' && array[i][j].ship != 'none') {
        square.classList.add('hit');
        square.innerHTML = `<span class="material-symbols-outlined">explosion</span>`
      }
      
    }
  }
  console.log('grid refreshed');
};
gridRefresh('human', playergrid, fullarr);

// ship factory
const Ship = (length, name) => {
  let hitcount = 0;
  return {
    length,
    name,
    sunk: false,
    hit() {
      hitcount++;
      console.log(`${name} damage: ${hitcount}`);
      this.isItSunk();
    },
    isItSunk() {
      if (length === hitcount) {
        this.sunk = true;
      }
    },
  };
};

let orient = "horiz";

const fleet = [Ship(5, "carrier"), Ship(4, "battleship"), Ship(3, "destroyer"), Ship(3, "submarine"), Ship(2, "patrol")];
const cpufleet = [Ship(5, "carrier"), Ship(4, "battleship"), Ship(3, "destroyer"), Ship(3, "submarine"), Ship(2, "patrol")];

// create 'player' objects
playerFactory = (player, fleet, array) => {
  return {
    player,
    fleet,
    array,
  }
};

let human = playerFactory('human', fleet, fullarr);
let cpu = playerFactory('computer', cpufleet, cpuarr);
console.log(human);



// ship orientation toggle button
const toggleOrient = () => {
  orient == 'horiz' ? (orient = 'vert', orientbtn.textContent = 'Orient ships horizontally') : (orient = 'horiz', orientbtn.textContent = 'Orient ships vertically');
  console.log(orient);
};

const orientbtn = d.getElementById('orientbtn');
orientbtn.addEventListener('click', toggleOrient);






//keeps track of which ship is now being placed
let nowPlacing = fleet[0];
let placingMessage = () => {
  msg.innerHTML = `Now placing ${nowPlacing.name} (${nowPlacing.length} units long)`;
};
placingMessage();

const spaceInvalid = (length, x, y, grid) => {
  // if placing horizontally, checks if your ship is going off the grid
  if (orient == 'horiz' && length > parseInt(10 - x)) {
    console.log("insufficient space on board");
    return true;
  }
  // if placing horizontally, checks if any other ships are in the way
  for (i = 0; i < length; i++) {
    if (orient == 'horiz' && grid[y][x + i].ship != "none") {
      console.log("preexisting ship in the way");
      return true;
    }
  }
  // if placing vertically, checks if your ship is going off the grid
    if (orient == 'vert' && length > parseInt(10 - y)) {
      console.log("insufficient space on board");
      return true;
    }
    // if placing vertically, checks if any other ships are in the way
    for (i = 0; i < length; i++) {
      if (orient == 'vert' && grid[y + i][x].ship != "none") {
        console.log("preexisting ship in the way");
        return true;
      }
    } return false;
};

placeShipShell = (x, y) => {
  let j = 0;
  const callfn = (x, y) => {
    const currentship = fleet[j].name;
    if (orient == "horiz" && !spaceInvalid(nowPlacing.length, x, y, fullarr)) {
      fullarr[y][x].ship = currentship;
      for (i = 1; i < nowPlacing.length; i++) {
        fullarr[y][x + i].ship = currentship;
      } j++;
      if (j >= 5) {
        return startGame();
      };
      nowPlacing = fleet[j];
      placingMessage();
      gridRefresh('human', playergrid, fullarr);
    }
    if (orient == "vert" && !spaceInvalid(nowPlacing.length, x, y, fullarr)) {
      fullarr[y][x].ship = currentship;
      for (i = 1; i < nowPlacing.length; i++) {
        fullarr[y + i][x].ship = currentship;
    } j++;
    if (j >= 5) {
      return startGame();
    };
    nowPlacing = fleet[j];
    placingMessage();
    console.log(cpuarr);
    gridRefresh('human', playergrid, fullarr);
    }
  };
  return callfn;
};

const placeShip = placeShipShell();


//change from ship-placing to actual gameplay
let startGame = () => {
  pregame = false;
  msg.textContent = '';
  gridRefresh('human', playergrid, fullarr);
  let squares = playergrid.querySelectorAll('div');
  orientbtn.style.opacity = '0';
  gridcontainer.style.width = '1300px';
  placeCpuShips();
  setTimeout(revealCPU, 1000);
  console.log(cpufleet);
};

revealCPU = () => {

  //set up the two message areas underneath grids
  cpugrid.style.display = 'grid';
  gridcontainer.setAttribute('id', 'gridcontainercolumned');
  gridcontainer.appendChild(msg);
  let playermsg = d.createElement('h1');
  playermsg.setAttribute('id', 'playermsg')
  gridcontainer.appendChild(playermsg);
  playermsg.textContent = 'Fire when ready.'
  

  setTimeout(function() {
    cpugrid.style.opacity = '1';
    let ocean = d.getElementById('ocean');
    ocean.style.opacity = '1';
    playermsg.style.opacity = '1';
  }, 50);
  gridRefresh('cpu', cpugrid, cpuarr);
  
}

//randomly fill cpu array
const placeCpuShips = () => {

  let j = 0;
  while (j < 5) {

    let currentship = fleet[j];
    let orientnumb = Math.random();
    if (orientnumb >= 0.5) {
      orient = 'horiz';
    } else orient = 'vert';
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);
    console.log(`${x}, ${y}, ${orient}`);

    // place ship horizontally
    if (orient == 'horiz' && !spaceInvalid(currentship.length, x, y, cpuarr)) {
      for (i = 0; i < currentship.length; i++) {
        cpuarr[y][x + i].ship = currentship.name;
      } j++;
      console.log(`cpu ${currentship.name} placed at ${x}, ${y}`);
    };
    
    //place ship vertically
    if (orient == 'vert' && !spaceInvalid(currentship.length, x, y, cpuarr)) {
    for (i = 0; i < currentship.length; i++) {
      cpuarr[y + i][x].ship = currentship.name;
      } j++;
      console.log(`cpu ${currentship.name} placed at ${x}, ${y}`);
    };
  }
  console.log(cpuarr);
};

// clicking a cell
let attackCell = (e) => {
  //find cell in array from coordinates
  const column = parseInt(e.target.dataset.column);
  const row = parseInt(e.target.dataset.row);
  //it is now 'hit' rather than a 'fresh' cell
  cpuarr[row][column].status = 'hit';

  if (cpuarr[row][column].ship == 'none') {
    console.log('miss');
    playermsg.textContent = 'Miss.';
  };

  if (cpuarr[row][column].ship != 'none') {
    cpuarr[row][column].status = 'hit';
    hitship = cpufleet.find(obj => obj.name == cpuarr[row][column].ship);
    playermsg.textContent = 'Hit!'
    hitship.hit();
    console.table(cpufleet);
  }
  gridRefresh('cpu', cpugrid, cpuarr);
  isGameOver(cpufleet, 'you');

  //computer takes turn after human goes
  cpuAttackCell();
  gridRefresh('human', playergrid, fullarr);
  isGameOver(fleet, 'computer');
};

let cpuAttackCell = () => {
  let x = Math.floor(Math.random() * 10);
  let y = Math.floor(Math.random() * 10);
  console.log(`attack at (${x}, ${y})`)
  fullarr[y][x].status = 'hit';

  if (fullarr[y][x].ship != 'none') {
    hitship = fleet.find(obj => obj.name == fullarr[y][x].ship);
    hitship.hit();
    mainmsg.textContent = `Your ${hitship.name} has been hit!`
  };

  if (fullarr[y][x].ship == 'none') {
    mainmsg.textContent = 'Computer missed your ships... phew!'
  }
  
};



let isGameOver = (playerfleet, opponent) => {
  if (playerfleet.every((ship) => ship.sunk === true)) {
    gameover = true;
    alert(`game over! ${opponent} wins!`);
  }
};



if (typeof module === 'object') {
  module.exports = spaceInvalid;
}
});