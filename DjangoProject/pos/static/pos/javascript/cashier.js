// global vars
var id = 1;
var options_id = 0;
var checkbox_id = 0;
var item_map = new Map();
var total = 0;

function createOrderItem(item) {
    // get order item template
    var order_item = document.querySelector('#order-item');
    var order_item_clone = order_item.cloneNode(true);
    // give order item a unique id
    order_item_clone.id = 'order-item-' + id;
    // make element visible
    order_item_clone.classList.remove('visually-hidden');

    // get the item's buttons
    var delete_button = order_item_clone.querySelector('#delete-btn');
    var minus_button = order_item_clone.querySelector('#minus-btn');
    var plus_button = order_item_clone.querySelector('#plus-btn');
    var item_quantity_val = order_item_clone.querySelector('#item-quantity-value');

    var price = item.querySelector('#price').innerHTML;
    // set onclick function to buttons
    // console.log(order_item_clone)
    delete_button.onclick = function() {
        deleteItem(order_item_clone, price);
    };
    minus_button.onclick = function() {
        subtractQuantity(order_item_clone, price, 1);
    };
    plus_button.onclick = function() {
        addQuantity(order_item_clone, price, 1);
    };
    item_quantity_val.onclick = function() {
        editQuantity(order_item_clone, price);
    };

    // assign item index to order item
    var order_item_index = order_item_clone.querySelector('#item-index');
    order_item_index.innerHTML = id;
    // assign item name to order item
    var order_item_name = order_item_clone.querySelector('#item-name');
    order_item_name.innerHTML = item.querySelector('#name').innerHTML;
    // assign item price to order item
    var item_price = item.querySelector('#price');
    var order_item_price = order_item_clone.querySelector('#item-price');
    order_item_price.innerHTML = item_price.innerHTML;
    // assign item quantity to order item
    var order_item_quantity = order_item_clone.querySelector('#item-quantity-value');
    order_item_quantity.innerHTML = 1;
    // assign item quantity to order item
    var order_item_id = order_item_clone.querySelector('#item-id');
    order_item_id.innerHTML = item.id;

    // get order_list element
    var order_list = document.querySelector('#order-list');

    // if item already exists in map
    if (item_map.get(parseInt(order_item_id.innerHTML)) != null &&
        !(item.querySelector('#name').innerHTML.includes('Create '))) {

        // find duplicate element in order_list
        var array = Array.from(order_list.children);
        array.forEach(function(element) {
            // find element with matching name
            if (element.querySelector('#item-name') != null) {
                if (element.querySelector('#item-name').innerHTML == order_item_name.innerHTML) {
                    // increment quantity
                    var quantity = element.querySelector('#item-quantity-value');
                    quantity.innerHTML = parseInt(quantity.innerHTML) + 1;
                    item_map.get(parseInt(order_item_id.innerHTML)).quantity += 1;
                    // increment price (rounding to 2 decimal places)
                    var price = element.querySelector('#item-price');
                    price.innerHTML = (parseFloat(price.innerHTML) + parseFloat(item_price.innerHTML)).toFixed(2);
                    // update total price
                    total += parseFloat(item_price.innerHTML);
                }
            }
        });
    } else {
        if (item.querySelector('#name').innerHTML.includes('Create ')) {
            // add a add options button to order_item_clone's Name div
            var add_options_button = document.createElement('button');
            add_options_button.classList.add('btn', 'btn-primary', 'btn-sm');
            add_options_button.innerHTML = 'Add Options';
            add_options_button.id = 'add-options-btn';
            // set onclick function to show options
            add_options_button.onclick = function() {
                getOptions(order_item_clone);
            };
            
            // add button to order item
            order_item_name.appendChild(add_options_button);
        }

        // change background color for order based on id
        if (id % 2 == 0) {
            order_item_clone.classList.add('bg-offwhite');
        } else {
            order_item_clone.classList.add('bg-light');
        }
        // increment id for next order item
        id++;
        // add item to map
        item_map.set(parseInt(order_item_id.innerHTML), new map_item(parseInt(order_item_id.innerHTML), order_item_name.innerHTML, parseFloat(order_item_price.innerHTML), 1));
        // update total price
        total += parseFloat(item_price.innerHTML);
        // append order item to order list
        order_list.appendChild(order_item_clone);
    }

    // update total price on screen
    var total_price = document.querySelector('#cashier-total-price');
    total_price.innerHTML = Math.abs(total.toFixed(2));
};

function changeCategory(category) {
    var item_list = document.querySelector('#item-list');
    var items = Array.from(item_list.children);

    items.forEach(function(element) {
        // select all item elements matching category
        if (element.classList.contains('item')) {
            // hide all elements except selected category
            if (element.querySelector('#category').innerHTML != category) {
                element.classList.add('visually-hidden');
            } else {
                element.classList.remove('visually-hidden');
            }
        }
    });
};

