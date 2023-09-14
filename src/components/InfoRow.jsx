function InfoRow({ caption, value }) {
  return (
    <div
      style={{
        margin: "10px 0",
        borderBottom: "1px solid #bebebe",
      }}
    >
      <p style={{ fontSize: 12, color: "#999999" }}>{caption}</p>
      {value?.constructor === Array ? (
        <div>
          {value.map((item) => {
            return (
              <p style={{ margin: "3px 0" }} key={item}>
                {item}
              </p>
            );
          })}
        </div>
      ) : (
        <p style={{ margin: "3px 0" }}>{value}</p>
      )}
    </div>
  );
}

export default InfoRow;
