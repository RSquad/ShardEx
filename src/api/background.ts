export default {
  request: function(task: any, parameters = {}) {
    const data = { method: task.name, data: parameters };
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage(data).then((response) => {
        switch (response.code) {
          case 0:
            resolve(response.data);
            break;
          default:
            console.error(response);
            reject(response.error);
        }
      });
    });
  },
};
