const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const emails = (value, helpers) => {
  if (!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return helpers.message("Invalid email format");
  }
  return value;
};

const objectId = (value, helpers) => {
  if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
    return helpers.message('"{{#label}}" must be a valid positive integer');
  }
  return value;
};

const validateTodayDate = (value, helpers) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const inputDate = new Date(value);
  inputDate.setHours(0, 0, 0, 0); // Set to start of day

  if (inputDate.getTime() !== today.getTime()) {
    return helpers.error("date.today");
  }

  return value;
};

module.exports = {
  password,
  emails,
  objectId,
  validateTodayDate
};
