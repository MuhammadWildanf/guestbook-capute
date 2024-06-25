$(document).ready(function () {
    $("#country").select2({
        placeholder: "Select Country",
        allowClear: true,
    });
});

var key

var a = WOWW
console.log(a.toLowerCase())

document.getElementById("submit").addEventListener('click', e => {
    e.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var country = document.getElementById("country").value.toLowerCase()
    var comment = document.getElementById("comment").value

    console.log(name, email, country, comment)

    document.getElementById("p2").style.display = 'flex'
    document.getElementById("p1").style.display = 'none'

    Swal.fire({
        icon: "info",
        title: "Thank You",
        text: "Something went wrong!",
    });

    updateData(key, name, email, country, comment)
})

document.getElementById("next").addEventListener('click', e => {
    e.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var country = document.getElementById("country").value.toLowerCase()
    var comment = document.getElementById("comment").value

    console.log(name, email, country, comment)

    document.getElementById("pg2").style.display = 'block'
    document.getElementById("pg1").style.display = 'none'

    Swal.fire({
        icon: "info",
        title: "Oops...",
        text: "Something went wrong!",
    });

    submit(name, email, country, comment)
})

async function submit(name, email, country, comment) {
    try {
        const response = await fetch('https://imajiwa-x-argo-visual.vercel.app/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, country, comment })
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

async function updateData(key, name, email, country, comment) {
    try {
        const response = await fetch('https://imajiwa-x-argo-visual.vercel.app/update-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, name, email, country, comment })
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