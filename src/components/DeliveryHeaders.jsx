import React from "react";

function DeliveryHeaders({ type }) {
  return (
    <tr>
      <th>№</th>
      <th>ID</th>
      <th>Дата расчета</th>
      <th>Заметка</th>
      <th>Курьер</th>
      <th>Кол-во доставок</th>
      <th>Сумма</th>
      <th>Наличные</th>
      <th></th>
    </tr>
  );
}

export default DeliveryHeaders;
