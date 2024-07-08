import logo from "./logo.svg";
import "./App.css";
import { io } from "socket.io-client";
import Square from "./Components/Square/Square";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

function App() {
  const tictacArray = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  const [gameState, setGameState] = useState(tictacArray);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedStateArray, setFinishedStateArray] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponents, setOpponents] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  const checkWinner = () => {
    // Check rows
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] &&
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedStateArray([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // Check columns
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] &&
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedStateArray([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    // Check diagonals
    if (
      gameState[0][0] &&
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedStateArray([0, 4, 8]);
      return gameState[0][0];
    }
    if (
      gameState[0][2] &&
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedStateArray([2, 4, 6]);
      return gameState[0][2];
    }

    // Check for draw
    const isDrawMatch = gameState.flat().every((e) => e !== null);
    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  useEffect(() => {
    if (socket) {
      socket.on("playerMoveFromServer", (data) => {
        console.log(data);
        const id = data.state.id;
        setGameState((prevState) => {
          let newState = [...prevState];
          const rowIndex = Math.floor(id / 3);
          const colIndex = id % 3;
          newState[rowIndex][colIndex] = data.state.sign;
          return newState;
        });
        setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
      });

      socket.on("connect", function () {
        setPlayOnline(true);
      });

      socket.on("opponentNotFound", function () {
        setOpponents(false);
      });

      socket.on("opponentFound", function (data) {
        console.log("data:", data);
        setOpponents(data.Opponents);
        setPlayingAs(data.playingAs);
      });

      return () => {
        socket.off("playerMoveFromServer");
        socket.off("connect");
        socket.off("opponentNotFound");
        socket.off("opponentFound");
      };
    }
  }, [socket]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      inputLabel: "Add your name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  async function playOnClick() {
    const result = await takePlayerName();
    const name = result.value;
    setPlayerName(name);

    const newSocket = io("http://localhost:8080", {
      autoConnect: true,
    });
    newSocket.emit("request_to_play", {
      playerName: name,
    });
    setSocket(newSocket);
  }

  if (!playOnline) {
    return (
      <div className="play-online">
        <h1 onClick={playOnClick}>Play Online</h1>
      </div>
    );
  }

  if (playOnline && !opponents) {
    return (
      <div className="opponents">
        <h1>Waiting for Opponents ....</h1>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div>
        <div className="move-detection">
          <div
            className={`left-move ${
              currentPlayer === playingAs ? "current-move-" + currentPlayer : ""
            }`}
          >
            {playerName}
          </div>
          <div
            className={`right-move ${
              currentPlayer !== playingAs
                ? "current-move-" + currentPlayer
                : ""
            }`}
          >
            {opponents}
          </div>
        </div>
        <h1 className="primary-color game-heading">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {gameState.map((row, rowIndex) => {
            return (
              <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => {
                  const id = rowIndex * 3 + colIndex;
                  return (
                    <Square
                      gameState={gameState}
                      socket={socket}
                      finishedStateArray={finishedStateArray}
                      setFinishedState={setFinishedState}
                      finishedState={finishedState}
                      currentPlayer={currentPlayer}
                      setCurrentPlayer={setCurrentPlayer}
                      setGameState={setGameState}
                      id={id}
                      key={id}
                      currentElement={cell}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        {finishedState && finishedState !== "draw" && (
          <h3 className="won-game">{finishedState} Won the game</h3>
        )}
        {finishedState && finishedState === "draw" && (
          <h3 className="won-game">Match Draw! No one wins the match</h3>
        )}
        {!finishedState && opponents && (
          <h3 className="won-game">You are playing against {opponents}</h3>
        )}
      </div>
    </div>
  );
}

export default App;