function getOptions(item) {
    var item_name = item.querySelector('#item-name');
    var add_options_button = item_name.querySelector('#add-options-btn')
    var options = document.querySelector('.item-options');
    // clone options into item name div
    var options_clone = options.cloneNode(true);
    options_clone.classList.remove('visually-hidden');
    options_clone.id = 'item-options-' + options_id;
    options_id++;

    const checkboxes = options_clone.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.id = checkbox.id + '-' + checkbox_id;
        checkbox_id++;
        checkbox.addEventListener('change', () => {
            // grass fed meatball fix
            var form_inputs = options_clone.querySelectorAll('.form-check-input');
            var selected_option = Array.from(form_inputs).find(input => input.id === checkbox.id);
            
            var order_item_price = item.querySelector('#item-price');
            var total_price = document.querySelector('#cashier-total-price');
            
            var order_item_name = selected_option.id;
            // get rid of excess text
            order_item_name = order_item_name.replace('checkbox-', '');
            order_item_name = order_item_name.replace(/-\d+/g, '');

            var item_object = document.getElementById(order_item_name);
            var item_price = item_object.querySelector('#add-price').innerHTML;
            var order_item_id = item_object.querySelector('#add-item-id');

            if (checkbox.checked) {
                // increase price of the order item
                order_item_price.innerHTML = (parseFloat(order_item_price.innerHTML) + parseFloat(item_price)).toFixed(2);
                // update total price
                total += parseFloat(item_price);
                // update total price on screen
                total_price.innerHTML = Math.abs(total.toFixed(2));

                item_map.set(parseInt(order_item_id.innerHTML), new map_item(parseInt(order_item_id.innerHTML), order_item_name, parseFloat(order_item_price.innerHTML), 1));
            } else {
                // decrease price of the order item
                order_item_price.innerHTML = (parseFloat(order_item_price.innerHTML) - parseFloat(item_price)).toFixed(2);
                // update total price
                total -= parseFloat(item_price);
                // update total price on screen
                total_price.innerHTML = Math.abs(total.toFixed(2));

                item_map.delete(parseInt(order_item_id.innerHTML));
            }
            console.log(item_map);
        });
    }); 

    // insert options before add options button
    item_name.insertBefore(options_clone, add_options_button);
    
    showOptions(item, options_clone);
}

function showOptions(item, options_clone) {
    console.log(options_clone)
    var item_name = item.querySelector('#item-name');
    var add_options_button = item_name.querySelector('#add-options-btn');

    options_clone.classList.remove('visually-hidden');
    
    // change add options button to hide options button
    add_options_button.innerHTML = 'Hide Options';
    // change add_options_button onclick function to hideOptions
    add_options_button.onclick = function() {
        hideOptions(item, options_clone);
    };
}

function hideOptions(item, options_clone) {
    var item_name = item.querySelector('#item-name');
    var add_options_button = item_name.querySelector('#add-options-btn')
    
    // remove options
    // item_name.removeChild(options);
    options_clone.classList.add('visually-hidden');

    // change add options button to hide options button
    add_options_button.innerHTML = 'Add Options';
    // change add_options_button onclick function to hideOptions
    add_options_button.onclick = function() {
        showOptions(item, options_clone);
    };
}

function addQuantity(item, item_price, new_quantity, editing=false) {
    // dont allow addition during editing quantity
    if (document.getElementById('input-item-quantity') != null && !editing) {
        return;
    }

    // get order_list element and item information
    var order_list = document.querySelector('#order-list');
    var order_item_name = item.querySelector('#item-name');
    var order_item_id = item.querySelector('#item-id');

    // find duplicate element in order_list
    var array = Array.from(order_list.children);

    array.forEach(function(element) {
        // find element with matching name
        if (element.querySelector('#item-name') != null) {
            if (element.querySelector('#item-name').innerHTML == order_item_name.innerHTML) {
                // increment quantity
                var quantity = element.querySelector('#item-quantity-value');
                quantity.innerHTML = parseInt(quantity.innerHTML) + parseInt(new_quantity);
                item_map.get(parseInt(order_item_id.innerHTML)).quantity += parseInt(new_quantity);
                // increment price (rounding to 2 decimal places)
                var price = element.querySelector('#item-price');
                
                price.innerHTML = (parseFloat(price.innerHTML) + (parseFloat(item_price) * parseInt(new_quantity))).toFixed(2);
                // update total price
                total += parseFloat(item_price) * parseInt(new_quantity);
            }
        }
    });

    // update total price on screen
    var total_price = document.querySelector('#cashier-total-price');
    total_price.innerHTML = Math.abs(total.toFixed(2));
}

