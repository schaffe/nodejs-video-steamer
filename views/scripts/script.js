"use strict";

const load = (id, event) => {
    event.preventDefault();
    fetch('/load/' + id).then((response) => {
        console.log(response.json());
        return response;
    }).then(() => {
        location.reload()
    });

    const element = document.getElementById("elem-" + id);
    const spinner = document.createElement("div");
    spinner.className = "loader";
    element.appendChild(spinner);
};