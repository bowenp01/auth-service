//=============================================================
//  Change Log
//  Created : 25-JUN-2020
//  Author : Paul Bowen
//=============================================================
const config = require("config"); // will use settings from config/*.json based on NODE_ENV
const jwt = require("jsonwebtoken");

module.exports = class User {
  constructor(username, fullname, email, department, roles) {
    this.username = username;
    this.fullname = fullname;
    this.email = email;
    this.department = department;
    this.roles = roles;
  }

  getJWT() {
    const token = jwt.sign(
      {
        username: this.username,
        fullname: this.fullname,
        email: this.email,
        department: this.department,
        roles: this.roles,
      },
      config.get("jwtPrivateKey"),
      { expiresIn: "24h" }
    );
    return token;
  }
};
