// Importing All Boards
const blue_Board = document.getElementById("blue-Board");
const green_Board = document.getElementById("green-Board");
const red_Board = document.getElementById("red-Board");
const yellow_Board = document.getElementById("yellow-Board");

// DOMs
const rollDiceButton = document.getElementById("rollDiceButton");
const rollDice = document.getElementById("rollDice");

// Initial Variables

// hold the players team color
let playerTurns = [];

let currentPlayerTurnIndex = 0;
let prevPlayerTurnIndex;

// 'true' means user has not yet played and 'false' means played
let currentPlayerTurnStatus = true;

// bonus when killed, reached home
let teamHasBonus = false;

// to hold the dice result after its roll
let diceResult;

// paths of all teams (board)
let pathArray = [
   "r1",
   "r2",
   "r3",
   "r4",
   "r5",
   "r6",
   "r7",
   "r8",
   "r9",
   "r10",
   "r11",
   "r12",
   "r13",
   "g1",
   "g2",
   "g3",
   "g4",
   "g5",
   "g6",
   "g7",
   "g8",
   "g9",
   "g10",
   "g11",
   "g12",
   "g13",
   "y1",
   "y2",
   "y3",
   "y4",
   "y5",
   "y6",
   "y7",
   "y8",
   "y9",
   "y10",
   "y11",
   "y12",
   "y13",
   "b1",
   "b2",
   "b3",
   "b4",
   "b5",
   "b6",
   "b7",
   "b8",
   "b9",
   "b10",
   "b11",
   "b12",
   "b13",
];

// home paths (obj) of all teams (board)
let homePathEntries = {
   blue: ["bh1", "bh2", "bh3", "bh4", "bh5", "home"],
   yellow: ["yh1", "yh2", "yh3", "yh4", "yh5", "home"],
   red: ["rh1", "rh2", "rh3", "rh4", "rh5", "home"],
   green: ["gh1", "gh2", "gh3", "gh4", "gh5", "home"],
};

// safe paths of all teams (board)
let safePaths = [
   "r1",
   "r9",
   "b1",
   "b9",
   "y1",
   "y9",
   "g1",
   "g9",
   ...homePathEntries.blue,
   ...homePathEntries.red,
   ...homePathEntries.yellow,
   ...homePathEntries.green,
];

// home paths (array) of all teams (board)
let homePathArray = [
   ...homePathEntries.blue,
   ...homePathEntries.red,
   ...homePathEntries.yellow,
   ...homePathEntries.green,
];

// Setting Player Piece (class)
class Player_Piece {
   constructor(team, position, score, homePathEntry, playerId, gameEntry) {
      this.team = team;
      this.position = position;
      this.score = score;
      this.homePathEntry = homePathEntry;
      this.id = playerId;
      this.gameEntry = gameEntry;

      // 'status' if 0 means piece is locked & if 1 means piece piece is unlocked
      this.status = 0;

      // return the piece to the board when killed
      this.initialPosition = position;
   }

   unlockedPiece() {
      this.status = 1;
      this.position = this.gameEntry;

      // update in UI
      const element = document.querySelector(`[piece_id="${this.id}"]`);
      const toAppendDiv = document.getElementById(this.gameEntry);
      toAppendDiv.appendChild(element);
   }

   // to update the latest position of piece after moving
   updatePosition(position) {
      this.position = position;
   }

   // to move the piece on the board
   movePiece(array) {
      let filteredArray = array;

      if (array.includes(this.homePathEntry)) {
         let indexOfPathEntry = array.findIndex(
            (obj) => obj === this.homePathEntry
         );
         let newSlicedArray = array.slice(0, indexOfPathEntry);

         if (newSlicedArray.length < diceResult) {
            let remainingLength = diceResult - newSlicedArray.length;
            let secondPart = homePathEntries[this.team].slice(
               0,
               remainingLength
            );
            newSlicedArray = newSlicedArray.concat(secondPart);
         }

         filteredArray = newSlicedArray;
      }

      if (filteredArray.includes("home")) {
         teamHasBonus = true;
      }

      moveElementSequentially(this.id, filteredArray);
      this.score += filteredArray.length;
   }

