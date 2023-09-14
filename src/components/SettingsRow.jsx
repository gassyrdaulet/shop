import { useNavigate } from "react-router-dom";

function SettingsRow({ item, settingsType, totalLength, index }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        color: "rgb(41, 116, 208)",
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        padding: 10,
        textAlign: "start",
        backgroundColor: settingsType === item.name ? "#f8f8f8" : "transparent",
        userSelect: "none",
        cursor: "pointer",
        borderTop: "1px solid rgb(187, 187, 187)",
        borderBottom:
          index + 1 === totalLength ? "1px solid rgb(187, 187, 187)" : "none",
      }}
      onClick={() => {
        navigate("/settings/" + item.name);
      }}
      key={item.text}
    >
      <span style={{ marginRight: 5 }}>{item.icon}</span>
      <p style={{ fontSize: 12 }}>{item.text}</p>
    </div>
  );
}

export default SettingsRow;
