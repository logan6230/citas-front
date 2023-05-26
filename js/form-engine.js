import {formatHead} from "./format.js";

/**
 * Interfaz para el motor de formularios.
 * @interface
 */
class IFormEngine {
    /**
     * Renderiza el formulario en el documento.
     * @async
     * @param {string} formType - El tipo de formulario a renderizar.
     * @returns {Promise<HTMLFormElement>} - Una promesa que se resuelve con el elemento HTML del formulario.
     */
    async render(formType) { }
}

/**
 * Clase que representa un motor de formularios que se encarga de renderizar un formulario
 * a partir de un objeto JSON obtenido de una API.
 * @extends IFormEngine
 */
class FormEngine extends IFormEngine {
    /**
     * Crea una instancia del motor de formularios.
     */
    constructor() {
        super();
    }

    /**
     * Renderiza el formulario en el documento.
     * @async
     * @param {string} formType - El tipo de formulario a renderizar.
     * @returns {Promise<HTMLFormElement>} - Una promesa que se resuelve con el elemento HTML del formulario.
     */
    async render(formType) {
        try {
            const idElements = formType.toLowerCase()
            const form = await this._fetchForm(this.eliminarPalabraAntesDelGuion(formType));

            const formHtml = document.createElement("form");
            formHtml.id = `form-${idElements}`;
            formHtml.classList.add("container", "my-2");

            for (const [key, value] of Object.entries(form.properties)) {
                const label = this._createLabel(formatHead(key));
                const input = this._createInput(key, value.type);
                input.type = this.hasDateVariable(key) ? "date" : input.type;

                if (/^id[a-z]*[A-Z]/.test(key) && formHtml.id === "form-crear-cita") {

                } else {
                    formHtml.appendChild(label);
                }

                if (this.isEspecialidad(key)) {
                    const especialidades = await this.fetchEspecialidades();
                    const select = document.createElement("select");
                    select.classList.add("form-select");
                    select.id = "idEspecialidad";
                    select.innerHTML = especialidades
                        .map(
                            (especialidad) =>
                                `<option value="${especialidad.idEspecialidad}">${especialidad.nombre}</option>`
                        )
                        .join("");
                    formHtml.appendChild(select);
                } else if (this.isMedico(key)) {
                    const especialidades = await this.fetchData('medicos');
                    const select = document.createElement("select");
                    select.classList.add("form-select");
                    select.id = "tarjetaProfesional";
                    select.innerHTML = especialidades
                        .map(
                            (medico) =>
                                `<option value="${medico.tarjetaProfesional}">${medico.nombre} ${medico.apellido}-${medico.Especialidad.nombre}</option>`
                        )
                        .join("");
                    formHtml.appendChild(select);

                } else if (this.isPaciente(key)) {
                    const especialidades = await this.fetchData('pacientes');
                    const select = document.createElement("select");
                    select.classList.add("form-select");
                    select.id = "cedulaPaciente";
                    select.innerHTML = especialidades
                        .map(
                            (paciente) =>
                                `<option value="${paciente.cedula}">${paciente.nombre} ${paciente.apellido}</option>`
                        )
                        .join("");
                    formHtml.appendChild(select);

                } else {
                    if (/^id[a-z]*[A-Z]/.test(key) && formHtml.id === "form-crear-cita") {

                    } else {
                        formHtml.appendChild(input);
                    }

                }
            }

            // const idInput = formHtml.querySelector('input[name="cedula"]');
            const button = this._createButton(this.eliminarPalabraDespuesDelGuion(idElements) === "editar" ? "Editar" : "Crear");
            //desabilitar el boton si los campos estan vacios
            if (this.eliminarPalabraDespuesDelGuion(idElements) !== "editar") {
                button.disabled = true;
                formHtml.addEventListener("input", (event) => {
                    const inputs = [...formHtml.querySelectorAll("input")];
                    const inputsEmpty = inputs.filter((input) => !input.value);
                    button.disabled = inputsEmpty.length > 0;
                });
            }


            button.id = `btn-${idElements}`;
            formHtml.appendChild(button);

            return formHtml;
        } catch (error) {
            console.error(error);
            throw new Error("Error al renderizar el formulario");
        }
    }
    _convertToSnakeCase(obj) {

        const snakeCaseObj = {};
        for (const [key, value] of Object.entries(obj)) {

            const snakeCaseKey = key.replace(/[A-Z]/g, (letter, index) => {

                return index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`;
            });

            snakeCaseObj[snakeCaseKey] = value;
        }
        return snakeCaseObj;
    }

    /**
     * Obtiene la lista de especialidades desde la API.
     * @async
     * @returns {Promise<Array>} - Una promesa que se resuelve con la lista de especialidades.
     */
    async fetchEspecialidades() {
        const response = await fetch("http://localhost:3000/especialidades", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }

    /**
 * Obtiene la lista desde la API.
 * @async
 * @returns {Promise<Array>} - Una promesa que se resuelve con la lista del dato que se pase.
 */
    async fetchData(dato) {
        const response = await fetch(`http://localhost:3000/${dato}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }

    /**
     * Obtiene el objeto JSON del formulario desde la API.
     * @async
     * @param {string} formType - El tipo de formulario a obtener.
     * @returns {Promise<Object>} - Una promesa que se resuelve con el objeto JSON del formulario.
     * @private
     */
    async _fetchForm(formType) {
        const response = await fetch(`http://localhost:3000/formulario/${formType}`);
        const form = await response.json();
        return form;
    }

    /**
     * Crea un elemento de etiqueta HTML para un campo de formulario.
     * @param {string} text - El texto de la etiqueta.
     * @returns {HTMLLabelElement} - El elemento de etiqueta HTML creado.
     * @private
     */
    _createLabel(text) {
        const label = document.createElement("label");
        label.classList.add("form-label");
        label.innerText = text;
        return label;
    }

    /**
     * Crea un elemento de entrada HTML para un campo de formulario.
     * @param {string} name - El nombre del campo.
     * @param {string} type - El tipo de campo.
     * @returns {HTMLInputElement} - El elemento de entrada HTML creado.
     * @private
     */
    _createInput(name, type) {
        const input = document.createElement("input");
        input.name = name;
        input.id = name;
        input.type = type === "integer" ? "number" : "text";
        input.classList.add("form-control");
        return input;
    }

    /**
     * Crea un botón HTML para enviar el formulario.
     * @param {string} text - El texto del botón.
     * @returns {HTMLButtonElement} - El botón HTML creado.
     * @private
     */
    _createButton(text) {
        const button = document.createElement("button");
        button.type = "submit";
        button.innerText = text;
        button.classList.add("btn", "btn-primary", "my-2");
        return button;
    }

    /**
     * Verifica si una variable tiene la palabra "fecha".
     * @param {string} variable - La variable a verificar.
     * @returns {boolean} - `true` si la variable contiene la palabra "fecha", `false` en caso contrario.
     */
    hasDateVariable(variable) {
        return typeof variable === "string" && variable.toLowerCase().includes("fecha");
    }

    /**
     * Verifica si una variable tiene la palabra "especialidad".
     * @param {string} data - La variable a verificar.
     * @returns {boolean} - `true` si la variable contiene la palabra "especialidad", `false` en caso contrario.
     */
    isEspecialidad(data) {
        return typeof data === "string" && (data.toLowerCase().includes("especialidad"));
    }
    /**
 * Verifica si una variable tiene la palabra "especialidad".
 * @param {string} data - La variable a verificar.
 * @returns {boolean} - `true` si la variable contiene la palabra "especialidad", `false` en caso contrario.
 */
    isMedico(data) {
        return typeof data === "string" && (data.toLowerCase().includes("medico"));
    }
    /**
* Verifica si una variable tiene la palabra "paciente".
* @param { string } data - La variable a verificar.
* @returns { boolean } - `true` si la variable contiene la palabra "especialidad", `false` en caso contrario.
*/
    isPaciente(data) {
        return typeof data === "string" && (data.toLowerCase().includes("paciente"));
    }

    /**
* Elimina una palabra antes de un guion, incluyendo el guion.
* @param {string} texto - El texto original.
* @returns {string} El texto modificado con la palabra despues del guion.
*/
    eliminarPalabraAntesDelGuion(texto) {
        const guionIndex = texto.indexOf("-");
        if (guionIndex !== -1) {
            return texto.substring(guionIndex + 1);
        }
        return texto;
    }
    /**
        * Elimina una palabra despues de un guion, incluyendo el guion.
        * @param {string} texto - El texto original.
        * @returns {string} El texto modificado sin la palabra despues del guion.
        */
    eliminarPalabraDespuesDelGuion(texto) {
        const guionIndex = texto.lastIndexOf("-");
        if (guionIndex !== -1) {
            return texto.substring(0, guionIndex);
        }
        return texto;
    }
}

export default FormEngine;