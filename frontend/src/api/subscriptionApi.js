import axiosClient from "./axiosClient";

export const subscriptionApi = {
  getCurrent: () =>
    axiosClient.get("/subscriptions/me").then((r) => r.data),

  // Send plan as a QUERY parameter, not a body
  renew: (plan) =>
    axiosClient.post(`/subscriptions/renew?plan=${encodeURIComponent(plan)}`).then((r) => r.data),

  history: () =>
    axiosClient.get("/subscriptions/history").then((r) => r.data),
};