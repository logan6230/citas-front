import {formatHead} from "./format.js";
/**
 * Clase que representa una tabla.
 */
class Table {

    /**
     * Crea una instancia de la clase Table.
     * @param {ApiDataFetcher} dataFetcher - Objeto que se encarga de obtener los datos de la tabla.
     * @param {ApiTableRenderer} tableRenderer - Objeto que se encarga de renderizar la tabla.
     */
    constructor(dataFetcher, tableRenderer) {
        this.dataFetcher = dataFetcher;
        this.tableRenderer = tableRenderer;
    }



    /**
     * Renderiza la tabla.
     * @param {string} tableType - Tipo de tabla a renderizar.
     * @param {string} idAddButton - ID del botón de agregar.
     * @returns {HTMLDivElement} - Elemento HTML que representa la tabla.
     */
    async renderTable(tableType, idAddButton) {

        const data = await this.dataFetcher.fetchData(tableType);
        const divTable = document.createElement("div");
        divTable.appendChild(this.createAddButton(idAddButton));
        divTable.appendChild(this.tableRenderer.createTable(data, idAddButton));
        return divTable;
    }

    /**
     * Crea el botón de agregar.
     * @param {string} idAddButton - ID del botón de agregar.
     * @returns {HTMLButtonElement} - Elemento HTML que representa el botón de agregar.
     */
    createAddButton(idAddButton) {
        const addButton = document.createElement("button");
        addButton.classList.add("btn", "btn-success", "mx-1", "w-25");
        addButton.setAttribute("id", `crear-${idAddButton}`);
        addButton.setAttribute("data-bs-toggle", "modal");
        addButton.setAttribute("data-bs-target", `#modal-${idAddButton}`);
        addButton.innerText = "Agregar";

        return addButton;
    }


}

/**
 * Clase que se encarga de obtener los datos de una API.
 */
class ApiDataFetcher {
    /**
     * Crea una instancia de la clase ApiDataFetcher.
     * @param {string} apiUrl - URL de la API.
     */
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    /**
     * Obtiene los datos de la API.
     * @param {string} tableType - Tipo de tabla a obtener.
     * @returns {Promise<Array>} - Promesa que resuelve en un array con los datos de la tabla.
     * @throws {Error} - Si hay un error al obtener los datos de la API.
     */
    async fetchData(tableType) {
        const response = await fetch(`${this.apiUrl}/${tableType}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
}

/**
 * Clase que se encarga de renderizar una tabla.
 */
class ApiTableRenderer {
    /**
     * Crea una instancia de la clase ApiTableRenderer.
     */
    constructor() { }

    /**
     * Crea la tabla.
     * @param {Array} data - Datos de la tabla.
     * @returns {HTMLTableElement} - Elemento HTML que representa la tabla.
     */
    createTable(data, idElements) {
        const tableHtml = document.createElement("table");
        tableHtml.classList.add(
            "mt-3",
            "table",
            "table-striped",
            "table-bordered",
            "table-hover"
        );
        tableHtml.appendChild(this.createTableHeader(data[0], idElements));
        tableHtml.appendChild(this.createTableBody(data, idElements));
        return tableHtml;
    }

    /**
     * Crea el encabezado de la tabla.
     * @param {Object} data - Datos de la tabla.
     * @returns {HTMLTableSectionElement} - Elemento HTML que representa el encabezado de la tabla.
     */
    createTableHeader(data, idElements) {

        let datos = data;
        if (idElements === "Cita") {
            datos = this.desestructurarObjeto(data)
        }

        const headerRow = document.createElement("tr");
        for (const key in datos) {

            const formattedHeader = formatHead(key);
            const headerCell = document.createElement("th");
            headerCell.classList.add("text-center");
            headerCell.innerText = formattedHeader;
            headerRow.appendChild(headerCell);
        }
        const buttonHeader = document.createElement("th");
        buttonHeader.classList.add("text-center");
        buttonHeader.innerText = "Acciones";
        headerRow.appendChild(buttonHeader);
        const thead = document.createElement("thead");
        thead.appendChild(headerRow);
        return thead;
    }

    /**
     * Crea el cuerpo de la tabla.
     * @param {Array} data - Datos de la tabla.
     * @returns {HTMLTableSectionElement} - Elemento HTML que representa el cuerpo de la tabla.
     */
    createTableBody(data, idElements) {
        let datos = data;
        if (idElements === "Cita") {
            datos = data.flatMap((cita) => {
                const { idCita, fechaCita, Paciente, Medico: { nombre, Especialidad } } = cita;
                return { idCita, fechaCita, Paciente, nombre, Especialidad };
            }
            );
        }
        const tbody = document.createElement("tbody");
        let btnValue = 0;
        for (const obj of datos) {

            const row = document.createElement("tr");

            for (const [key, value] of Object.entries(obj)) {
                let cellValue = value;

                if (typeof value === "object") {
                    cellValue = cellValue.nombre;
                }
                if (typeof value === "string") {
                    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
                    if (isoDateRegex.test(value)) {
                        const options = { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' };
                        const date = new Date(value.replace('Z', ''));
                        cellValue = date.toLocaleDateString('es-ES', options);
                    }
                }
                const cell = document.createElement("td");
                cell.innerText = cellValue;
                cell.classList.add(key);
                row.appendChild(cell);
            }

            if (idElements === 'Paciente') {
                btnValue = obj.cedula;
            }
            if (idElements === 'Medico') {
                btnValue = obj.tarjetaProfesional;
            }
            row.appendChild(this.createButtonCell(idElements, btnValue));
            tbody.appendChild(row);
        }
        return tbody;
    }

    /**
  * Desestructura un objeto anidado en un solo nivel.
  * @param {object} objeto - El objeto que se desea desestructurar.
  * @returns {object} - El objeto desestructurado en un solo nivel.
  */
    desestructurarObjeto(objeto) {
        const objetoDesestructurado = {};

        /**
         * Función recursiva para desestructurar un objeto anidado.
         * @param {object} obj - El objeto que se está desestructurando en el momento.
         * @param {string} prefix - El prefijo opcional para las propiedades anidadas.
         */
        function desestructurar(obj, prefix = '') {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    desestructurar(obj[key], `${key} `);
                } else {

                    objetoDesestructurado[`${prefix}${key}`] = obj[key];
                }
            }
        }

        desestructurar(objeto);
        return objetoDesestructurado;
    }



    /**
     * Crea la celda de botones.
     * @param {number} id - ID del objeto.
     * @returns {HTMLTableCellElement} - Elemento HTML que representa la celda de botones.
     */
    createButtonCell(id, value) {
        const classBtn = id.toLowerCase();
        const editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-warning", "mx-1", `editar-${classBtn}`);
        editButton.setAttribute("id", `editar-${id}`);
        editButton.innerText = "Editar";
        editButton.setAttribute("data-bs-toggle", "modal");
        editButton.setAttribute("data-bs-target", `#modal-${id}`);
        editButton.setAttribute("value", value);
        editButton.innerText = "Editar";

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger", "mx-1", `eliminar-${classBtn}`);
        deleteButton.innerText = "Eliminar";
        deleteButton.setAttribute("value", value);
        deleteButton.setAttribute("id", `eliminar-${id}`);
        const buttonCell = document.createElement("td");
        buttonCell.classList.add("text-center");
        buttonCell.appendChild(editButton);
        buttonCell.appendChild(deleteButton);
        return buttonCell;
    }
}

export { Table, ApiDataFetcher, ApiTableRenderer };