const API_BASE_URL = window.NUTRISCAN_API_BASE_URL || "https://nutriscan-production-186b.up.railway.app";

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

window.onload = function () {
  if (!userId || !token) {
    window.location.href = "index.html";
    return;
  }
  const select = document.getElementById("rangeSelect");
  select.addEventListener("change", () => loadAnalytics(select.value));
  loadAnalytics(select.value);
};
function showError(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function clearSkeletons() {
  document.querySelectorAll(".skeleton").forEach(el => el.classList.remove("skeleton"));
}

async function loadAnalytics(range) {

  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics?userId=${encodeURIComponent(userId)}&range=${encodeURIComponent(range || "7d")}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      showError("Session expired. Redirecting to login...");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "index.html";
      }, 1500);

      return;
      return;
    }

    if (!response.ok) {

      const message = await response.text().catch(() => "");
      console.error("Analytics request failed:", response.status, message);
      throw new Error(message || "Couldn't load your analytics.");
    }

    const data = await response.json();
    clearSkeletons();

    document.getElementById("streak").textContent = data.streak;

    const goal = data.calorieGoal;
    const labels = document.querySelectorAll(".trend-grid-line");

    labels[0].textContent = goal;
    labels[1].textContent = Math.round(goal * 0.75);
    labels[2].textContent = Math.round(goal * 0.5);
    labels[3].textContent = Math.round(goal * 0.25);
    const avgCalories = data.averageCalories ?? 0;
    document.getElementById("averageCalories").textContent = `${Math.round(avgCalories)} kcal`;
    document.getElementById("avgCalorieBadge").textContent = `Avg: ${avgCalories.toLocaleString()} kcal`;

    const change = document.getElementById("calorieChange");
    const changePercent = data.calorieChangePercent ?? 0;
    if (changePercent >= 0) {
      change.textContent = `▲ ${changePercent}% higher than last week`;
      change.style.color = "var(--apricot-deep)";
    } else {
      change.textContent = `▼ ${Math.abs(changePercent)}% lower than last week`;
      change.style.color = "var(--sage-deep)";
    }

    const calorieTrend = data.calorieTrend ?? [];
    const maxCalories = Math.max(...calorieTrend.map(d => d.calories), data.calorieGoal);

    calorieTrend.forEach((day, index) => {
      const dayLabel = document.getElementById(`day${index}`);
      const bar = document.getElementById(`calorieBar${index}`);
      if (dayLabel) dayLabel.textContent = day.day;
      if (bar) bar.style.height = `${Math.min((day.calories / maxCalories) * 100, 100)}%`;
    });

    const proteinTrend = data.proteinTrend ?? [];
    const maxProtein = Math.max(...proteinTrend.map(d => d.protein), data.proteinGoal);
    document.getElementById("proteinTargetText").textContent =
      `Weekly distribution of tracked protein load vs target (${data.proteinGoal}g)`;
    proteinTrend.forEach((day, index) => {
      const dayLabel = document.getElementById(`proteinDay${index}`);
      const bar = document.getElementById(`proteinBar${index}`);
      if (dayLabel) dayLabel.textContent = day.day;
      if (bar) bar.style.height = `${Math.min((day.protein / maxProtein) * 100, 100)}%`;
    });

    const macros = data.macroBreakdown ?? { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };
    const protein = macros.proteinPercent ?? 0;
    const carbs = macros.carbsPercent ?? 0;
    const fat = macros.fatPercent ?? 0;

    document.getElementById("proteinValue").textContent = `${protein}%`;
    document.getElementById("carbsValue").textContent = `${carbs}%`;
    document.getElementById("fatValue").textContent = `${fat}%`;
    document.getElementById("carbsGrams").textContent = `${macros.carbs}g / ${data.carbsGoal}g`;
    document.getElementById("proteinGrams").textContent = `${macros.protein}g / ${data.proteinGoal}g`;
    document.getElementById("fatGrams").textContent = `${macros.fat}g / ${data.fatGoal}g`;
    drawDonut(protein, carbs, fat);

  } catch (err) {
    console.error("Failed to load analytics:", err);
    clearSkeletons();
    if (err.message.includes("Failed to fetch")) {
      showError("Unable to connect to the server.");
    } else {
      showError(err.message || "Something went wrong.");
    }
  }
}

function drawDonut(protein, carbs, fat) {

  const carbsArc = document.getElementById("carbsArc");
  const proteinArc = document.getElementById("proteinArc");
  const fatArc = document.getElementById("fatArc");

  carbsArc.setAttribute("stroke-dasharray", `${carbs} ${100 - carbs}`);
  carbsArc.setAttribute("stroke-dashoffset", "0");

  proteinArc.setAttribute("stroke-dasharray", `${protein} ${100 - protein}`);
  proteinArc.setAttribute("stroke-dashoffset", `-${carbs}`);

  fatArc.setAttribute("stroke-dasharray", `${fat} ${100 - fat}`);
  fatArc.setAttribute("stroke-dashoffset", `-${carbs + protein}`);
}

let toastTimer;
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  switch (type) {
    case "success":
      toast.style.background = "#1B4332";
      break;
    case "error":
      toast.style.background = "#D62828";
      break;
    case "warning":
      toast.style.background = "#E07A2C";
      break;
    case "info":
      toast.style.background = "#2563EB";
      break;
  }
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(12px)";
  }, 2500);
}