const myMap = new Map([
    [
        "cstat",
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13733.380577348591!2d-96.3395247!3d30.6242291!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864683948b74be99%3A0xa73f7a8f8c500ffd!2sPiada%20Italian%20Street%20Food!5e0!3m2!1sen!2sus!4v1699135351535!5m2!1sen!2sus",
    ],
    [
        "dallas",
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1712313.1201417393!2d-98.94012451171876!3d33.046946733564035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c2360dbe0e0f5%3A0xbc1d5b0619d34bbd!2sPiada%20Italian%20Street%20Food!5e0!3m2!1sen!2sus!4v1699986532656!5m2!1sen!2sus",
    ],
    [
        "houston",
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d221669.02752161765!2d-95.420571!3d29.760908000000004!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c0cf3405f4ef%3A0xe9141620cd6cfb6a!2sPiada!5e0!3m2!1sen!2sus!4v1700016437293!5m2!1sen!2sus",
    ],
]);

// the descriptions for these 4 methods below are found in order_online.js
function default_item_active() {
    let items = document.querySelectorAll(".menu-btn");
    items.forEach((item) => {
        if (item.classList.contains("category-active")) {
            item.classList.remove("category-active");
            let item_elem = document.getElementById(item.textContent + "-items");
            item_elem.style.display = "none";
        }
    });
    let default_elem = document.getElementById("default-item");
    default_elem.style.display = "";
}

function checkItemsDisplay() {
    let items = document.querySelectorAll(".menu-btn");
    let allHidden = true;
    items.forEach((item) => {
        if (item.classList.contains("category-active")) {
            allHidden = false;
        }
    });

    let defaultDiv = document.getElementById("default-item");
    if (allHidden) {
        defaultDiv.style.display = ""; // Show default item
    } else {
        defaultDiv.style.display = "none"; // hide default item
    }
}

function category_active() {
    let btn_name = this.textContent;
    let btn_div = document.getElementById(btn_name + "-items");
    btn_div.style.display = "";

    refresh_selection(btn_name);

    let category_elem = document.getElementById("btn-" + btn_name);
    category_elem.classList.add("category-active");
    checkItemsDisplay();
}

function refresh_selection(btn_name) {
    let items = document.querySelectorAll(".menu-btn");
    items.forEach((item) => {
        if (item.id != "btn-" + btn_name && item.classList.contains("category-active")) {
            item.classList.remove("category-active");
            let item_elem = document.getElementById(item.textContent + "-items");
            item_elem.style.display = "none";
        }
    });
}

function getJSON(type, store) {
    var userId = document.getElementById('user-id').innerHTML;
    
    var jsonData;
    
    if (store != null) {
        jsonData = JSON.stringify({'user_id':userId,'store':store})
    }

    return jsonData;
}


function changeStore(store) {
    var store_map = document.getElementById('store-map');
    store_map.src = myMap.get(store);
    updateInfo('store', store);
}

window.onload = function() {
    console.log("ON LOAD");
    var iframe = document.getElementById('store-map');

    var cstat = document.getElementById('cstat');
    var dallas = document.getElementById('dallas');
    var houston = document.getElementById('houston');

    let locations = [cstat, dallas, houston];

    for (var i = 0; i < locations.length; i++) {
        if (locations[i] != null) {
            iframe.src = myMap.get(locations[i].id);            
        }
    }
};


// update info of a given type
function updateInfo(type, store) {
    var jsonData = getJSON(type, store);
    
    console.log(jsonData)

    fetch('/update_info/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        // var date_form = document.getElementById('date-form');
        // date_form.classList.add('visually-hidden');

        // var birthday = document.getElementById('birthday');
        // birthday.classList.remove('visually-hidden');
        console.log("changed store");
        // location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
    });
};