   // return the piece to the locked position
   sentMeToBoard() {
      this.score = 0;
      this.position = this.initialPosition;
      this.status = 0;

      let element = document.querySelector(`[piece_id="${this.id}"]`);
      let toAppendDiv = document.getElementById(this.initialPosition);
      toAppendDiv.appendChild(element);
   }
}

// Getting input from user, that how many players are getting played
// let numPvP = parseInt(prompt("Enter no. of players (choose from 2, 3, 4)"));
let numPvP = 4;

if (numPvP > 4 || numPvP < 2 || !numPvP) {
   location.reload();
}

// hold all pieces of all the teams
let playerPieces = [];

// to hold the details of each baord (color)
let boardDetails = [
   {
      boardColor: "blue",
      board: blue_Board,
      homeEntry: "y13",
      gameEntry: "b1",
   },
   {
      boardColor: "green",
      board: green_Board,
      homeEntry: "r13",
      gameEntry: "g1",
   },
   {
      boardColor: "red",
      board: red_Board,
      homeEntry: "b13",
      gameEntry: "r1",
   },
   {
      boardColor: "yellow",
      board: yellow_Board,
      homeEntry: "g13",
      gameEntry: "y1",
   },
];

// to create/add the pieces for all the teams in DOM
for (let i = 0; i < numPvP; i++) {
   let boardColor = boardDetails[i].boardColor;
   let homeEntry = boardDetails[i].homeEntry;
   let gameEntry = boardDetails[i].gameEntry;

   const parentDiv = document.createElement("div");

   // to create/add 4 pieces for each team (color)
   for (let i = 0; i < 4; i++) {
      const span = document.createElement("span");
      const icon = document.createElement("i");

      icon.classList.add(
         "fa-solid",
         "fa-location-pin",
         "piece",
         `${boardColor}-piece`
      );

      // adding event listener on a piece
      icon.addEventListener("click", (e) => {
         turnForUser(e);
      });

      if (boardColor === "blue") {
         icon.setAttribute("myPieceNum", i + 1);
      }

      let pieceID = `${boardColor}${i}`;
      let position = `${i}_${boardColor}`;

      let player = new Player_Piece(
         boardColor,
         position,
         0,
         homeEntry,
         pieceID,
         gameEntry
      );

      span.setAttribute("id", position);
      icon.setAttribute("piece_id", pieceID);

      playerPieces.push(player);

      span.append(icon);
      parentDiv.append(span);
   }

   boardDetails[i].board.append(parentDiv);
}

if (numPvP === 2) {
   playerTurns = ["blue", "green"];
} else if (numPvP === 3) {
   playerTurns = ["blue", "red", "green"];
} else if (numPvP === 4) {
   playerTurns = ["blue", "red", "green", "yellow"];
}

// defining 'delay' to make the game smooth / to add delay b/w player actions
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// to add the 'active' class to the current players whose's turn
const setPlayerTurn = (playerTurnIndex) => {
   if (playerTurnIndex === null || playerTurnIndex === undefined) return;

   let currentTeamTurn = playerTurns[playerTurnIndex];

   // filtering the board details & finding the current team turn object
   let boardDetailObject = boardDetails.filter(
      (obj) => obj.boardColor === currentTeamTurn
   );
   boardDetailObject[0].board.classList.toggle("active");
};

// by-default its user turn (blue is the user and its highlighting)
setPlayerTurn(0);

