import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../auth-client";

export const usersQueryOptions = ({
  pageSize = 5,
  currentPage = 1,
  query,
}: {
  pageSize: number;
  currentPage: number;
  query?: string;
}) =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await authClient.admin.listUsers({
        query: {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          searchValue: query,
        },
      });
      return response;
    },
  });
