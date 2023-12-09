// outline plan
// highestOrder_id() "from localstore"
// returns int

// increment_highestOrder_id()
// highestOrder_id ++
//                                               3 digits 4 digits 5 digits
//                          9 digits   2 digits     0,3    4,8     9,14
// add_item() "key, value : orderItem id_number : item_id quantity price
// i will splice the string values
// the orderItem string will allow me to recognise the set as a orderITem
// the id_number in the key will allow me to identify which item in the order log i have selected, also identify total amount
// quantity digit keeps tally, 0 still included in string
// duplicate will just increase quantity

// remove_item()
// based on id_number
// if quantity == 0 - remove set
// else quantity--

// 2 types of sets
// orderItem
// totalPrice

// i wil use local storage to load checkout page

// Main Goal: returns total cart count of user
// queries all localstorage key:value pairs and only tallies
// keys that start with 'cart_item'

// Main Goal: formats 'number' to N digits and pads '0' to start
function formatNumberTo_N_Digits(number, N) {
    return number.toString().padStart(N, "0");
}

// Main Goal: returns total cart_items int found in localStorage
function LS_cart_count() {
    let total_count = localStorage.length;
    let cart_count = 0;
    let index = 0;

    while (true) {
        let curr_Item = localStorage.key(index);
        if (curr_Item != null) {
            let curr_Item_str = curr_Item.valueOf();
            if (curr_Item_str.substring(0, 9) == "cart_item") {
                cart_count += 1;
            }
        }
        index += 1;
        if (index == total_count) {
            break;
        }
    }

    return cart_count;
}

// Main Goal : process all cart_item entries from local Storage
// return map object of all cart_items SORTED by key ##
function LS_cart_map() {
    let user_cart = new Map();

    // Extract and sort the keys based on the number in 'cart_item ##'
    let sortedKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith("cart_item"))
        .sort((a, b) => {
            let numA = parseInt(a.split(" ")[1]); // Extract number from key a
            let numB = parseInt(b.split(" ")[1]); // Extract number from key b
            return numA - numB;
        });

    sortedKeys.forEach((key) => {
        // value of key - string
        let cart_item_val = localStorage.getItem(key);

        // Extract and format necessary parts from cart_item_val
        let cart_item_id = cart_item_val.substring(0, 3);
        let item_quantity_int = parseInt(cart_item_val.substring(4, 8));
        let item_price_float = parseFloat(cart_item_val.substring(9, 14));
        let common_name = cart_item_val.substring(15, cart_item_val.length);

        let item_quantity_str = item_quantity_int.toString().padStart(4, "0");
        let item_price_str = item_price_float.toFixed(2).toString().padStart(5, "0");

        let NEW_cart_item_val = cart_item_id + " " + item_quantity_str + " " + item_price_str + " " + common_name;

        // Update user_cart Map
        user_cart.set(key, NEW_cart_item_val);
    });

    return user_cart;
}

// Main Goal : removes all keys with "cart_item"
// ignores necessary entries ex. debug
function LS_clear_items() {
    // Loop through all keys in localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        // Check if the key includes the substring 'hello'
        if (key.includes("cart_item")) {
            // Remove the item from localStorage
            // console.log("Removed " + key + ":" + localStorage.getItem(key));
            localStorage.removeItem(key);
        }
    }
}

// Main Goal: resets local Storage entries starting with "cart_item" and
// adds new entries given new_cart_map type: Map()
function update_cart_map(new_cart_map = new Map()) {
    // clear old cart_items
    LS_clear_items();

    new_cart_map.forEach((value, key) => {
        localStorage.setItem(key, value);
    });
}

// Main Goal : input is item_id and
// returns key or null if not found in current local storage map
function checkIfItemExistsInCart(item_id) {
    let curr_cart_map = LS_cart_map();
    console.log(curr_cart_map);
    for (let [key, value] of curr_cart_map) {
        let temp_id = value.substring(0, 3);
        if (temp_id === item_id) {
            console.log("key - " + key);
            return key; // Return true as soon as a match is found
        }
    }
    return null; // Return false if no match is found
}

// Main Goal : calculates total price of cart_map
function calc_total_cart_price() {
    temp_cart_map = LS_cart_map();
    let total_price_elem = document.querySelectorAll("#total-price");
    let total_price_float = 0.0;
    temp_cart_map.forEach((value, key) => {
        let temp_cost_str = value.substring(9, 14);
        let parsed_cost = parseFloat(temp_cost_str);

        let temp_quantity_str = value.substring(4, 8);
        let parsed_quantity = parseFloat(temp_quantity_str);

        total_price_float += parsed_cost * parsed_quantity;
    });
    total_price_elem.forEach(function (elem) {
        elem.innerHTML = "Total: $" + total_price_float.toFixed(2); // Set the new value for each element
    });
    console.log("Updated Total: " + total_price_float);
    return total_price_float;
}

