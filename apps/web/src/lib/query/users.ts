import { queryOptions } from "@tanstack/react-query";
import { authClient } from "../auth-client";

export const usersPaginatedQueryOptions = ({
  pageSize = 10,
  currentPage = 1,
  query,
}: {
  pageSize: number;
  currentPage: number;
  query?: string;
}) =>
  queryOptions({
    queryKey: ["users", pageSize, currentPage, query],
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

export const usersQueryOptions = ({ enabled = true }: { enabled?: boolean }) =>
  queryOptions({
    queryKey: ["users", "all"],
    enabled,
    queryFn: async () => {
      const response = await authClient.admin.listUsers({
        query: {},
      });
      return response;
    },
  });
