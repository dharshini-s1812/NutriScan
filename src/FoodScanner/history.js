const SERVER_URL = "https://nutriscan-production-186b.up.railway.app"
let token = localStorage.getItem("token")
const userId = localStorage.getItem("userId");

window.onload = function () {
    historyFilter();
};

const buttons = document.querySelectorAll(".filter-btn");
let selectedType = "ALL";

buttons.forEach(button => {
    button.addEventListener("click", () => {

        buttons.forEach(btn => {
            btn.classList.remove("bg-[var(--forest)]", "text-white");
            btn.classList.add("text-[var(--ink-soft)]");
        });

        button.classList.remove("text-[var(--ink-soft)]");
        button.classList.add("bg-[var(--forest)]", "text-white");

        selectedType = button.dataset.type;
        historyFilter();
    });
});

document.getElementById("selected-date").addEventListener("change", historyFilter);

function historyFilter() {

    const seldate = document.getElementById('selected-date').value;

    if (!userId) {
        showToast("Session expired. Please login again.", "warning");
        setTimeout(() => { window.location.href = "index.html"; }, 1200);
        window.location.href = "index.html";
        return;
    }

    let url = `${SERVER_URL}/meals/history?userId=${userId}&date=${seldate}`;

    if (selectedType !== "ALL") {
        url += `&type=${selectedType}`;
    }

    fetch(`${url}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            displayMeals(data);
        })
        .catch(error => {
            console.error("Error", error);
            showToast(error.message, "error");
        });

}

function displayMeals(data) {

    const container = document.getElementById("meal-container");

    container.innerHTML = "";

    data.forEach(data => {

        container.innerHTML += `
            <div class="meal-history-row flex-col sm:flex-row gap-4 items-start sm:items-center">

                <div class="flex items-center gap-3.5 w-full sm:w-auto">

                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style="background:var(--cream-2)">
                        <img src="plate.png" class="w-10 h-10"/>
                    </div>

                    <div>
                        <h4 class="font-semibold text-base">
                            ${data.foodName}
                        </h4>

                        <div class="flex items-center gap-2 mt-1 flex-wrap">

                            <span class="tag tag-${data.mealType.toLowerCase()}">
                                ${data.mealType}
                            </span>

                            <span class="text-xs text-[var(--ink-soft)]">
                                ${new Date(data.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })}
                            </span>

                        </div>

                    </div>

                </div>

                <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto sm:ml-auto">

                    <div class="sm:text-right">

                        <span class="font-display font-bold text-lg block">
                            ${data.calories} kcal
                        </span>

                        <span class="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-soft)]">
                            P: ${data.protein}g |
                            C: ${data.carbs}g |
                            F: ${data.fat}g
                        </span>

                    </div>
                    <button onclick="openDeleteModal(${data.mealId})" class="p-2 rounded-lg text-[var(--ink-soft)] hover:text-red-600 hover:bg-red-50">
                    X </button>
                      

                </div>

            </div>
        `;
    });
}


let mealToDelete = null;

function openDeleteModal(mealId) {
    mealToDelete = mealId;
    document.getElementById("deleteModal").classList.remove("hidden");
}
function closeDeleteModal() {
    mealToDelete = null;
    document.getElementById("deleteModal").classList.add("hidden");
}
document.getElementById("confirmDeleteBtn").onclick = () => {
    if (!mealToDelete) return;
    deleteMeal(mealToDelete);
    closeDeleteModal();
};

function deleteMeal(mealId) {

    fetch(`${SERVER_URL}/deleteMeal/${mealId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(async response => {
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Unable to delete meal.");
            }
            showToast("Meal deleted successfully.", "delete");
            historyFilter();

        })
        .catch(error => {
            if (error.message.includes("Failed to fetch")) {
                showToast("Unable to connect to the server.", "error");
            } else {
                showToast(error.message, "error");
            }
            console.error(error);
        });
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
window.onload = () => {

    const today = new Date().toISOString().split("T")[0];

    document.getElementById("selected-date").value = today;

    historyFilter();
};