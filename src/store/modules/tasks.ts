import Vue from "vue";
import { sortBy } from "lodash";
import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

const _ = {
  indexEntitiesByField(entities: any, field: any) {
    const result: any = {};
    for (const element of entities) {
      result[element[field]] = element;
    }
    return result;
  },
};

export const interactiveTaskStatus = {
  new: 1,
  cancellation: 2,
  canceled: 3,
  process: 4,
  performed: 5,
  unknown: 6,
};

export const interactiveTaskActiveStatusIds = [
  interactiveTaskStatus.new,
  interactiveTaskStatus.cancellation,
  interactiveTaskStatus.process,
];

export const interactiveTaskType = {
  transfer: 1,
};

class TasksState {
  list: any[] = [];
}

class TasksGetters extends Getters<TasksState> {
  get getAll() {
    const tasks = sortBy(this.state.list, "id");
    return _.indexEntitiesByField(tasks, "id");
  }

  get getTask(): (id: number) => any {
    return (id: number) => this.state.list.find((task: any) => task.id === id);
  }

  get isOneOfTaskByRequestIdCanceled() {
    return (requestId: string) => {
      const tasksNum = this.state.list.filter(
        (task) => task.requestId === requestId && task.statusId === interactiveTaskStatus.canceled
      ).length;
      return tasksNum > 0;
    };
  }
  get getActiveTasks() {
    const tasks = sortBy(this.state.list.filter((task) => interactiveTaskActiveStatusIds.includes(task.statusId)));
    return _.indexEntitiesByField(tasks, "id");
  }
}

class TasksMutations extends Mutations<TasksState> {
  createTaskMut(task: any) {
    this.state.list.push(task);
  }

  putTaskMut({ i, task }: any) {
    Vue.set(this.state.list, i, task);
  }
}

class TasksActions extends Actions<TasksState, TasksGetters, TasksMutations, TasksActions> {
  async createTask({ typeId, network, requestId = null, params = {}, data = {} }: any) {
    const task: any = {
      typeId,
      network,
      requestId,
      data,
      params,
      statusId: interactiveTaskStatus.new,
    };
    task.id = this.state.list.length;
    this.mutations.createTaskMut(task);
    return task;
  }

  // async runTask() {}

  async updateTasks(tasks: any) {
    for (const i in tasks) {
      this.mutations.putTaskMut({ i, task: tasks[i] });
    }
  }
}

export const tasks = new Module({
  state: TasksState,
  getters: TasksGetters,
  mutations: TasksMutations,
  actions: TasksActions,
});

export const tasksModuleMapper = createMapper(tasks);
