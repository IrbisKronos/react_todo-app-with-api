import React, { useEffect, useMemo, useState } from 'react';

import { Todo } from './types/Todo';
import { FilterCriteria } from './types/FilterCriteria';
import * as todoServise from './api/todos';
import { Header, Footer, TodoList, ErrorNotification } from './components';

const filterTodos = (tasks: Todo[], filterCriteria: FilterCriteria) => {
  return tasks.filter(task => {
    const matchesStatus =
      filterCriteria === FilterCriteria.All ||
      (filterCriteria === FilterCriteria.Active && !task.completed) ||
      (filterCriteria === FilterCriteria.Completed && task.completed);

    return matchesStatus;
  });
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterCriteria>(FilterCriteria.All);
  const [titleTodo, setTitleTodo] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [editingTodos, setEditingTodos] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setIsLoading(true);

    todoServise
      .getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const getFilteredTodos = useMemo(() => {
    return filterTodos(todos, filter);
  }, [todos, filter]);

  const addTodo = ({ title, userId, completed }: Todo) => {
    setIsLoading(true);

    const newTempTodo = {
      id: 0,
      userId: todoServise.USER_ID,
      title,
      completed: false,
    };

    setTempTodo(newTempTodo);

    todoServise
      .createTodo({ title, userId, completed })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTitleTodo('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
      })
      .finally(() => {
        setIsLoading(false);
        setTempTodo(null);
      });
  };

  const updateTodo = (updatedTodo: Todo) => {
    setLoadingTodoIds(ids => [...ids, updatedTodo.id]);

    todoServise
      .updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currentTodos => {
          const newTodo = [...currentTodos];
          const index = newTodo.findIndex(post => post.id === updatedTodo.id);

          newTodo.splice(index, 1, todo);

          return newTodo;
        });
        setEditingTodos(prev => ({ ...prev, [updatedTodo.id]: false }));
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');
      })
      .finally(() => {
        setLoadingTodoIds(ids => ids.filter(id => id !== updatedTodo.id));
        setTitleTodo('');
      });
  };

  const deleteTodo = (todoId: number) => {
    setLoadingTodoIds(ids => [...ids, todoId]);

    todoServise
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setLoadingTodoIds(ids => ids.filter(id => id !== todoId));
      });
  };

  const handleFilter = (filterType: FilterCriteria) => {
    setFilter(filterType);
  };

  const activeTodos = todos.filter(todo => !todo.completed).length || 0;

  const completedTodos = todos.filter(todo => todo.completed).length || 0;

  const toggleAllTodos = () => {
    const hasIncomplete = todos.some(todo => !todo.completed);

    const toggledTodos = hasIncomplete
      ? todos
          .filter(todo => !todo.completed)
          .map(todo => ({
            ...todo,
            completed: true,
          }))
      : todos.map(todo => ({
          ...todo,
          completed: false,
        }));

    toggledTodos.forEach(updateTodo);
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          addTodo={addTodo}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          titleTodo={titleTodo}
          setTitleTodo={setTitleTodo}
          toggleAllTodos={toggleAllTodos}
          activeTodos={activeTodos}
        />

        <TodoList
          todos={getFilteredTodos}
          updateTodo={updateTodo}
          deleteTodo={deleteTodo}
          isLoading={isLoading}
          loadingTodoIds={loadingTodoIds}
          tempTodo={tempTodo}
          editingTodos={editingTodos}
          setEditingTodos={setEditingTodos}
        />

        {!!todos.length && (
          <Footer
            handleFilter={handleFilter}
            filter={filter}
            todos={getFilteredTodos}
            deleteTodo={deleteTodo}
            activeTodos={activeTodos}
            completedTodos={completedTodos}
          />
        )}
      </div>

      <ErrorNotification errorMessage={errorMessage} />
    </div>
  );
};
