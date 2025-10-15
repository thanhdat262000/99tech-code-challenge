export type TokenPrice = {
  currency: string;
  date: string;
  price: number;
};

export type TokenPriceWithIcon = TokenPrice & {
  icon: string;
};
