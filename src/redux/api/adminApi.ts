import { baseApi } from "./baseApi";

// import { GetAllJobsResponse } from "@/types/jobType";

export const AdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllDashboardStats: builder.query({
      query: (params) => ({
        url: "/admin/dashboard-stats",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Admin"],
    }),

    getAllUsers: builder.query({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Admin"],
    }),

    getAllAuditLogs: builder.query({
      query: (params) => ({
        url: "/audit/audit-logs",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Admin"],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: "PATCH",
        body: {
          role,
        },
      }),
      invalidatesTags: ["Admin"],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: {
          status,
        },
      }),
      invalidatesTags: ["Admin"],
    }),

    
  }),
});

export const {
  useGetAllDashboardStatsQuery,
  useGetAllUsersQuery,
  useGetAllAuditLogsQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation
} = AdminApi;


