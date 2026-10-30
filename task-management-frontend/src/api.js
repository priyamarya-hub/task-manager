const API_URL = 
"http://localhost:8080/api/tasks";

export async function getTasks() {
const response = await fetch(API_URL);

if(!response.ok){
    throw new Error("Tasks could not be loaded.");
}
return response.json();
    
}
export async function createTask(task) {
    const response = await fetch(API_URL,{
        method: "POST",
        headers:{
            "Content-type": "application/json",

        },
        body: JSON.stringify({
            title: task.text,
            description: "",
            completed: task.completed??false,
            dueDate: task.dueDate || null,

        }),
    });
    if(!response.ok){
        throw new Error("Task could not be created.");
    }
    return response.json();
}

export async function updateTask(id, task) {
    const response = await fetch(`${API_URL}/${id}`,{
        method: "PUT",
        headers:{
            "Content-type": "application/json",
        },
        body: JSON.stringify({
            title: task.text,
            description: "",
            completed: task.completed,
            dueDate: task.dueDate || null,
        }),
    });
    if(!response.ok){
        throw new Error("Task could not be updated.");
    }

    return response.json();
}