const SERVER_URL = "http://localhost:8080"
let token = localStorage.getItem("token")
 const userId = localStorage.getItem("userId");

window.onload = function () {
    GetUserMeal();
    loadBMI();
    loadDashboard();
    loadProfileForSuggestions();
    if (sessionStorage.getItem('openAddMeal') === '1') {
        sessionStorage.removeItem('openAddMeal');
        openAddMealModal();
    }
};


function AddUserMeal(){
    const foodname = document.getElementById("am-food-name").value.trim();
    const portion = document.getElementById("am-portion").value.trim();
    const mealType = _amSelectedMeal;
  if (!userId) {
        showToast("Please Login First.", "error");
        window.location.href = "login.html";
        return;
    }

    const payload = {
    mealType,
    foodName: foodname,
    portionSize: portion
    };

    fetch(`${SERVER_URL}/addMeal?userId=${userId}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
})
.then(async response => {

    if (!response.ok) {

        if (response.status === 404) {
            showToast("Food not found. Try another food name.", "error");
            return;
        }

        if (response.status === 401) {
            showToast("Please login again.", "error");
            return;
        }

        if (response.status === 403) {
            showToast("You are not authorized.", "error");
            return;
        }

        showToast("Something went wrong.", "error");
        return;
    }

    const data = await response.json();

    showToast("Meal added successfully!", "success");

    setTimeout(() => {
        window.location.reload();
    }, 800);
})
.catch(err => {
    console.error(err);
    showToast(err.message, "error");
});
}

function GetUserMeal() {

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    fetch(`${SERVER_URL}/todayMeal?userId=${userId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => displayMeals(data))
    .catch(err => console.log(err));
}

function displayMeals(meals) {
    const container = document.getElementById("mealContainer");
    container.innerHTML = "";
    const mealImages = {
        'BREAKFAST': 'breakfast.png',
        'LUNCH': 'lunch.png',
        'DINNER': 'dinner.png',
        'SNACK': 'snack.png'
    };

    meals.forEach(meal => {
        const currentMealType = meal.mealType ? meal.mealType.toUpperCase() : '';
        const imageSrc = mealImages[currentMealType] || 'addfood.png'; 

        container.innerHTML += `
            <div class="meal-row focus-ring flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center" tabindex="0">
                <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style="background:var(--cream-2)">
                        <img 
                            src="${imageSrc}" 
                            alt="${meal.mealType}" 
                            class="w-10 h-10 object-contain"
                        />
                    </div>
                    <div>
                        <h3 class="font-semibold text-sm md:text-base">
                            ${meal.foodName}
                        </h3>

                        <span class="tag tag-breakfast block sm:inline-block mt-1 sm:mt-0">
                            ${meal.mealType}
                        </span>
                    </div>
                </div>
                <span class="font-display font-semibold text-base md:text-lg sm:ml-auto">
                    ${Math.round(meal.calories)} kcal
                </span>
            </div>
        `;
    });
}

var _amSelectedMeal = 'BREAKFAST';

function openAddMealModal(){
  var el = document.getElementById('add-meal-overlay');
  el.style.display = 'flex';
  setTimeout(function(){ document.getElementById('am-food-name').focus(); }, 80);
}

function closeAddMealModal(){
  document.getElementById('add-meal-overlay').style.display = 'none';
}

function amSelectTab(tab){
  document.querySelectorAll('.am-tab').forEach(function(t){
    t.classList.remove('am-tab-active');
    t.setAttribute('aria-selected','false');
  });
  tab.classList.add('am-tab-active');
  tab.setAttribute('aria-selected','true');
  _amSelectedMeal = tab.dataset.meal;
}

function amCheckValid(){
  var btn = document.getElementById('am-save-btn');
  var val = document.getElementById('am-food-name').value.trim();
  btn.disabled = val.length === 0;
}

function amSaveMeal() {
    var name = document.getElementById("am-food-name").value.trim();

    if (!name) {
        showToast("Please enter a food name.", "error");
        return;
    }

    AddUserMeal();
}

function amResetForm(){
  ['am-food-name', 'am-portion'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('am-save-btn').disabled = true;
}

document.getElementById('add-meal-overlay').addEventListener('click', function(e){
  if(e.target === this) closeAddMealModal();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && document.getElementById('add-meal-overlay').style.display === 'flex') {
    closeAddMealModal();
  }
});


async function loadBMI() {
    try {
        const response = await fetch(`${SERVER_URL}/dashboard?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error("Error:", response.status, await response.text());
            return;
        }
        const data = await response.json();
        renderBodyStats(data);
    } catch (err) {
        console.error("Could not load body stats:", err);
    }
}

function renderBodyStats(data) {
    // Use the server's BMI if present; otherwise calculate it here from height & weight,
    // so the card works even before the backend is rebuilt.
    let bmi = Number(data.bmi);
    if (!(bmi > 0)) {
        const h = Number(data.height) / 100;
        const w = Number(data.weight);
        bmi = (h > 0 && w > 0) ? Math.round((w / (h * h)) * 10) / 10 : 0;
    }
    const hasBmi = Number.isFinite(bmi) && bmi > 0;
    const category = (data.bmi > 0 && data.category) ? data.category : bmiCategoryFor(bmi);

    document.getElementById("height").textContent = data.height ?? "--";
    document.getElementById("weight").textContent = data.weight ?? "--";
    document.getElementById("bmiValue").textContent = hasBmi ? bmi.toFixed(1) : "--";

    const catEl = document.getElementById("bmiCategory");
    catEl.textContent = hasBmi ? category : "Add your height and weight in Profile";
    const colors = { Underweight: "#4A7FA7", Normal: "#2D6A4F", Overweight: "#B7791F", Obese: "#C44545" };
    catEl.style.color = colors[category.split(" ")[0]] || "#6B6459";

    if (hasBmi) movePointer(bmi);
}

function bmiCategoryFor(bmi) {
    if (!(bmi > 0)) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
}

// The bar is split into 4 equal zones (Underweight / Normal / Overweight / Obese),
// so the pointer lands inside the zone that matches the BMI category label.
function movePointer(bmi) {
    const pointer = document.getElementById("bmiPointer");
    let percent;
    if (bmi < 18.5) {
        percent = (Math.max(bmi, 13) - 13) / (18.5 - 13) * 25;
    } else if (bmi < 25) {
        percent = 25 + (bmi - 18.5) / (25 - 18.5) * 25;
    } else if (bmi < 30) {
        percent = 50 + (bmi - 25) / (30 - 25) * 25;
    } else {
        percent = 75 + Math.min((bmi - 30) / 10, 1) * 25;
    }
    // keep the knob inside the bar ends
    percent = Math.max(2, Math.min(percent, 98));
    pointer.style.left = `${percent}%`;
    pointer.style.opacity = "1";
}

async function loadDashboard() {
    const response = await fetch(`http://localhost:8080/dashboard?userId=${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    latestDashboardData = data;

    updateRing(
        "calorieRing",
        "caloriePercent",
        data.caloriePercent
    );
    updateRing(
        "proteinRing",
        "proteinPercent",
        data.proteinPercent
    );
    updateRing(
        "carbsRing",
        "carbsPercent",
        data.carbsPercent
    );
    updateRing(
        "fatRing",
        "fatPercent",
        data.fatPercent
    );
    document.getElementById("calorieTaken").textContent = data.caloriesTaken;
    document.getElementById("calorieGoal").textContent = data.calorieGoal;
    document.getElementById("proteinTaken").textContent = data.proteinTaken + "g";
    document.getElementById("proteinGoal").textContent = data.proteinGoal;
    document.getElementById("carbsTaken").textContent = data.carbsTaken + "g";
    document.getElementById("carbsGoal").textContent = data.carbsGoal;
    document.getElementById("fatTaken").textContent = data.fatTaken + "g";
    document.getElementById("fatGoal").textContent = data.fatGoal;
    document.getElementById("streak").textContent = data.streak;
    document.getElementById("streakd").textContent = data.streak;

    renderSuggestions();
}

function updateRing(ringId, percentId, percent) {

    const circumference = 188.4;

    const offset = circumference - (percent / 100) * circumference;

    document.getElementById(ringId)
        .style.strokeDashoffset = offset;

    document.getElementById(percentId)
        .textContent = percent + "%";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.error("Toast element not found");
        return;
    }
    toast.textContent = message;
    toast.style.background = (type === "error") ? "#B3261E" : "#1B4332";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(-8px)";
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(12px)";
    }, 3000);
}

