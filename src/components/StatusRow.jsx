import React from "react";

function StatusRow({
  item,
  deliveryStatus,
  totalLength,
  index,
  icons,
  mobile = false,
  total,
}) {
  return (
    <div
      style={{
        color: mobile
          ? deliveryStatus === item.name
            ? "white"
            : "rgb(41, 116, 208)"
          : "rgb(41, 116, 208)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: mobile ? "column" : "row",
        padding: 10,
        textAlign: "start",
        backgroundColor:
          deliveryStatus === item.name
            ? mobile
              ? "rgb(41, 116, 208)"
              : "#f8f8f8"
            : "transparent",
        borderRadius: mobile ? 5 : 0,
        margin: mobile ? "0 3px" : "",
        borderTop: mobile ? "" : "1px solid rgb(187, 187, 187)",
        userSelect: "none",
        cursor: "pointer",
        borderBottom:
          index + 1 === totalLength ? "1px solid rgb(187, 187, 187)" : "none",
      }}
      onClick={item.onClick}
      key={item.text}
    >
      <span style={{ marginRight: 5 }}>{icons[item.name]}</span>
      <span
        style={{
          display: "block",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <p
          style={{
            fontSize: 12,
          }}
        >
          {item.text}
          {total ? ` (${total})` : ""}
        </p>
      </span>
    </div>
  );
}

export default StatusRow;
