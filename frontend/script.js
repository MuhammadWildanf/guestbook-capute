let isSubmitting = false;

document.getElementById("next").addEventListener("click", async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  const btnNext = document.getElementById("next");
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!name || !comment) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Isi semua kolom terlebih dahulu!",
    });
    return;
  }

  let badwords = [];
  try {
    const res = await fetch("/badwords");
    badwords = await res.json();
    console.log("Badwords:", badwords);
  } catch (error) {
    console.error("Gagal memuat data.json", error);
  }

  function normalizeRepeatedChars(text) {
    return text
      .toLowerCase()
      .replace(/(.)\1+/g, "$1$1") // huruf berulang 2x+
      .replace(/[@4]/g, "a")
      .replace(/[$5]/g, "s")
      .replace(/[!1]/g, "i")
      .replace(/[0]/g, "o")
      .replace(/[3]/g, "e")
      .replace(/[7]/g, "t")
      .replace(/[9]/g, "g")
      .replace(/[^a-z0-9\s]/g, "") // hapus simbol lain
      .replace(/\s+/g, ""); // hapus semua spasi
  }

  let allText = `${name} ${comment}`.toLowerCase();
  allText = normalizeRepeatedChars(allText);

  // Cek apakah ada kata yang terlarang
  /*  const foundBadword = badwords.some((word) => allText.includes(word));
   if (foundBadword) {
     Swal.fire({
       icon: "warning",
       title: "Perhatian",
       text: "Input Anda mengandung kata yang tidak sesuai kebijakan. Mohon ubah sebelum melanjutkan.",
     });
     return;
   } */

  isSubmitting = true;
  btnNext.disabled = true;
  btnNext.textContent = "Memproses...";

  document.getElementById("p2").style.display = "block";
  document.getElementById("p1").style.display = "none";

  Swal.fire({
    html: `
    <div style="
      background-color: #ffff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        background-color: #1c8263;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      ">
        <i class="fa-solid fa-check" style="color: #fff; font-size: 14px;"></i>
      </div>
      <div style="font-size: 1.5rem; font-weight: bold;">
        Berhasil
      </div>
    </div>
  `,
    showConfirmButton: false,
    background: "transparent",
    timer: 1500,
    customClass: {
      popup: "no-border-shadow",
    },
  });

  try {
    await submit(name, char, comment);
  } finally {
    // Setelah selesai, bisa diaktifkan lagi kalau mau
    isSubmitting = false;
    btnNext.disabled = false;
    btnNext.textContent = "MASUK";
  }
});

async function submit(name, char, comment) {
  try {
    const response = await fetch("https://green-summit.vercel.app/submit-form", {
      // const response = await fetch("http://localhost:3002/submit-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, char, comment }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${errorMessage}`
      );
    }

    const responseData = await response.json();
    console.log("Response Data:", responseData);

    showThankYouScreen({ name, char });
  } catch (error) {
    console.error("Error submitting data:", error.message || error);
  }
}

function showThankYouScreen(data) {
  const { name, char } = data;

  // Tampilkan gambar karakter
  const imageUrl = `/char/${char}.png`;
  const charImg = document.createElement('img');
  charImg.src = imageUrl;
  charImg.alt = char;
  charImg.style.width = "400px";
  charImg.style.display = "block";
  charImg.style.margin = "0 auto 20px";

  const charContainer = document.getElementById("char-container");
  charContainer.innerHTML = "";
  charContainer.appendChild(charImg);

  // Set nama user di tengah
  const userName = document.getElementById("user-name");
  userName.textContent = name;

  // Tampilkan layar
  const p2 = document.getElementById("p2");
  p2.style.display = "flex";
  p2.style.flexDirection = "column";
  p2.style.alignItems = "center";
}

// const svg = document.getElementById("wave-container");
// let width = window.innerWidth;
// let height = window.innerHeight;
// const numberOfLines = 120; // Jumlah garis
// const waveAmplitude = 20; // Amplitudo gelombang
// const waveLength = 120; // Panjang gelombang
// const speed = 0.01; // Kecepatan animasi
// let time = 0;

