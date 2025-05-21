/**
 * Filters out fields that are not allowed from the required fields list.
 * 
 * @param {Array} requiredFields - The list of required fields.
 * @param {Array} allowedFields - The list of allowed fields.
 * @returns {Array} - The filtered list of required fields that are also allowed.
 */

function filterValidFields(requiredFields, allowedFields) {
  return requiredFields.filter((field) => allowedFields.includes(field));
}

/**
 * Filters out fields that are not allowed from the required fields object. 
 * @param {Object} requiredFields - The object of required fields.
 * @param {Array} allowedFields - The list of allowed fields.
 * @returns {Object} - The filtered object of required fields that are also allowed.
 */

function filterValidFieldsFromObject(requiredFields, allowedFields) {
    return Object.keys(requiredFields).reduce((acc, key) => {
        if(allowedFields.includes(key)) {
            acc[key] = requiredFields[key];
        }
        return acc;
    }, {});
}

module.exports = {
    filterValidFields,
    filterValidFieldsFromObject
}
