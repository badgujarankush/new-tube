import Joi from "joi";
import _ from "lodash";
import ApiError from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  const validSchema = _.pick(schema, ["params", "query", "body"]);
  const object = _.pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    const errorList = error.details.map((details) => {
      return {
        message: details.message,
        ...(details.context || {}),
      };
    });

    return next(
      new ApiError({
        statusCode: 400,
        errors: errorList,
        message: errorMessage,
      })
    );
  }
  Object.assign(req, value);
  return next();
};

export default validate;
