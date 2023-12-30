/* const apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTc4MzNhMWMwNTgzNTAwMTg1MjJlZGMiLCJpYXQiOjE3MDIzNzYzNTMsImV4cCI6MTcwMzU4NTk1M30.NBHFLlWuBf4UxZaXF5wOzKzkMFILSQ6UVVTc0SBsEfo'; */
const apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTc4MzNhMWMwNTgzNTAwMTg1MjJlZGMiLCJpYXQiOjE3MDM5NDc5NzMsImV4cCI6MTcwNTE1NzU3M30.xctoMiM3RPMY0brr9r0pHxkdE5my0y8KAt4fgZgtnvo';
const apiUri = 'https://striveschool-api.herokuapp.com/api/product';

/* inizializzo la variabile products come un array vuoto, 
conterrà tutti i prodotti */
let products = [];

/* inizializzo la variabile productDetail come un oggetto vuoto, 
conterrà i dettagli del singolo prodotto */
let productDetail = {};

/* inizializzo la variabile selectedProductId come un valore nullo,
conterrà l'id nelle funzioni che richiedono di identificare un singolo prodotto */
let selectedProductId = null;

/* al caricamento del dom, esegue le istruzioni in base alla pagina in cui si trova */
document.addEventListener('DOMContentLoaded', () => {

    if (location.href.includes("back-office.html")) {
        document.querySelector('#prod-modal').addEventListener('submit', (e) => {
            e.preventDefault();

            /* crea un oggetto FormData dai dati del modulo */
            const formData = new FormData(e.target);

            /* prendo i valori dai campi del form, tolgo eventuali spazi all'inizio e alla fine */
            const brand = formData.get('brand').trim();
            const name = formData.get('name').trim();
            const description = formData.get('description').trim();
            const imageUrl = formData.get('imageUrl').trim();
            const price = formData.get('price').trim();

            if (!validateTextInput(brand, 2) || !validateTextInput(name, 2) || !validateTextInput(description, 2) || !validatePrice(price)) {
                alert('Make sure you enter at least 2 characters for the first 4 fields and a valid price for the "Price" field.');
                return;
            }

            const data = {
                brand,
                name,
                description,
                imageUrl,
                price: parseFloat(price)
            };

            if (selectedProductId) {
                /* se è definito, effettua una chiamata di aggiornamento */
                updateData(selectedProductId, data);
            } else {
                /* altrimenti, effettua una chiamata di creazione */
                createData(data);
            }

            const modalCloseButton = document.querySelector('#exampleModal button[data-bs-dismiss="modal"]');

            /* simula il click sul pulsante di chiusura della modale */
            modalCloseButton.click();

            /* invoca la funzione per ottenere i dati aggiornati */
            readData();

            /* resetta l'id del prodotto selezionato */
            selectedProductId = null;
        });

        /* invoca la funzione per ottenere i dati all'inizio */
        readData();

    } else if (location.href.includes("index.html")) {
        readData();
    }

    else if (location.href.includes("product-detail.html")) {

        let url = new URL(location.href);

        let id = url.searchParams.get('id');

        readDataById(id);
    }
})

/* funzione di validazione per la lunghezza minima del campo */
function validateTextInput(value, minLength) {
    return value.length >= minLength;
}

/* funzione di validazione per il prezzo */
function validatePrice(value) {
    /* il prezzo deve essere un numero positivo */
    const priceRegex = /^\d+(\.\d+)?$/;
    const isValid = priceRegex.test(value) && parseFloat(value) >= 0;
    return isValid;
}

/* funzione per ottenere i dati dall'api */
function readData() {
    fetch(apiUri, {
        headers: {
            "Authorization": apiKey
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            products = json;        // aggiorna l'array dei prodotti con i dati ottenuti
            render();               // invoca la funzione per visualizzare i dati
            //clear()
        })
        .catch(error => console.log(error))
}

/* funzione per eliminare tutti i dati con un ciclo for of tramite la funzione deleteData */
function clear() {
    for (const product of products) {
        deleteData(product._id)
    }
}

/* funzione per eliminare un dato specifico */
function deleteData(id) {
    fetch(apiUri + "/" + id, {
        method: 'DELETE',
        headers: {
            "Authorization": apiKey
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log('deleted');

            /* rimuove il prodotto dall'array products */
            products = products.filter(prod => prod._id !== id);

            /* aggiorna la tabella */
            render();
        })
        .catch(error => console.log(error))
}

/* funzione per creare nuovi dati */
function createData(data) {
    console.log(data);
    fetch(apiUri, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log('created');
        })
        .catch(error => console.log(error))
}

/* funzione per creare le righe della tabella nel back office */
function createRow(brand, name, description, image, price, id) {
    return `
    <tr class="align-items-center">
        <td>${brand}</td>
        <td>${name}</td>
        <td>${description}</td>
        <td><img src="${image}" class="img-back-office"></td>
        <td>$ ${price}</td>
        <td>
            <button type="button" onclick="openModal('${id}')" class="btn btn-outline-warning m-1"><i class="bi bi-pencil-square"></i></button>
            <button type="button" onclick="deleteProduct('${id}')" class="btn btn-outline-danger m-1"><i class="bi bi-x-square"></i></button>
        </td>
    </tr>`;
}

/* funzione per visualizzare i dati */
function render() {

    /* nella tabella del back office */
    let rowContainer = document.querySelector('#rowContainer');
    if (rowContainer) {
        let row = products.map(prod =>
            createRow(prod.brand, prod.name, prod.description, prod.imageUrl, prod.price, prod._id));
        rowContainer.innerHTML = row.join('');
    }

    /* nelle card in homepage */
    let cardsContainer = document.querySelector('#cardsContainer')
    if (cardsContainer) {
        let card = products.map(prod =>
            createCard(prod.brand, prod.name, prod.description, prod.imageUrl, prod.price, prod._id));
        cardsContainer.innerHTML = card.join('');
    }

    /* nella pagina di dettaglio */
    let productContainer = document.querySelector('#productContainer');
    if (productContainer) {
        let details = createDetailPage(productDetail.brand, productDetail.name, productDetail.description, productDetail.imageUrl, productDetail.price);
        productContainer.innerHTML = details;
    }
}

/* chiamata per MODIFICARE dati api */
function updateData(id, data) {
    fetch(apiUri + "/" + id, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log('updated');
        })
        .catch(error => console.log(error))
}