// // Fungsi untuk memperbarui ukuran SVG
// function resize() {
//   width = window.innerWidth;
//   height = window.innerHeight;
//   svg.setAttribute("width", width);
//   svg.setAttribute("height", height);
//   svg.innerHTML = ""; // Hapus garis lama agar tidak ada bug saat ukuran berubah
//   createWaves(); // Buat ulang garis
// }

// // Membuat garis gelombang
// function createWaveLine(yOffset) {
//   const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
//   path.setAttribute("stroke", "black");
//   path.setAttribute("stroke-width", "1");
//   path.setAttribute("fill", "none");
//   svg.appendChild(path);
//   return { path, yOffset };
// }

// let waves = [];
// function createWaves() {
//   waves = Array.from({ length: numberOfLines }, (_, i) =>
//     createWaveLine(i * 30)
//   );
// }

// // Animasi gelombang
// function animateWave() {
//   time += speed;
//   waves.forEach((wave, index) => {
//     const points = [];
//     for (let x = 0; x <= width; x += 20) {
//       const y =
//         wave.yOffset + Math.sin(x / waveLength + time + index) * waveAmplitude;
//       points.push(`${x},${y}`);
//     }
//     wave.path.setAttribute("d", `M${points.join(" L")}`);
//   });
//   requestAnimationFrame(animateWave);
// }

// // Inisialisasi
// resize();
// animateWave();
// window.addEventListener("resize", resize); // Perbarui ukuran saat jendela berubah

// async function updateData(key, name, email, char, comment) {
//     try {
//         const response = await fetch('https://imajiwa-x-argo-visual.vercel.app/update-form', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ key, name, email, char, comment })
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const responseData = await response.json();
//         console.log('Response Data:', responseData.msg);

//     } catch (error) {
//         console.error('Error:', error);
//         console.log('Error submitting data');
//     }
// }

const wrapper = document.querySelector(".carousel-wrapper");
const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".carousel-wrapper i");
const carouselChildrens = [...carousel.children];

let char = 1;
let isDragging = false,
  startX,
  startScrollLeft,
  timeoutId;

// Get the number of cards that can fit in the carousel at once
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// Infinite scrolling setup
carouselChildrens
  .slice(-cardPerView)
  .reverse()
  .forEach((card) => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
  });
carouselChildrens.slice(0, cardPerView).forEach((card) => {
  carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

carousel.classList.add("no-transition");
carousel.scrollLeft = carousel.offsetWidth;
carousel.classList.remove("no-transition");

// Update char function
const updateChar = () => {
  char =
    Math.round(carousel.scrollLeft / firstCardWidth) %
    carouselChildrens.length || carouselChildrens.length;
  console.log("Current char after scroll/drag:", char);
};

// Arrow button click events
arrowBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    carousel.scrollLeft += btn.id === "left" ? -firstCardWidth : firstCardWidth;

    if (char > 1 && char < 10) {
      char += btn.id === "left" ? -1 : 1;
    } else if (char === 1) {
      char = btn.id === "left" ? 10 : 2;
    } else if (char === 10) {
      char = btn.id === "left" ? 9 : 1;
    }

    updateChar();
  });
});

// Drag events
const dragStart = (e) => {
  isDragging = true;
  carousel.classList.add("dragging");
  startX = e.pageX;
  startScrollLeft = carousel.scrollLeft;
};

const dragging = (e) => {
  if (!isDragging) return;
  carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
};

const dragStop = () => {
  if (isDragging) updateChar();
  isDragging = false;
  carousel.classList.remove("dragging");
};

const infiniteScroll = () => {
  if (carousel.scrollLeft === 0) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  } else if (
    Math.ceil(carousel.scrollLeft) ===
    carousel.scrollWidth - carousel.offsetWidth
  ) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  }
  updateChar();
};

// Event listeners
carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("scroll", infiniteScroll);
wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
