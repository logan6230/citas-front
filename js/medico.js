import { Table, ApiDataFetcher, ApiTableRenderer } from "./table.js";
import FormEngine from "./form-engine.js";
import { alert } from "./format.js";

/**
 * Obtiene el elemento HTML que contiene la tabla de médicos.
 * @type {HTMLElement}
 */
const getType = document.getElementById('medicos');

/**
 * Inicializa la tabla de médicos.
 * @async
 * @param {string} data - El ID del elemento HTML que contiene la tabla de médicos.
 * @returns {Promise<void>}
 */
async function init(data) {
    try {
        await renderTable(data);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Renderiza la tabla de médicos en el documento.
 * @async
 * @param {string} tableType - El tipo de tabla que se va a renderizar.
 * @returns {Promise<void>}
 */
async function renderTable(tableType) {
    // Configuración de la API
    const apiUrl = "http://localhost:3000";
    const dataFetcher = new ApiDataFetcher(apiUrl);

    // Configuración de la tabla
    const addIdButton = 'Medico';
    const tableRenderer = new ApiTableRenderer();
    const table = new Table(dataFetcher, tableRenderer);

    // Renderizar la tabla
    const tableElement = await table.renderTable(tableType, addIdButton);
    getType.appendChild(tableElement);

    if (document.getElementById('editar-Medico')) {
        const getBtnEditar = document.getElementById('editar-Medico');
        const getBtnEliminar = document.getElementById('eliminar-Medico');
        captureEditButton(getBtnEditar.id)
        captureDeleteButton(getBtnEliminar.id);
    }
    const getBtnCrear = document.getElementById('crear-Medico');
    captureCreateButton(getBtnCrear);

}

/**
 * Captura el botón "Crear" de la tabla de pacientes y crea un event listener.
 * @param {string} buttonId - El ID del botón que se va a capturar.
 * @returns {void}
 */
function captureCreateButton(buttonId) {

    buttonId.addEventListener("click", async (event) => {
        event.preventDefault();

        const formEngine = new FormEngine();
        const form = await formEngine.render(buttonId.id);
        const modalBody = document.getElementById("modal-body");
        modalBody.innerHTML = "";
        modalBody.appendChild(form);
        const btnCreaEdita = document.getElementById("btn-crear-medico");
        createDoctor(btnCreaEdita)

    });
}

function createDoctor(btnCrear) {
    btnCrear.addEventListener("click", async (event) => {
        event.preventDefault();
        //Capturar los datos del formulario
        const form = document.getElementById("form-crear-medico");
        //capturar los datos del formulario    

        const datos = {
            tarjetaProfesional: form.elements.tarjetaProfesional.value,
            nombre: form.elements.nombre.value,
            apellido: form.elements.apellido.value,
            consultorio: form.elements.consultorio.value,
            telefono: form.elements.telefono.value,
            email: form.elements.email.value,
            idEspecialidad: form.elements.idEspecialidad.value,
        };

        try {
            const response = await fetch(`http://localhost:3000/crearMedico`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const result = await response.json();

            //cerrar el modal
            hideModal();

            //limpiar el formulario
            form.reset();

            //limpiar la tabla
            const table = document.getElementById("medicos");
            table.innerHTML = "";
            //actualizar la tabla
            init(getType.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error al enviar los datos del formulario");
        }
    })
}

function captureEditButton(buttonClass) {

    //convertir a minuscula buttonClass
    let btnClass = buttonClass.toLowerCase();
    const buttons = document.getElementsByClassName(btnClass);

    for (const button of buttons) {

        button.addEventListener("click", async (event) => {
            event.preventDefault();
            const buttonId = button.id;
            const formEngine = new FormEngine();
            const form = await formEngine.render(buttonId);
            const modalBody = document.getElementById("modal-body");
            modalBody.innerHTML = "";
            modalBody.appendChild(form);
            const btnCreaEdita = document.getElementById("btn-editar-medico");
            fillFormWithRowData(button);
            editDoctor(btnCreaEdita)
        });
    }
}
function fillFormWithRowData(button) {

    const row = button.parentNode.parentNode; // Obtener la fila actual

    const rowData = {
        tarjetaProfesional: row.querySelector('.tarjetaProfesional').innerText,
        nombre: row.querySelector('.nombre').innerText,
        apellido: row.querySelector('.apellido').innerText,
        consultorio: row.querySelector('.consultorio').innerText,
        telefono: row.querySelector('.telefono').innerText,
        email: row.querySelector('.email').innerText,
        idEspecialidad: row.querySelector('.Especialidad').innerText,
    };
    // Luego, puedes establecer los valores en los campos del formulario
    const tarjetaProfesionalInput = document.getElementById("tarjetaProfesional");
    tarjetaProfesionalInput.value = rowData.tarjetaProfesional
    tarjetaProfesionalInput.disabled = true;
    const nombreInput = document.getElementById("nombre");
    nombreInput.value = rowData.nombre;
    const apellidoInput = document.getElementById("apellido");
    apellidoInput.value = rowData.apellido;
    const consultorioInput = document.getElementById("consultorio");
    consultorioInput.value = rowData.consultorio;
    const telefonoInput = document.getElementById("telefono");
    telefonoInput.value = rowData.telefono;
    const emailInput = document.getElementById("email");
    emailInput.value = rowData.email;
    const idEspecialidadInput = document.getElementById("idEspecialidad");
    // Recorre las opciones dentro del select
    const opcionSeleccionada = [...idEspecialidadInput.options].find(option => option.textContent === rowData.idEspecialidad);
    if (opcionSeleccionada) {
        opcionSeleccionada.selected = true;
    }
}

function editDoctor(btnEditar) {
    btnEditar.addEventListener("click", async (event) => {
        event.preventDefault();
        const form = document.getElementById("form-editar-medico");
        //capturar los datos del formulario
        const datos = {
            tarjetaProfesional: form.elements.tarjetaProfesional.value,
            nombre: form.elements.nombre.value,
            apellido: form.elements.apellido.value,
            consultorio: form.elements.consultorio.value,
            telefono: form.elements.telefono.value,
            email: form.elements.email.value,
            IdEspecialidad: form.elements.idEspecialidad.value,
        };
        try {
            const response = await fetch(`http://localhost:3000/actualizarMedico`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const result = await response.json();

            //cerrar el modal
            hideModal();

            //limpiar el formulario
            form.reset();

            //limpiar la tabla
            const table = document.getElementById("medicos");
            table.innerHTML = "";
            //actualizar la tabla
            init("medicos");
        } catch (error) {
            console.error(error);
        }
    })
}

function captureDeleteButton(buttonClass) {
    const buttons = document.getElementsByClassName("eliminar-medico");
    for (const button of buttons) {
        button.addEventListener("click", handleDeleteCodctor)
    }

}

async function handleDeleteCodctor(event) {
    event.preventDefault();
    const button = event.target;
    const row = button.parentNode.parentNode;
    const tarjetaProfesional = row.querySelector('.tarjetaProfesional').innerText;
    try {
        const response = await fetch(`http://localhost:3000/medico/${tarjetaProfesional}`, {
            method: "DELETE",
        });
        const result = await response.json();
        alert(`Medico ${result.nombre} ${result.apellido} eliminado con exito!`, 'success')
        //limpiar la tabla
        const table = document.getElementById("medicos");
        table.innerHTML = "";
        //actualizar la tabla
        init("medicos");
    } catch (error) {
        alert('La cita no ha sido eliminada!', 'danger')
    }

}
function hideModal() {
    const modalElement = document.getElementById("modal-Medico");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
}

// Inicializar la tabla de médicos
init(getType.id);