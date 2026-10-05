import { useEffect, useRef } from 'react';

export default function Modal({
  children,
  onClose,
  titleId,
  descriptionId,
  alert = false,
  busy = false,
  small = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
      if (!document.querySelector('dialog[open]'))
        document.body.classList.remove('dialog-open');
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal${small ? ' modal-sm' : ''}`}
      role={alert ? 'alertdialog' : 'dialog'}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          !busy &&
          event.target === event.currentTarget &&
          (event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom)
        )
          onClose();
      }}
    >
      {children}
    </dialog>
  );
}
