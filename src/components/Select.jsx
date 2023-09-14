import cl from "../styles/Select.module.css";

function Select({
  options = [],
  loading,
  setValue,
  className,
  type = "groups",
  style,
  value,
}) {
  return (
    <select
      value={value}
      style={style}
      onChange={({ target }) => {
        setValue(type === "settings" ? target.value : parseInt(target.value));
      }}
      disabled={loading}
      className={cl.Select + " " + className}
    >
      {type === "groups" ? (
        <option key={-2} value={-2}>
          Все товары
        </option>
      ) : (
        ""
      )}
      {type === "groups" ? (
        <option key={-1} value={-1}>
          Товары без группы
        </option>
      ) : (
        ""
      )}
      {type === "managers" ? (
        <option key={-1} value={-1}>
          Пользователь не выбран
        </option>
      ) : (
        ""
      )}
      {type === "managers2" ? (
        <option key={-1} value={-1}>
          Все
        </option>
      ) : (
        ""
      )}
      {options.map((option) => {
        return (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        );
      })}
    </select>
  );
}

export default Select;
