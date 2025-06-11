import {languages}  from "./assets/languages.js";
import {useEffect, useState} from "react";
import {clsx} from "clsx";
import {getFarewellText, getRandomWord} from "./assets/utils.js";
import Confetti from 'react-confetti';


function App() {

    // state value
    const [currentWord, setCurrentWord] = useState(() => getRandomWord());
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [timeLeft, setTimeLeft] = useState(120);

    // derived values
    const numOfGuessesLeft = languages.length - 1;
    const wrongGuessesCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length;
    const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter));
    const isGameLost = wrongGuessesCount >= numOfGuessesLeft;
    const isGameOver = isGameWon || isGameLost || timeLeft <= 0;
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
    const isLastGuessedIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

    useEffect(() => {
        if(isGameOver  || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime -1)
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameOver, timeLeft]);



    // static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function addGuessedWord(word) {
        setGuessedLetters(prevWord =>
            prevWord.includes(word) ?
               prevWord :
               [...prevWord, word])
    }

    const languageElements = languages.map((l, index) => {

        const isLanguageLost = index < wrongGuessesCount

        const styles = {
            backgroundColor: l.backgroundColor,
            color: l.color
        }

        //const className = clsx("chip", isLanguageLost && "lost")

        return (
            <span
                className={`chip ${isLanguageLost ? "lost" : ""}`}
                style={styles}
                key={l.name}
            >{l.name}</span>
        )
    })


    const letterElements = currentWord.split("").map((letter, index) => {

        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )

        return (<span key={index} className={letterClassName}>
            {shouldRevealLetter ? letter.toUpperCase() : ""}
        </span>)
    })

    const keyboardElements = alphabet.split("").map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        const isCorrect = isGuessed && currentWord.includes(letter);
        const isWrong = isGuessed && !currentWord.includes(letter);

        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
        <button
            className={className}
            disabled={isGameOver}
            aria-disabled={guessedLetters.includes(letter)}
            key={letter}
            aria-label={`Letter ${letter}`}
            onClick={() => addGuessedWord(letter)}>
            {letter.toUpperCase()}
        </button>)
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessedIncorrect
    })

    function startNewGame(){
        setCurrentWord(getRandomWord());
        setGuessedLetters([]);
        setTimeLeft(120)
    }

    function renderGameStatus() {
        if(!isGameOver && isLastGuessedIncorrect) {
            return (
                <>
                    <p className="farewell-message">
                        {getFarewellText(languages[wrongGuessesCount -1].name)}
                    </p>
                </>
            )
        }

        if(isGameWon) {
            return (
                <>
                    <h2>You Win!</h2>
                    <p>Well Done!</p>
                </>
            )
        }

        if(isGameLost) {
            return (
                <>
                    <h2>Game Over</h2>
                    <p>You lose! Better start learning Assembly language!</p>
                </>
            )
        }
    }
  return (
    <>
      <main>
          {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
          <header>
            <h1>Assembly: Endgame</h1>
            <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
          </header>

          <section className="game-stats">
              <p className="info-text">
                  🧠 Number of guesses left: {numOfGuessesLeft - wrongGuessesCount}
              </p>

              <p className="info-text timer">
                  ⏳ Timer: {timeLeft}s
              </p>

          </section>
          <section aria-live="polite"
                   role="status"
                   className={gameStatusClass}>
              {renderGameStatus()}
          </section>

          <section className="language-chips">
              {languageElements}
          </section>
          <section className="word">
              {letterElements}
          </section>

          <section className="keyboard">
              {keyboardElements}
          </section>

          {/* Combined visually aria-live region for status updates*/}
          <section
              className="sr-only"
              aria-live="polite"
              role="status">

              <p>
                  {currentWord.includes(lastGuessedLetter) ?
                  `Correct! The letter ${lastGuessedLetter} is in the word` :
                  `Sorry, the letter ${lastGuessedLetter} is not in the word`}
                  you have {numOfGuessesLeft} attempts left!
              </p>
              <p>Current word: {currentWord.split("").map(letter => guessedLetters.includes(letter) ? letter + "." : "blank").join(" ")}</p>
          </section>

          {isGameOver &&
              <section>
                  <h2>{timeLeft <= 0 ? "⏰ Time’s up!" : isGameWon ? "🎉 You Won!" : "💀 Game Over!"}</h2>
                   <button onClick={startNewGame} className="new-game">New Game</button>
              </section>
          }

      </main>
    </>
  )
}

export default App
