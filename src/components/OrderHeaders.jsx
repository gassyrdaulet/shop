import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";

function OrderHeaders({ markAll, allMarked, unmarkAll, dateType, status }) {
  return (
    <tr
      className="centerAllChilds"
      onClick={() => {
        if (allMarked) {
          unmarkAll();
        } else {
          markAll();
        }
      }}
    >
      <th>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {allMarked ? (
            <BiCheckboxChecked size={32} />
          ) : (
            <BiCheckbox size={32} />
          )}
        </div>
      </th>
      <th>Товары</th>
      <th>Сумма</th>
      <th>Продавец</th>
      <th>Курьер</th>
      <th>Адрес</th>
      <th>Комментарий</th>
      <th>{status === "archive" ? dateType : "Дата создания"}</th>
      <th>План. дата</th>
      <th>Статус заказа</th>
    </tr>
  );
}

export default OrderHeaders;
