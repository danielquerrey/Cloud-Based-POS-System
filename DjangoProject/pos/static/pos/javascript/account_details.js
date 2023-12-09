let startDate = document.getElementById('date');

const myMap = new Map([
    ['cstat', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13733.380577348591!2d-96.3395247!3d30.6242291!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864683948b74be99%3A0xa73f7a8f8c500ffd!2sPiada%20Italian%20Street%20Food!5e0!3m2!1sen!2sus!4v1699135351535!5m2!1sen!2sus'],
    ['dallas', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1712313.1201417393!2d-98.94012451171876!3d33.046946733564035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c2360dbe0e0f5%3A0xbc1d5b0619d34bbd!2sPiada%20Italian%20Street%20Food!5e0!3m2!1sen!2sus!4v1699986532656!5m2!1sen!2sus'],
    ['houston', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d221669.02752161765!2d-95.420571!3d29.760908000000004!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c0cf3405f4ef%3A0xe9141620cd6cfb6a!2sPiada!5e0!3m2!1sen!2sus!4v1700016437293!5m2!1sen!2sus']
]);

// show correct store in interactive map
window.onload = function() {
    var iframe = document.getElementById('store-map');

    var cstat = document.getElementById('cstat');
    var dallas = document.getElementById('dallas');
    var houston = document.getElementById('houston');

    let locations = [cstat, dallas, houston];

    for (var i = 0; i < locations.length; i++) {
        console.log(locations[i])
        if (locations[i] != null) {
            iframe.src = myMap.get(locations[i].id);
        }
    }

    var pref_orders = document.getElementById('pref-orders');
    var text_container = document.getElementById('no-favs');

    if (pref_orders.children.length == 1) {
        text_container.innerHTML = "You have no favorite orders yet!";
        pref_orders.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    }
};

function cart_add_items(order_id) {
    var items = document.getElementById('order-' + order_id);
    
    var items_list = items.innerHTML.split(';');
    var order_items = [];

    for (var i = 0; i < items_list.length - 1; i++) {
        var item_info = items_list[i].split(',').map(item => item.trim());
        order_items.push(item_info);
    }

    order_items.forEach(item => {
        console.log(item[0], item[1], '', item[2])
        LS_add_item(item[0], item[1], '', item[2]);
    });
}

// birthday picker
startDate.addEventListener('change',(e)=>{
    let startDateVal = e.target.value
    document.getElementById('date-selected').innerText = startDateVal
});

function changeStore(store) {
    var store_map = document.getElementById('store-map');
    store_map.src = myMap.get(store);
    var store_text = document.getElementById('store-text');
    if (store == 'cstat') {
        store_text.innerHTML = "1025 UNIVERSITY DR. SUITE 109 COLLEGE STATION, TX 77845";
    } else if (store == 'dallas') {
        store_text.innerHTML = "3309 DALLAS PKWY #401, PLANO, TX 75093";
    } else if (store == 'houston') {
        store_text.innerHTML = "5801 MEMORIAL DR, HOUSTON, TX 77007";
    }
    updateInfo('store', store);
}

// update phone number
function changeField(button, id, original_text_id, type) {
    var field = document.getElementById(id);
    field.classList.remove('visually-hidden');

    var birthday = document.getElementById(original_text_id);
    birthday.innerHTML = "";

    button.innerHTML = "Save";

    button.onclick = function() {
        updateInfo(type, null);
    }
}

function getJSON(type, store) {
    var userId = document.getElementById('user-id').innerHTML;
    
    var jsonData;
    
    if (store != null) {
        jsonData = JSON.stringify({'user_id':userId,'store':store})
    }
    else if (type == "birthday") {
        var bday = document.getElementById('date').value;
        jsonData = JSON.stringify({'user_id':userId,'birthday':bday})
    } 
    else if (type == "card") {
        var card = document.getElementById('user-card').value;
        jsonData = JSON.stringify({'user_id':userId,'card':card})
    }
    else if (type == 'phone') {
        var phone = document.getElementById('phone_number').value;
        jsonData = JSON.stringify({'user_id':userId,'phone':phone})
    }
    else if (type == 'email') {
        var email = document.getElementById('user-email').value;
        console.log(email);
        jsonData = JSON.stringify({'user_id':userId,'email':email})
    }

    return jsonData;
}

// update info of a given type
function updateInfo(type, store) {
    var jsonData = getJSON(type, store);
    
    console.log(jsonData);

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
        
    })
    .catch(error => {
        
    });
};

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

function updateFavorite(order_id, favorite) {
    var jsonData = jsonData = JSON.stringify({'order_id':order_id,'favorite':favorite});
    
    console.log(jsonData);

    fetch('/update_favorite/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        
    })
    .catch(error => {
        
    });
    window.location.reload();
};

function selectFavorite(order_id, is_favorited) {
    console.log(is_favorited);
    // UPDATE DB & BUTTON
    var fav_button = document.getElementById(order_id + '-btn');

    if (is_favorited == 'True') {
        updateFavorite(order_id, 'false');
        fav_button.onclick = function() {
            selectFavorite(order_id, 'False');
        }
    } else {
        updateFavorite(order_id, 'true');
        fav_button.onclick = function() {
            selectFavorite(order_id, 'True');
        }
    }

    // UPDATE ICON
    var fav_icon = document.getElementById(order_id + '-fav-icon');

    if (fav_icon.classList.contains('fa-solid')) {
        fav_icon.classList.remove('fa-solid');
        fav_icon.classList.add('fa-regular');
    } else {
        fav_icon.classList.remove('fa-regular');
        fav_icon.classList.add('fa-solid');
    }
}