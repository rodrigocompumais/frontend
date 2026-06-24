/** Restaura scroll e toque no body após fechar modais MUI (bug comum em Android). */
export const restoreBodyScrollLock = () => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.body.style.position = "";
};

/**
 * Props para Dialog em mobile: evita travamento de toque no Android
 * quando modais fullscreen (pedido, ocupar mesa) são fechados.
 */
export const getMobileDialogProps = (isXs = false) => ({
  disableScrollLock: true,
  ...(isXs ? { disableEnforceFocus: true } : {}),
  TransitionProps: {
    onExited: restoreBodyScrollLock,
  },
});
