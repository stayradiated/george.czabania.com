export type Todo = {
  id: number;
  completed: boolean;
};

export const createTodo = async (): Promise<Todo> => {
  return { id: 1, completed: false };
};

export const deleteTodo = async (_todo: Todo) => {};

export const completeTodo = async (todo: Todo) => {
  return {
    ...todo,
    completed: true,
  };
};
