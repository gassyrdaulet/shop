import cl from "../styles/CheckBox.module.css";

function CheckBox({ checked, onChange, disabled }) {
  return (
    <label className={cl["toggle-switch"]}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          if (disabled) {
            return;
          }
          onChange(e);
        }}
      />
      <span className={cl["switch"]} />
    </label>
  );
}

export default CheckBox;
