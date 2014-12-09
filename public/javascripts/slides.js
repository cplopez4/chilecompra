jQuery(document).ready(function($) {
    $('#slider').bjqs({
 
	// PARAMETROS OPCIONALES QUE NOS OFRECE EL PLUGIN
	width : 650,
	height : 340,
	 
	// animacion
	animtype : 'fade', // 'fade' o 'slide'
	animduration : 500, // rapidez de transicion
	animspeed : 20000, // delay entre animaciones
	automatic : false, // automatico
	 
	// controles
	showcontrols : true, // Mostrar controles prev y next
	centercontrols : true, // centrar controles prev y next
	nexttext : 'Siguiente >', // Texto para boton next
	prevtext : '< Anterior', // Texto para boton prev
	showmarkers : true, // Mostrar botones de navegacion
	centermarkers : true, // Centrar botones de navegacion
	 
	// interaccion
	keyboardnav : true, // habilita navegacion por teclado
	hoverpause : true, // pausa slide cuando el mouse esta encima
	 
	// presentacion
	usecaptions : true, // muestra texto introducido en el tag title
	responsive : true // habilita modo responsive (beta)
	    });
});
