// Main Goal: resets menu category view to default category prompt
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

// Main Goal: removes the default category prompt when other's are active
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

// Main Goal : removes all other menu category btn active classes
// passed "foodName" as btn_name
// appends "btn-" to btn_name"
// if other category btn is active, it's removed, display set to none
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

// 1. calls refresh_selection
// 2. then adds category_active class to category menu btn
// 3. finally calls checkItemsDisplays()
function category_active() {
    let btn_name = this.textContent;
    let btn_div = document.getElementById(btn_name + "-items");
    btn_div.style.display = "";

    refresh_selection(btn_name);

    let category_elem = document.getElementById("btn-" + btn_name);
    category_elem.classList.add("category-active");
    checkItemsDisplay();
}

//  user_cart checkout displays
function activateCartListener() {
    let page = document.querySelector("#page-container");
    let user_cart = document.getElementById("checkout-btn");
    user_cart.addEventListener("click", () => {
        if (page.classList.contains("active")) {
            console.log("removed active");
            page.classList.remove("active");
        } else {
            page.classList.add("active");
            console.log("added active");
        }
    });
}




activateCartListener();
