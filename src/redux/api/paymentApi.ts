import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayment: builder.query({
      query: (params) => ({
        url: "/payments/my-payments",
        method: "GET",
        params: { ...params },
      }),
      providesTags: ["Payment"],
    }),



    createPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/create-checkout-session",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),

  }),
});

export const {
useGetMyPaymentQuery,
useCreatePaymentMutation,
} = paymentApi;
