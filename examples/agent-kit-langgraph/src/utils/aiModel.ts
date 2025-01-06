export const runAIModel = async (data: { [key: string]: any }[]) => {
  // Mock AI model logic
  return data.map(item => ({ ...item, score: Math.random() * 100 }));
};
