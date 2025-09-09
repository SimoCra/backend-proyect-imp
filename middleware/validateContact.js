import { body, validationResult } from "express-validator";

export const validateContactRequest = [
  body("name")
    .trim()
    .notEmpty().withMessage("El nombre es obligatorio")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre contiene caracteres inválidos"),

  body("email")
    .trim()
    .isEmail().withMessage("Debe ser un correo válido")
    .normalizeEmail(),

  body("subject")
    .trim()
    .notEmpty().withMessage("El motivo es obligatorio")
    .isIn([
      "consulta",
      "informacion",
      "pedido",
      "devolucion",
      "soporte",
      "reclamo",
      "otro"
    ]).withMessage("Motivo inválido"),

  body("message")
    .trim()
    .notEmpty().withMessage("El mensaje no puede estar vacío")
    .isLength({ min: 10, max: 1000 }).withMessage("El mensaje debe tener entre 10 y 1000 caracteres")
    .matches(/^[\w\sáéíóúÁÉÍÓÚñÑ.,;:!?¡¿()'"-]+$/).withMessage("El mensaje contiene caracteres no permitidos"),

  // Middleware final para revisar errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extracted = errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }));
      return res.status(422).json({ errores: extracted });
    }
    next();
  }
];
