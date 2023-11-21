export const encrypteEmail = (email) => {
  const emailArr = email.split("");
  const emailSympolIndex = emailArr.findIndex((char) => char === "@");
  const slicedPart = emailSympolIndex - 1;
  const firstChar = email[0];

  const decryptedEmailPart = email.slice(slicedPart);

  const encryptedEmailPart = decryptedEmailPart.padStart(email.length - 1, "*");

  const encryptedEmail = `${firstChar}${encryptedEmailPart}`;
  return encryptedEmail;
};
