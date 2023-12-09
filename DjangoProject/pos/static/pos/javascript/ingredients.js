window.onload = function() {
    showNewIngredientForm();
};

function updateGraph(item_id) {
    // Make an AJAX request to fetch the graph data for the selected item
    $.ajax({
        url: "/get_stock_graph/",  // Update the URL to match your Django URL pattern
        method: "GET",
        data: { item_id: item_id },
        success: function(response) {
            // Update the graph container with the new graph
            $("#graph-container").html(response.graph_html);
        },
        error: function(error) {
            console.error("Error fetching graph data:", error);
        }
    });
}

function showStockUpdate(item_id, item_name, current_stock) {
    //update the graph
    updateGraph(item_id);
    // Create the input box with the current stock value
    var inputBoxHtml = `
        <label for="stock-input">Update Stock for ${item_name}:</label>
        <input type="number" id="stock-input" value="${current_stock}">
        <button onclick="updateStock('${item_id}')">Update</button>
        
        <br> <!-- Add a line break for better separation -->

        <!-- Delete button -->
        <button onclick="deleteIngredient('${item_id}')">Delete</button>

        <br>

        <button onclick="showNewIngredientForm()">Add new Ingredient</button>
        
        <!-- Feedback message placeholders -->
        <div id="update-message"></div>
        <div id="delete-message"></div>
    `;

    // Set the HTML of the "update-stock" div with the input box
    document.getElementById('update-stock').innerHTML = inputBoxHtml;
}

function updateStock(item_id) {
    // Get the new stock value from the input box
    var newStock = document.getElementById('stock-input').value;

    // Make an AJAX request to update the stock in the database
    $.ajax({
        url: "/update_stock/",  // Update the URL to match your Django URL pattern
        method: "POST",
        data: {
            item_id: item_id,
            new_stock: newStock,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function(response) {
            // Handle success
            console.log("Stock updated successfully");
            
            // Display feedback message
            document.getElementById('update-message').innerHTML = "Stock updated successfully.";

            location.reload();
        },
        error: function(error) {
            console.error("Error updating stock:", error);
            
            // Display error message
            document.getElementById('update-message').innerHTML = "Error updating stock. Please try again.";
        }
    });
}

function deleteIngredient(item_id) {
    // Make an AJAX request to delete the ingredient from the database
    $.ajax({
        url: "/delete_ingredient/",  // Update the URL to match your Django URL pattern
        method: "POST",
        data: {
            item_id: item_id,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function(response) {
            // Handle success
            console.log("Ingredient deleted successfully");
            
            // Display feedback message
            document.getElementById('delete-message').innerHTML = "Ingredient deleted successfully.";
            
            location.reload();

        },
        error: function(error) {
            console.error("Error deleting ingredient:", error);
            
            // Display error message
            document.getElementById('delete-message').innerHTML = "Error deleting ingredient. Please try again.";
        }
    });
}

function showNewIngredientForm() {
    // Create a form to add a new ingredient
    var newIngredientFormHtml = `
        <h1>Add a new Ingredient</h1>
        <form id="new-ingredient-form">
            <label for="ingredient-name">Ingredient Name:</label>
            <input type="text" id="ingredient-name" required>

            <label for="initial-stock">Initial Stock:</label>
            <input type="number" id="initial-stock" required>

            <button type="button" onclick="addNewIngredient()">Add Ingredient</button>
        </form>
        
        <!-- Feedback message placeholder for new ingredient -->
        <div id="new-ingredient-message"></div>
    `;

    // Set the HTML of the "update-stock" div with the new ingredient form
    document.getElementById('update-stock').innerHTML = newIngredientFormHtml;
}

function addNewIngredient() {
    // Get the values from the new ingredient form
    var ingredientName = document.getElementById('ingredient-name').value;
    var initialStock = document.getElementById('initial-stock').value;

    // Make an AJAX request to add the new ingredient to the database
    $.ajax({
        url: "/add_new_ingredient/",  // Update the URL to match your Django URL pattern
        method: "POST",
        data: {
            ingredient_name: ingredientName,
            initial_stock: initialStock,
            csrfmiddlewaretoken: '{{ csrf_token }}'
        },
        success: function(response) {
            // Handle success
            console.log("New ingredient added successfully");

            // Display feedback message
            document.getElementById('new-ingredient-message').innerHTML = "New ingredient added successfully.";

            location.reload();
            
        },
        error: function(error) {
            console.error("Error adding new ingredient:", error);

            // Display error message
            document.getElementById('new-ingredient-message').innerHTML = "Error adding new ingredient. Please try again.";
        }
    });
}