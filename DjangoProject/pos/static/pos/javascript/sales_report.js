window.onload = function() {
    // run change category to be set to piadas when page loads
    changeCategory('piadas');
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

function updateGraph(item_id) {
    // Make an AJAX request to fetch the graph data for the selected item
    $.ajax({
        url: "/get_sales_graph/",  // Update the URL to match your Django URL pattern
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