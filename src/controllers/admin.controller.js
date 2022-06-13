const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { signToken, decodeToken } = require("../config/jwt.js");
const emailHelper = require("../helpers/email");
const randomInt = require("random-int");

const VendorController = {
  login: async function (req, res) {
    try {
      let { email, password } = req.body;
      email = email.toLowerCase();
      let admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).send({ message: "Invalid  details" });
      }

      const result = await bcrypt.compare(password, admin.password);
      if (!result) {
        return res
          .status(400)
          .send({ message: "Email or password is incorrect" });
      }

      let token = await signToken({ user: admin });

      res.status(200).send({
        message: "Login successful",
        data: {
          token,
          user: admin,
        },
      });
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "An error occurred, Please try again",
        error: error.toString(),
      });
    }
  },

  create: async function (req, res) {
    try {
      const { email } = req.body;
      let admin = await Admin.findOne({ email });
      if (admin) {
        return res.status(409).send({
          type: "email",
          message: "An admin with that email already exists.",
        });
      }
      let data = req.body;
      await bcrypt.hash(data.password, saltRounds, async function (err, hash) {
        if (err) {
          return res.status(500).send(error);
        }

        data.password = hash;
        data.pin = randomInt(1000, 9999);

        admin = new Admin(data);
        await admin.save();
        let token = await signToken({ user: admin });
        emailHelper.sendVendorRegister(admin, token);
        res.status(201).send({
          message: "Registration successful",
          data: { token, user: admin },
        });
      });
    } catch (error) {
      res.status(500).send({
        status: "error",
        message: "An error occurred, Please try again",
        error: error.toString(),
      });
    }
  },
};

module.exports = VendorController;
