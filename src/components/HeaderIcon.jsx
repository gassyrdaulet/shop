import { useRef, useEffect } from "react";

function HeaderIcon({ children, className, closeMenu, name, actual }) {
  const reference = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (reference.current && !reference.current.contains(event.target)) {
        if (name === actual) {
          closeMenu();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [reference, closeMenu, actual, name]);

  return (
    <div ref={reference} className={className}>
      {children}
    </div>
  );
}

export default HeaderIcon;
