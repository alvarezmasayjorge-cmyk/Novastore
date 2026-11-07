# NØVA — tienda juvenil
Proyecto académico realizado con HTML, CSS y JavaScript puro. Sin frameworks ni instalación de dependencias.

## Vista local
Desde esta carpeta ejecuta `python3 -m http.server 8080 --directory dist` y abre http://localhost:8080. Es necesario usar un servidor porque el catálogo se solicita con `fetch`; no abrir index.html con doble clic.

## Archivos
- dist/index.html: estructura semántica y formulario.
- dist/styles.css: diseño adaptable y animaciones.
- dist/app.js: catálogo, filtros, carrito y validación.
- dist/products.json: colección de productos de ejemplo.

## Requisitos cubiertos
- DOM: generación dinámica de tarjetas y líneas del carrito.
- JSON: petición fetch a products.json y persistencia del carrito con JSON/localStorage.
- Eventos y listeners: click, input, change, submit y close con addEventListener.
- Colecciones: arrays, filter, map, find, sort, reduce y Set.
- Animaciones: franja en movimiento, entrada de tarjetas, apertura del carrito y zoom de imágenes. Respeta movimiento reducido.
- Formulario: nombre, correo, asunto y mensaje con validación nativa y JavaScript.
- Navegación: inicio, colección, marca y contacto; carrito accesible mediante dialog.

## Alcance
Marca ficticia, precios de ejemplo en bolivianos y fotografías de referencia de Unsplash (las variantes descritas no representan inventario real). Fuentes Google Fonts. Imágenes y fuentes necesitan conexión a internet. El carrito persiste en este navegador. La compra es simulada y el formulario no envía ni guarda mensajes. No hay pagos ni servidor de pedidos.

## GitHub Pages
Crea un repositorio y sube el contenido de dist a la raíz del repositorio (index.html, styles.css, app.js y products.json). Activa GitHub Pages para publicar esa raíz. También puedes conservar esta estructura y configurar una acción que publique dist.

La publicación privada de Sites, si está disponible, es independiente del repositorio de GitHub y no equivale a un enlace público para entregar al profesor.
