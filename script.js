const DEFAULTS = {
  eat: ["Tacos", "Homemade ramen", "Order Thai", "Leftovers"],
  watch: ["Finish the show everyone's talking about", "A comfort rewatch", "A documentary"],
  do: ["Go for a walk", "Board game night", "Call an old friend"]
};

let state = {
  eat: [...DEFAULTS.eat],
  watch: [...DEFAULTS.watch],
  do: [...DEFAULTS.do]
};

let currentTab = "eat";

function save() {
  localStorage.setItem("tonight-picker", JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem("tonight-picker");
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      // ignore corrupt data, fall back to defaults
    }
  }
}

function render() {
  const panels = document.getElementById("panels");
  panels.innerHTML = ""; // clear and rebuild each time

  const list = state[currentTab];

  const stage = document.createElement("div");
  stage.className = "stage";
  stage.innerHTML = `<p id="reel">Ready when you are</p>`;

  const decideBtn = document.createElement("button");
  decideBtn.className = "decide";
  decideBtn.textContent = "Decide for me";
  decideBtn.disabled = list.length === 0;
  decideBtn.addEventListener("click", () => decide());

  const ul = document.createElement("ul");
  list.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item + " ";
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      state[currentTab].splice(index, 1); // remove this item
      save();
      render();
    });
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });

  const addRow = document.createElement("div");
  addRow.className = "add-row";

  const input = document.createElement("input");
  input.placeholder = "Add an option…";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add";

  function addItem() {
    const val = input.value.trim();
    if (!val) return;
    state[currentTab].push(val);
    input.value = "";
    save();
    render();
  }

  addBtn.addEventListener("click", addItem);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
  });

  addRow.append(input, addBtn);

  panels.append(stage, decideBtn, ul, addRow);
}

function decide() {
  const list = state[currentTab];
  if (!list.length) return;

  const reel = document.getElementById("reel");
  let ticks = 0;
  const totalTicks = 15;
  let delay = 70;

  function tick() {
    reel.textContent = list[Math.floor(Math.random() * list.length)];
    ticks++;
    if (ticks < totalTicks) {
      delay *= 1.12; // each step waits a bit longer than the last
      setTimeout(tick, delay);
    }
    // after the last tick, whatever's showing is the "final" pick
  }
  tick();
}

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  currentTab = btn.dataset.cat;

  document.querySelectorAll("#tabs button").forEach(b =>
    b.classList.toggle("active", b.dataset.cat === currentTab)
  );

  render();
});

load();
render();
