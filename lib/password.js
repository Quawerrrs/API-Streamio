const generatePassword = function () {
  const length = 12; // longueur minimale du mot de passe
  const charsets = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // lettres majuscules
    "abcdefghijklmnopqrstuvwxyz", // lettres minuscules
    "0123456789", // chiffres
    "!@#$%^&*()_+-=", // caractères spéciaux
  ];
  const password = [];

  // sélectionnez au hasard un caractère de chaque charset
  for (let i = 0; i < length; i++) {
    const charsetIndex = Math.floor(Math.random() * charsets.length);
    const charset = charsets[charsetIndex];
    const char = charset.charAt(Math.floor(Math.random() * charset.length));
    password.push(char);
  }

  // assurez-vous que le mot de passe contient au moins 2 caractères spéciaux, 1 lettre majuscule et 1 chiffre
  while (
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=]).{12,}$/.test(password.join(""))
  ) {
    password = generatePassword();
  }

  return password.join("");
};

module.exports = generatePassword;
