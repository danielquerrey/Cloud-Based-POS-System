window.onload = function() {
    // run change category to be set to piadas when page loads
    changeCategory('piadas');
};
var selected_item_id = -1
var selected_mode = -1

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

function deleteItem(itemID) {
    if(confirm("Are you sure you want to delete")) {
        //delete the item
        $.ajax({
            url: "/ajax_delete/",  // Update the URL to match your Django URL pattern
            method: "GET",
            data: { item_id: itemID },
            success: function(response) {
                // Update the graph container with the new graph
                location.reload();
            },
            error: function(error) {
                console.error("Error deleting item: ", error);
            }
        });
    }else {
        return false;
    }
}

function select_item(itemID){
    // Reset the style of previously selected item
    if (selected_item_id !== -1) {
        var previouslySelectedItem = document.querySelector('.item.selected');
        if (previouslySelectedItem) {
            previouslySelectedItem.classList.remove('selected');
        }
    }

    // Set the selected_item_id to the new itemID
    selected_item_id = itemID;

    // Add a class to highlight the selected item
    var selectedItem = document.querySelector('.item[value="' + itemID + '"]');
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
}

function select_delete(){
    selected_mode = 0
    if(selected_item_id != -1){
        deleteItem(selected_item_id)
        selected_item_id = -1
        selected_mode = -1
    }
}

function select_edit(){
    selected_mode = 1
    if(selected_item_id != -1){
        editItem(selected_item_id)
        selected_item_id = -1
        selected_mode = -1
    }
}

function editItem(itemID){
    // Construct the URL with the order ID
    const editUrl = `/edit_item/${itemID}/`; 

    // Redirect to the new page
    window.location.href = editUrl;
}