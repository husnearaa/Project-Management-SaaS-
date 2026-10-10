import { baseApi } from "./baseApi";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Task"],
    }),

    getTaskById: builder.query({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),

   

       getMyTask: builder.query({
      query: (params) => ({
        url: "/tasks/my-tasks",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Task"],
    }),

    createTask: builder.mutation({
      query: (data) => ({
        url: "/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),

    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),

    deleteTask: builder.mutation({
  query: ({ id }) => ({
    url: `/tasks/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Task"],
}),

    assignTask: builder.mutation({
      query: ({id,data}) => ({
        url: `/tasks/${id}/assign`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),


    ChangeTaskStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),

  }),
});

export const {
useGetAllTasksQuery,
useGetTaskByIdQuery,
useCreateTaskMutation,
useUpdateTaskMutation,
useDeleteTaskMutation,
useAssignTaskMutation,
useChangeTaskStatusMutation,
useGetMyTaskQuery,
} = taskApi;
