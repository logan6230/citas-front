import { Table, ApiDataFetcher, ApiTableRenderer } from "./table.js";
import FormEngine from "./form-engine.js";
import { alert } from "./format.js";

/**
 * Obtiene el elemento HTML que contiene la tabla de pacientes.
 * @type {HTMLElement}
 */
const getType = document.getElementById('citas');
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
    const addIdButton = 'Cita';
    const tableRenderer = new ApiTableRenderer();
    const table = new Table(dataFetcher, tableRenderer);
    // Renderizar la tabla
    const tableElement = await table.renderTable(tableType, addIdButton);

    getType.appendChild(tableElement);

    const getBtnCrear = document.getElementById('crear-Cita');

    if (document.getElementById('editar-Cita')) {
        const getBtnEliminar = document.getElementById('eliminar-Cita');
        const getBtnEditar = document.getElementById('editar-Cita');
        captureEditButton(getBtnEditar.id)
        captureDeleteButton(getBtnEliminar.id);
    }


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
        const btnCreaEdita = document.getElementById("btn-crear-cita");
        crearCita(btnCreaEdita)

    });
}
/**
 * Captura los botones "Editar" de la tabla de pacientes y crea event listeners para cada uno.
 * @param {string} buttonClass - La clase de los botones de edición.
 * @returns {void}
 */
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
            const btnCreaEdita = document.getElementById("btn-editar-cita");
            fillFormWithRowData(button);
            editCita(btnCreaEdita)
        });
    }
}

function captureDeleteButton(buttonClass) {
    const buttons = document.getElementsByClassName("eliminar-cita");
    for (const button of buttons) {
        button.addEventListener("click", handleDeletePatient)
    }

}
async function handleDeletePatient(event) {
    event.preventDefault();
    const button = event.target;
    const row = button.parentNode.parentNode;
    const rowData = {
        idCita: row.querySelector('.idCita').innerText,
    };
    deleteAppointment(rowData.idCita);
}
async function deleteAppointment(idCita) {
    console.log('idCita', idCita);
    const response = await fetch(`http://localhost:3000/cita/${idCita}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();

    if (data) {
        alert(`La cita ha sido eliminada con exito`, 'success')

        const table = document.getElementById("citas");
        table.innerHTML = "";
        //actualizar la tabla
        init("citas");
    }
    else {
        alert('La cita no ha sido eliminada!', 'danger')
    }

}


function fillFormWithRowData(button) {
    const row = button.parentNode.parentNode; // Obtener la fila actual
    const rowData = {
        idCita: row.querySelector('.idCita').innerText,
        fechaCita: row.querySelector('.fechaCita').innerText,
        pacienteCedula: row.querySelector('.Paciente').innerText,
        medicoTarjetaProfesional: row.querySelector('.nombre').innerText,
    };

    // Luego, puedes establecer los valores en los campos del formulario
    const idCitaInput = document.getElementById("idCita");
    idCitaInput.value = rowData.idCita;
    idCitaInput.disabled = true;

    // fechaCitaInput.value = rowData.fechaCita
    const fechaCitaInput = document.getElementById("fechaCita");
    // Formatear la fecha de nacimiento para que sea compatible con el input
    const fechaParts = rowData.fechaCita.split('/');
    const fechaCita = new Date(`${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`);
    const fechaFormateada = fechaCita.toISOString().split('T')[0];
    fechaCitaInput.value = fechaFormateada;

    const pacienteCedulaInput = document.getElementById("cedulaPaciente");
    const pacienteCedulaSeleccionado = [...pacienteCedulaInput.options].find(option => option.textContent.includes(rowData.pacienteCedula));
    if (pacienteCedulaSeleccionado) {
        pacienteCedulaSeleccionado.selected = true;
    }

    const medicoTarjetaProfesionalInput = document.getElementById("tarjetaProfesional");
    const medicoTarjetaProfesionalSeleccionado = [...medicoTarjetaProfesionalInput.options].find(option => option.textContent.includes(rowData.medicoTarjetaProfesional));
    if (medicoTarjetaProfesionalSeleccionado) {
        medicoTarjetaProfesionalSeleccionado.selected = true;
    }
}

function crearCita(btnCrear) {
    btnCrear.addEventListener("click", async (event) => {
        event.preventDefault();
        //Capturar los datos del formulario
        const form = document.getElementById("form-crear-cita");
        //capturar los datos del formulario

        const datos = {
            fechaCita: form.elements.fechaCita.value,
            pacienteCedula: form.elements.cedulaPaciente.value,
            medicoTarjetaProfesional: form.elements.tarjetaProfesional.value,

        };
        try {
            const response = await fetch(`http://localhost:3000/crearCita`, {
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
            const table = document.getElementById("citas");
            table.innerHTML = "";
            //actualizar la tabla
            init(getType.id);
        } catch (error) {
            console.error(error);
            throw new Error("Error al enviar los datos del formulario");
        }

    })
}

function editCita(btnEditar) {
    btnEditar.addEventListener("click", async (event) => {
        event.preventDefault();
        const form = document.getElementById("form-editar-cita");
        //capturar los datos del formulario
        const datos = {
            idCita: form.elements.idCita.value,
            fechaCita: form.elements.fechaCita.value,
            pacienteCedula: form.elements.cedulaPaciente.value,
            medicoTarjetaProfesional: form.elements.tarjetaProfesional.value,
        };
        try {
            const response = await fetch(`http://localhost:3000/actualizarCita`, {
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
            const table = document.getElementById("citas");
            table.innerHTML = "";
            //actualizar la tabla
            init("citas");
        } catch (error) {
            console.error(error);
        }
    })
}

function hideModal() {
    const modalElement = document.getElementById("modal-Cita");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
}


// Inicializar la tabla de pacientes
init(getType.id);