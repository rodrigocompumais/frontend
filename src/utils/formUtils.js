/**
 * Verifica se um campo deve ser exibido com base nas respostas e nas regras condicionais.
 * @param {Object} field - O campo do formulário
 * @param {Object} answers - Objeto { fieldId: valorResposta }
 * @param {Array} allFields - Todos os campos do formulário (para resolver fieldId)
 * @returns {boolean}
 */

const isEmpty = (val) => {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  return false;
};

const normStr = (val) => String(val ?? "").trim().toLowerCase();

const resolveSourceFieldId = (field, allFields = []) => {
  if (field.conditionalFieldId != null && field.conditionalFieldId !== "") {
    return field.conditionalFieldId;
  }
  if (typeof field.conditionalFieldIndex === "number" && allFields.length > 0) {
    const sorted = [...allFields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const source = sorted[field.conditionalFieldIndex];
    return source?.id ?? null;
  }
  return null;
};

export const isFieldVisible = (field, answers, allFields = []) => {
  if (!field.hasConditional) return true;

  const sourceFieldId = resolveSourceFieldId(field, allFields);
  if (sourceFieldId == null || sourceFieldId === "") return false;

  const rules = field.conditionalRules || {};
  const operator = rules.operator || "equals";
  const expectedValue = rules.value;

  const answerValue =
    answers[sourceFieldId] ??
    answers[String(sourceFieldId)] ??
    answers[Number(sourceFieldId)];

  switch (operator) {
    case "equals":
      if (expectedValue === undefined || expectedValue === null) return false;
      if (Array.isArray(answerValue)) {
        return answerValue.some((v) => normStr(v) === normStr(expectedValue));
      }
      return normStr(answerValue) === normStr(expectedValue);
    case "notEquals":
      if (expectedValue === undefined || expectedValue === null) return false;
      if (Array.isArray(answerValue)) {
        return !answerValue.some((v) => normStr(v) === normStr(expectedValue));
      }
      return normStr(answerValue) !== normStr(expectedValue);
    case "contains":
      if (expectedValue === undefined || expectedValue === null) return false;
      return String(answerValue || "")
        .toLowerCase()
        .includes(String(expectedValue || "").toLowerCase());
    case "isEmpty":
      return isEmpty(answerValue);
    case "isNotEmpty":
      return !isEmpty(answerValue);
    case "isTrue":
      if (Array.isArray(answerValue)) return answerValue.length > 0;
      {
        const strVal = String(answerValue || "").toLowerCase();
        return (
          strVal === "true" ||
          strVal === "sim" ||
          strVal === "yes" ||
          strVal === "1" ||
          answerValue === true
        );
      }
    case "isFalse":
      if (Array.isArray(answerValue)) return answerValue.length === 0;
      {
        const strVal2 = String(answerValue || "").toLowerCase();
        return (
          strVal2 === "false" ||
          strVal2 === "não" ||
          strVal2 === "nao" ||
          strVal2 === "no" ||
          strVal2 === "0" ||
          answerValue === false ||
          isEmpty(answerValue)
        );
      }
    default:
      return false;
  }
};

/** Remove erros/respostas de campos condicionais que ficaram ocultos após mudança do pai. */
export const pruneHiddenConditionalFields = (fields, answers, errors = {}) => {
  const sortedFields = [...(fields || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  let nextAnswers = answers;
  let nextErrors = errors;
  let changedAnswers = false;
  let changedErrors = false;

  sortedFields.forEach((field) => {
    if (!field.hasConditional) return;
    if (isFieldVisible(field, answers, sortedFields)) return;

    if (nextAnswers[field.id] !== undefined) {
      if (!changedAnswers) {
        nextAnswers = { ...answers };
        changedAnswers = true;
      }
      delete nextAnswers[field.id];
    }
    if (nextErrors[field.id]) {
      if (!changedErrors) {
        nextErrors = { ...errors };
        changedErrors = true;
      }
      delete nextErrors[field.id];
    }
  });

  return { answers: nextAnswers, errors: nextErrors };
};
