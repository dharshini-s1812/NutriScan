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
        const noneChip = chips.find(c => c.querySelector('input').value.toUpperCase === 'NONE');
        noneChip.classList.remove('selected');
        noneChip.querySelector('input').checked = false;
      }
    });
  });

  function validateStep1(){
    return fullname.value.trim().length > 0 &&
           age.value && height.value && weight.value &&
           document.querySelector('input[name="gender"]:checked');
  }

  toStep2.addEventListener('click', () => {
    if (!validateStep1()){
      [fullname, age, height, weight].forEach(el => {
        if (!el.value.trim()) el.style.borderColor = 'var(--apricot-deep)';
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

  [fullname, age, height, weight].forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = 'var(--line)'; });
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
    if (!termsBox.checked) return;
    preferences();
  });
})();

function preferences() {
    const name = document.getElementById("fullname").value;
    const age = Number(document.getElementById("age").value);
    const height = Number(document.getElementById("height").value);
    const weight = Number(document.getElementById("weight").value);
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const goalEl = document.querySelector('input[name="goal"]:checked');
    const gender = genderEl ? genderEl.value : "";
    const goal = goalEl ? goalEl.value : "";
    const allergyEl = document.querySelector('.chip input:checked');
    const allergies = allergyEl ? allergyEl.value : "None";
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Session expired. Please log in again.");
        window.location.href = "index.html";
        return;
    }
    const payload = { name, age, height, weight, gender, goal, allergies };
    fetch(`${SERVER_URL}/preferences?userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to save profile preferences.");
        }
        return response.json();
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