const SERVER_URL = "https://nutriscan-production-186b.up.railway.app";
let token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
let currentMealObject = null;

(function(){

  const tiles      = {
    camera:  document.getElementById('tile-camera'),
    gallery: document.getElementById('tile-gallery'),
  };
  const photoCard   = document.getElementById('photo-card');
  const stage        = document.getElementById('stage');
  const stateIdle    = document.getElementById('state-idle');
  const statePreview = document.getElementById('state-preview');
  const stateError   = document.getElementById('state-error');
  const previewImg   = document.getElementById('preview-img');
  const scanningLabel= document.getElementById('scanning-label');
  const primaryAction= document.getElementById('primary-action');
  const idleIcon     = document.getElementById('idle-icon');
  const idleTitle    = document.getElementById('idle-title');
  const idleSubtitle = document.getElementById('idle-subtitle');
  const errorTitle   = document.getElementById('error-title');
  const errorSubtitle= document.getElementById('error-subtitle');
  const retryAction  = document.getElementById('retry-action');
  const manualClose  = document.getElementById('manual-close');
  const manualPanel  = document.getElementById('manual-panel');
  const resultPanel  = document.getElementById('result-panel');
  const fileCamera   = document.getElementById('file-camera');
  const fileGallery  = document.getElementById('file-gallery');
  const notRight     = document.getElementById('not-right');
  const manualLink      = document.getElementById('manual-link');
  const manualLinkError = document.getElementById('manual-action-error');

  let currentMode = 'camera';

  const modeCopy = {
      camera:{
          icon:'/camera.png',
          title:'Center your plate in frame',
          subtitle:'Good lighting helps NutriScan tell ingredients apart.',
          button:'Open camera',
          scanning:'Identifying ingredients…'
      },
      gallery:{
          icon:'/food.png',
          title:'Choose a photo of your meal',
          subtitle:'Pick a clear, well-lit shot for the best match.',
          button:'Choose from gallery',
          scanning:'Identifying ingredients…'
      }
  };

   function setPhotoMode(mode){
    currentMode = mode;
    const c = modeCopy[mode];
    idleIcon.textContent     = c.icon;
    idleTitle.textContent    = c.title;
    idleSubtitle.textContent = c.subtitle;
    primaryAction.textContent= c.button;
    showIdle();
  }

  function showIdle(){
    stage.classList.remove('has-error','has-preview');
    stateIdle.classList.remove('hidden');
    statePreview.classList.add('hidden');
    stateError.classList.add('hidden');
    resultPanel.classList.add('hidden');
  }

  function showPreviewScanning(imgSrc){
    stage.classList.add('has-preview');
    stage.classList.remove('has-error');
    stateIdle.classList.add('hidden');
    stateError.classList.add('hidden');
    statePreview.classList.remove('hidden');
    previewImg.src = imgSrc || '';
    scanningLabel.textContent = modeCopy[currentMode].scanning;
  }

  function showPhotoError(title, subtitle){
    stage.classList.add('has-error');
    stage.classList.remove('has-preview');
    stateIdle.classList.add('hidden');
    statePreview.classList.add('hidden');
    stateError.classList.remove('hidden');
    errorTitle.textContent   = title;
    errorSubtitle.textContent= subtitle;
  }

  function runScan(imgSrc, opts){
    opts = opts || {};
    showPreviewScanning(imgSrc);
    const delay = 1700 + Math.random() * 500;
    setTimeout(() => {
      if(opts.forceFail){ showPhotoError('Couldn\'t read that photo','The image was too blurry to identify ingredients with confidence.'); return; }
      resultPanel.classList.remove('hidden');
      resultPanel.scrollIntoView({ behavior:'smooth', block:'nearest' });
      stage.classList.remove('has-preview','has-error');
    }, delay);
  }

  async function handleFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        showPreviewScanning(e.target.result);
        const formData = new FormData();
        formData.append("image", file);
        try{
            const response = await fetch(`${SERVER_URL}/api/food/identify`,{
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${token}`
                },
                body:formData
            });
            const data = await response.json();

            document.getElementById("state-preview").classList.add("hidden");
            stage.classList.remove('has-preview','has-error');

            if(data.type === "BARCODE"){
                showFoodResult(data.product);
                currentMealObject = data.product;
            }
            else if(data.type === "FOOD"){
                showFoodResult(data.food);
                currentMealObject = data.food;
            }
            else{
                showPhotoError("Couldn't identify", data.message);
            }
        }
        catch(error){
            console.error(error);
            stage.classList.remove('has-preview');
            showPhotoError(
                "Couldn't identify image",
                "Please try another image."
            );
        }
    };
    reader.onerror = () => {
        stage.classList.remove('has-preview');
        showPhotoError(
            "Couldn't open image",
            "Unsupported image format."
        );
    };

    reader.readAsDataURL(file);
  }

  function showFoodResult(data){

      document.getElementById("food-title").textContent =
          data.foodName ?? data.productName;

      document.getElementById("food-serving").textContent =
          data.servingUnit ?? data.brand ?? "1 serving";

      document.getElementById("food-calories").textContent =
          (data.calories ?? 0) + " kcal";

      document.getElementById("food-protein").textContent =
          (data.protein ?? 0) + " g";

      document.getElementById("food-carbs").textContent =
          (data.carbs ?? 0) + " g";

      document.getElementById("food-fat").textContent =
          (data.fat ?? 0) + " g";

      resultPanel.classList.remove("hidden");

      resultPanel.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
      });
  }

  function activateTile(mode){

      Object.entries(tiles).forEach(([k,el])=>{
          el.classList.toggle("active",k===mode);
          el.setAttribute("aria-selected",k===mode);
      });

      currentMode=mode;

      manualPanel.classList.add("hidden");
      resultPanel.classList.add("hidden");

      setPhotoMode(mode);
  }

  tiles.camera.addEventListener('click',  () => activateTile('camera'));
  tiles.gallery.addEventListener('click', () => activateTile('gallery'));

  primaryAction.addEventListener('click', () => {
    if(currentMode === 'gallery') fileGallery.click();
    else                          fileCamera.click();
  });
  fileCamera.addEventListener('change',  (e) => handleFile(e.target.files[0]));
  fileGallery.addEventListener('change', (e) => handleFile(e.target.files[0]));
  retryAction.addEventListener('click',  () => showIdle());

  function goToManualEntry(){
      sessionStorage.setItem('openAddMeal', '1');
      window.location.href = 'Dashboard.html';
  }
  if (manualLink)      manualLink.addEventListener('click', goToManualEntry);
  if (manualLinkError) manualLinkError.addEventListener('click', goToManualEntry);

  function suggestOtherMethod(){
      const otherMode = currentMode === 'camera' ? 'gallery' : 'camera';
      activateTile(otherMode);
      idleSubtitle.textContent = otherMode === 'gallery'
          ? 'Try uploading a clearer photo instead for a better match.'
          : 'Try taking a fresh photo instead for a better match.';
  }
  notRight.addEventListener('click', suggestOtherMethod);

  manualClose.addEventListener('click', () => manualPanel.classList.add('hidden'));
  window.resetScanStage = showIdle;
})();


let selectedMeal = "BREAKFAST";
const overlay = document.getElementById("add-meal-overlay");
const saveBtn = document.getElementById("am-save-btn");

function closeAddMealModal() {
    overlay.style.display = "none";
}

function amCheckValid(){
    const btn = document.getElementById('am-save-btn');
    const val = document.getElementById('am-food-name').value.trim();
    btn.disabled = val.length === 0;
}

function amSelectTab(tab) {

    document.querySelectorAll(".am-tab").forEach(function(t){
        t.classList.remove("am-tab-active");
        t.setAttribute("aria-selected","false");
    });

    tab.classList.add("am-tab-active");
    tab.setAttribute("aria-selected","true");

    selectedMeal = tab.dataset.meal;
}


function getPortion(quantityText){
    const qty = parseFloat(quantityText);
    if(isNaN(qty))
        return "MEDIUM";
    if(qty < 250)
        return "SMALL";
    if(qty < 500)
        return "MEDIUM";
    return "LARGE";
}

function amShowToast(msg){
    const toast = document.getElementById("am-toast") || document.getElementById("toast");
    if (!toast) {
        console.warn("Toast element not found:", msg);
        return;
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    setTimeout(function(){
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(12px)";
    },2600);
}


overlay.addEventListener("click",function(e){
    if(e.target===overlay){
        closeAddMealModal();
    }
});

document.addEventListener("keydown",function(e){
    if(e.key==="Escape" && overlay.style.display==="flex"){
        closeAddMealModal();
    }
});

function openAddMealModal(product) {
    const nameInput = document.getElementById("am-food-name");
    if (currentMealObject) {
        nameInput.value = currentMealObject.foodName ?? currentMealObject.productName ?? "";
        nameInput.readOnly = true;
        nameInput.classList.add("am-input-locked");
    } else {
        nameInput.value = "";
        nameInput.readOnly = false;
        nameInput.classList.remove("am-input-locked");
    }
    document.getElementById("am-portion").value = "MEDIUM";
    overlay.style.display = "flex";
    amCheckValid();
}

async function amSaveMeal(){

    const payload = {
        foodName: document.getElementById("am-food-name").value,
        mealType: selectedMeal,
        portionSize: document.getElementById("am-portion").value
    };


    if(currentMealObject && currentMealObject.productName){
        payload.calories = currentMealObject.calories;
        payload.protein = currentMealObject.protein;
        payload.carbs = currentMealObject.carbs;
        payload.fat = currentMealObject.fat;
    }

    try{

        const response = await fetch(
            `${SERVER_URL}/addMeal?userId=${userId}`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                     "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify(payload)
            }
        );

        if(!response.ok)
            throw new Error();

        amShowToast("Meal added successfully");

        closeAddMealModal();

        const resultPanel = document.getElementById('result-panel');
        if (resultPanel) resultPanel.classList.add('hidden');
        if (window.resetScanStage) window.resetScanStage();

    }catch(e){
        amShowToast("Failed to save meal");
    }
}



