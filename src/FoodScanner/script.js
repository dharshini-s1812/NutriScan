const SERVER_URL = "https://nutriscan-production-186b.up.railway.app"

async function login() {

    clearMessage();

    const username = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (!username || !password) {
        showMessage("Please enter both email and password.");
        return;
    }
    try {
        const response = await fetch(`${SERVER_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Invalid email or password.");
        }
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        showMessage("Login successful!", "success");
        setTimeout(() => {
            if (data.hasPreferences) {
                window.location.href = "Dashboard.html";
            } else {
                window.location.href = "userPreference.html";
            }
        }, 600);
    } catch (err) {
        if (err.message.includes("Failed to fetch")) {
            showMessage("Unable to connect to the server. Please try again later.");
        } else {
            showMessage(err.message);
        }
        console.error(err);
    }
}

function showMessage(message, type = "error") {
    const box = document.getElementById("loginMessage");
    box.textContent = message;
    box.style.background = type === "success" ? "#1B4332" : "#B3261E";
    box.style.opacity = "1";
    box.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
        box.style.opacity = "0";
        box.style.transform = "translateX(-50%) translateY(12px)";
    }, 3000);
}

function clearMessage() {
    const box = document.getElementById("loginMessage");
    box.style.opacity = "0";
    box.style.transform = "translateX(-50%) translateY(12px)";
}

function register() {

    clearRegisterMessage();

    const username = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    if (!username || !password) {
        showRegisterMessage("Please enter both email and password.");
        return;
    }

    if (password.length < 8) {
        showRegisterMessage("Password must be at least 8 characters.");
        return;
    }

    const registerBtn = document.getElementById("register-btn");
    registerBtn.disabled = true;

    fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (response.ok) {
                showRegisterMessage("Registration successful!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 600);
            } else {
                return response.text().then(msg => {
                    throw new Error(msg || "Registration failed.");
                });
            }
        })
        .catch(error => {
            showRegisterMessage(error.message);
        })
        .finally(() => {
            registerBtn.disabled = false;
        });
}

function showRegisterMessage(message, type = "error") {
    const box = document.getElementById("registerMessage");
    box.textContent = message;
    box.style.background = type === "success" ? "#1B4332" : "#B3261E";
    box.style.opacity = "1";
    box.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(() => {
        box.style.opacity = "0";
        box.style.transform = "translateX(-50%) translateY(12px)";
    }, 3000);
}

function clearRegisterMessage() {
    const box = document.getElementById("registerMessage");
    box.style.opacity = "0";
    box.style.transform = "translateX(-50%) translateY(12px)";
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        register();
    });
}


