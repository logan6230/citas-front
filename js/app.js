/**
 * Módulo principal del programa.
 * @module program
 */

import Table from "./table.js";
import FormEngine from "./form-engine.js";



/**
 * Inicializa el programa.
 * @async
 */
async function init(data) {
    console.log('click--->', data);
    try {
        await renderForm(data);
        // await renderTable(data);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Renderiza el formulario en el documento.
 * @async
 */
async function renderForm(formType) {


    const formEngine = new FormEngine();
    const formElement = await formEngine.render(formType);
    formulario.innerHTML = '';
    formulario.appendChild(formElement);

}

