let input = document.getElementById("input");
let text = document.querySelector(".text");

function myfunc(){
    if(input.value == ""){
        alert("Please enter a task");
    }else{
        let newElement = document.createElement("ul");
        newElement.innerHTML = `${input.value} <i class="fa-solid fa-trash"></i>`;
        text.prepend(newElement);
        input.value = "";
        newElement.querySelector("i").addEventListener("click", ()=>{
            newElement.remove();
        })
    }
}