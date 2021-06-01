import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import BackgroundApi from "@/api/background";
import { interactiveTaskActiveStatusIds, interactiveTaskStatus } from "./tasks";
import Vue from "vue";
import { store } from "@/store";
import {
  cancelInteractiveTaskTask,
  applyInteractiveTaskTask,
  saveFormInteractiveTaskTask,
  requestInteractiveTasksTask,
} from "@/api/task/items";

const _ = {
  findCurrentTask(tasks: any) {
    const taskArraySortedById: any = Object.entries(tasks).sort((a: any, b: any) => a.id - 0 - (b.id - 0));
    // eslint-disable-next-line no-unused-vars
    for (const [id, task] of taskArraySortedById) {
      if (interactiveTaskActiveStatusIds.includes(task.statusId)) {
        return task;
      }
    }
    return null;
  },
  hasCurrentTaskStatus(tasks: any, statusId: any) {
    const task = this.findCurrentTask(tasks);
    if (null !== task) {
      if (task.statusId === statusId) {
        return true;
      }
    }
    return false;
  },
  countTasks(tasks: any, onlyActive = false) {
    let num = 0;
    if (onlyActive) {
      // eslint-disable-next-line no-unused-vars
      for (const [id, task] of Object.entries(tasks)) {
        if (interactiveTaskActiveStatusIds.includes(task.statusId)) {
          num++;
        }
      }
    } else {
      num = Object.entries(tasks).length;
    }
    return num;
  },
  updateTaskEndless: async function(commit, state) {
    try {
      const tasks = await BackgroundApi.request(requestInteractiveTasksTask);
      store.commit("action/setTasks", tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(
        async function() {
          await this.updateTaskEndless(commit, state);
        }.bind(this),
        1000
      );
    }
  },
};

class ActionState {
  tasks: any = {};
}

class ActionGetters extends Getters<ActionState> {
  get isDialogShowing() {
    return _.countTasks(this.state.tasks, true) > 0;
  }
  get currentTask() {
    return _.findCurrentTask(this.state.tasks);
  }
  get activeTasksAmount() {
    return _.countTasks(this.state.tasks, true);
  }
  get isCancelButtonEnabled() {
    return _.hasCurrentTaskStatus(this.state.tasks, interactiveTaskStatus.new);
  }
  get isCancelButtonLoading() {
    return _.hasCurrentTaskStatus(this.state.tasks, interactiveTaskStatus.cancellation);
  }
  get isApplyButtonEnabled() {
    return _.hasCurrentTaskStatus(this.state.tasks, interactiveTaskStatus.new);
  }
  get isApplyButtonLoading() {
    return _.hasCurrentTaskStatus(this.state.tasks, interactiveTaskStatus.process);
  }
}

class ActionMutations extends Mutations<ActionState> {
  setTasks(tasks: any) {
    for (const [id, task] of Object.entries(tasks)) {
      if (undefined === this.state.tasks[id]) {
        Vue.set(this.state.tasks, id, task);
      } else {
        this.state.tasks[id].statusId = task.statusId;
        this.state.tasks[id].result = task.result;
        this.state.tasks[id].error = task.error;
      }
    }
  }

  setCurrentTaskCancellation() {
    const taskId = _.findCurrentTask(this.state.tasks).id;
    this.state.tasks[taskId].statusId = interactiveTaskStatus.cancellation;
  }

  setCurrentTaskProcess() {
    const taskId = _.findCurrentTask(this.state.tasks).id;
    this.state.tasks[taskId].statusId = interactiveTaskStatus.process;
    this.state.tasks[taskId].error = null;
  }

  clear() {
    this.state.tasks = {};
  }
}

class ActionActions extends Actions<ActionState, ActionGetters, ActionMutations, ActionActions> {
  cancel(interactiveTaskId: any) {
    this.mutations.setCurrentTaskCancellation();
    return BackgroundApi.request(cancelInteractiveTaskTask, { interactiveTaskId }).then((tasks) => {
      this.mutations.setTasks(tasks);
    });
  }
  async apply({ interactiveTask, password }: any): Promise<any> {
    this.mutations.setCurrentTaskCancellation();
    const form = this.state.tasks[interactiveTask.id].form;
    return BackgroundApi.request(applyInteractiveTaskTask, {
      interactiveTaskId: interactiveTask.id,
      password,
      form,
    }).then(async ({ interactiveTasks, interactiveTask }) => {
      this.mutations.setTasks(interactiveTasks);
      // if (interactiveTask.data.frontPostApply !== undefined) {
      //   await frontPostApply.call(interactiveTask.data.frontPostApply);
      // }
    });
  }
  formChange(form: any) {
    const taskId = _.findCurrentTask(this.state.tasks).id;
    this.state.tasks[taskId].form = form;
    return BackgroundApi.request(saveFormInteractiveTaskTask, { interactiveTaskId: this.state.tasks[taskId].id, form });
  }
  startTaskUpdating() {
    return _.updateTaskEndless(store.commit, this.state);
  }
}

export const action = new Module({
  state: ActionState,
  getters: ActionGetters,
  mutations: ActionMutations,
  actions: ActionActions,
});

export const actionModuleMapper = createMapper(action);
