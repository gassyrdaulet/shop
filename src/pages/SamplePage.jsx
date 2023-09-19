// import { useState, useEffect, useMemo } from "react";
// import { BsArrowLeftCircle } from "react-icons/bs";
// import { AiOutlineCheckCircle } from "react-icons/ai";
// import { useNavigate } from "react-router-dom";
// import cl from "../styles/Goods.module.css";

// function SamplePage() {
//   const navigate = useNavigate();
//   const [processLoading, setProcessLoading] = useState(false);

//   const buttons = [
//     {
//       disabled: processLoading,
//       icon: <BsArrowLeftCircle />,
//       text: "Назад",
//       onClick: () => navigate(-1),
//     },
//   ];
//   const buttons2 = [
//     {
//       disabled: processLoading,
//       icon: <AiOutlineCheckCircle />,
//       text: "Сохранить",
//       onClick: () => {},
//     },
//   ];
//   return (
//     <div className="pageWrapper">
//       <div className={cl.Options}>
//         <div className={cl.OptionsButtons}>
//           {buttons.map((button) => {
//             return (
//               <button
//                 disabled={button.disabled}
//                 key={button.text}
//                 onClick={button.onClick}
//                 className={cl.OptionsButton}
//               >
//                 {button.icon}
//                 {button.text}
//               </button>
//             );
//           })}
//         </div>
//         <div className={cl.OptionsButtons}>
//           {buttons2.map((button) => {
//             return (
//               <button
//                 disabled={button.disabled}
//                 key={button.text}
//                 onClick={button.onClick}
//                 className={cl.OptionsButton}
//               >
//                 {button.icon}
//                 {button.text}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//       <div className={cl.goodsWrapper}>
//         <div className={cl.groupsWrapper} style={{ padding: "5px" }}></div>
//         <div className={cl.secondHalf}>
//           <div className={cl.inputsMobile}></div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SamplePage;
