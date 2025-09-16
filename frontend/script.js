document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("comment");

  textarea.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models"),
]).then(() => {
  // tunggu sampai video bener-bener jalan
  video.addEventListener("playing", () => {
    startDetection();
  });
});


  let isSubmitting = false;
  let capturedBlob = null;
  let currentStream = null;

  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const takePhotoBtn = document.getElementById("take-photo");
  const photoPreview = document.getElementById("photo-preview");
  const retakePhotoBtn = document.getElementById("retake-photo");

  // --- Load kamera ---
  async function loadCameras() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, // "user" = kamera depan, "environment" = kamera belakang
    });
    video.srcObject = stream;
    await video.play();
    currentStream = stream;
  } catch (err) {
    console.error("Gagal akses kamera:", err);
    Swal.fire("Error", "Tidak bisa mengakses kamera: " + err.message, "error");
  }
}


  // --- Start kamera dengan fallback ---
  async function startCamera(deviceId) {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: "user" } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await video.play();
      currentStream = stream;
    } catch (err) {
      console.warn("DeviceId timeout, coba fallback facingMode");
      if (deviceId) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          video.srcObject = stream;
          await video.play();
          currentStream = stream;
        } catch (err2) {
          console.error("Gagal akses kamera sama sekali:", err2);
          Swal.fire(
            "Error",
            "Tidak bisa mengakses kamera: " + err2.message,
            "error"
          );
        }
      } else {
        console.error("Gagal akses kamera:", err);
        Swal.fire(
          "Error",
          "Tidak bisa mengakses kamera: " + err.message,
          "error"
        );
      }
    }
  }

  async function startDetection() {
    const displaySize = { width: video.width, height: video.height };

    // Buat canvas overlay untuk bounding box
    const overlay = faceapi.createCanvasFromMedia(video);
    overlay.style.position = "absolute";
    overlay.style.left = video.offsetLeft + "px";
    overlay.style.top = video.offsetTop + "px";
    document
      .querySelector(".d-flex.justify-content-center.mb-2")
      .appendChild(overlay);

    faceapi.matchDimensions(overlay, displaySize);

    setInterval(async () => {
      if (video.readyState === 4) {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );
        const resized = faceapi.resizeResults(detections, displaySize);

        overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
        faceapi.draw.drawDetections(overlay, resized);
      }
    }, 200);
  }

  // --- Capture foto (mirror & preview) ---
  takePhotoBtn.addEventListener("click", async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detections.length === 0) {
      Swal.fire(
        "Wajah tidak terdeteksi!",
        "Pastikan wajah terlihat jelas di kamera.",
        "error"
      );
      return;
    }

    // proses ambil foto (kode kamu yang lama tetap di sini)
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const context = canvas.getContext("2d");
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    canvas.toBlob((blob) => {
      capturedBlob = blob;
      const url = URL.createObjectURL(blob);
      photoPreview.src = url;
      photoPreview.style.display = "block";
      video.style.display = "none";
      takePhotoBtn.style.display = "none";
      retakePhotoBtn.style.display = "inline-block";
      Swal.fire("Foto berhasil diambil!", "", "success");
    }, "image/jpeg");
  });

  // --- Foto ulang ---
  retakePhotoBtn.addEventListener("click", () => {
    photoPreview.style.display = "none";
    retakePhotoBtn.style.display = "none";
    video.style.display = "block";
    takePhotoBtn.style.display = "inline-block";
    capturedBlob = null;
  });

  document.getElementById("next").addEventListener("click", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = document.getElementById("name").value.trim();
    const comment = document.getElementById("comment").value.trim();

    if (!name || !comment) {
      Swal.fire("Oops...", "Isi semua kolom terlebih dahulu!", "error");
      return;
    }
    if (!capturedBlob) {
      Swal.fire("Oops...", "Ambil foto dulu!", "error");
      return;
    }

    isSubmitting = true;
    const btnNext = document.getElementById("next");
    btnNext.disabled = true;
    btnNext.textContent = "Memproses...";

    try {
      await submit(name, comment, capturedBlob);
      document.getElementById("p2").style.display = "block";
      document.getElementById("p1").style.display = "none";
      showThankYouScreen({ name });
    } finally {
      isSubmitting = false;
      btnNext.disabled = false;
      btnNext.textContent = "MASUK";
    }
  });

  async function submit(name, comment, photoBlob) {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("comment", comment);
      formData.append("photo", photoBlob, "camera-photo.jpg");

      const response = await fetch(
        "https://guestbook-capute.vercel.app/submit-form",
        {
          // const response = await fetch("http://localhost:3000/submit-form", {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorMessage}`
        );
      }

      const responseData = await response.json();
      console.log("Response Data:", responseData);
    } catch (error) {
      console.error("Error submitting data:", error.message || error);
    }
  }

  function showThankYouScreen(data) {
    const { name } = data;
    document.getElementById("user-name").textContent = name;
    const p2 = document.getElementById("p2");
    p2.style.display = "flex";
    p2.style.flexDirection = "column";
    p2.style.alignItems = "center";
  }

  // --- Start ---
  loadCameras();
});
