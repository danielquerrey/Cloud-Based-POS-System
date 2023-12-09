let waiting = false;

function go_to_id(){
    if(waiting){
        return;
    }
    waiting = true;
    const goToIdField = document.getElementById("go_to_input");
    var jsonData = JSON.stringify({'go_to_id':parseInt(goToIdField.value)});

    // make a post request to get new time range
    fetch('/new_order_history/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        orders = data['orders']
        load_orders((orders))
        
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function next_100(){
    if(waiting){
        return;
    }
    waiting = true;
    currId = 0;
    try{
        currId =  parseInt(document.getElementById("order-list").children[1].children[0].children[0].innerHTML.substring(1))
        currId += 100;
    }
    catch{

    }
    const goToIdField = document.getElementById("go_to_input");
    console.log(currId)

    var jsonData = JSON.stringify({'go_to_id':currId});

    // make a post request to get new time range
    fetch('/new_order_history/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        orders = data['orders']
        load_orders((orders))
    })
    .catch(error => {
    console.error('Error:', error);
    });
}

function prev_100(){
    if(waiting){
        return;
    }
    waiting = true;
    currId = 0;
    try{
        currId = parseInt(document.getElementById("order-list").children[1].children[0].children[0].innerHTML.substring(1))
        currId -= 100;
    }
    catch{
        
    }

    var jsonData = JSON.stringify({'go_to_id':currId});

    // make a post request to get new time range
    fetch('/new_order_history/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        orders = data['orders']
        load_orders((orders))
    })
    .catch(error => {
    console.error('Error:', error);
    });
}

function load_orders(orders){
    const table_div = document.getElementById("order-list")
    for (var i = table_div.children.length - 1; i > 0; i--) {
        table_div.removeChild(table_div.children[i]);
    }
    const container = document.createElement('div');
    table_div.appendChild(container);

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'bg-light mt-0 fs-4 order-row row text-center p-0 m-0 fw-bold';

        const idDiv = document.createElement('div');
        idDiv.className = 'col-1 border border-dark';
        idDiv.innerText = `#${order.id}`;
        orderDiv.appendChild(idDiv);

        const dateDiv = document.createElement('div');
        dateDiv.className = 'col-3 border border-dark';
        dateDiv.innerText = formatDateString(order.date_time);
        orderDiv.appendChild(dateDiv);

        const commonNamesDiv = document.createElement('div');
        commonNamesDiv.className = 'col-4 border border-dark';
        if(order.common_names){
        order.common_names.forEach(name => {
            const nameP = document.createElement('p');
            nameP.innerText = name;
            commonNamesDiv.appendChild(nameP);
        });}
        orderDiv.appendChild(commonNamesDiv);

        const priceDiv = document.createElement('div');
        priceDiv.className = 'col-2 border border-dark';
        priceDiv.innerText = order.price;
        orderDiv.appendChild(priceDiv);
        
        const editButton = document.createElement('button');
        editButton.className = 'col-1 border border-dark';
        editButton.innerText = "Edit";
        editButton.onclick = edit_order;
        editButton.setAttribute('data-order-id', order.id);
        orderDiv.appendChild(editButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'col-1 border border-dark';
        deleteButton.innerText = "Delete";
        deleteButton.onclick = delete_order;
        deleteButton.setAttribute('data-order-id', order.id);
        orderDiv.appendChild(deleteButton);

        container.appendChild(orderDiv);
    });
    table_div.appendChild(container);
    waiting = false;
}

function edit_order() {
    // Find the clicked button
    const clickedButton = event.target;

    // Extract the order ID from the data attribute
    const orderId = clickedButton.dataset.orderId;

    // Construct the URL with the order ID
    const editUrl = `/edit_order/${orderId}/`;  // Modify the URL structure based on your Django app

    // Redirect to the new page
    window.location.href = editUrl;
}

function delete_order() {
    // Find the clicked button
    const clickedButton = event.target;

    // Extract the order ID from the data attribute
    const order_id = clickedButton.dataset.orderId;

    // make a post request to get new time range// make a post request to get new time range
    // Serialize to JSON
    var user_id = document.querySelector('#user-id').innerHTML;
    var jsonData = JSON.stringify({'user_id':user_id,'order_id': order_id});
    // make a post request to place_order
    fetch('/delete_order/', {
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
    
    currId = 0;
    try{
        currId = parseInt(document.getElementById("order-list").children[1].children[0].children[0].innerHTML.substring(1))
    }
    catch{
        
    }
    
    setTimeout(function() {
        var jsonData = JSON.stringify({'go_to_id':currId});
    
        fetch('/new_order_history/', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',  
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: jsonData, 
        })
        .then(response => response.json())
        .then(data => {
            orders = data['orders']
            load_orders((orders))
        })
        .catch(error => {
        console.error('Error:', error);
        });
    }, 0);
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

function formatDateString(dateString) {
    const date = new Date(dateString);

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    const formattedDate = date.toLocaleTimeString('en-US', options);
    return formattedDate;
}