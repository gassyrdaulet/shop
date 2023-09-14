import cl from "../styles/Loading.module.css";

function Loading({ which }) {
  if (which === "small") {
    return <div className={cl.MiniLoader}></div>;
  }
  if (which === "gray") {
    return (
      <div className={cl["lds-facebook"]}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
  return (
    <div className={cl["lds-ellipsis"]}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default Loading;
