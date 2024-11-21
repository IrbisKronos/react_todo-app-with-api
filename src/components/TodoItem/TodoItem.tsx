import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

import { Todo } from '../../types/Todo';
import { updateTodo } from '../../api/todos';

type Props = {
  todo: Todo;
  deleteTodo: (todoId: number) => void;
  isLoading: boolean;
  isEditingTodos: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  loadingTodoIds: number[];
  setLoadingTodoIds: React.Dispatch<React.SetStateAction<number[]>>;
  tempTodo: Todo | null;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  deleteTodo,
  isLoading,
  isEditingTodos,
  setErrorMessage,
  loadingTodoIds,
  setLoadingTodoIds,
  tempTodo,
}) => {
  const { title, completed, id } = todo;

  const [editedTitle, setEditedTitle] = useState(title);
  const [editingTodos, setEditingTodos] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTodos && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingTodos]);

  useEffect(() => {
    if (isEditingTodos) {
      setEditingTodos(false);
    }
  }, [isEditingTodos]);

  const handleDoubleClick = () => {
    setEditingTodos(true);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setLoadingTodoIds(ids => [...ids, todo.id]);
    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle) {
      deleteTodo(id);
    } else if (trimmedTitle !== title) {
      updateTodo({ ...todo, title: trimmedTitle })
        .then(() => {
          setEditedTitle(trimmedTitle);
          setEditingTodos(false);
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
        })
        .finally(() =>
          setLoadingTodoIds(ids => ids.filter(id => id !== todo.id)),
        );
    } else {
      setEditingTodos(false);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setEditedTitle(title);
      setEditingTodos(false);
    }

    if (event.key === 'Enter') {
      const trimmedTitle = editedTitle.trim();

      if (trimmedTitle === title) {
        setEditingTodos(false);
      } else {
        handleSubmit(event);
      }
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: completed })}
      key={id}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          onClick={() => updateTodo({ ...todo, completed: !completed })}
          checked={completed}
        />
      </label>

      {editingTodos ? (
        <form onSubmit={handleSubmit}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editedTitle}
            ref={inputRef}
            onChange={handleTitleChange}
            onKeyUp={handleKeyUp}
            onBlur={handleSubmit}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isLoading || editingTodos || loadingTodoIds.includes(id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
