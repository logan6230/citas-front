/**
 * Convierte un encabezado en un formato legible por humanos.
 * @param {string} header - El encabezado a formatear.
 * @returns {string} - El encabezado formateado.
 */
export function formatHead(header) {
    /**
     * Convertimos el texto en un array de palabras.
     * @type {Array<string>}
     */
    const words = header.split(/(?=[A-Z])/);

    // Removemos el prefijo "id" si está presente
    if (words[0] === 'Id' || words[0] === 'id') {
        words.shift();
    }

    /**
     * Unimos las palabras con un espacio y las hacemos todas mayúsculas.
     * @type {string}
     */
    const formattedHeader = words.join(' ').toLowerCase();

    /**
     * Convertimos la primera letra de cada palabra a mayúscula (formato Camel Case).
     * @type {string}
     */
    const camelCaseHeader = formattedHeader.replace(/(^|\s)\S/g, (l) => l.toUpperCase());

    return camelCaseHeader;
}
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
export const alert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}




