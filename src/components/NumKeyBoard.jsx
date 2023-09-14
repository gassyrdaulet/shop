import { BiCheckCircle, BiLeftArrowCircle } from "react-icons/bi";
import cl from "../styles/NumKeyBoard.module.css";
import { useCallback } from "react";

function NumKeyBoard({ setValue, focusedInput, onEnter }) {
  const handlePress = useCallback(
    (key, e) => {
      try {
        e.preventDefault();
        setValue(key, focusedInput);
      } catch (e) {
        console.log(e);
      }
    },
    [focusedInput, setValue]
  );

  return (
    <div className={cl.Main}>
      <div className={cl.NumPadWrapper}>
        <button
          onMouseDown={(e) => {
            handlePress("7", e);
          }}
          className={cl.NumPadItem7 + " " + cl.NumPadItem}
        >
          7
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("8", e);
          }}
          className={cl.NumPadItem8 + " " + cl.NumPadItem}
        >
          8
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("9", e);
          }}
          className={cl.NumPadItem9 + " " + cl.NumPadItem}
        >
          9
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("Backspace", e);
          }}
          className={cl.NumPadItemBackSpace + " " + cl.NumPadItem}
        >
          <BiLeftArrowCircle size={30} />
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("4", e);
          }}
          className={cl.NumPadItem4 + " " + cl.NumPadItem}
        >
          4
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("5", e);
          }}
          className={cl.NumPadItem5 + " " + cl.NumPadItem}
        >
          5
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("6", e);
          }}
          className={cl.NumPadItem6 + " " + cl.NumPadItem}
        >
          6
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("1", e);
          }}
          className={cl.NumPadItem1 + " " + cl.NumPadItem}
        >
          1
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("2", e);
          }}
          className={cl.NumPadItem2 + " " + cl.NumPadItem}
        >
          2
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("3", e);
          }}
          className={cl.NumPadItem3 + " " + cl.NumPadItem}
        >
          3
        </button>
        <button
          onMouseDown={(e) => {
            handlePress("0", e);
          }}
          className={cl.NumPadItem0 + " " + cl.NumPadItem}
        >
          0
        </button>
        <button className={cl.NumPadItemDot + " " + cl.NumPadItem}>.</button>
        <button
          onMouseDown={(e) => {
            onEnter();
            handlePress("Enter", e);
          }}
          className={cl.NumPadItemEnter + " " + cl.NumPadItem}
        >
          <BiCheckCircle size={30} />
        </button>
      </div>
    </div>
  );
}

export default NumKeyBoard;
