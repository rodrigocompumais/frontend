/**
 * Verifica se um campo deve ser exibido com base nas respostas e nas regras condicionais.
 * @param {Object} field - O campo do formulário
 * @param {Object} answers - Objeto { fieldId: valorResposta }
 * @param {Array} allFields - Todos os campos do formulário (para resolver fieldId)
 * @returns {boolean}
 */
export const isFieldVisible = (field, answers, allFields = []) => {
  if (!field.hasConditional) return true;

  const sourceFieldId = field.conditionalFieldId;
  if (sourceFieldId == null || sourceFieldId === "") return false;

  const rules = field.conditionalRules || {};
  const operator = rules.operator || "equals";
  const expectedValue = rules.value;

  // Suportar chave numérica e string (answers pode usar qualquer uma)
  const answerValue = answers[sourceFieldId] ?? answers[String(sourceFieldId)] ?? answers[Number(sourceFieldId)];

  const isEmpty = (val) => {
    if (val === undefined || val === null) return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === "string" && val.trim() === "") return true;
    return false;
  };

  switch (operator) {
    case "equals":
      if (expectedValue === undefined || expectedValue === null) return false;
      if (Array.isArray(answerValue)) {
        return answerValue.includes(expectedValue);
      }
      return String(answerValue || "").trim() === String(expectedValue || "").trim();
    case "notEquals":
      if (expectedValue === undefined || expectedValue === null) return false;
      if (Array.isArray(answerValue)) {
        return !answerValue.includes(expectedValue);
      }
      return String(answerValue || "").trim() !== String(expectedValue || "").trim();
    case "contains":
      if (expectedValue === undefined || expectedValue === null) return false;
      return (String(answerValue || "").toLowerCase()).includes(String(expectedValue || "").toLowerCase());
    case "isEmpty":
      return isEmpty(answerValue);
    case "isNotEmpty":
      return !isEmpty(answerValue);
    case "isTrue":
      if (Array.isArray(answerValue)) return answerValue.length > 0;
      const strVal = String(answerValue || "").toLowerCase();
      return strVal === "true" || strVal === "sim" || strVal === "yes" || strVal === "1" || answerValue === true;
    case "isFalse":
      if (Array.isArray(answerValue)) return answerValue.length === 0;
      const strVal2 = String(answerValue || "").toLowerCase();
      return strVal2 === "false" || strVal2 === "não" || strVal2 === "nao" || strVal2 === "no" || strVal2 === "0" || answerValue === false || isEmpty(answerValue);
    default:
      return false;
  }
};
