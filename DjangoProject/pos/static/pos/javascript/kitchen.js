
function timed_refresh() {
    // Initial call to update colors
    reset_screen();
    updateOrderColorsAndTimers()
    setInterval(updateOrderColorsAndTimers, 1000);
    setInterval(increment_time, 1000);
    setInterval(reset_screen, 10001);
}

// Attach the function to the window.onload event
window.onload = timed_refresh;

var lock = false;
var now = new Date();
function increment_time() {
    now.setSeconds(now.getSeconds() + 1);
}
function reset_screen() {
    lock = true;
    var jsonData = JSON.stringify({});
    
    fetch('/new_kitchen/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        orders = data['orders'];
        now = new Date(data['now']);
        load_orders(orders);
    })
    .catch(error => {
    console.error('Error:', error);
    });
    lock = false;
}

function load_orders(orders) {
    var orderSet = new Set();
    var oldOrderSet = new Set();
    orders.forEach(function (order){
        orderSet.add(order.id)
    });

    var orderItems = document.querySelectorAll('.order-item');
    if(orderItems){
        orderItems.forEach(function (orderItem) {
            if(!orderSet.has(parseInt(orderItem.querySelector('.order-id').textContent))){
                orderItem.parentElement.removeChild(orderItem);
            }
            else{
                oldOrderSet.add(parseInt(orderItem.querySelector('.order-id').textContent));
            }
        });
    }

    var displayItemsContainer = document.getElementById('kitchen-area');

    orders.forEach(function (order) {
        if(!oldOrderSet.has(order.id)){
            var orderItem = document.createElement('div');
            orderItem.classList.add('order-item');
            orderItem.id = "menu-item-wrapper";
            orderItem.onclick = function () {
                deliver_order(this);
            };
    
            orderItem.innerHTML = `
                <h5>#${order.id}</h5>
                <ul>
                    ${order.order_items.map(item => `<li><p>${item.common_name}</p></li>`).join('')}
                </ul>
                <div class="timer"></div>
                <div class="visually-hidden order-id">${order.id}</div>
                <div class="visually-hidden order-date">${order.date_time}</div>
            `;
    
            setColorAndTime(orderItem);
            displayItemsContainer.appendChild(orderItem);
        }
    });
}

function deliver_order(element) {
    if(lock){
        return;
    }
    // Get the order ID from the hidden div
    var orderId = element.querySelector('.order-id').textContent;

    // Remove the clicked element from the screen
    element.remove();

    var jsonData = JSON.stringify({'order_id':orderId});

    fetch('/kitchen_deliver/', {
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
        console.error('Error:', error);
    });
}

function updateOrderColorsAndTimers() {
    var orderItemsArea = document.getElementById('kitchen-area');
    var orderItems = orderItemsArea.children;
    for(var i = 0; i < orderItems.length; i++){
        var orderItem = orderItems[i]; 
        setColorAndTime(orderItem)
    }
}

function setColorAndTime(orderItem){
    var orderDateElement = orderItem.querySelector('.order-date');
    var orderDateString = orderDateElement.textContent;

    // Parse the formatted date string into a JavaScript Date object
    var orderDate = new Date(orderDateString);
    var currentTime = now;

    var timeDifference = Math.round((currentTime - orderDate) / 1000);

    // Define color classes and time thresholds
    var bgColorClasses = ['bg-secondary', 'bg-info', 'bg-success', 'bg-warning', 'bg-danger'];
    var timeThresholds = [30, 75, 120, 165, 210]; // in seconds

    // Find the appropriate color based on time elapsed
    var colorIndex = 0;
    while (colorIndex < timeThresholds.length && timeDifference >= timeThresholds[colorIndex]) {
        colorIndex++;
    }
    colorIndex--;

    // Apply the color to the order item
    orderItem.classList.remove(...bgColorClasses); // Remove existing background color classes
    orderItem.classList.add(bgColorClasses[colorIndex]); // Add the new background color class

    // Update the timer display
    var timerElement = orderItem.querySelector('.timer');
    var timerValue = Math.abs(Math.round(timeDifference));
    timerElement.textContent = 'Timer: ' + formatTime(timerValue);
}

// Function to format time as MM:SS
function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = timeInSeconds % 60;

    return padZero(minutes) + ':' + padZero(seconds);
}

// Function to pad zero to single-digit numbers
function padZero(number) {
    return (number < 10 ? '0' : '') + number;
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