// to move the turn to the next player/team
const nextTeamTurn = async () => {
   prevPlayerTurnIndex = currentPlayerTurnIndex;

   if (currentPlayerTurnIndex === playerTurns.length - 1) {
      currentPlayerTurnIndex = 0;
   } else {
      currentPlayerTurnIndex += 1;
   }

   setPlayerTurn(prevPlayerTurnIndex); // to remove the 'active' class from previous player board
   setPlayerTurn(currentPlayerTurnIndex); // to add the 'active' class to the current player board

   await delay(500);

   // if current player is not a user, then roll dice by the bot
   if (playerTurns[currentPlayerTurnIndex] !== "blue") {
      rollDiceButtonForBot();
   }
};

// calculating path array for selected piece
const giveArrayForMovingPath = (piece) => {
   let indexOfPath;
   let movingArray = [];

   // if piece is on their home paths
   if (!pathArray.includes(piece.position)) {
      indexOfPath = homePathEntries[piece.team].findIndex(
         (elem) => elem === piece.position
      );

      let homePathArrayForPiece = homePathEntries[piece.team];

      for (let i = 0; i < diceResult; i++) {
         if (indexOfPath + 1 < homePathArrayForPiece.length) {
            indexOfPath += 1;
            movingArray.push(homePathArrayForPiece[indexOfPath]);
         } else {
            break; // exit the loop if the end of the home path array is reached
         }
      }
   }
   // if piece is not on their home paths - instead on path array
   else {
      indexOfPath = pathArray.findIndex((elem) => elem === piece.position);

      for (let i = 0; i < diceResult; i++) {
         indexOfPath = (indexOfPath + 1) % pathArray.length;
         movingArray.push(pathArray[indexOfPath]);
      }
   }

   return movingArray;
};

// actually move the piece on the board
const moveElementSequentially = (elementId, array) => {
   const elementToMove = document.querySelector(`[piece_id="${elementId}"]`);
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
   let piece = playerPieces.find((obj) => obj.id === elementId);
   let toBreak = false;

   // recursive function to move the piece to the next target
   function moveToNextTarget(index) {
      if (index >= array.length) return;

      const currentTarget = document.getElementById(array[index]);

      if (array[index] === "home") {
         let indexOfPiece = playerPieces.findIndex(
            (obj) => obj.id === piece.id
         );
         playerPieces.splice(indexOfPiece, 1);
         elementToMove.remove();
         toBreak = true;

         // defining winning condition
         // when all pieces of current team reacehd home
         let totalPiecesOfThisTeam = playerPieces.filter(
            (obj) => obj.team === currentTeamTurn
         );

         if (totalPiecesOfThisTeam.length === 0) {
            declareWinner(currentTeamTurn);
            return;
         }

         if (currentTeamTurn === "blue") {
            // if user's piece is reached home - give bonus
            currentPlayerTurnStatus = true;
         } else {
            // if bot's piece is reached home - give bonus
            rollMyDice(true);
         }
         return;
      }

      piece.updatePosition(array[index]);

      // append the element to the current target
      currentTarget.appendChild(elementToMove);

      setTimeout(() => {
         moveToNextTarget(index + 1);
      }, 170);
   }

   !toBreak && moveToNextTarget(0);
};

// helper function to roll the dice by the bot(s)
const rollMyDice = async (hasBonus) => {
   currentPlayerTurnStatus = true; // to enable the rollDiceButtonForBot
   await delay(700);

   // if dice result is 6
   // if bot has a bonus turn
   // if bot killed other team pice
   if (diceResult === 6 || hasBonus || teamHasBonus) {
      rollDiceButtonForBot(); // again rolling dice for bot
   }
   // if no above condition(s) meet
   else {
      nextTeamTurn(); // pass the turn to the next team

      // if the next turn's (team) is a bot
      if (playerTurns[currentPlayerTurnIndex] !== "blue")
         rollDiceButtonForBot();
   }
};

