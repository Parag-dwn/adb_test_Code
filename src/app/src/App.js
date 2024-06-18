import './App.css';
import React, { useState, useEffect } from 'react';

const App = () => {
    const [todos, setTodos] = useState([]);
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);

    const fetchTodos = async () => {
        try {
            const response = await fetch('http://localhost:8000/todos');
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch todos');
                return;
            }
            const data = await response.json();
            setTodos(data.todos);
            setError(null);
        } catch (error) {
            setError('An unexpected error occurred while fetching todos');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/todos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to add todo');
                return;
            }

            const result = await response.json();
            console.log('Todo added successfully:', result);
            setDescription("");
            fetchTodos();
            setError(null);
        } catch (error) {
            console.error('Error submitting todo:', error);
            setError('An unexpected error occurred while submitting todo');
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);
    return (
      <div className='App'>
      <h1>Todo List</h1>
      <div className="container">
          {error && <div className="error-message">{error}</div>}
          <form className="form-container" onSubmit={handleSubmit}>
              <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="TODO description" 
                  required 
              />
              <button type="submit">Submit</button>
          </form>
          <ul className="todos-list">
              {todos.map(todo => (
                  <li key={todo._id}>{todo.description}</li>
              ))}
          </ul>
      </div>
      </div>
  );
};

export default App;
