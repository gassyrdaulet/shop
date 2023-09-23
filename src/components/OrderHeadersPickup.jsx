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
      <th>№</th>
      <th>Товары</th>
      <th>Сумма</th>
      <th>Продавец</th>
      <th>Комментарий</th>
      <th>Номер чека</th>
      <th>{status === "archive" ? dateType : "Дата создания"}</th>
      <th>Статус заказа</th>
    </tr>
  );
}

export default OrderHeaders;