// Main Goal : using string/int parsing and specific string layout, given id and price
// new item is added to a map instance and then calls update_cart_map to add it to local storage
// if there is a duplicate id, it simply parses string to int, increments, parsed back to string, added to map, then calls update method
function LS_add_item(id, price, description, common_name) {
    let item_id = formatNumberTo_N_Digits(id, 3);
    let item_price = formatNumberTo_N_Digits(price, 5);
    let temp_cart_map = LS_cart_map();
    let duplicate_entry = checkIfItemExistsInCart(item_id);
    if (duplicate_entry != null) {
        // found entry
        // increment quantity
        // get duplicate [key,value]
        let curr_entry = temp_cart_map.get(duplicate_entry);
        // substring for quanitity digits 3-8
        let item_quantity_str = curr_entry.valueOf().substring(3, 8);
        // Key Value String
        let value_str = curr_entry.valueOf();
        // parse string to int value - looses padding
        let parsed_quantity = parseInt(item_quantity_str);
        // increment
        parsed_quantity += 1;
        // repad int quantity value to string
        item_quantity_str = formatNumberTo_N_Digits(parsed_quantity, 4);
        // update new value of key
        let new_key_value = value_str.substring(0, 3) + " " + item_quantity_str + " " + value_str.substring(9, 14) + " " + common_name;
        console.log(new_key_value);
        temp_cart_map.set(duplicate_entry, new_key_value);
        update_cart_map(temp_cart_map);

        // DOM Maninpulation
        parsed_quantity = parseInt(item_quantity_str);
        item_quantity_str = parsed_quantity.toString();
        let orderContainer = document.getElementById("order-container");
        let itemToUpdate = orderContainer.querySelector('.order-item[data-item-id="' + item_id + '"]');
        if (itemToUpdate) {
            let stockElement = itemToUpdate.querySelector("h3");
            if (stockElement) {
                stockElement.textContent = item_quantity_str;
            }
        }
        //
        console.log("updated item : " + duplicate_entry + "-:-" + item_quantity_str);
    } else {
        let map_size = temp_cart_map.size;
        let map_size_str = formatNumberTo_N_Digits(map_size, 2);
        temp_cart_map.set("cart_item " + map_size_str, item_id + " 0001 " + item_price + " " + common_name);
        console.log("cart_item " + map_size_str, item_id + " 0001 " + item_price + " " + common_name);
        update_cart_map(temp_cart_map);
        populateCartItems();
        // cart_appendOrderItem("1",item_price,description, common_name);
        // console.log("addded new item - " + "cart_item " + map_size_str, item_id + " 0001 " + item_price + " " + common_name);
    }
    console.log(LS_cart_map());
    calc_total_cart_price();
}

// Main Goal : using string/int parsing and specific string layout, given id and price
// item is decremented or removed based on quantity and manipulates dom
function LS_remove_item(id, price, common_name) {
    let item_id = formatNumberTo_N_Digits(id, 3);
    let item_price = formatNumberTo_N_Digits(price, 5);
    let temp_cart_map = LS_cart_map();
    let duplicate_entry = checkIfItemExistsInCart(item_id);
    if (duplicate_entry != null) {
        // found entry
        // increment quantity
        // get duplicate [key,value]
        let curr_entry = temp_cart_map.get(duplicate_entry);
        // substring for quanitity digits 3-8
        let item_quantity_str = curr_entry.valueOf().substring(3, 8);
        // Key Value String
        let value_str = curr_entry.valueOf();
        // parse string to int value - looses padding
        let parsed_quantity = parseInt(item_quantity_str);
        // increment
        parsed_quantity -= 1;
        // remove item
        if (parsed_quantity <= 0) {
            temp_cart_map.delete(duplicate_entry);
            update_cart_map(temp_cart_map);

            // remove padding for DOM quantity
            parsed_quantity = parseInt(item_quantity_str);
            item_quantity_str = parsed_quantity.toString();
            let orderContainer = document.getElementById("order-container");
            let itemToRemove = orderContainer.querySelector('.order-item[data-item-id="' + item_id + '"]');
            if (itemToRemove) {
                orderContainer.removeChild(itemToRemove);
            }
            console.log("updated removed item : " + duplicate_entry + "-:-" + item_quantity_str);
            console.log(LS_cart_map());
        }
        // decrement item
        else {
            // repad int quantity value to string
            item_quantity_str = formatNumberTo_N_Digits(parsed_quantity, 4);
            // update new value of key
            let new_key_value = value_str.substring(0, 3) + " " + item_quantity_str + " " + value_str.substring(9, 14) + " " + common_name;
            console.log(new_key_value);
            temp_cart_map.set(duplicate_entry, new_key_value);
            update_cart_map(temp_cart_map);

            // DOM Maninuplation below
            parsed_quantity = parseInt(item_quantity_str);
            item_quantity_str = parsed_quantity.toString();
            let orderContainer = document.getElementById("order-container");
            let itemToUpdate = orderContainer.querySelector('.order-item[data-item-id="' + item_id + '"]');
            if (itemToUpdate) {
                let stockElement = itemToUpdate.querySelector("h3");
                if (stockElement) {
                    stockElement.textContent = item_quantity_str;
                }
            }
            //

            console.log("updated decremented item : " + duplicate_entry + "-:-" + item_quantity_str);
        }
    }
    calc_total_cart_price();
}

