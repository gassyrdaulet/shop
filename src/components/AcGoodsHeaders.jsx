import React from "react";

function AcGoodsHeaders({ type }) {
  return (
    <tr>
      <th>№</th>
      <th>Наименование</th>
      <th>
        {type === "ac" || type === "acceptance" ? "Закуп. цена" : "Розн. цена"}
      </th>
      <th>Количество</th>
      <th>Сумма</th>
      <th></th>
    </tr>
  );
}

export default AcGoodsHeaders;