// helper function to move the piece of the bot(s)
const moveMyPiece = async (piece) => {
   let array = giveArrayForMovingPath(piece);

   if (array.length < diceResult) {
      await delay(500);
      currentPlayerTurnStatus = true;
      nextTeamTurn();
      return false;
   }

   piece.movePiece(array);
   await delay(array.length * 180);
   rollMyDice();
   return true; // return 'true' if move was performed
};

const giveEnemiesBehindMe = (piece) => {
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
   let indexOfPath = pathArray.findIndex((elem) => elem === piece.position);

   if (!indexOfPath) return 0;

   let lastSixPath = [];

   for (let i = 6; i > 0; i--) {
      let index = (indexOfPath - i + pathArray.length) % pathArray.length;
      lastSixPath.push(pathArray[index]);
   }

   let opponentsOnPath = playerPieces.filter(
      (obj) =>
         lastSixPath.includes(obj.position) && obj.team !== currentTeamTurn
   );

   return opponentsOnPath.length;
};

// handler for bot(s) when its bot turns
const turnForBot = async () => {
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

   // if bot has any unlocked pieces
   let totalUnlockedPieces = playerPieces.filter(
      (obj) => obj.team === currentTeamTurn && obj.status === 1
   );

   // total pieces of current bot that's playing
   let totalPiecesOfThisTeam = playerPieces.filter(
      (obj) => obj.team === currentTeamTurn
   ).length;

   let isMoving = false;

   // if there's not any unlocked piece & dice result is not 6
   if (totalUnlockedPieces.length === 0 && diceResult !== 6) {
      rollMyDice();
      return;
   }

   currentPlayerTurnStatus = true;
   let piece_team = playerPieces.filter((obj) => obj.team === currentTeamTurn);

   // if there's not any unlocked piece & dice result is 6
   if (totalUnlockedPieces.length === 0 && diceResult === 6) {
      piece_team[0].unlockedPiece(); // unlocked the piece of bot
      rollMyDice(); // again roll the dice
      return;
   }

   // logic for kill detection
   let opponentPieces = playerPieces.filter(
      (obj) => obj.team !== currentTeamTurn && obj.status === 1
   );
   let bonusReached = false;

   for (let i = 0; i < totalUnlockedPieces.length; i++) {
      if (bonusReached) {
         return;
      }

      let array = giveArrayForMovingPath(totalUnlockedPieces[i]);
      let cut = opponentPieces.find(
         (obj) =>
            obj.position === array[array.length - 1] &&
            !safePaths.includes(obj.position)
      );

      // if the last path is home
      let homeBonusReached = array[array.length - 1] === "home";

      if (cut) {
         totalUnlockedPieces[i].movePiece(array);
         await delay(array.length * 180);
         cut.sentMeToBoard();
         bonusReached = true;
         rollMyDice(true);
         return;
      }

      if (homeBonusReached) {
         totalUnlockedPieces[i].movePiece(array);
         await delay(array.length * 180);
         bonusReached = true;
         rollMyDice(true);
      }
   }

   if (bonusReached) {
      return;
   }

   // Moving pieces by the bot(s) logic
   let lockedPieces = playerPieces.filter(
      (obj) => obj.team === currentTeamTurn && obj.status === 0
   );

   const attemptMove = async (piece) => {
      if (!(await moveMyPiece(piece))) {
         return false;
      }
      isMoving = true;
      return true;
   };

   // when bot(s) has 1 unlocked piece
   if (totalUnlockedPieces.length === 1) {
      if (totalUnlockedPieces.length <= 3 && diceResult === 6) {
         lockedPieces[0].unlockedPiece();
         rollMyDice();
         return;
      }

      let piece = totalUnlockedPieces.find((obj) => obj.status === 1);
      if (!(await attemptMove(piece)));
   }

   // when bot(s) has 2 unlocked pieces
   if (totalUnlockedPieces.length === 2) {
      if (
         totalUnlockedPieces.length <= 3 &&
         diceResult === 6 &&
         totalPiecesOfThisTeam >= 3
      ) {
         lockedPieces[0].unlockedPiece();
         rollDiceButtonForBot();
         return;
      }

      let pieceSafe = totalUnlockedPieces.filter((obj) =>
         safePaths.includes(obj.position)
      );

      let pieceUnSafe = totalUnlockedPieces.filter(
         (obj) => !safePaths.includes(obj.position)
      );

      if (pieceSafe.length === 0) {
         let scoreOfFirstPiece = pieceUnSafe[0].score;
         let scoreOfSecondPiece = pieceUnSafe[1].score;

         if (scoreOfSecondPiece > scoreOfFirstPiece) {
            // move the element with higher score
            if (!(await attemptMove(pieceUnSafe[1]))) return;
         } else {
            // move the element with higher score
            if (!(await attemptMove(pieceUnSafe[0]))) return;
         }
      }

      if (pieceSafe.length === 1) {
         if (!(await attemptMove(pieceUnSafe[0]))) return;
      }

      if (
         pieceSafe.length === 2 &&
         pieceSafe[0].position === pieceSafe[1].position
      ) {
         if (!(await attemptMove(pieceSafe[0]))) return;
      }

      if (pieceSafe.length === 2) {
         let scoreOfFirstPiece = pieceSafe[0].score;
         let opponentsBeforeFirstPiece = giveEnemiesBehindMe(pieceSafe[0]);

         let scoreOfSecondPiece = pieceSafe[1].score;
         let opponentsBeforeSecondPiece = giveEnemiesBehindMe(pieceSafe[1]);

         if (opponentsBeforeFirstPiece > opponentsBeforeSecondPiece) {
            if (!(await attemptMove(pieceSafe[1]))) return;
         } else if (opponentsBeforeSecondPiece > opponentsBeforeFirstPiece) {
            if (!(await attemptMove(pieceSafe[0]))) return;
         } else if (opponentsBeforeFirstPiece === opponentsBeforeSecondPiece) {
            if (scoreOfSecondPiece > scoreOfFirstPiece) {
               if (!(await attemptMove(pieceSafe[1]))) return;
            } else {
               if (!(await attemptMove(pieceSafe[0]))) return;
            }
         }
      }
   }

   // when bot(s) has 3 unlocked pieces
   if (totalUnlockedPieces.length === 3) {
      let pieceSafe = totalUnlockedPieces.filter((obj) =>
         safePaths.includes(obj.position)
      );

      let pieceUnSafe = totalUnlockedPieces.filter(
         (obj) => !safePaths.includes(obj.position)
      );

      if (pieceSafe.length === 0) {
         let scoreOfFirstPiece = pieceUnSafe[0].score;
         let scoreOfSecondPiece = pieceUnSafe[1].score;
         let scoreOfThirdPiece = pieceUnSafe[2].score;

         let greatestScore = Math.max(
            scoreOfFirstPiece,
            scoreOfSecondPiece,
            scoreOfThirdPiece
         );

         let movingPiece = pieceUnSafe.find(
            (obj) => obj.score === greatestScore
         );

         if (!(await attemptMove(movingPiece))) return;
      }

      if (pieceSafe.length === 1) {
         // 1 piece is safe and other 2 are unsafe
         let scoreOfFirstPiece = pieceUnSafe[0].score;
         let scoreOfSecondPiece = pieceUnSafe[1].score;

         if (scoreOfSecondPiece > scoreOfFirstPiece) {
            // move the element with higher score
            if (!(await attemptMove(pieceUnSafe[1]))) return;
         } else {
            // move the element with higher score
            if (!(await attemptMove(pieceUnSafe[0]))) return;
         }
      }

      if (
         pieceSafe.length === 3 &&
         (pieceSafe[0].position === pieceSafe[1].position) ===
            pieceSafe[2].position
      ) {
         if (!(await attemptMove(pieceSafe[0]))) return;
      }

      if (pieceSafe.length === 2) {
         if (!(await attemptMove(pieceUnSafe[0]))) return;
      }

      if (pieceSafe.length === 3) {
         let opponentsBeforeFirstPiece = giveEnemiesBehindMe(pieceSafe[0]);
         let opponentsBeforeSecondPiece = giveEnemiesBehindMe(pieceSafe[1]);
         let opponentsBeforeThirdPiece = giveEnemiesBehindMe(pieceSafe[2]);

         if (
            opponentsBeforeFirstPiece < opponentsBeforeSecondPiece &&
            opponentsBeforeFirstPiece < opponentsBeforeThirdPiece
         ) {
            if (!(await attemptMove(pieceSafe[0]))) return;
         } else if (
            opponentsBeforeSecondPiece < opponentsBeforeFirstPiece &&
            opponentsBeforeSecondPiece < opponentsBeforeThirdPiece
         ) {
            if (!(await attemptMove(pieceSafe[1]))) return;
         } else if (
            opponentsBeforeThirdPiece < opponentsBeforeFirstPiece &&
            opponentsBeforeThirdPiece < opponentsBeforeSecondPiece
         ) {
            if (!(await attemptMove(pieceSafe[2]))) return;
         } else {
            let piecesAtHomePath = piece_team.filter(
               (obj) => obj.status === 1 && homePathArray.includes(obj.position)
            );

            let piecesNotAtHomePath = piece_team.filter(
               (obj) =>
                  obj.status === 1 && !homePathArray.includes(obj.position)
            );

            piecesNotAtHomePath.sort((a, b) => a.score - b.score);

            if (piecesNotAtHomePath.length > 0) {
               if (!(await attemptMove(piecesNotAtHomePath[0]))) return;
            } else {
               for (let i = 0; i < piecesAtHomePath; i++) {
                  let movingPathArray = giveArrayForMovingPath(
                     piecesAtHomePath[i]
                  );

                  if (movingPathArray.length === diceResult) {
                     isMoving = true;
                     moveMyPiece(piecesAtHomePath[i]);
                     break;
                  }
               }
            }
         }
      }
   }

   if (!isMoving) {
      nextTeamTurn();
   }
};