/* funzione che apre la modale per aggiungere/modificare un prodotto */
function openModal(id) {

    /* condizione per la modifica del prodotto */
    if (id !== undefined && id !== null) {
        selectedProductId = id;
        const productToEdit = products.find(prod => prod._id === id);

        /* selettori per popolare la modale con i dati del prodotto da modificare */
        document.querySelector('#prod-modal input[name="brand"]').value = productToEdit.brand;
        document.querySelector('#prod-modal input[name="name"]').value = productToEdit.name;
        document.querySelector('#prod-modal input[name="description"]').value = productToEdit.description;
        document.querySelector('#prod-modal input[name="imageUrl"]').value = productToEdit.imageUrl;
        document.querySelector('#prod-modal input[name="price"]').value = productToEdit.price;
    } else {
        /* se l'id non è già definito, il prodotto è da aggiungere, 
        quindi apre la modale con i campi vuoti */
        resetForm()
    }

    /* visualizza la modale */
    const modal = new bootstrap.Modal(document.querySelector('#exampleModal'));
    modal.show();

}

/* funzione per resettare il form */
function resetForm() {
    /* selettori per pulire i campi della modale al click sul btn reset e dopo aver aggiunto un prodotto */
    document.querySelector('#prod-modal input[name="brand"]').value = '';
    document.querySelector('#prod-modal input[name="name"]').value = '';
    document.querySelector('#prod-modal input[name="description"]').value = '';
    document.querySelector('#prod-modal input[name="imageUrl"]').value = '';
    document.querySelector('#prod-modal input[name="price"]').value = '0.00';
}

/* funzione che chiede conferma per il reset del form */
function onResetForm() {
    const userConfirm = window.confirm("Are you sure you want to reset the form?");

    if (userConfirm) {
        /* se l'utente conferma, invoca la funzione resetForm */
        resetForm();
    } else {
        /* se l'utente annulla, non fare nulla */
        console.log("Reset cancelled.");
    }
}

/* funzione per gestire la cancellazione dei prodotti dall'api  */
function deleteProduct(id) {

    /* chiede conferma all'utente tramite un pop-up */
    const userConfirm = window.confirm("Are you sure you want to delete this product?");

    if (userConfirm) {
        /* se l'utente conferma, invoca la funzione deleteData per cancellare il prodotto */
        deleteData(id);
    } else {
        /* se l'utente annulla, non fare nulla */
        console.log("Deletion cancelled.");
    }
}

/* funzione per creare le card nella home */
function createCard(brand, name, description, image, price, id) {
    return `
    <div class="col-xl-3 col-lg-4 col-md-6">
        <div class="card mb-4 shadow-sm">
            <img src="${image}" class="card-img-top">
            <div class="card-body">
                <h6 class="card-text">${brand}</h6>
                <h5 class="card-title">${name}</h5>
                <p class="card-text">${truncateText(description, 100)}</p>
                <p class="card-text">$ ${price}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <a href="product-detail.html?id=${id}" class="btn btn-sm btn-outline-secondary w-50 me-1">
                        View
                    </a>
                    <button type="button" class="btn btn-sm btn-outline-secondary w-50 ms-1">
                        Buy
                    </button>
                </div>
            </div>
        </div>
    </div>`
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    } else {
        return text;
    }
}

/* funzione per leggere i dati tramite id,
serve per vedere la pagina di dettaglio del prodotto selezionato */
function readDataById(id) {
    fetch(apiUri + "/" + id, {
        headers: {
            "Authorization": apiKey
        }
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            productDetail = json;        // aggiorna l'array dei prodotti con i dati ottenuti
            render();                    // invoca la funzione per visualizzare i dati
        })
        .catch(error => console.log(error))
}

/* funzione per creare la pagina di dettaglio */
function createDetailPage(brand, name, description, image, price) {
    return `
    <img src="${image}" alt="${description}" class="img-detail">
    <div class="ms-5">
        <h2 class="fs-4">${brand}</h2>
        <h1>${name}</h1>
        <h3 class="fs-6 fw-normal">${description}</h3>
        <p>$ ${price}</p>
    </div>`
}

/* funzione per ordinare i prodotti */
function sortProducts(orderBy) {
    if (orderBy === 'name') {
        products.sort((a, b) => a.name.localeCompare(b.name))
    } else if (orderBy === 'price') {
        products.sort((a, b) => a.price - b.price)
    }

    render();
}