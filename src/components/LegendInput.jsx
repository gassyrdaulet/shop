import React from "react";
import cl from "../styles/LegendInput.module.css";

function LegendInput({
  value,
  setValue,
  type,
  legend,
  inputMode,
  placeholder,
  list,
  disabled,
  inputStyle,
  textarea,
  maxLength,
}) {
  return (
    <div className={cl.LegendInputWrapper}>
      {textarea ? (
        <textarea
          style={{ ...inputStyle, resize: "none" }}
          className={cl.LegendInput}
          disabled={disabled}
          list={list}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode={inputMode}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      ) : (
        <input
          style={{ ...inputStyle }}
          className={cl.LegendInput}
          disabled={disabled}
          list={list}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode={inputMode}
          type={type}
          placeholder={placeholder}
        />
      )}
      <p className={cl.LegendTitle}>{legend}</p>
    </div>
  );
}

export default LegendInput;
