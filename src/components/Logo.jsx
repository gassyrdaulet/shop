import cl from "../styles/Logo.module.css";
import fox from "../assets/fevecfox.png";

function Logo() {
  return (
    <div className={cl.mainWrapper}>
      <img src={fox} className={cl.logoImage} />
    </div>
  );
}

export default Logo;
