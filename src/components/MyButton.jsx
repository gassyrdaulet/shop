import React from "react";
import cl from "../styles/MyButton.module.css";
import Loading from "./Loading";

function MyButton({
  children,
  style,
  text,
  type,
  onClick,
  isLoading,
  disabled,
  className,
}) {
  return (
    <button
      disabled={isLoading || disabled}
      style={style}
      type={type}
      onClick={onClick}
      className={
        cl.MyButton + " " + (isLoading ? cl.Loading : "") + " " + className
      }
    >
      {children}
      {text}
      <div className={cl.Loader + " " + (isLoading ? cl.LoaderVisible : "")}>
        <Loading which="small" />
      </div>
    </button>
  );
}

export default MyButton;
