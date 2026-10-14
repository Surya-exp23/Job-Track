// Guest chatbot API — public endpoint, no auth needed.
import { request } from "./client";

export const chatbotApi = {
  ask: (message, history) =>
    request("/chatbot/ask", { method: "POST", body: { message, history } }),
};
