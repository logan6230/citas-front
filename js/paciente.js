import { Table, ApiDataFetcher, ApiTableRenderer } from "./table.js";
import FormEngine from "./form-engine.js";
import { alert } from "./format.js";

/**
 * Obtiene el elemento HTML que contiene la tabla de pacientes.
 * @type {HTMLElement}
 */
const getType = document.getElementById('pacientes');
// const modalBody = document.getElementById('modal-body');
/**
 * Inicializa la tabla de pacientes.
 * @async
 * @param {string} data - El ID del elemento HTML que contiene la tabla de pacientes.
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
 * Renderiza la tabla de pacientes en el documento.
 * @async
 * @param {string} tableType - El tipo de tabla que se va a renderizar.
 * @returns {Promise<void>}
 */
async function renderTable(tableType) {
    // Configuración de la API
    const apiUrl = "http://localhost:3000";
    const dataFetcher = new ApiDataFetcher(apiUrl);

    // Configuración de la tabla
    const addIdButton = 'Paciente';
    const tableRenderer = new ApiTableRenderer();
    const table = new Table(dataFetcher, tableRenderer);

    // Renderizar la tabla
    const tableElement = await table.renderTable(tableType, addIdButton);
    getType.appendChild(tableElement);

    if (document.getElementById('editar-Paciente')) {
        const getBtnEditar = document.getElementById('editar-Paciente');
        const getBtnEliminar = document.getElementById('eliminar-Paciente');
        captureEditButton(getBtnEditar.id)
        captureDeleteButton(getBtnEliminar.id);
    }
    const getBtnCrear = document.getElementById('crear-Paciente');

    captureCreateButton(getBtnCrear);
    // console.log('btn crear', getBtnCrear.id);

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
        const btnCreaEdita = document.getElementById("btn-crear-paciente");

        crearPaciente(btnCreaEdita)

    });
}
/**
 * Captura los botones "Editar" de la tabla de pacientes y crea event listeners para cada uno.
 * @param {string} buttonClass - La clase de los botones de edición.
 * @returns {void}
 */
function captureEditButton(buttonClass) {
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
            const btnCreaEdita = document.getElementById("btn-editar-paciente");
            fillFormWithRowData(button);
            editPatient(btnCreaEdita)
        });
    }
}

function captureDeleteButton(buttonClass) {
    const buttons = document.getElementsByClassName("eliminar-paciente");
    for (const button of buttons) {
        button.addEventListener("click", handleDeletePatient)
    }

}
async function handleDeletePatient(event) {
    event.preventDefault();
    const button = event.target;
    const row = button.parentNode.parentNode;
    const rowData = {
        cedula: row.querySelector('.cedula').innerText,
    };
    deletePatient(rowData.cedula);
}
async function deletePatient(idPatient) {
    const response = await fetch(`http://localhost:3000/eliminarPaciente/${idPatient}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();

    if (data) {
        alert(`Paciente ${data.nombre} ${data.apellido} eliminado con exito!`, 'success')
        //limpiar la tabla
        const table = document.getElementById("pacientes");
        table.innerHTML = "";
        //actualizar la tabla
        init("pacientes");
    }
    else {
        alert(`Paciente no pudo ser eliminadoo!`, 'danger')
    }

}


function fillFormWithRowData(button) {

    const row = button.parentNode.parentNode; // Obtener la fila actual
    const rowData = {
        cedula: row.querySelector('.cedula').innerText,
        nombre: row.querySelector('.nombre').innerText,
        apellido: row.querySelector('.apellido').innerText,
        fechaNacimiento: row.querySelector('.fechaNacimiento').innerText,
        telefono: row.querySelector('.telefono').innerText,
    };

    // Luego, puedes establecer los valores en los campos del formulario
    const cedulaInput = document.getElementById("cedula");
    cedulaInput.value = rowData.cedula;
    cedulaInput.disabled = true;
    const nombreInput = document.getElementById("nombre");
    nombreInput.value = rowData.nombre;
    const apellidoInput = document.getElementById("apellido");
    apellidoInput.value = rowData.apellido;
    const fechaNacimientoInput = document.getElementById("fechaNacimiento");
    // Formatear la fecha de nacimiento para que sea compatible con el input
    const fechaParts = rowData.fechaNacimiento.split('/');
    const fechaNacimiento = new Date(`${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`);
    const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
    fechaNacimientoInput.value = fechaFormateada;
    const telefonoInput = document.getElementById("telefono");
    telefonoInput.value = rowData.telefono;
}


function crearPaciente(btnCrear) {
    btnCrear.addEventListener("click", async (event) => {
        event.preventDefault();
        //Capturar los datos del formulario
        const form = document.getElementById("form-crear-paciente");
        //capturar los datos del formulario

        const datos = {
            cedula: form.elements.cedula.value,
            nombre: form.elements.nombre.value,
            apellido: form.elements.apellido.value,
            fechaNacimiento: form.elements.fechaNacimiento.value,
            telefono: form.elements.telefono.value,
        };
        try {
            const response = await fetch(`http://localhost:3000/crearPaciente`, {
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
            const table = document.getElementById("pacientes");
            table.innerHTML = "";
            //actualizar la tabla
            init(getType.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error al enviar los datos del formulario");
        }

    })
}

function editPatient(btnEditar) {
    btnEditar.addEventListener("click", async (event) => {
        event.preventDefault();
        const form = document.getElementById("form-editar-paciente");
        //capturar los datos del formulario
        const datos = {
            cedula: form.elements.cedula.value,
            nombre: form.elements.nombre.value,
            apellido: form.elements.apellido.value,
            fechaNacimiento: form.elements.fechaNacimiento.value,
            telefono: form.elements.telefono.value,
        };
        try {
            const response = await fetch(`http://localhost:3000/actualizarPaciente`, {
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
            const table = document.getElementById("pacientes");
            table.innerHTML = "";
            //actualizar la tabla
            init("pacientes");
        } catch (error) {
            console.error(error);
        }
    })
}

function hideModal() {
    const modalElement = document.getElementById("modal-Paciente");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
}


// Inicializar la tabla de pacientes
init(getType.id);