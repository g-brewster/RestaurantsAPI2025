const express = require("express");

const validateBody = (req, res, next) => {
  if (!req.body) {
    res.status(400).json({
      status: "fail",
      message: "Please specify a body in the request",
    });
  }
  next();
};

module.exports = validateBody;