// Main Goal : creates and appends order item to order-container in DOM
function cart_appendOrderItem(item_quantity, item_price, descr, common_name, item_id) {
    // Create the main div
    var orderItem = document.createElement("div");
    orderItem.className = "order-item";
    // orderItem.onclick = function () {
    //     LS_remove_item(item_id, item_price, common_name);
    // };

    // Create the item-text div
    var itemText = document.createElement("div");
    itemText.id = "item-text";
    itemText.onclick = function () {
        LS_remove_item(item_id, item_price, common_name);
    };

    // Create and append h1 and h6 to item-text
    var title = document.createElement("h2");
    title.textContent = common_name;

    // var description = document.createElement("h6");
    // description.textContent = descr;

    itemText.appendChild(title);
    // itemText.appendChild(description);
    itemText.onmouseover = function () {
        title.id = "active-text";
    };
    itemText.onmouseout = function () {
        title.id = "";
    };
    // Create the item-details div
    var itemDetails = document.createElement("div");
    itemDetails.id = "item-details";

    // Create the item-buttons div
    var itemButtons = document.createElement("div");
    itemButtons.id = "item-buttons";

    // Create and append buttons and h3 to item-buttons
    var buttonMinus = document.createElement("button");
    buttonMinus.textContent = "-";
    buttonMinus.onclick = function () {
        LS_remove_item(item_id, item_price, common_name);
    };
    var stockNumber = document.createElement("h3");
    stockNumber.textContent = item_quantity;
    var buttonPlus = document.createElement("button");
    buttonPlus.textContent = "+";
    buttonPlus.onclick = function () {
        LS_add_item(item_id, item_price, descr, common_name);
    };
    itemButtons.appendChild(buttonMinus);
    itemButtons.appendChild(stockNumber);
    itemButtons.appendChild(buttonPlus);

    // Create the item-price div
    var itemPrice = document.createElement("div");
    itemPrice.id = "item-price";

    // Create and append h3 to item-price
    var price = document.createElement("h3");
    let parsed_price = parseFloat(item_price);
    item_price = parsed_price.toString();
    price.textContent = "$" + item_price;

    itemPrice.appendChild(price);

    // Append item-buttons and item-price to item-details
    itemDetails.appendChild(itemButtons);
    itemDetails.appendChild(itemPrice);

    // Append item-text and item-details to order-item
    orderItem.appendChild(itemText);
    orderItem.appendChild(itemDetails);

    // Set a data attribute for the orderItem
    orderItem.setAttribute("data-item-id", item_id);

    // Append the order-item to the order-container
    document.getElementById("order-container").appendChild(orderItem);
}

// Main Goal : loads DOM with cart_items function, cart_appendOrderItem,  from local storage based on sorted map from LS_cart_map()
function populateCartItems() {
    // Retrieve the sorted map of cart items
    let sortedCartItems = LS_cart_map();
    // Get the order-container element
    let orderContainer = document.getElementById("order-container");

    // Function to check if an item is already in the container
    function isItemAdded(itemId) {
        return !!orderContainer.querySelector('.order-item[data-item-id="' + itemId + '"]');
    }

    let total_price_elem = document.querySelector("#total-price");
    let total_price_float = 0.0;

    // Iterate over each cart item in the map
    sortedCartItems.forEach((value, key) => {
        // Extract details from the value
        let parts = value.split(" ");
        let parts_len = parts.length;
        let cart_item_id = parts[0];
        let item_quantity_str = parts[1];
        let item_price_str = parts[2];
        let common_name = parts[3];
        for (let i = 4; i < parts_len; i++) {
            common_name += " " + parts[i];
        }

        // Check if the item has already been added
        if (!isItemAdded(cart_item_id)) {
            // Create a common name and description for the cart item
            // let common_name = "Item " + cart_item_id; // Placeholder common name
            let descr = "Description for Item " + cart_item_id; // Placeholder description

            // Call cart_appendOrderItem to create and append the order item element
            let parsed_quantity = parseInt(item_quantity_str);
            item_quantity_str = parsed_quantity.toString();
            let parsed_price = parseFloat(item_price_str);
            item_price_str = parsed_price.toString();
            cart_appendOrderItem(item_quantity_str, item_price_str, descr, common_name, cart_item_id);
        }
    });

    calc_total_cart_price();
}

