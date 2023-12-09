function activateCartListener() {
    let page = document.querySelector("#page-container");
    let user_cart = document.getElementById("checkout-btn");
    user_cart.addEventListener("click", () => {
        if (page.classList.contains("active")) {
            console.log("removed active");
            page.classList.remove("active");
        } else {
            page.classList.add("active");
            console.log("added active");
        }
    });
}



activateCartListener();