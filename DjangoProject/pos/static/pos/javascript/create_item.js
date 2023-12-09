item_id = -1
document.addEventListener("DOMContentLoaded", function() {
    // Access the order items JSON from the data attribute
    try{
        item_id = parseInt(document.getElementById('item-id').innerHTML);
    }
    catch{

    }
})
function addItem() {
    // Get values from the first section
    var commonName = document.getElementById('commonName').value;
    var price = document.getElementById('price').value;
    var description = document.getElementById('description').value;

    // Get the selected category
    var selectedCategory = document.querySelector('input[name="category"]:checked');
    var category = selectedCategory ? selectedCategory.value : null;

    // Get selected ingredients
    var selectedIngredients = document.querySelectorAll('.ingredient-checkbox:checked');
    var ingredients = Array.from(selectedIngredients).map(function (checkbox) {
        return checkbox.value;
    });
    console.log(ingredients)

    // Check if all required fields are filled
    if (!commonName || !price || !description || !category || ingredients.length === 0) {
        alert('Please fill in all required fields.');
        return;
    }

    // Prepare data to send to the server
    var data = {
        name: commonName,
        price: price,
        description: description,
        category: category,
        ingredient_ids: ingredients,
        id: item_id
    };

    // Make a POST request to the Django server
    fetch('/create_item_submit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if needed
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if(item_id == -1){
            clearForm();
        }
        else{
            // Construct the URL with the order ID
            const editUrl = `/manager/`;  // Modify the URL structure based on your Django app

            // Redirect to the new page
            window.location.href = editUrl;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors as needed
    });
}

// Function to clear the form
function clearForm() {
    document.getElementById('commonName').value = '';
    document.getElementById('price').value = '';
    document.getElementById('description').value = '';
    
    // Uncheck radio buttons
    var categoryRadios = document.querySelectorAll('.category-radio');
    categoryRadios.forEach(function(radio) {
        radio.checked = false;
    });

    // Uncheck checkboxes
    var ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox');
    ingredientCheckboxes.forEach(function(checkbox) {
        checkbox.checked = false;
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