const SERVER_URL = "https://nutriscan-production-186b.up.railway.app";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

function confirmDelete() {
    document.getElementById('delete-modal').style.display = 'flex';
}


function showToast(msg, type = "success") {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('error');
    if (type === "error") t.classList.add('error');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

function formatText(value) {
    if (!value) return "";
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

function markAllergies(allergies) {
    document.querySelectorAll('input[name="allergy"]').forEach(cb => cb.checked = false);
    (allergies || []).forEach(allergy => {
        const checkbox = document.querySelector(`input[name="allergy"][value="${allergy}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function getSelectedAllergies() {
    return Array.from(document.querySelectorAll('input[name="allergy"]:checked'))
        .map(cb => cb.value);
}

function getpreferences() {
    if (!userId || !token) {
        showToast("Please log in first.", "error");
        window.location.href = "index.html";
        return;
    }

    fetch(`${SERVER_URL}/profile?userId=${userId}`, {
        cache: "no-store",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load profile.");
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("f-age").value = data.age;
            document.getElementById("f-gender").value = data.gender;
            document.getElementById("f-height").value = data.height;
            document.getElementById("f-weight").value = data.weight;
            document.getElementById("f-goal").value = data.goal;
            document.getElementById("f-firstname").value = data.name;
            document.getElementById("f-email").value = data.username;
            document.getElementById("display-name").textContent = data.name;
            document.getElementById("display-email").textContent = data.username;
            document.getElementById("streak").textContent = data.streak;
            document.getElementById("member-since").textContent =
                `Member since ${data.memberSince}`;
            console.log("allergies from server:", data.allergies);
            markAllergies(data.allergies);
        })
        .catch(error => {
            console.error(error);
            showToast(error.message, "error");
        });
}

window.onload = function () {
    getpreferences();
};

let editMode = false;
const editBtn = document.getElementById("save-all-btn");
editBtn.addEventListener("click", () => {
    if (!editMode) {
        enableEditing();
    } else {
        saveProfile();
    }
});

function enableEditing() {
    editMode = true;
    editBtn.textContent = "Save Profile";
    document.getElementById("f-firstname").disabled = false;
    document.getElementById("f-age").disabled = false;
    document.getElementById("f-height").disabled = false;
    document.getElementById("f-weight").disabled = false;
    document.getElementById("f-gender").disabled = false;
    document.getElementById("f-goal").disabled = false;
    document.querySelectorAll('input[name="allergy"]')
        .forEach(cb => cb.disabled = false);
}

function disableEditing() {
    document.querySelectorAll(".field-input").forEach(input => {
        input.disabled = true;
    });
    document.querySelectorAll('input[name="allergy"]')
        .forEach(cb => cb.disabled = true);
}

function saveProfile() {
    if (!userId || !token) {
        showToast("Please log in first.", "error");
        return;
    }

    const payload = {
        name: document.getElementById("f-firstname").value,
        age: Number(document.getElementById("f-age").value),
        gender: document.getElementById("f-gender").value,
        height: Number(document.getElementById("f-height").value),
        weight: Number(document.getElementById("f-weight").value),
        goal: document.getElementById("f-goal").value,
        allergies: getSelectedAllergies()
    };

    editBtn.disabled = true;

    fetch(`${SERVER_URL}/updatePreferences?userId=${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                showToast("Failed to update profile", "error");
            }
            return response.json();
        })
        .then(() => {
            showToast("Profile updated.");
            disableEditing();
            editMode = false;
            editBtn.textContent = "Edit Profile";
            getpreferences();
            disableEditing();
        })
        .catch(error => {
            console.error(error);
            showToast(error.message, "error");
        })
        .finally(() => {
            editBtn.disabled = false;
        });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "index.html";
}
document.getElementById("logout-btn").addEventListener("click", logout);

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
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}