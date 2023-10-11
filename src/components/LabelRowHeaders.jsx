import React from "react";

function LabelRowHeaders({ type }) {
  return (
    <tr>
      <th>№</th>
      <th>ID</th>
      <th>Наименование</th>
      <th>
        {type === "ac" || type === "acceptance" ? "Закуп. цена" : "Розн. цена"}
      </th>
      <th>Количество</th>
      <th></th>
    </tr>
  );
}

export default LabelRowHeaders;
