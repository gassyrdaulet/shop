import cl from "../styles/TextButton.module.css";

function TextButton({ text, onClick, disabled }) {
  return (
    <p disabled={disabled} className={cl.Link} onClick={onClick}>
      {text}
    </p>
  );
}

export default TextButton;
