const surahSelect = document.getElementById("surah-select");
const ayahSelect = document.getElementById("ayah-select");
const ayahDisplay = document.getElementById("ayah-display");
const nextAyahBtn = document.getElementById("next-ayah-btn");

let quranData = {};
let currentAyahIndex = 0;

// 🔹 Fetch Quran Data from API
async function fetchQuranData() {
    const response = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani"); 
    const data = await response.json();

    // 🔹 Process Surahs into an Object
    data.data.surahs.forEach(surah => {
        quranData[surah.number] = {
            name: surah.englishName,
            ayahs: surah.ayahs.map(ayah => ayah.text), // Store only Ayah text
            totalAyahs: surah.ayahs.length
        };
    });

    populateSurahDropdown();
}

// 🔹 Populate Surah Dropdown
function populateSurahDropdown() {
    Object.keys(quranData).forEach(key => {
        let option = document.createElement("option");
        option.value = key;
        option.textContent = `${key}. ${quranData[key].name}`;
        surahSelect.appendChild(option);
    });
}

// 🔹 Populate Ayah Ranges
function populateAyahRanges(surahKey) {
    ayahSelect.innerHTML = `<option value="" disabled selected>Select Ayah Range</option>`;
    let totalAyahs = quranData[surahKey].totalAyahs;
    
    for (let i = 0; i < totalAyahs; i += 5) {
        let range = `${i + 1}-${Math.min(i + 5, totalAyahs)}`;
        let option = document.createElement("option");
        option.value = i; // Store starting index
        option.textContent = range;
        ayahSelect.appendChild(option);
    }
}

// 🔹 Update Ayah Display
function updateAyahDisplay() {
    let surahKey = surahSelect.value;
    let ayahs = quranData[surahKey].ayahs;
    let endAyah = Math.min(currentAyahIndex + 5, ayahs.length);
    
    ayahDisplay.innerHTML = `<strong>Surah ${quranData[surahKey].name}</strong><br>`;
    for (let i = currentAyahIndex; i < endAyah; i++) {
        ayahDisplay.innerHTML += `<p>${i + 1}. ${ayahs[i]}</p>`;
    }
}

// 🔹 Event Listeners
surahSelect.addEventListener("change", function() {
    let surahKey = this.value;
    if (surahKey) {
        populateAyahRanges(surahKey);
    }
});

ayahSelect.addEventListener("change", function() {
    currentAyahIndex = parseInt(this.value);
    updateAyahDisplay();
});

// 🔹 Next Ayah Button
nextAyahBtn.addEventListener("click", function() {
    let surahKey = surahSelect.value;
    let totalAyahs = quranData[surahKey].ayahs.length;

    if (currentAyahIndex + 5 >= totalAyahs) {
        alert("Reached end of the Surah!");
        return;
    }

    currentAyahIndex += 5;
    updateAyahDisplay();
});

// 🔹 Load Quran Data on Page Load
fetchQuranData();
