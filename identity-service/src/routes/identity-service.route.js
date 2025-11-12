const express = require("express");

const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  logout,
} = require("../controllers/identity.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/logout", logout);

module.exports = router;
