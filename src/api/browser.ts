export default {
  throwErrorIfOccurred: function() {
    const error = this.findError();
    if (null !== error) {
      throw error;
    }
  },
  findError: function() {
    const { lastError } = browser.runtime;
    if (!lastError) {
      return null;
    }
    if (lastError.message) {
      return lastError;
    }
    return new Error(lastError.message);
  },
};