// handler for user when click on blue team's piece
const turnForUser = async (e) => {
   let isUserTurn = playerTurns[currentPlayerTurnIndex] === "blue";
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

   // return if the current turn is not for user OR
   // if user has used its chance
   if (!isUserTurn || currentPlayerTurnStatus) return;

   // if user has any unlocked pieces
   let totalUnlockedPieces = playerPieces.filter(
      (obj) => obj.team === currentTeamTurn && obj.status === 1
   ).length;

   // identifying which piece is selected or clicked by the user
   let piece = playerPieces.find(
      (obj) =>
         obj.id === e.target.getAttribute("piece_id") &&
         obj.team === currentTeamTurn
   );

   // kill logic for opponent's piece
   let opponentPieces = playerPieces.filter(
      (obj) => obj.team !== currentTeamTurn && obj.status === 1
   );

   // calculate & provide the moving array for the selected piece
   let array = giveArrayForMovingPath(piece);

   let cut = opponentPieces.find(
      (obj) =>
         obj.position === array[array.length - 1] &&
         !safePaths.includes(obj.position)
   );

   if (cut) {
      piece.movePiece(array);
      await delay(array.length * 180);
      cut.sentMeToBoard();
      currentPlayerTurnStatus = true;
      return;
   }

   // return if dice result is greater than the left paths covered by the selected piece
   if (array.length < diceResult) {
      await delay(500);
      currentPlayerTurnStatus = true;
      nextTeamTurn();
      return;
   }

   // if dice result is 6
   if (diceResult === 6) {
      // again chance to roll dice
      currentPlayerTurnStatus = true;

      // if current piece is locked then unlocked and return
      if (piece.status === 0) {
         piece.unlockedPiece();
         return;
      }

      // if current piece is already unlocked then simply move the piece on the board
      piece.movePiece(array);
   }
   // if dice result is other than 6
   else {
      // if current piece is locked then unlocked and return
      if (piece.status === 0) {
         piece.unlockedPiece();
         return;
      }

      currentPlayerTurnStatus = true; // 'true' to enable roll dice for next turn
      piece.movePiece(array); // simply move the piece on the board

      // if current piece not killed other's team piece - team bonus
      // then pass the turn to the next team
      if (!teamHasBonus) {
         nextTeamTurn();
      }
   }
};

