import { getTokens } from "@/services/api";
import { type TokenPriceWithIcon } from "@/services/api/model";
import { useQuery } from "@tanstack/react-query";

export function useTokens() {
  return useQuery<TokenPriceWithIcon[]>({
    queryKey: ["tokens"],
    queryFn: getTokens,
  });
}
