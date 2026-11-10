const crypto = require("crypto");

function validatePassword(password, field = "contrasena") {
  if (typeof password !== "string" || password.length < 10 || password.length > 128) {
    const error = new Error(`${field} debe tener entre 10 y 128 caracteres`);
    error.status = 400;
    throw error;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    const error = new Error(`${field} debe incluir letras y numeros`);
    error.status = 400;
    throw error;
  }
  return password;
}

// Genera la contrasena temporal a partir de bytes aleatorios (hash hexadecimal de 16 caracteres).
// Se repite hasta que incluya letras y numeros para cumplir validatePassword.
function generateTemporaryPassword() {
  let password;
  do {
    password = crypto.randomBytes(8).toString("hex");
  } while (!/[a-f]/.test(password) || !/\d/.test(password));
  return password;
}

// Usa la contrasena enviada o genera una cuando el administrador lo solicita.
function resolveTemporaryPassword(body, required = true) {
  if (body.generar_password === true) return { password: generateTemporaryPassword(), generated: true };
  if (!required && !body.password_temporal) return { password: null, generated: false };
  return { password: validatePassword(body.password_temporal, "password_temporal"), generated: false };
}

// El nombre de usuario se guarda en minusculas para que el login no distinga mayusculas.
function normalizeUsername(value) {
  const username = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z0-9._-]{3,60}$/.test(username)) {
    const error = new Error("El usuario debe tener entre 3 y 60 letras, numeros, punto, guion o guion bajo");
    error.status = 400;
    throw error;
  }
  return username;
}

module.exports = { validatePassword, normalizeUsername, generateTemporaryPassword, resolveTemporaryPassword };
