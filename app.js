const addForm = document.getElementById("addForm");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const searchInput = document.getElementById("search");
const filters = document.querySelectorAll(".filter");
const meta = document.getElementById("meta");
const toggleAllBtn = document.getElementById("toggleAll");
const clearCompletedBtn = document.getElementById("clearCompleted");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";


function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";
  let filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  const search = searchInput.value.toLowerCase();
  if (search) {
    filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(search));
  }

  if (filteredTasks.length === 0) {
    empty.hidden = false;
  } else {
    empty.hidden = true;
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "item";
    li.draggable = true;
    const checkbox = document.createElement("div");
    checkbox.className = "checkbox" + (task.completed ? " checked" : "");
    checkbox.innerHTML = task.completed ? "✔" : "";
    checkbox.onclick = () => toggleTask(index);
    const text = document.createElement("div");
    text.className = "text" + (task.completed ? " done" : "");
    text.textContent = task.text;
    text.ondblclick = () => editTask(index);
    const actions = document.createElement("div");
    actions.className = "actions";
    const delBtn = document.createElement("button");
    delBtn.className = "icon-btn";
    delBtn.innerHTML = "🗑";
    delBtn.onclick = () => deleteTask(index);
    actions.appendChild(delBtn);
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);
    li.addEventListener("dragstart", e => {
      li.classList.add("dragging");
      e.dataTransfer.setData("text/plain", index);
    });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));

    list.appendChild(li);
  });

  updateMeta();
  saveTasks();
}


function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  taskInput.value = "";
  renderTasks();
}


function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}


function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}


function editTask(index) {
  const newText = prompt("Edit task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    renderTasks();
  }
}


function updateMeta() {
  const done = tasks.filter(t => t.completed).length;
  meta.textContent = `${tasks.length} tasks • ${done} done`;
}


filters.forEach(btn => {
  btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});


searchInput.addEventListener("input", renderTasks);


toggleAllBtn.addEventListener("click", () => {
  const allDone = tasks.every(t => t.completed);
  tasks.forEach(t => (t.completed = !allDone));
  renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  renderTasks();
});

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});


list.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(list, e.clientY);
  if (afterElement == null) {
    list.appendChild(dragging);
  } else {
    list.insertBefore(dragging, afterElement);
  }
});

list.addEventListener("drop", e => {
  const fromIndex = e.dataTransfer.getData("text/plain");
  const dragging = document.querySelector(".dragging");
  const newIndex = Array.from(list.children).indexOf(dragging);
  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(newIndex, 0, moved);
  renderTasks();
});

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".item:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}


renderTasks();
