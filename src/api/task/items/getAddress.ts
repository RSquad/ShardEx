import { store } from "@/store";

export default {
  name: "getAddress",
  handle: async function() {
    return store.getters["wallet/activeAccountAddress"];
  },
};