function LS_pay() {
    let item_id_arr = [];
    let cartItemsMap = LS_cart_map();
    cartItemsMap.forEach((value, key) => {
        // Assuming the value format is like "015 0003 08.29 Description"
        let parts = value.split(" ");
        let itemId = parts[0]; // The first 3 characters (item_id)
        let quantity = parseInt(parts[1]); // The next 4 characters (quantity)

        // Repeat itemId based on quantity
        for (let i = 0; i < quantity; i++) {
            item_id_arr.push(itemId);
        }
    });
    // console.log(item_id_arr);

    let total_price = calc_total_cart_price();
    // Serialize to JSON
    var user_id = document.querySelector("#user-id").innerHTML;
    var jsonData = JSON.stringify({ user_id: user_id, item_ids: item_id_arr, price: total_price, mobile:true });
    console.log(user_id);
    console.log(jsonData);
    // make a post request to place_order
    fetch("/place_order/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: jsonData,
    })
        .then((response) => response.json())
        .then((data) => {
            // right now we are doing nothing with the response not sure if this will change
        })
        .catch((error) => {
            console.error("Error:", error);
        });

    // clear the screen
    LS_clear_items();
    populateCartItems();
    // location.reload();
}

// Main Goal : removes all orderItems from DOM
function remove_all_orderItems() {
    let orderContainer = document.getElementById("order-container");
    while (orderContainer.firstChild) {
        orderContainer.removeChild(orderContainer.firstChild);
    }
}

// Main Goal : clears all cart_items from local storage and DOM
function clear_cartButton() {
    LS_clear_items();
    populateCartItems();
    remove_all_orderItems();
}

// Main Goal : checks if cart is empty, if so, prevents checkout at order_online.html
// this is not in use currently - allows user to go to checkout page
function check_emptyCart(event) {
    let cart_count = LS_cart_count();

    if (cart_count == 0) {
        event.preventDefault();
        alert("Your cart is empty");
    } else {
    }
}

// Main Goal : checks if cart is empty, if so, prevents checkout at checkout_order.html
function check_emptyCart_checkout(event) {
    let cart_count = LS_cart_count();

    if (cart_count == 0) {
        alert("Your cart is empty");
    } else {
        LS_pay();
    }
}

// Main Goal : check out order, excluding location.reload in check_emptyCart_checkout call
function orderCart(event) {
    check_emptyCart_checkout(event);

    let currentUrl = window.location.href; // Get the current URL
    let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/")); // Remove the last segment
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/")); // Remove the last segment
    let newUrl = baseUrl + "/order_online/"; // Append '/orderOnline' to the base URL
    // Redirect to the new URL
    window.location.href = newUrl;


}

// Main Goal : shows fav order alert
function showAlert() {
    document.getElementById("customAlert").style.display = "flex";
}

// Main Goal : closes fav order alert
function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}

// Main Goal : updates favorite in DB
function selectFavorite(order_id, is_favorited) {
    console.log(is_favorited);
    // UPDATE DB & BUTTON
    var fav_button = document.getElementById(order_id + "-btn");

    if (is_favorited == "True") {
        updateFavorite(order_id, "false");
        fav_button.onclick = function () {
            selectFavorite(order_id, "False");
        };
    } else {
        updateFavorite(order_id, "true");
        fav_button.onclick = function () {
            selectFavorite(order_id, "True");
        };
    }
}



// Main Goal : checks if cart is empty, if so, prevents checkout at checkout_order.html
// also updates favorite
function orderAndFavCart(event) {
    // selectFavorite('{{ order.id }}', 'True')
    // updateFavorite('{{ order.id }}', 'True')
    let order_id = document.querySelector("#highest-id").innerHTML;
    closeAlert();
    check_emptyCart_checkout(event);

    setTimeout(function () {
        updateFavorite(order_id, "true");
    }, 1000); // Sleep for 1 second (1000 milliseconds)

    setTimeout(function () {
    let currentUrl = window.location.href; // Get the current URL
    let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/")); // Remove the last segment
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/")); // Remove the last segment
    let newUrl = baseUrl + "/order_online/"; // Append '/orderOnline' to the base URL
    // Redirect to the new URL
    window.location.href = newUrl;
    },1000);
}


// This is the main function that will be called when the page loads
// and cart will generate any localStorage entries
populateCartItems();
