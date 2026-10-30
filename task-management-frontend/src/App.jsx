import { useState, useEffect } from "react"; import "./App.css"; import { getTasks, createTask, updateTask } from "./api";

function App() { const [task, setTask] = useState("");
    const [dueDate, setDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  const [editingTaskID, setEditingTaskID] = useState(null); const [tasks, setTasks] = useState([]); 
  const filteredTasks = tasks.filter((item) => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
        filter === "all" ||
        (filter === "completed" && item.completed) ||
        (filter === "pending" && !item.completed);
        return matchesSearch && matchesFilter;
  });
  const [darkMode, setDarkMode] = useState(false);

// Load tasks from backend
useEffect(() => {
    getTasks()
        .then((data) => {
            setTasks(
                data.map((item) => ({
                    id: item.id,
                    text: item.title,
                    completed: item.completed,
                    dueDate: item.dueDate || "",
                }))
            );
        })
        .catch((error) => {
            console.error("Tasks load nahi hue:", error);
        });
}, []);

// Add new task or update existing task
async function handleAddTask() {
    if (!task.trim()) {
        return;
    }

    try {
        if (editingTaskID !== null) {
            const existingTask = tasks.find(
                (item) => item.id === editingTaskID
            );

            const updatedTask = await updateTask(editingTaskID, {
                text: task.trim(),
                completed: existingTask
                    ? existingTask.completed
                    : false, dueDate: dueDate || null,
            });

            setTasks((previousTasks) =>
                previousTasks.map((item) =>
                    item.id === editingTaskID
                        ? {
                              id: updatedTask.id,
                              text: updatedTask.title,
                              completed: updatedTask.completed,
                              dueDate: updatedTask.dueDate || dueDate || "",
                          }
                        : item
                )
            );

            setTask("");
            setEditingTaskID(null);
            return;
        }

        const newTask = await createTask({
            text: task.trim(),
            completed: false,
            dueDate: dueDate || null,
        });

        setTasks((previousTasks) => [
            ...previousTasks,
            {
                id: newTask.id,
                text: newTask.title,
                completed: newTask.completed,
                dueDate: newTask.dueDate,}]);
        
        

        setTask("");
        setDueDate("");
    } catch (error) {
        console.error("Task did not save/update:", error);
        alert("Task did not save. check the backend and console.");
    }
}

// Edit task
function handleEditTask(item) {
    setTask(item.text);
    setDueDate(item.dueDate || "");
    setEditingTaskID(item.id);
}

// Complete or undo task
async function handleCompleteTask(id) {
    const currentTask = tasks.find((item) => item.id === id);

    if (!currentTask) {
        return;
    }

    try {
        const updatedTask = await updateTask(id, {
            text: currentTask.text,
            completed: !currentTask.completed, dueDate: currentTask.dueDate || null,
        });

        setTasks((previousTasks) =>
            previousTasks.map((item) =>
                item.id === id
                    ? {
                          id: updatedTask.id,
                          text: updatedTask.title,
                          completed: updatedTask.completed,
                          dueDate: updatedTask.dueDate || item.dueDate || "",
                      }
                    : item
            )
        );
    } catch (error) {
        console.error("Task status update nahi hua:", error);
        alert("Task status update nahi hua. Dobara try karo.");
    }
}

// Delete task
async function handleDeleteTask(id) {
    try {
        const response = await fetch(
            `http://localhost:8080/api/tasks/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            throw new Error("Task delete nahi hua.");
        }

        setTasks((previousTasks) =>
            previousTasks.filter((item) => item.id !== id)
        );

        if (editingTaskID === id) {
            setEditingTaskID(null);
            setTask("");
        }
    } catch (error) {
        console.error("Task delete nahi hua:", error);
        alert("Task delete nahi hua. Dobara try karo.");
    }
}

return (
    <div
        className={`app-container ${darkMode ? "dark-mode" : ""}`}
    >
        {/* Dark / Light Mode Button */}
        <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((previousMode) => !previousMode)}
        >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <h1>Task Manager</h1>
        <p>Manage your daily tasks easily.</p>

        {/* Task Statistics */}
        <div className="task-stats">
            <div className="stat-card">
                <h3>Total Tasks</h3>
                <p>{tasks.length}</p>
            </div>

            <div className="stat-card">
                <h3>Completed</h3>
                <p>
                    {tasks.filter((item) => item.completed).length}
                </p>
            </div>

            <div className="stat-card">
                <h3>Pending</h3>
                <p>
                    {tasks.filter((item) => !item.completed).length}
                </p>
            </div>
        </div>

        {/* Search Tasks */}
        <input
            type="text"
            className="search-input"
            placeholder="Search your tasks..."
            aria-label="Search your tasks"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
        />

        {/* Filter Tasks */}
        <div className="filter-buttons">
            <button
                className={filter === "all" ? "active-filter" : ""}
                onClick={() => setFilter("all")}
                >
                    All Tasks
                </button>

                <button
                className={filter === "pending" ? "active-filter" : ""}
                onClick={() => setFilter("pending")}
                >
                    Pending Tasks
                </button>

                <button
                className={filter === "completed" ? "active-filter" : ""}
                onClick={() => setFilter("completed")}
                >
                    Completed Tasks
                </button>
        </div>

        {/* Due Date Picker*/}
        <input
            type="date"
            id="dueDate"
            className="due-date-input"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
        />


        {/* Task Input */}
        <input
            type="text"
            placeholder="Enter your task"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    handleAddTask();
                }
            }}
        />

        

        <button type="button" onClick={handleAddTask}>
            {editingTaskID !== null ? "Save Changes" : "Add Task"}
        </button>

        

        {/* Task List */}
        <ul>
            {filteredTasks.map((item) => (
                <li key={item.id}>
                    <span
                        className={item.completed ? "completed-task" : ""}
                    >
                        {item.text}
                    </span>

                    {item.dueDate && (
                        <span className="due-date">
                            Due: {item.dueDate}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => handleEditTask(item)}
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => handleCompleteTask(item.id)}
                    >
                        {item.completed ? "Undo" : "Complete"}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDeleteTask(item.id)}
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    </div>
);
}

export default App;