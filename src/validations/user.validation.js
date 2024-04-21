import Joi from "joi";

const addUser = {
  body: {
    username: Joi.string().label("Username").required(),
    password: Joi.string().label("Password").required(),
    email: Joi.string().label("Email").required(),
    fullName: Joi.string().label("Full Name").required(),
  },
};

const loginUser = {
  body: {
    email: Joi.string().label("Email").required(),
    password: Joi.string().label("Password").required(),
  },
};

export default { addUser, loginUser };
