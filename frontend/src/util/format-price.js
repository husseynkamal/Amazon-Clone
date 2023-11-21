export const formatPrice = (price) => {
  const stringedPrice = Math.round(price).toString();
  if (stringedPrice.length <= 3) return price;

  if (isNaN(+price)) return "Invalid input";

  const formattedNumber = +price / 1000;
  const formattedPrice = formattedNumber.toFixed(3);

  return formattedPrice;
};