function subtractQuantity(item, item_price, new_quantity, editing=false) {
    // dont allow subtraction during editing quantity
    if (document.getElementById('input-item-quantity') != null && !editing) {
        return;
    }

    // get all order items
    var order_list = document.querySelector('#order-list');
    // get order item id
    var order_item_id = item.querySelector('#item-index').innerHTML;
    // get order quantity
    var order_item_quantity = item.querySelector('#item-quantity-value').innerHTML;
    var order_item_name = item.querySelector('#item-name');
    
    // update order item price
    var order_item_price = item.querySelector('#item-price');
    
    // update quantity
    order_item_quantity -= parseInt(new_quantity);
    item_map.get(parseInt(item.querySelector('#item-id').innerHTML)).quantity -= parseInt(new_quantity);
    // update total price
    total -= item_price * parseInt(new_quantity);

    // if quantity is zero, delete order item
    if (order_item_quantity <= 0) {
        // dont remove create your own items from item_map
        if (!order_item_name.innerHTML.includes('Create ')) {
            // remove order item from map
            item_map.delete(parseInt(item.querySelector('#item-id').innerHTML));
        }
        
        // remove order item from order list
        order_list.removeChild(item);
        // update order ids of remaining order items
        var array = Array.from(order_list.children);
        array.forEach(function(element) {
            // find element with matching name
            if (element.querySelector('#item-index') != null) {
                if (element.querySelector('#item-index').innerHTML > order_item_id) {
                    // decrement id
                    var id = element.querySelector('#item-index');
                    id.innerHTML = parseInt(id.innerHTML) - 1;
                }
            }
        });
        // update global id variable
        id--;
    } else {
        // update order item quantity
        item.querySelector('#item-quantity-value').innerHTML = order_item_quantity;
        // update order item price
        order_item_price.innerHTML = (parseFloat(order_item_price.innerHTML) - item_price * parseInt(new_quantity)).toFixed(2);
    }

    // update total price on screen
    var total_price = document.querySelector('#cashier-total-price');
    total_price.innerHTML = Math.abs(total.toFixed(2));
}

function editQuantity(item, item_price) {
    // get items
    var current_quantity_item = item.querySelector('#item-quantity-value');
    var current_quantity = current_quantity_item.innerHTML;
    console.log(current_quantity);
    // create div container
    var div_container = document.createElement('div');
    div_container.classList.add('row');
    
    // create input field
    var input_field = document.createElement('input');
    input_field.type = 'number';
    input_field.value = current_quantity;
    input_field.id = 'input-item-quantity';

    // add event listener for keypress event
    input_field.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) { // key == Enter
            var new_quantity = this.value;
            if (new_quantity == "" || new_quantity == "0") {
                console.log('delete item');
                deleteItem(item, item_price);
            } else {
                console.log('update item');
                var updated_quantity = parseInt(new_quantity) - parseInt(current_quantity);
                // add updated quantity to item
                addQuantity(item, item_price, updated_quantity, true);
                // remove input field and show current quantity
                current_quantity_item.innerHTML = new_quantity;
                current_quantity_item.classList.remove('visually-hidden');
                div_container.parentNode.removeChild(div_container);
            }
        }
    });

    // append input field to div container
    div_container.appendChild(input_field);

    // hide current quantity and insert div container
    current_quantity_item.classList.add('visually-hidden');
    current_quantity_item.parentNode.insertBefore(div_container, current_quantity_item.nextSibling);
}

function deleteItem(item, item_price) {
    subtractQuantity(item, item_price, item.querySelector('#item-quantity-value').innerHTML);
}

window.onload = function() {
    // run change category to be set to piadas when page loads
    changeCategory('piadas');
    // update total price on screen
    var total_price = document.querySelector('#cashier-total-price');
    total_price.innerHTML = Math.abs(total.toFixed(2));
};

function pay() {
    // create an array with all item ids
    item_id_arr = [];
    for (const [key, value] of item_map) {
        for(let i = 0; i < value.quantity; i++){
            item_id_arr.push(key);
        }
    }
    
    // Serialize to JSON
    var user_id = document.querySelector('#user-id').innerHTML;
    var jsonData = JSON.stringify({'user_id':user_id,'item_ids':item_id_arr, 'price':total, 'mobile':false});
    console.log(user_id);
    console.log(jsonData);
    // make a post request to place_order
    fetch('/place_order/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        // right now we are doing nothing with the response not sure if this will change
    })
    .catch(error => {
        console.error('Error:', error);
    });

    // clear the screen
    clear_order();
};

function clear_order() {
    // clear order-list
    var order_list = document.querySelector('#order-list');
    while (order_list.children.length > 2) {
        order_list.removeChild(order_list.children[2]);
    }

    // reset our global variables and change price text
    item_map = new Map();
    var total_price = document.querySelector('#cashier-total-price');
    total = 0;
    total_price.innerHTML = Math.abs(total.toFixed(2));
    id = 1;
};

function print() {
    console.log(item_map)
};

map_item = function (id, name, price, quantity){
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
}

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
}