// defining the roll dice gif
const rollDiceGif = new Image();
rollDiceGif.src = "./assets/dice_rolling.gif";

// adding event listener on roll dice button
rollDiceButton.addEventListener("click", () => {
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

   // return if user has used its chance
   if (!currentPlayerTurnStatus) return;

   rollDiceButton.disabled = true;
   rollDice.src = rollDiceGif.src;

   diceResult = Math.floor(Math.random() * 6) + 1;
   //    diceResult = 6;

   // user used its chance
   currentPlayerTurnStatus = false;
   teamHasBonus = false;

   setTimeout(async () => {
      rollDice.src = `./assets/dice_${diceResult}.png`;
      await delay(700);
      rollDiceButton.disabled = false;

      let totalUnlockedPieces = playerPieces.filter(
         (obj) => obj.team === currentTeamTurn && obj.status === 1
      );

      if (
         totalUnlockedPieces.length === 0 &&
         diceResult !== 6 &&
         !teamHasBonus
      ) {
         currentPlayerTurnStatus = true;
         nextTeamTurn();
      }
   }, 600);
});

// rolling dice button for the bot
const rollDiceButtonForBot = async () => {
   // return if bot has used its chance
   if (!currentPlayerTurnStatus) return;

   rollDice.src = rollDiceGif.src;

   diceResult = Math.floor(Math.random() * 6) + 1;

   // user used its chance
   currentPlayerTurnStatus = false;
   teamHasBonus = false;

   setTimeout(async () => {
      rollDice.src = `./assets/dice_${diceResult}.png`;
      await delay(700);
      rollDiceButton.disabled = false;

      turnForBot();
   }, 600);
};

