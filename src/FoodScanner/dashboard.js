const SERVER_URL = "https://nutriscan-production-186b.up.railway.app"
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
    GetUserMeal();
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

    const response = await fetch(`https://nutriscan-production-186b.up.railway.app/dashboard?userId=${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        console.error("Error:", response.status, await response.text());
        return;
    }
    const data = await response.json();
    document.getElementById("bmiValue").textContent = data.bmi;
    document.getElementById("bmiCategory").textContent = data.category;
    document.getElementById("height").textContent = data.height;
    document.getElementById("weight").textContent = data.weight;
    movePointer(data.bmi);
}

function movePointer(bmi) {

    const pointer = document.getElementById("bmiPointer");
    let percent;
    if (bmi <= 15)
        percent = 0;
    else if (bmi >= 40)
        percent = 100;
    else
        percent = ((bmi - 15) / (40 - 15)) * 100;
    percent = Math.max(0, Math.min(percent, 100));
    pointer.style.left = `${percent}%`;
}

async function loadDashboard() {
    const response = await fetch(`https://nutriscan-production-186b.up.railway.app/dashboard?userId=${userId}`, {
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