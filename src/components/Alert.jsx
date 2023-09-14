import cl from "../styles/Alert.module.css";

function Alert({ title, text }) {
  return (
    <div className={cl.AlertWrapper}>
      <div className={cl.Alert}>
        <p className={cl.Title}>{title}</p>
        <p className={cl.Text}>{text}</p>
      </div>
    </div>
  );
}

export default Alert;
