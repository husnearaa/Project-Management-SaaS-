import { baseApi } from "./baseApi";

// import { GetAllJobsResponse } from "@/types/jobType";

export const ManagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProjects: builder.query({
      query: (params) => ({
        url: "/projects",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Manager"],
    }),

      getProjectById: builder.query({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "GET",
      }),
      providesTags: ["Manager"],
    }),

    getAllTasks: builder.query({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Manager"],
    }),

    getMyTasks: builder.query({
      query: (params) => ({
        url: "/tasks/my-tasks",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Manager"],
    }),

    createProject: builder.mutation({
      query: (data) => ({
        url: "/projects/create-project",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Manager"],
    }),

        updateProject: builder.mutation({
      query: ({ id }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Admin"],
    }),

    addMember: builder.mutation({
      query: ({id,data}) => ({
        url: `/projects/${id}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Manager"],
    }),


     deleteProject: builder.mutation({
      query: ({ id }) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manager"],
    }),

     deleteMember: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/projects/${id}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manager"],
    }),

  }),
});

export const {
  useGetAllProjectsQuery,
  useGetAllTasksQuery,
  useGetMyTasksQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useAddMemberMutation,

} = ManagerApi;
