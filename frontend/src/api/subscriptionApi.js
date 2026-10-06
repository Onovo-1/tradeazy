import axiosClient from "./axiosClient";

export const subscriptionApi = {
  me: () => axiosClient.get("/subscriptions/me").then((r) => r.data),

  renew: (plan = "MONTHLY") =>
    axiosClient
      .post(`/subscriptions/renew?plan=${plan}`)
      .then((r) => r.data),

  history: (params = {}) =>
    axiosClient.get("/subscriptions/history", { params }).then((r) => r.data),

  prices: () => axiosClient.get("/subscriptions/prices").then((r) => r.data),
};