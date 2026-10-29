import { useRef } from "react";
import { useFocusBoundary } from "../../lib/useFocusBoundary";
export default function DialogLayer({ children, onClose }) {
  const ref = useRef(null);
  useFocusBoundary(ref, true);
  return (
    <div
      ref={ref}
      className="studio-modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose?.();
      }}
    >
      {children}
    </div>
  );
}
