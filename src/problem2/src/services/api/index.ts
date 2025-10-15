import type { TokenPrice, TokenPriceWithIcon } from "./model";

export async function getTokens(): Promise<TokenPriceWithIcon[]> {
  try {
    const response = await fetch("https://interview.switcheo.com/prices.json");
    const data: TokenPrice[] = await response.json();
    // Remove duplicates - keep the most recent entry for each currency
    const deduped = Object.values(
      data.reduce<Record<string, TokenPrice>>((acc, token) => {
        const key = token.currency.toUpperCase();
        const existing = acc[key];

        if (!existing) {
          acc[key] = token;
        } else if (new Date(token.date) > new Date(existing.date)) {
          acc[key] = token;
        }

        return acc;
      }, {})
    );

    const formatted = deduped.map((token) => {
      let formattedCurrency = token.currency;
      switch (token.currency) {
        case "STRD":
          formattedCurrency = "STRD";
          break;
        case "RATOM":
          formattedCurrency = "rATOM";
          break;
        default:
          formattedCurrency = token.currency.startsWith("ST")
            ? `st${token.currency.slice(2)}`
            : token.currency;
          break;
      }
      return {
        ...token,
        currency: formattedCurrency,
      };
    });

    const formattedWithIcon = formatted.map((token) => ({
      ...token,
      icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency}.svg`,
    }));

    // Sort alphabetically by currency
    return formattedWithIcon.sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}
