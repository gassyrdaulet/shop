import cl from "../styles/Logo.module.css";
import fox from "../assets/fevecfox.png";

function Logo() {
  return (
    <div className={cl.mainWrapper}>
      <img src={fox} className={cl.logoImage} alt="A Fevec Fox" />
    </div>
  );
}

export default Logo;
