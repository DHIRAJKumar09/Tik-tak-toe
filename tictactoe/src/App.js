import logo from "./logo.svg";
import "./App.css";
import Square from "./Components/Square/Square";
import { useState } from "react";

function App() {
  const tictacArray = [
    [1,2,3],[4,5,6],[7,8,9]
  ]
  const [gameState,setGameState] = useState(tictacArray);
  const [currentPlayer,setCurrentPlayer] = useState('circle');
  const [finishedState,setFinishedState] = useState(false);
  return (
    <div className="main-div">
      <div>
       <div className="move-detection">
        <div className="left-move">Left</div>
        <div className="right-move">Right</div>
       </div>
        <h1 className="primary-color game-heading">Tic Tac Toe</h1>
        <div className="square-wrapper">
          {tictacArray.map((arr, index) => {
            return (
              <div key={index}>
                {tictacArray.map((newAr,newIndex) => {
                  return (
                    <div key={index + newAr}>
                      <Square 
                      setFinishedState={setFinishedState}
                      finishedState={finishedState}
                      currentPlayer ={currentPlayer}
                      setCurrentPlayer={setCurrentPlayer}
                      setGameState={setGameState}
                      id={index*3+newIndex}
                      key={index*3+newIndex}

                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
