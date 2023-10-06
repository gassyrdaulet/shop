import { AiFillCloseCircle } from "react-icons/ai";
import cl from "../styles/SearchInput.module.css";

function SearchInput({
  value,
  setValue,
  placeholder,
  className,
  type,
  inputMode,
  autoFocus,
  isDate,
}) {
  return (
    <span className={cl.SearchInput + " " + className}>
      <input
        autoFocus={autoFocus}
        type={type}
        className={cl.SearchInputInput}
        value={value}
        onChange={({ target }) => setValue(target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      <span className={cl.EraseButton} style={isDate ? { right: "30px" } : {}}>
        <AiFillCloseCircle size={19} onClick={() => setValue("")} />
      </span>
    </span>
  );
}

export default SearchInput;
