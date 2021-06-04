import { interactiveTaskStatus } from "@/store/modules/tasks";
import { store } from "@/store";

export default {
  name: "cancelInteractiveTask",
  async handle(task: any) {
    const { interactiveTaskId } = task.data;
    const interactiveTask = await store.dispatch("tasks/getTask", interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.new) {
      let interactiveTasks = [];
      interactiveTasks = await store.getters["tasks/getActiveTasks"];

      for (const i in interactiveTasks) {
        interactiveTasks[i].statusId = interactiveTaskStatus.canceled;
      }
      store.dispatch("tasks/updateTasks", interactiveTasks);
    }
    return await store.getters["tasks/getAll"];
  },
};
