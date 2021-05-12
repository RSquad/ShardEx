export const validatePassword = (password: string) =>
  /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{6,64}$/.test(password) ||
  "Your password must be 6-64 characters, and include at least one lowercase letter and a number.";
