export const stateManager = {
  currentState: {} as { [key: string]: any },
  setState: (key: string, value: any) => {
      stateManager.currentState[key] = value;
  },
  getState: (key: string) => {
      return stateManager.currentState[key];
  }
};
