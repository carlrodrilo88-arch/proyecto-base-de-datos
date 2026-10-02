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

module.exports = { validatePassword };
