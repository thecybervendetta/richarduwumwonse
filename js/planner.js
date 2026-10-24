// ===== Academic Planner Logic =====

var defaultTasks = [
  { id: 1, title: "Submit COS 106 term project", due: "", priority: "high", done: false },
  { id: 2, title: "Review SOC analysis incident triage notes", due: "", priority: "medium", done: false },
  { id: 3, title: "Set up GitHub repository & CI check", due: "", priority: "low", done: true }
];

var tasks = [];
try {
  var stored = localStorage.getItem("planner-tasks");
  tasks = stored ? JSON.parse(stored) : defaultTasks;
} catch (e) {
  tasks = defaultTasks;
}

var currentFilter = "all";

var form = document.getElementById("task-form");
var titleInput = document.getElementById("task-title");
var dueInput = document.getElementById("task-due");
var priorityInput = document.getElementById("task-priority");
var list = document.getElementById("task-list");
var counter = document.getElementById("task-counter");
var encouragement = document.getElementById("task-encouragement");
var bar = document.getElementById("progress-bar");
var progressWrap = document.querySelector(".progress");
var celebration = document.getElementById("celebration-banner");

function save() {
  try {
    localStorage.setItem("planner-tasks", JSON.stringify(tasks));
  } catch (e) {
    console.warn("LocalStorage unavailable", e);
  }
}

function addTask(title, due, priority) {
  tasks.unshift({
    id: Date.now(),
    title: title,
    due: due,
    priority: priority,
    done: false
  });
  save();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(function (t) {
    if (t.id === id) t.done = !t.done;
    return t;
  });
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(function (t) { return t.id !== id; });
  save();
  render();
}

function formatDue(dateStr) {
  if (!dateStr) return "No deadline set";
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var target = new Date(dateStr + "T00:00:00");
  if (isNaN(target.getTime())) return "Due: " + dateStr;

  var diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "⚠️ Overdue (" + Math.abs(diffDays) + "d ago)";
  if (diffDays === 0) return "📌 Due today";
  if (diffDays === 1) return "⏳ Due tomorrow";
  return "Due: " + target.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

function render() {
  list.innerHTML = "";

  var visible = tasks.filter(function (t) {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "completed") return t.done;
    return true;
  });

  if (visible.length === 0) {
    var empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = currentFilter === "completed" 
      ? "No completed tasks yet. Finish a task and check it off!"
      : (currentFilter === "active" ? "All caught up! No active tasks pending." : "Your planner is clear. Add a goal above.");
    list.appendChild(empty);
  }

  visible.forEach(function (t) {
    var li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "");

    var check = document.createElement("input");
    check.type = "checkbox";
    check.checked = t.done;
    check.setAttribute("aria-label", "Mark '" + t.title + "' as " + (t.done ? "incomplete" : "completed"));
    check.addEventListener("change", function () { toggleTask(t.id); });

    var info = document.createElement("div");
    info.className = "info";

    var title = document.createElement("div");
    title.className = "title";
    title.textContent = t.title + " ";

    var badge = document.createElement("span");
    badge.className = "badge " + (t.priority || "medium");
    badge.textContent = t.priority || "medium";
    title.appendChild(badge);

    var meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = formatDue(t.due);

    info.appendChild(title);
    info.appendChild(meta);

    var del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.textContent = "Remove";
    del.setAttribute("aria-label", "Delete task: " + t.title);
    del.addEventListener("click", function () { deleteTask(t.id); });

    li.appendChild(check);
    li.appendChild(info);
    li.appendChild(del);
    list.appendChild(li);
  });

  // Calculate progress & encouragement
  var total = tasks.length;
  var doneCount = tasks.filter(function (t) { return t.done; }).length;
  var percent = total ? Math.round((doneCount / total) * 100) : 0;

  if (counter) {
    counter.textContent = doneCount + " of " + total + " completed (" + percent + "%)";
  }
  if (bar) {
    bar.style.width = percent + "%";
  }
  if (progressWrap) {
    progressWrap.setAttribute("aria-valuenow", percent);
  }

  if (encouragement) {
    if (total === 0) {
      encouragement.textContent = "Ready when you are.";
    } else if (doneCount === total) {
      encouragement.textContent = "All clear! Excellent focus.";
    } else if (percent >= 50) {
      encouragement.textContent = "Past the halfway mark!";
    } else {
      encouragement.textContent = "One step at a time.";
    }
  }

  if (celebration) {
    if (total > 0 && doneCount === total) {
      celebration.classList.add("show");
    } else {
      celebration.classList.remove("show");
    }
  }
}

// Quick suggestions chips
document.querySelectorAll(".quick-chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    var title = chip.getAttribute("data-title") || "";
    var priority = chip.getAttribute("data-priority") || "medium";
    if (titleInput) {
      titleInput.value = title;
      if (priorityInput) priorityInput.value = priority;
      titleInput.focus();
    }
  });
});

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var title = titleInput.value.trim();
    if (!title) {
      titleInput.classList.add("invalid");
      titleInput.focus();
      return;
    }
    titleInput.classList.remove("invalid");
    addTask(title, dueInput.value, priorityInput.value);
    form.reset();
    titleInput.focus();
  });
}

document.querySelectorAll(".filter").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter").forEach(function (b) {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
