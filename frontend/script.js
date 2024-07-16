$(document).ready(function () {
    $("#country").select2({
        placeholder: "Select Country",
        allowClear: true,
    });
});

var key

document.getElementById("submit").addEventListener('click', e => {
    e.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var company = document.getElementById("company").value
    var country = document.getElementById("country").value.toLowerCase()
    var comment = document.getElementById("comment").value

    console.log(name, email, country, comment)

    if (comment == "") {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Fill in the empty fields first!",
        });
    } else {
        document.getElementById("p2").style.display = 'block'
        document.getElementById("p1").style.display = 'none'

        Swal.fire({
            icon: "info",
            title: "Success!",
            text: "Data Submitted Successfully"
        });

        updateData(key, name, email, country, company, char, comment)
    }

})

document.getElementById("next").addEventListener('click', e => {
    e.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var company = document.getElementById("company").value
    var country = document.getElementById("country").value.toLowerCase()
    var comment = document.getElementById("comment").value

    console.log(name, email, country, comment)

    if (name == "" || email == "" || country == "") {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Fill in the empty fields first!",
        });
    } else {
        document.getElementById("pg2").style.display = 'block'
        document.getElementById("pg1").style.display = 'none'

        Swal.fire({
            icon: "info",
            title: "Success",
            text: "Data Submitted Successfully"
        });

        submit(name, email, country, company, char, comment)
    }

})

async function submit(name, email, country, company, char, comment) {
    try {
        const response = await fetch('https://imajiwa-x-argo-visual.vercel.app/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, country, company, char, comment })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        key = responseData.key
        console.log('Response Data:', responseData.key);

    } catch (error) {
        console.error('Error:', error);
        console.log('Error submitting data');
    }
}

async function updateData(key, name, email, country, company, char, comment) {
    try {
        const response = await fetch('https://imajiwa-x-argo-visual.vercel.app/update-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, name, email, country, company, char, comment })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log('Response Data:', responseData.msg);

    } catch (error) {
        console.error('Error:', error);
        console.log('Error submitting data');
    }
}

const wrapper = document.querySelector(".carousel-wrapper");
const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".carousel-wrapper i");
const carouselChildrens = [...carousel.children];

let char = 1

let isDragging = false, isAutoPlay = true, startX, startScrollLeft, timeoutId;

// Get the number of cards that can fit in the carousel at once
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// Insert copies of the last     few cards to beginning of carousel for infinite scrolling
carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
});

// Insert copies of the first few cards to end of carousel for infinite scrolling
carouselChildrens.slice(0, cardPerView).forEach(card => {
    carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

// Scroll the carousel at appropriate postition to hide first few duplicate cards on Firefox
carousel.classList.add("no-transition");
carousel.scrollLeft = carousel.offsetWidth;
carousel.classList.remove("no-transition");

// Add event listeners for the arrow buttons to scroll the carousel left and right
arrowBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
        if (char > 1 && char < 10) {
            char += btn.id == "left" ? -1 : 1;
        } else if (char == 1) {
            char = btn.id == "left" ? 10 : 2;
        } else if (char == 10) {
            char = btn.id == "left" ? 9 : 1;
        }

        console.log(char)
    });
});

const dragStart = (e) => {
    isDragging = true;
    carousel.classList.add("dragging");
    // Records the initial cursor and scroll position of the carousel
    startX = e.pageX;
    startScrollLeft = carousel.scrollLeft;
}

const dragging = (e) => {
    if (!isDragging) return; // if isDragging is false return from here
    // Updates the scroll position of the carousel based on the cursor movement
    carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
}

const dragStop = () => {
    isDragging = false;
    carousel.classList.remove("dragging");
}

const infiniteScroll = () => {
    // If the carousel is at the beginning, scroll to the end
    if (carousel.scrollLeft === 0) {
        carousel.classList.add("no-transition");
        carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
        carousel.classList.remove("no-transition");
    }
    // If the carousel is at the end, scroll to the beginning
    else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
        carousel.classList.add("no-transition");
        carousel.scrollLeft = carousel.offsetWidth;
        carousel.classList.remove("no-transition");
    }

    // Clear existing timeout & start autoplay if mouse is not hovering over carousel
    clearTimeout(timeoutId);
}

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("scroll", infiniteScroll);
wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));