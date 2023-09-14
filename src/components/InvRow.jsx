import moment from "moment";
import { BsEye } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function InvRow({ inventoryItem }) {
  const navigate = useNavigate();

  return (
    <tr>
      <td>{inventoryItem.id}</td>
      <td>{inventoryItem.type === "acceptance" ? "Приемка" : "Списание"}</td>
      <td>{inventoryItem.comment}</td>
      <td>{moment(inventoryItem.date).format("yyyy.MM.DD")}</td>
      <td>{inventoryItem.sum} тг</td>
      <td>{inventoryItem.quantity}</td>
      <td>
        <div
          onClick={() =>
            navigate("/warehouse/inventory/details/" + inventoryItem.id)
          }
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <BsEye style={{ cursor: "pointer" }} size={20} />
        </div>
      </td>
    </tr>
  );
}

export default InvRow;
