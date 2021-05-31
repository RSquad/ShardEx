import { store } from "@/store";

export default {
  name: "saveFormInteractiveTask",
  handle: async function(task: any) {
    const { interactiveTaskId, form } = task.data;
    const interactiveTask = await store.getters["tasks/getTask"](interactiveTaskId);
    interactiveTask.form = form;
    await store.dispatch("tasks/updateTasks", [interactiveTask]);
  },
};
