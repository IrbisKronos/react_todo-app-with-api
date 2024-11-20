import React from 'react';

import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem';

type Props = {
  todos: Todo[] | null;
  updateTodo: (updatedTodo: Todo) => void;
  deleteTodo: (todoId: number) => void;
  isLoading: boolean;
  loadingTodoIds: number[];
  tempTodo: Todo | null;
  editingTodos: Record<number, boolean>;
  setEditingTodos: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
};

export const TodoList: React.FC<Props> = ({
  todos,
  updateTodo,
  deleteTodo,
  isLoading,
  loadingTodoIds,
  tempTodo,
  editingTodos,
  setEditingTodos,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos &&
        todos.map((todo: Todo) => (
          <TodoItem
            todo={todo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
            isLoading={loadingTodoIds.includes(todo.id)}
            key={todo.id}
            editingTodos={editingTodos}
            setEditingTodos={setEditingTodos}
          />
        ))}
      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          updateTodo={updateTodo}
          deleteTodo={deleteTodo}
          isLoading={true}
          editingTodos={editingTodos}
          setEditingTodos={setEditingTodos}
        />
      )}
    </section>
  );
};
