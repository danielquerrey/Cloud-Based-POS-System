function edit_user() {
    // Find the clicked button
    const clickedButton = event.target;

    // Extract the order ID from the data attribute
    const userId = clickedButton.dataset.userId;

    // Construct the URL with the order ID
    const editUrl = `/edit_user/${userId}/`;  // Modify the URL structure based on your Django app

    // Redirect to the new page
    window.location.href = editUrl;
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
        window.location = `/admin_landing`
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