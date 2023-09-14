import React from "react";
import cl from "../styles/Goods.module.css";

function Button({ style, disabled, text, onClick, icon }) {
  return (
    <button
      style={style}
      disabled={disabled}
      onClick={onClick}
      className={cl.OptionsButton}
    >
      {icon}
      {text}
    </button>
  );
}

export default Button;
