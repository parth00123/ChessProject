// alert("Hey");
// const chess = require("chess.js");
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

function renderboard(){
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex)=>{
        row.forEach((square,squareIndex) =>{
            const squareElement = document.createElement("div");
            squareElement.classList.add(
            "square",
            (rowindex+squareIndex)%2 ===0 ? 
            "light":"dark");

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareIndex;

            if(square){
                const peiceElement = document.createElement("div");
                peiceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );

                peiceElement.innerText = getPieceCode(square);
                peiceElement.draggable = playerRole === square.color;

                peiceElement.addEventListener("dragstart",(e)=>{
                    if(peiceElement.draggable){
                        draggedPiece = peiceElement;
                        sourceSquare = {row:rowindex, col:squareIndex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });

                peiceElement.addEventListener("dragend",(e) =>{
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.append(peiceElement);
            }
            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            });

            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.col)
                    };

                    handelMove(sourceSquare,targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
        
    });
    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }

    
}

function handelMove(source,target){
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion: 'q'

    };

    socket.emit("move",move);
}

function getPieceCode(piece){
    
        const unicodePieces = {
            n : "♘",
            b : "♗",
            r : "♖",
            p : "♙",
            q : "♕",
            k : "♔",
            N : "♞",
            B : "♝",
            R : "♜",
            P : "♟",
            Q : "♛",
            K : "♚"
        };
        return unicodePieces[piece.type];
    
    

}


socket.on("playerRole",function(role){
    playerRole = role;
    renderboard();
});

socket.on("spectatorRole",function(){
    playerRole = null;
    renderboard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderboard();
});

socket.on("move",function(move){
    chess.move(move);
    renderboard();
});

renderboard();