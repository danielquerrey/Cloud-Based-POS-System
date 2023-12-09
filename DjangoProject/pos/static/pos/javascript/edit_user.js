function submit_edit() {
    const clickedButton = event.target;
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var userRole = document.getElementById("userRole").value;
    var edit_user_id = clickedButton.dataset.userId;
    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;
    var birthday = document.getElementById("birthday").value;
    console.log(birthday)
    var phone = document.getElementById("phone").value;
    var store = document.getElementById("store").value;
    var user_id = document.querySelector('#user-id').innerHTML;
    var jsonData = JSON.stringify({
        'user_id': user_id,
        'edit_user_id': edit_user_id, // Make sure you have a variable edit_user_id defined
        'selected_role': userRole, // Use the userRole variable instead of selected_role
        'username': username,
        'email': email,
        'firstname': firstname,
        'lastname': lastname,
        'birthday': birthday,
        'phone': phone,
        'store': store
    });
    // make a post request to place_order
    fetch('/submit_edit_user/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        window.location = `/users`
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

function delete_user() {
    // Find the clicked button
    const clickedButton = event.target;
    const deleted_user_id = clickedButton.dataset.userId;
    var user_id = document.querySelector('#user-id').innerHTML;
    var jsonData = JSON.stringify({'user_id':user_id,'deleted_user_id': deleted_user_id});
    // make a post request to place_order
    fetch('/delete_user/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        window.location = `/admin`
    })
    .catch(error => {
        console.error('Error:', error);
    });
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