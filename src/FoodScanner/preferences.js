const SERVER_URL = "https://nutriscan-production-186b.up.railway.app"
let token = localStorage.getItem("token")
 const userId = localStorage.getItem("userId");

(function(){
  const form         = document.getElementById('profile-form');
  const step1        = document.getElementById('step-1');
  const step2        = document.getElementById('step-2');
  const toStep2      = document.getElementById('to-step-2');
  const backToStep1 = document.getElementById('back-to-step-1');
  const progressFill= document.getElementById('progress-fill');
  const stepLabel   = document.getElementById('step-label');
  const stepHint    = document.getElementById('step-hint');
  const heroTitle   = document.getElementById('hero-title');
  const heroSubtitle= document.getElementById('hero-subtitle');
  const fullname    = document.getElementById('fullname');
  const age         = document.getElementById('age');
  const height      = document.getElementById('height');
  const weight      = document.getElementById('weight');
  const genderGroup = document.getElementById('gender-group');
  const termsBox    = document.getElementById('terms');
  const finishBtn   = document.getElementById('finish-btn');
  const modal       = document.getElementById('terms-modal');
  const openTerms   = document.getElementById('open-terms');
  const closeModal  = document.getElementById('close-modal');
  const acceptTerms = document.getElementById('accept-terms');

  // ---- Numeric field guarding (age / height / weight) ----
  // Each entry: { el, min, max, errorEl }
  const numericFields = [
    { el: age,    min: 10, max: 100, errorEl: document.getElementById('age-error') },
    { el: height, min: 50, max: 250, errorEl: document.getElementById('height-error') },
    { el: weight, min: 10, max: 400, errorEl: document.getElementById('weight-error') },
  ];

  // Block characters that would let someone type a negative, decimal-exponent,
  // or otherwise invalid number: "-", "+", "e"/"E", "."
  const blockedKeys = ['-', '+', 'e', 'E', '.'];
  numericFields.forEach(({ el }) => {
    el.addEventListener('keydown', (e) => {
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
      }
    });

    // Belt-and-suspenders: strip out anything non-numeric that slips through
    // (e.g. pasted text like "-25" or "1e5"), and clamp to the field's range.
    el.addEventListener('input', () => {
      let raw = el.value;
      let cleaned = raw.replace(/[^0-9]/g, '');
      if (cleaned !== raw) {
        el.value = cleaned;
      }
    });

    // On blur, clamp into range so a stray out-of-range value can't be submitted.
    el.addEventListener('blur', () => {
      if (el.value === '') return;
      const num = Number(el.value);
      const field = numericFields.find(f => f.el === el);
      if (Number.isNaN(num)) {
        el.value = '';
        return;
      }
      if (num < field.min) el.value = String(field.min);
      if (num > field.max) el.value = String(field.max);
    });
  });

  function fieldIsValid({ el, min, max }) {
    if (el.value.trim() === '') return false;
    const num = Number(el.value);
    if (Number.isNaN(num)) return false;
    return num >= min && num <= max;
  }

  function showFieldError(field, show) {
    field.el.style.borderColor = show ? 'var(--apricot-deep)' : 'var(--line)';
    if (field.errorEl) field.errorEl.classList.toggle('hidden', !show);
  }

  genderGroup.querySelectorAll('.seg-option').forEach(opt => {
    opt.addEventListener('click', () => {
      genderGroup.querySelectorAll('.seg-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input').checked = true;
    });
  });

    const chips = Array.from(document.querySelectorAll('.chip'));
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const input = chip.querySelector('input');
      input.checked = !input.checked;
      chip.classList.toggle('selected', input.checked);

      const isNone = input.value === 'NONE';
      if (isNone && input.checked) {
        chips.forEach(c => {
          if (c !== chip) {
            c.classList.remove('selected');
            c.querySelector('input').checked = false;
          }
        });
      } else if (!isNone && input.checked) {
        const noneChip = chips.find(c => c.querySelector('input').value.toUpperCase() === 'NONE'); 
        if (noneChip) {
          noneChip.classList.remove('selected');
          noneChip.querySelector('input').checked = false;
        }
      }
    });
  });


  function validateStep1(){
    const namedOk = fullname.value.trim().length > 0;
    const numbersOk = numericFields.every(fieldIsValid);
    const genderOk = !!document.querySelector('input[name="gender"]:checked');
    return namedOk && numbersOk && genderOk;
  }

  toStep2.addEventListener('click', () => {
    if (!validateStep1()){
      if (!fullname.value.trim()) fullname.style.borderColor = 'var(--apricot-deep)';
      numericFields.forEach(field => {
        showFieldError(field, !fieldIsValid(field));
      });
      if (!document.querySelector('input[name="gender"]:checked')){
        genderGroup.querySelectorAll('.seg-option').forEach(o => o.style.borderColor = 'var(--apricot-deep)');
      }
      return;
    }

    const firstName = fullname.value.trim().split(' ')[0];
    step1.classList.remove('active');
    step2.classList.add('active');
    progressFill.style.width = '100%';
    stepLabel.textContent = 'Step 2 of 2';
    stepHint.textContent = 'Goals & allergies';
    heroTitle.textContent = `Nice to meet you, ${firstName}!`;
    heroSubtitle.textContent = 'Last step — tell us your goal and anything we should watch out for.';
  });

  backToStep1.addEventListener('click', () => {
    step2.classList.remove('active');
    step1.classList.add('active');
    progressFill.style.width = '50%';
    stepLabel.textContent = 'Step 1 of 2';
    stepHint.textContent = 'About you';
    heroTitle.textContent = "Let's set up your profile";
    heroSubtitle.textContent = 'A few details help NutriScan personalize your targets.';
  });

  fullname.addEventListener('input', () => { fullname.style.borderColor = 'var(--line)'; });
  numericFields.forEach(field => {
    field.el.addEventListener('input', () => { showFieldError(field, false); });
  });

  genderGroup.querySelectorAll('.seg-option').forEach(opt => {
    opt.addEventListener('click', () => {
      genderGroup.querySelectorAll('.seg-option').forEach(o => o.style.borderColor = 'var(--line)');
    });
  });

  termsBox.addEventListener('change', () => {
    finishBtn.disabled = !termsBox.checked;
  });

  function openModal(){ modal.classList.add('open'); }
  function closeModalFn(){ modal.classList.remove('open'); }

  openTerms.addEventListener('click', openModal);
  closeModal.addEventListener('click', closeModalFn);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFn(); });
  acceptTerms.addEventListener('click', () => {
    termsBox.checked = true;
    finishBtn.disabled = false;
    closeModalFn();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      // Shouldn't normally happen since step 1 is gated, but guard anyway.
      step2.classList.remove('active');
      step1.classList.add('active');
      numericFields.forEach(field => showFieldError(field, !fieldIsValid(field)));
      return;
    }
    if (!termsBox.checked) return;
    preferences();
  });
})();