let userProfile = null;
let latestDashboardData = null;


const SUGGESTION_POOL = [

    {
        id: 'tip-protein-low', type: 'tip', icon: 'protein-low.png',
        text: () => "You're behind on protein today - eggs, paneer, or lentils would help close the gap.",
        condition: (d) => d.proteinPercent < 50
    },
    {
        id: 'tip-protein-good', type: 'tip', icon: 'protein-good.png',
        text: () => "Nice work - you're right on track with protein today.",
        condition: (d) => d.proteinPercent >= 80 && d.proteinPercent <= 110
    },
    {
        id: 'tip-calorie-over', type: 'tip', icon: 'warning.png',
        text: () => "You're above your calorie goal for today - a lighter dinner could help balance things out.",
        condition: (d) => d.caloriePercent > 105
    },
    {
        id: 'tip-calorie-remaining', type: 'tip', icon: 'plate.png',
        text: (d) => `You have about ${Math.max(0, Math.round(d.calorieGoal - d.caloriesTaken))} kcal left today.`,
        condition: (d) => d.caloriePercent < 90
    },
    {
        id: 'tip-carbs-low', type: 'tip', icon: 'carbs-low.png',
        text: () => "Carbs are running low today - whole grains or fruit are an easy way to top up.",
        condition: (d) => d.carbsPercent < 40
    },
    {
        id: 'tip-fat-high', type: 'tip', icon: 'fat-high.png',
        text: () => "Fat intake is already high for today - maybe go easy on oil at your next meal.",
        condition: (d) => d.fatPercent > 110
    },
    {
        id: 'tip-streak', type: 'tip', icon: 'streak.png',
        text: (d) => `You're on a ${d.streak}-day logging streak - log one more meal to keep it alive.`,
        condition: (d) => d.streak > 0
    },
    {
        id: 'tip-water', type: 'tip', icon: 'water.png',
        text: () => "Don't forget to hit your 2.5L water goal today.",
        condition: () => true
    },


    { id: 'meal-1', type: 'meal', icon: 'chicken-salad.png', text: () => 'Grilled chicken salad with olive oil dressing', goals: ['WEIGHT_LOSS', 'MAINTENANCE'], allergens: [] },
    { id: 'meal-2', type: 'meal', icon: 'rice.png', text: () => 'Dal tadka with brown rice', goals: ['WEIGHT_LOSS', 'MAINTENANCE', 'WEIGHT_GAIN'], allergens: [] },
    { id: 'meal-3', type: 'meal', icon: 'omelette.png', text: () => 'Vegetable omelette with whole wheat toast', goals: ['MAINTENANCE', 'WEIGHT_GAIN'], allergens: ['EGGS', 'GLUTEN_WHEAT'] },
    { id: 'meal-4', type: 'meal', icon: 'yogurt.png', text: () => 'Greek yogurt with almonds and honey', goals: ['WEIGHT_GAIN', 'MAINTENANCE'], allergens: ['DAIRY', 'TREE_NUTS'] },
    { id: 'meal-5', type: 'meal', icon: 'paneer-tikka.png', text: () => 'Paneer tikka with mixed vegetables', goals: ['WEIGHT_GAIN', 'MAINTENANCE'], allergens: ['DAIRY'] },
    { id: 'meal-6', type: 'meal', icon: 'grilled-fish.png', text: () => 'Grilled fish with steamed vegetables', goals: ['WEIGHT_LOSS', 'MAINTENANCE'], allergens: ['FISH'] },
    { id: 'meal-7', type: 'meal', icon: 'smoothie.png', text: () => 'Peanut butter banana smoothie', goals: ['WEIGHT_GAIN'], allergens: ['PEANUTS'] },
    { id: 'meal-8', type: 'meal', icon: 'quinoa-bowl.png', text: () => 'Quinoa bowl with roasted vegetables', goals: ['WEIGHT_LOSS', 'MAINTENANCE'], allergens: [] },
    { id: 'meal-9', type: 'meal', icon: 'sandwich.png', text: () => 'Multigrain sandwich with hummus', goals: ['MAINTENANCE', 'WEIGHT_LOSS'], allergens: ['GLUTEN_WHEAT', 'SESAME'] },
    { id: 'meal-10', type: 'meal', icon: 'chickpea-curry.png', text: () => 'Chickpea curry with rice', goals: ['WEIGHT_LOSS', 'MAINTENANCE', 'WEIGHT_GAIN'], allergens: [] },
    { id: 'meal-11', type: 'meal', icon: 'oats.png', text: () => 'Oats with milk, banana, and a spoon of peanut butter', goals: ['WEIGHT_GAIN'], allergens: ['DAIRY', 'PEANUTS', 'GLUTEN_WHEAT'] },
    { id: 'meal-12', type: 'meal', icon: 'shrimp.png', text: () => 'Stir-fried shrimp with vegetables', goals: ['WEIGHT_LOSS', 'MAINTENANCE'], allergens: ['SHELLFISH'] },
];

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRelevantSuggestions(dashboardData, profile) {
    const goal = profile ? profile.goal : null;
    const allergies = (profile && Array.isArray(profile.allergies)) ? profile.allergies : [];

    const tips = SUGGESTION_POOL.filter(s =>
        s.type === 'tip' && (!s.condition || s.condition(dashboardData))
    );

    const meals = SUGGESTION_POOL.filter(s =>
        s.type === 'meal'
        && (!goal || s.goals.includes(goal))
        && !s.allergens.some(a => allergies.includes(a))
    );

    return { tips, meals };
}