document.addEventListener("keydown", (e) => {
   let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

   if (currentTeamTurn !== "blue") return;

   if (e.key === "1") {
      let piece = document.querySelector(`[myPieceNum="1"]`);
      piece?.click();
   }

   if (e.key === "2") {
      let piece = document.querySelector(`[myPieceNum="2"]`);
      piece?.click();
   }

   if (e.key === "3") {
      let piece = document.querySelector(`[myPieceNum="3"]`);
      piece?.click();
   }

   if (e.key === "4") {
      let piece = document.querySelector(`[myPieceNum="4"]`);
      piece?.click();
   }

   if (e.code === "Space") {
      rollDiceButton.click();
   }
});

const declareWinner = (team) => {
   let parentDiv = document.createElement("div");
   let childDiv = document.createElement("div");
   let h1 = document.createElement("h1");
   let button = document.createElement("button");

   parentDiv.setAttribute("id", "declaredWinner");

   h1.textContent = `${team} Won The Game..!`;

   button.textContent = "Play Again";

   button.addEventListener("click", () => {
      location.reload();
   });

   childDiv.append(h1);
   childDiv.append(button);
   parentDiv.append(childDiv);

   document.body.append(parentDiv);

   fire(0.25, {
      spread: 26,
      startVelocity: 55,
   });
   fire(0.2, {
      spread: 60,
   });
   fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
   });
   fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
   });
   fire(0.1, {
      spread: 120,
      startVelocity: 45,
   });
};

var count = 200;
var defaults = {
   origin: { y: 0.7 },
};

function fire(particleRatio, opts) {
   confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
   });
}
