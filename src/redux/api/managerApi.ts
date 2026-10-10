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
    
  }),
});

export const {
useGetAllProjectsQuery,
useGetAllTasksQuery,
useGetMyTasksQuery,
} = ManagerApi;


