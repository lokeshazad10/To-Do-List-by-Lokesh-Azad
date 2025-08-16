(function () {
  const STORAGE_KEY = "todo-modern-v1";

  const els = {
    themeToggle: document.getElementById("themeToggle"),
    themeIcon: document.getElementById("themeIcon"),
    addForm: document.getElementById("addForm"),
    taskInput: document.getElementById("taskInput"),
    dateInput: document.getElementById("dateInput"),
    priorityInput: document.getElementById("priorityInput"),
    searchInput: document.getElementById("searchInput"),
    clearCompleted: document.getElementById("clearCompleted"),
    todoList: document.getElementById("todoList"),
    emptyState: document.getElementById("emptyState"),
    tabs: Array.from(document.querySelectorAll(".tab")),
    itemsLeft: document.getElementById("itemsLeft"),
  };

  const state = {
    tasks: [],
    filter: "all", // all | active | completed
    search: "",
    theme: null,
  };

  // Load
  const saved = load();
  if (saved) {
    state.tasks = Array.isArray(saved.tasks) ? saved.tasks : [];
    state.theme = saved.theme || null;
  }
  // Theme
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(state.theme || (prefersDark ? "dark" : "light"));

  // Render initial
  render();

  // Event: Theme toggle
  els.themeToggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    applyTheme(newTheme);
    persist();
  });

  // Event: Add
  els.addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (els.taskInput.value || "").trim();
    const dueDate = els.dateInput.value || "" || null;
    const priority = els.priorityInput.value || "normal";
    if (!title) {
      bump(els.taskInput);
      return;
    }
    addTask(title, dueDate, priority);
    els.addForm.reset();
    els.taskInput.focus();
  });

  // Event: Filters
  els.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      els.tabs.forEach((t) => t.classList.toggle("active", t === btn));
      els.tabs.forEach((t) =>
        t.setAttribute("aria-selected", t === btn ? "true" : "false")
      );
      render();
    });
  });

  // Event: Search
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    render();
  });

  // Keyboard shortcut: Ctrl/Cmd+K focuses search
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
    }
  });

  // Clear completed
  els.clearCompleted.addEventListener("click", () => {
    const hadCompleted = state.tasks.some((t) => t.completed);
    state.tasks = state.tasks.filter((t) => !t.completed);
    if (hadCompleted) persist();
    render();
  });

  // Delegated events on list
  els.todoList.addEventListener("change", (e) => {
    const li = e.target.closest("li.todo");
    if (!li) return;
    const id = li.dataset.id;
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;

    if (e.target.matches('input[type="checkbox"].toggle')) {
      task.completed = e.target.checked;
      persist();
      renderItemState(li, task);
      updateCount();
    } else if (e.target.matches('input[type="date"].due')) {
      const v = e.target.value || null;
      task.dueDate = v;
      persist();
      updateDueStyle(e.target, task);
    }
  });

  els.todoList.addEventListener("click", (e) => {
    const li = e.target.closest("li.todo");
    if (e.target.closest(".delete")) {
      if (!li) return;
      removeTask(li.dataset.id);
      return;
    }
  });

  // Inline edit: remember original on focus, save on blur or Enter, cancel on Esc
  els.todoList.addEventListener("focusin", (e) => {
    if (e.target.classList.contains("title")) {
      e.target.dataset.original = e.target.textContent;
    }
  });
  els.todoList.addEventListener("keydown", (e) => {
    if (!e.target.classList.contains("title")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.target.textContent = e.target.dataset.original || e.target.textContent;
      e.target.blur();
    }
  });
  els.todoList.addEventListener(
    "blur",
    (e) => {
      if (!e.target.classList.contains("title")) return;
      const li = e.target.closest("li.todo");
      const id = li?.dataset.id;
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;

      const newTitle = (e.target.textContent || "").replace(/\s+/g, " ").trim();
      if (!newTitle) {
        // revert if empty
        e.target.textContent = task.title;
        bump(e.target);
        return;
      }
      if (newTitle !== task.title) {
        task.title = newTitle;
        persist();
      }
    },
    true
  );

  // Drag and drop (only via handle)
  els.todoList.addEventListener("dragstart", (e) => {
    const li = e.target.closest("li.todo");
    if (!li) return;
    // only start drag if the grab started on the grip
    if (!e.target.closest(".drag")) {
      e.preventDefault();
      return;
    }
    li.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", li.dataset.id);
  });
  els.todoList.addEventListener("dragend", (e) => {
    const li = e.target.closest("li.todo");
    if (!li) return;
    li.classList.remove("dragging");
    // Sync new order to state
    const ids = Array.from(els.todoList.querySelectorAll("li.todo")).map(
      (el) => el.dataset.id
    );
    const indexById = new Map(ids.map((id, i) => [id, i]));
    state.tasks.forEach((t) => {
      if (indexById.has(t.id)) t.order = indexById.get(t.id);
    });
    persist();
  });
  els.todoList.addEventListener("dragover", (e) => {
    const canDrag = canReorder();
    if (!canDrag) return; // safety
    e.preventDefault();
    const dragging = els.todoList.querySelector(".todo.dragging");
    if (!dragging) return;
    const afterEl = getDragAfterElement(els.todoList, e.clientY);
    if (afterEl == null) {
      els.todoList.appendChild(dragging);
    } else {
      els.todoList.insertBefore(dragging, afterEl);
    }
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll(".todo:not(.dragging)")];
    return els.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // Helpers
  function addTask(title, dueDate, priority) {
    const order = state.tasks.length
      ? Math.max(...state.tasks.map((t) => t.order ?? 0)) + 1
      : 0;
    const task = {
      id: uid(),
      title,
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate || null,
      priority: priority || "normal",
      order,
    };
    state.tasks.push(task);
    persist();
    render();
  }
  function removeTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    persist();
    render();
  }
  function render() {
    // Tabs state already set; update count and list
    updateCount();

    // filter/search
    const q = state.search.trim().toLowerCase();
    const show = state.tasks
      .filter((t) => {
        if (state.filter === "active" && t.completed) return false;
        if (state.filter === "completed" && !t.completed) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Empty state
    els.emptyState.style.display = show.length ? "none" : "block";

    // Render items
    els.todoList.innerHTML = "";
    const dragEnabled = canReorder();

    for (const task of show) {
      const li = document.createElement("li");
      li.className = "todo" + (task.completed ? " completed" : "");
      li.dataset.id = task.id;
      if (dragEnabled) li.setAttribute("draggable", "true");
      else li.removeAttribute("draggable");

      // left: grip + checkbox
      const grip = document.createElement("button");
      grip.className = "drag";
      grip.type = "button";
      grip.title = "Drag to reorder";
      grip.innerHTML =
        '<svg width="16" height="16"><use href="#icon-grip"/></svg>';

      const cbWrap = document.createElement("label");
      cbWrap.className = "checkbox";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "toggle";
      cb.checked = !!task.completed;
      cb.setAttribute("aria-label", "Toggle complete");
      cbWrap.appendChild(cb);

      const actions = document.createElement("div");
      actions.className = "actions";
      const del = document.createElement("button");
      del.className = "delete";
      del.type = "button";
      del.title = "Delete";
      del.innerHTML =
        '<svg width="16" height="16"><use href="#icon-trash"/></svg>';
      actions.appendChild(del);

      const content = document.createElement("div");
      content.className = "content";

      const title = document.createElement("div");
      title.className = "title";
      title.setAttribute("contenteditable", "true");
      title.setAttribute("role", "textbox");
      title.setAttribute("aria-label", "Edit task title");
      title.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "meta";

      // due date input styled as chip
      const due = document.createElement("input");
      due.type = "date";
      due.className = "due";
      due.value = task.dueDate || "";
      due.placeholder = "Due date";
      due.title = "Due date";
      updateDueStyle(due, task);

      // priority chip
      const pr = document.createElement("span");
      pr.className = "chip";
      pr.textContent = `Priority: ${cap(task.priority)}`;

      content.appendChild(title);
      const metaRow = document.createElement("div");
      metaRow.className = "meta";
      metaRow.appendChild(due);
      metaRow.appendChild(pr);
      content.appendChild(metaRow);

      li.appendChild(grip);
      li.appendChild(cbWrap);
      li.appendChild(content);
      li.appendChild(actions);
      els.todoList.appendChild(li);
    }
  }
  function renderItemState(li, task) {
    li.classList.toggle("completed", !!task.completed);
  }
  function updateCount() {
    const left = state.tasks.filter((t) => !t.completed).length;
    els.itemsLeft.textContent = `${left} left`;
  }
  function updateDueStyle(input, task) {
    // mark overdue if date is before today and not completed
    input.classList.remove("overdue");
    if (!task.dueDate || task.completed) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate + "T00:00:00");
    if (due < today) input.classList.add("overdue");
  }
  function canReorder() {
    return state.filter === "all" && state.search.trim() === "";
  }

  function persist() {
    const payload = {
      tasks: state.tasks,
      theme: document.documentElement.getAttribute("data-theme"),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    updateThemeIcon();
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeIcon();
    state.theme = theme;
  }
  function updateThemeIcon() {
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    els.themeIcon.innerHTML = isLight
      ? '<use href="#icon-moon" />'
      : '<use href="#icon-sun" />';
    els.themeToggle.title = isLight ? "Switch to dark" : "Switch to light";
  }
  function uid() {
    return (
      "t_" +
      Math.random().toString(36).slice(2, 9) +
      Date.now().toString(36).slice(-4)
    );
  }
  function cap(s) {
    return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
  }
  function bump(el) {
    el.classList.remove("shake");
    // force reflow
    void el.offsetWidth;
    el.classList.add("shake");
  }
})();
