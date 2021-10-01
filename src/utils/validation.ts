export const validatePassword = (password: string, text: any) =>
  /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{6,64}$/.test(password) || text;
