

// inFocus and outOfFocus used in menu bar to display corresponding category divs
function inFocus() {
    const items = document.querySelectorAll(".item");
    items.forEach((item) => {
        item.style.display = "none"
    });

    let btn_name = this.textContent;
    const btn_div = document.getElementById(btn_name + "-report");
    btn_div.style.display = "";
    checkItemsDisplay();
}

function checkItemsDisplay() {
    const items = document.querySelectorAll(".item");
    let allHidden = true;

    items.forEach((item) => {
        if (item.style.display !== "none") {
            allHidden = false;
        }
    });

    const defaultDiv = document.getElementById("default-item");
    if (allHidden) {
        defaultDiv.style.display = ""; // Show default item
    } else {
        defaultDiv.style.display = "none"; // Show default item
    }
}

function time_update(){
    const startDateField = document.getElementById("start-date");
    const endDateField = document.getElementById("end-date");
    var jsonData = JSON.stringify({'start-date':startDateField.value,'end-date':endDateField.value});

    // make a post request to get new time range
    fetch('/new_excess_time/', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',  
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: jsonData, 
    })
    .then(response => response.json())
    .then(data => {
        excess_report = data['excess_report']
        const excess_div = document.getElementById("excess-report")
        for (var i = excess_div.children.length - 1; i > 0; i--) {
            excess_div.removeChild(excess_div.children[i]);
        }
        excess_report.forEach(function(item) {
            var divWrapper = document.createElement("div");
            divWrapper.id = "menu-item-wrapper-alerts"
        
            var heading = document.createElement("h5");
            heading.textContent = item.common_name;
        
            var paragraph = document.createElement("p");
            paragraph.textContent = "Only sold " + item.amount_sold + " out of " + item.total_inventory + " stock";
        
            // Append the created elements to the wrapper
            divWrapper.appendChild(heading);
            divWrapper.appendChild(paragraph);
        
            // Append the wrapper to the parent element
            excess_div.appendChild(divWrapper);
        });
        
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