import { sendTransactionTask } from "@/api/task/items";
import { interactiveTaskStatus } from "@/store/modules/tasks";
import { store } from "../../store/index";
import {
  requestInteractiveTasksTask,
  saveFormInteractiveTaskTask,
  applyInteractiveTaskTask,
  cancelInteractiveTaskTask,
} from "@/api/task/items";

const taskList = {
  internal: {
    cancelInteractiveTaskTask,
    applyInteractiveTaskTask,
    saveFormInteractiveTaskTask,
    requestInteractiveTasksTask,
  },
  external: {
    interactive: {
      sendTransactionTask,
    },
    background: {},
  },
};
const _ = {
  getTaskHandler: function(list: any, name: any) {
    for (const i in list) {
      if (list[i].name === name) {
        return list[i];
      }
    }
    return null;
  },
  isTaskInList: function(list: any, name: any) {
    return this.getTaskHandler(list, name) !== null;
  },
  compileTaskByRequest: function(request: any, isInteractive = false, tabId = null) {
    return {
      requestId: request.requestId,
      method: request.method,
      data: request.data,
      isInteractive,
      tabId,
    };
  },
  handleTask: async function(list: any, task: any) {
    try {
      return await _.getTaskHandler(list, task.method).handle(task);
    } catch (e) {
      //@TODO move it out here
      throw new Error(e);
    }
  },
  timeout: (ms: any) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export default {
  compileExternalTaskByRequest: function(request: any, tabId: any) {
    const isInteractiveTask = _.isTaskInList(taskList.external.interactive, request.method);
    const isBackgroundTask = _.isTaskInList(taskList.external.background, request.method);
    if (!isInteractiveTask && !isBackgroundTask) {
      throw new Error(request.method);
    }
    return _.compileTaskByRequest(request, isInteractiveTask, tabId);
  },
  compileInternalTaskByRequest: function(request: any) {
    const isTaskExists = _.isTaskInList(taskList.internal, request.method);
    if (!isTaskExists) {
      throw new Error(request.method);
    }
    return _.compileTaskByRequest(request);
  },
  waitInteractiveTaskResolving: async function(task: any, interactiveTaskId: any): Promise<any> {
    if (await store.getters["tasks/isOneOfTaskByRequestIdCanceled"](task.requestId)) {
      throw new Error();
    }
    const interactiveTask = await store.getters["tasks/getTask"](interactiveTaskId);
    if (interactiveTask.statusId === interactiveTaskStatus.performed) {
      return interactiveTask.result;
    }
    await _.timeout(500);
    return await this.waitInteractiveTaskResolving(task, interactiveTaskId);
  },
  handleInternalTask: async function(task: any) {
    return _.handleTask(taskList.internal, task);
  },
  handleExternalBackgroundTask: async function(task: any) {
    return _.handleTask(taskList.external.background, task);
  },
  handleExternalInteractiveTask: async function(task: any) {
    return _.handleTask(taskList.external.interactive, task);
  },
};
