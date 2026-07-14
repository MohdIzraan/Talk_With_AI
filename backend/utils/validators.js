import { validationResult } from "express-validator";


// Middleware that checks for validation errors collected by express-validator rules defined on a route, and returns a 400 response listing them if any exist.

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
