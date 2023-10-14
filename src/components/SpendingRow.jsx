import moment from "moment";

function SpendingRow({ spending, index, purpose }) {
  return (
    <tr>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {index}
      </td>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {spending.id}
      </td>
      <td>{purpose}</td>
      <td>{spending.sum.toFixed(2)} тг.</td>
      <td style={{ textAlign: "center" }}>
        {moment(spending.date).format("DD.MM.yyyy HH:mm")}
      </td>
      <td style={{ textAlign: "center" }}>{spending.comment}</td>
      <td style={{ textAlign: "center" }}>
        {spending.username + ` (ID: ${spending.user})`}
      </td>
    </tr>
  );
}

export default SpendingRow;
