const STORAGE_KEY = "todo-app-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const itemsLeftEl = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";
let editingId = null;

init();

function init() {
  render();
  bindEvents();
}

function bindEvents() {
  form.addEventListener("submit", handleAdd);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
  });

  clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    render();
  });
}

function handleAdd(event) {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  input.value = "";
  saveTodos();
  render();
}

function handleToggle(id) {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  saveTodos();
  render();
}

function handleDelete(id) {
  todos = todos.filter((item) => item.id !== id);
  if (editingId === id) editingId = null;
  saveTodos();
  render();
}

function startEdit(id) {
  editingId = id;
  render();
}

function saveEdit(id, newText) {
  const text = newText.trim();
  if (!text) {
    handleDelete(id);
    return;
  }

  const todo = todos.find((item) => item.id === id);
  if (todo) {
    todo.text = text;
    saveTodos();
  }

  editingId = null;
  render();
}

function cancelEdit() {
  editingId = null;
  render();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function render() {
  const filtered = getFilteredTodos();
  list.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = getEmptyMessage();
    list.appendChild(empty);
  } else {
    filtered.forEach((todo) => {
      list.appendChild(createTodoElement(todo));
    });
  }

  updateFooter();
}

function getEmptyMessage() {
  if (todos.length === 0) {
    return "Henüz görev yok. Yukarıdan bir tane ekle!";
  }

  if (currentFilter === "active") {
    return "Aktif görev kalmadı.";
  }

  if (currentFilter === "completed") {
    return "Tamamlanan görev yok.";
  }

  return "Gösterilecek görev yok.";
}

function createTodoElement(todo) {
  const clone = template.content.cloneNode(true);
  const item = clone.querySelector(".todo-item");
  const checkbox = clone.querySelector(".todo-checkbox");
  const textEl = clone.querySelector(".todo-text");
  const editBtn = clone.querySelector(".edit-btn");
  const deleteBtn = clone.querySelector(".delete-btn");

  item.dataset.id = todo.id;

  if (todo.completed) {
    item.classList.add("completed");
  }

  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => handleToggle(todo.id));

  if (editingId === todo.id) {
    item.classList.add("editing");
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-edit-input";
    editInput.value = todo.text;
    editInput.maxLength = 200;

    textEl.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    editInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveEdit(todo.id, editInput.value);
      } else if (event.key === "Escape") {
        cancelEdit();
      }
    });

    editInput.addEventListener("blur", () => {
      saveEdit(todo.id, editInput.value);
    });
  } else {
    textEl.textContent = todo.text;
    editBtn.addEventListener("click", () => startEdit(todo.id));
  }

  deleteBtn.addEventListener("click", () => handleDelete(todo.id));

  return clone;
}

function updateFooter() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  itemsLeftEl.textContent = `${activeCount} görev kaldı`;

  const hasCompleted = todos.some((todo) => todo.completed);
  clearCompletedBtn.style.visibility = hasCompleted ? "visible" : "hidden";
}

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
