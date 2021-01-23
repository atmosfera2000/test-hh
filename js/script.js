// Server urls
const regionsUrl = "https://www.magistral-nn.ru/company/career/t1/test_case.php?cmd=get_regions";
const depsUrl = "https://www.magistral-nn.ru/company/career/t1/test_case.php?cmd=get_departments&region_id=";
const postUrl = "https://www.magistral-nn.ru/company/career/t1/test_case.php";

// Proxy url to add CORS header from the server
const proxyUrl = "https://cors-anywhere.herokuapp.com/";

// DOM - form groups (main loading stages)
const stage1 = document.getElementById("stage1");
const stage2 = document.getElementById("stage2");
const stage3 = document.getElementById("stage3");

// DOM - form and form fields
const elemForm = document.getElementById("recallForm");
const elemRegions = document.getElementById("regions");
const elemDepartments = document.getElementById("departments");
const elemPhone = document.getElementById("phone");

// DOM - alerts, spinner
const elemError     = document.getElementById("error");
const elemSuccess   = document.getElementById("success");
const elemSpinner   = document.getElementById("spinner");

/* 
    Stage 1. Load regions
                            */

loadingStage(stage1, elemSpinner, true);

loadJson(proxyUrl + regionsUrl)
    .then(obj => insertData(elemRegions, obj))
    .then(() => showStage(stage1, elemSpinner))
    .catch(error => showMessage(null, error));

/* 
    Stage 2. Load departments
                                */  

elemRegions.onchange = function() {

    let regionId = this.value;

    elemDepartments.options.length = 1;

    elemRegions.disabled = true;

    loadingStage(stage2, elemSpinner, true);

    loadJson(proxyUrl + depsUrl + regionId)
        .then(obj => insertData(elemDepartments, obj))
        .then(() => showStage(stage2, elemSpinner))
        .then(() =>  elemRegions.disabled = false)
        .catch(error => showMessage(null, error));    
};                            

/* 
    Stage 3. Send a phone number
                                    */  

elemDepartments.onchange = function() {
   showStage(stage3, null);
}; 

elemForm.onsubmit = function(event) {

    event.preventDefault();

    if (!isValidPhone(elemPhone.value)) {
        alert("Телефон введен неверно"); 
        return;       
    } 

    hideStages(elemForm, elemSpinner);

    sendData(proxyUrl + postUrl)
        .then((obj) => showMessage(obj, null))
        .catch((error) => showMessage(null, error));
    
};

/*
    Used functions
                    */
    
function loadingStage(stage, spinner, showStage = true) {

    if (stage.classList.contains("d-none")) {
        stage.classList.remove("d-none");
    }

    if (showStage) {
        stage.firstElementChild.classList.add("low-opacity");
    }
    else {
        stage.firstElementChild.classList.add("d-none");
    } 

    stage.classList.add("position-relative");
    stage.querySelector("select").disabled = true;
    stage.append(spinner);    
    spinner.classList.remove("d-none");        
}

function showStage(stage, spinner) {
    if (stage.classList.contains("d-none")) {
        stage.classList.remove("d-none");
    }

    if (stage.querySelector("select") !== null) {
        stage.querySelector("select").disabled = false;
    }
   
    stage.firstElementChild.classList.remove("low-opacity");

    if (spinner !== null) {
        spinner.classList.add("d-none");   
    }    
}

function insertData(elem, obj) {
    console.log(obj);

    if (obj.status != "ok") {
        throw new Error("Ошибка!");
    }

    if (obj.regions !== undefined) {
        let regions = obj.regions;        
        for (region of regions) {
            elem.options[elem.options.length] = new Option(region.name, region.id);
        }   
    }
    if (obj.departments !== undefined) {
        let deps = obj.departments; 
        for (id in deps) {
            elem.options[elem.options.length] = new Option(deps[id], id);
        }
    } 
}

function loadJson(url) {
    return fetch(url)
        .then(response => {

            console.log(response.status);

            if (response.status === 500) {
                return loadJson(url);
            }

            return response.json();
        });
}

function sendData(url) {
    return fetch(url, {
        method: "POST",
        body: new FormData(recallForm)
    })
    .then(response => {

        console.log(response.status);

        if (response.status === 500) {
            return sendData(url);
        }

        return response.json();
    });
}

function isValidPhone(phone) {    
    return /^(\s*)?(\+)?([-()\s]?\d[-()\s]?){6,20}(\s*)?$/.test(phone); 
} 

function hideStages(elemForm, spinner) {
    for (let elem of elemForm.children) {
        elem.classList.add("d-none");
    }
    if (!elemForm.classList.contains("position-relative")) {
        elemForm.classList.add("position-relative");
    }
    if (spinner.classList.contains("d-none")) {
        spinner.classList.remove("d-none");
    }
    elemForm.append(spinner);   
}

function showMessage(obj, error) {

    elemForm.classList.add("d-none");

    if (obj !== null) {

        console.log(obj);

        if (obj.status != "ok") {
            elemError.classList.remove("d-none");
        } else {
            elemSuccess.classList.remove("d-none");
        }  
        
    }    
    
    if (error !== null) {
        console.log(obj);
        elemError.classList.remove("d-none");
    }    
}