function renderSuggestions() {
    if (!latestDashboardData) return;
    const container = document.getElementById('suggestions-container');
    if (!container) return;

    const { tips, meals } = getRelevantSuggestions(latestDashboardData, userProfile);

    const pickedTips = shuffle(tips).slice(0, 1);
    const pickedMeals = shuffle(meals).slice(0, 1);
    const picked = shuffle([...pickedTips, ...pickedMeals]);

    if (picked.length === 0) {
        container.innerHTML = `<p class="text-sm" style="color:var(--ink-soft)">Log a few meals to start getting personalized suggestions.</p>`;
        return;
    }

    container.innerHTML = picked.map(s => `
        <div class="suggestion-card flex items-start gap-3 p-3 rounded-xl" style="background:var(--cream-2)">
            <div class="w-6 h-6 shrink-0 overflow-hidden flex items-center justify-center mt-0.5">
                <img
                    src="${s.icon}"
                    alt="Suggestion icon"
                    class="w-10 h-10 object-contain"
                />
            </div>
            <p class="text-sm" style="color:var(--ink)">
                ${typeof s.text === 'function' ? s.text(latestDashboardData) : s.text}
            </p>
        </div>
    `).join('');
}

async function loadProfileForSuggestions() {
    if (!userId || !token) return;
    try {
        const response = await fetch(`${SERVER_URL}/profile?userId=${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load profile for suggestions");
        userProfile = await response.json();
    } catch (err) {
        console.error(err);
        userProfile = null;
        } finally {
        renderSuggestions();
    }
}

const refreshBtn = document.getElementById('refresh-suggestions');
if (refreshBtn) {
    refreshBtn.addEventListener('click', renderSuggestions);
}

document.addEventListener("DOMContentLoaded", () => {
  const greetingEl = document.getElementById("dynamic-greeting");
  const dateEl = document.getElementById("dynamic-date");

  const now = new Date();
  const hours = now.getHours();
  let greeting = "Good evening !";
  if (hours < 12) {
    greeting = "Good morning !";
  } else if (hours < 17) {
    greeting = "Good afternoon !";
  }

  greetingEl.textContent = greeting;
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  dateEl.textContent = `${formattedDate} · Here's where today stands.`;
});


// ---- Food name autocomplete (searches the food database as you type) ----
// ---- Food name autocomplete ----
document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("am-food-name");
    const list = document.getElementById("am-food-list");

    console.log("Autocomplete init:", input, list);

    if (!input || !list) {
        console.error("Autocomplete elements not found");
        return;
    }

    let timer;

    input.addEventListener("input", () => {

        clearTimeout(timer);

        const q = input.value.trim();

        console.log("Typed:", q);

        if (q.length < 2) {
            list.innerHTML = "";
            return;
        }

        timer = setTimeout(async () => {

            try {

                const url =
                    `${SERVER_URL}/api/food/search?q=${encodeURIComponent(q)}`;

                console.log("Searching:", url);

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Response status:", res.status);

                if (!res.ok) {
                    console.error("Search failed:", await res.text());
                    return;
                }

                const foods = await res.json();

                console.log("Foods received:", foods);

                list.innerHTML = "";

                foods.forEach(f => {

                    const opt = document.createElement("option");

                    opt.value = f.foodName;

                    list.appendChild(opt);
                });

            } catch (e) {

                console.error("Autocomplete error:", e);

            }

        }, 200);
    });
});