import cl from "../styles/SearchInput.module.css";

function SearchInput({
  value,
  setValue,
  placeholder,
  className,
  type,
  inputMode,
  autoFocus,
}) {
  return (
    <input
      autoFocus={autoFocus}
      type={type}
      className={cl.SearchInput + " " + className}
      value={value}
      onChange={({ target }) => setValue(target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
    />
  );
}

export default SearchInput;
