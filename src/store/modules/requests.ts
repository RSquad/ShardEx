import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

// const requestsList = { interactive: {}, background: {} };

class RequestsState {}

class RequestsGetters extends Getters<RequestsState> {}

class RequestsMutations extends Mutations<RequestsState> {}

class RequestsActions extends Actions<RequestsState, RequestsGetters, RequestsMutations, RequestsActions> {}

export const requests = new Module({
  state: RequestsState,
  getters: RequestsGetters,
  mutations: RequestsMutations,
  actions: RequestsActions,
});

export const requestsModuleMapper = createMapper(requests);
