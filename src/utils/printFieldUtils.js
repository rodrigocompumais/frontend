import {
  isPieceAgainFieldStored,
  isPieceAgainStorableField,
  listPieceAgainStorableFields,
  resolvePieceAgainStoredFieldIds,
} from "./pieceAgainUtils";

export const isPrintStorableField = isPieceAgainStorableField;
export const listPrintStorableFields = listPieceAgainStorableFields;

export const resolvePrintStoredFieldIds = (settings, fields = []) =>
  resolvePieceAgainStoredFieldIds(
    { pieceAgainStoredFieldIds: settings?.printStoredFieldIds },
    fields
  );

export const isPrintFieldStored = isPieceAgainFieldStored;

export const clampPrintQrModuleSize = (value) => {
  const raw = Number(value ?? 10);
  if (!Number.isFinite(raw)) return 10;
  return Math.min(16, Math.max(4, Math.round(raw)));
};

export const clampPrintFontScale = (value) => {
  const raw = Number(value ?? 1);
  if (!Number.isFinite(raw)) return 1;
  return Math.min(3, Math.max(1, Math.round(raw)));
};

export const clampMesaQrPrintSize = (value) => {
  const raw = Number(value ?? 120);
  if (!Number.isFinite(raw)) return 120;
  return Math.min(280, Math.max(80, Math.round(raw)));
};
