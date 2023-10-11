import { useMemo } from "react";
import { BsArrowDownCircleFill, BsArrowUpCircleFill } from "react-icons/bs";

function GoodsHeaders({ setSort, sort }) {
  const ths = useMemo(
    () => [
      { name: "№", sort: { key: "none", type: "none" } },
      { name: "ID", sort: { key: "id", type: "numeric" } },
      { name: "Баркод", sort: { key: "barcode", type: "numeric" } },
      { name: "Наименование", sort: { key: "name", type: "text" } },
      { name: "Цена", sort: { key: "price", type: "numeric" } },
      { name: "Закуп. цена", sort: { key: "purchase", type: "numeric" } },
      { name: "Остаток", sort: { key: "remainder", type: "numeric" } },
      { name: "Ед. измерения", sort: { key: "unit", type: "text" } },
      { name: "", sort: { key: "none", type: "none" } },
    ],
    []
  );

  return (
    <tr>
      {ths.map((item) => {
        return (
          <th
            key={item.name}
            onClick={() =>
              setSort((prev) => {
                if (prev?.key === item.sort.key) {
                  return { ...prev, inverse: !prev.inverse };
                }
                return { ...item.sort, inverse: false };
              })
            }
          >
            {item.name}{" "}
            {item.sort.key === "none" ? (
              ""
            ) : item.sort.key === sort.key ? (
              sort.inverse ? (
                <BsArrowUpCircleFill />
              ) : (
                <BsArrowDownCircleFill />
              )
            ) : (
              ""
            )}
          </th>
        );
      })}
    </tr>
  );
}

export default GoodsHeaders;
