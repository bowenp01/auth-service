//--------------------------------------------------------------------------------
//  Change Log
//  Created : 23-JUN-2020
//  Author : Paul Bowen
//--------------------------------------------------------------------------------

const Joi = require("joi"); // Schema validation -- will validate user data

const CredentialSetEnum = {
  LOCAL: "LOCAL",
  ACTIVEDIRECTORY: "ACTIVEDIRECTORY",
};

const schema = Joi.object({
  username: Joi.string().alphanum().max(12).required(),
  password: Joi.string().required(),
  credentialset: Joi.string().required().valid("LOCAL", "ACTIVEDIRECTORY"),
  key: Joi.string().required(),
});


function validateAuthRX(authRX) {
  return schema.validate(authRX);
}

module.exports.validate = validateAuthRX;
module.exports.CredentialSetEnum = CredentialSetEnum;
