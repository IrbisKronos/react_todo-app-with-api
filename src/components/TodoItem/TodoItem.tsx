import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  updateTodo: (updatedTodo: Todo) => void;
  deleteTodo: (todoId: number) => void;
  isLoading: boolean;
  editingTodos: Record<number, boolean>;
  setEditingTodos: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  updateTodo,
  deleteTodo,
  isLoading,
  editingTodos,
  setEditingTodos,
}) => {
  const { title, completed, id } = todo;

  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTodos[id] && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingTodos, id]);

  const handleDoubleClick = () => {
    setEditingTodos(prev => ({ ...prev, [id]: true }));
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle) {
      if (trimmedTitle !== title) {
        updateTodo({ ...todo, title: trimmedTitle });
      }
    } else {
      deleteTodo(id);
    }
    setEditingTodos(prev => ({ ...prev, [id]: false }));
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setEditedTitle(title);
      setEditingTodos(prev => ({ ...prev, [id]: false }));
    }

    if (event.key === 'Enter') {
      const trimmedTitle = editedTitle.trim();

      if (trimmedTitle === title) {
        setEditingTodos(prev => ({ ...prev, [id]: false }));
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

      {editingTodos[id] ? (
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
          'is-active': isLoading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
