import { store } from "@/store";

export default {
  name: "requestInteractiveTasks",
  handle: async function() {
    return await store.getters["tasks/getAll"];
  },
};