function preferences() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Session expired. Please log in again.");
        window.location.href = "index.html";
        return;
    }

    const name = document.getElementById("fullname").value;
    const age = Number(document.getElementById("age").value);
    const height = Number(document.getElementById("height").value);
    const weight = Number(document.getElementById("weight").value);
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const goalEl = document.querySelector('input[name="goal"]:checked');
    const gender = genderEl ? genderEl.value : "";
    const goal = goalEl ? goalEl.value : "";
    const allergies = Array.from(document.querySelectorAll('.chip input:checked'))
    .map(el => el.value);

    const payload = { name, age, height, weight, gender, goal, allergies };

    fetch(`${SERVER_URL}/preferences?userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(async response => {
        const text = await response.text();
        console.log("Status:", response.status, "Body:", text);
        if (!response.ok) {
            throw new Error(`Failed to save preferences (status ${response.status}): ${text}`);
        }
        return text ? JSON.parse(text) : {};
    })
    .then(data => {
        alert("Preferences Saved Successfully!");
        window.location.href = "Dashboard.html";
    })
    .catch(error => {
        console.error("Error saving data:", error);
        alert(error.message);
    });
}
let toastTimer;
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    clearTimeout(toastTimer);
    toast.className = "";
    toast.classList.add(type);
    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ"
    };
    toast.innerHTML = `
        <span style="font-size:16px">${icons[type]}</span>
        <span>${message}</span>
    `;
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}