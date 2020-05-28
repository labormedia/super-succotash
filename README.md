# super-succotash
Versión 0.0.0-0-alpha

Solución al ejercicio propuesto en el proceso de reclutamiento de NodeJS Backend Developer para Aureolab SpA.

Notas sobre el proyecto: Este es un ejemplo de desarrollo como prueba de concepto de un ejercicio de integración. El uso es de exclusiva responsabilidad de quien lo utilice y en ningún caso relega responsabilidad alguna sobre el autor ni colaboradores.

El proyecto consiste en una unidad de prueba de concepto para una interfaz de aplicación API REST con websocket para comunicación en tiempo real desde el front-end y redis con streams para manejo de altos volúmenes de flujos de datos escalables en el backend. La versión primaria incluye implementaciones de encriptación end to end con tls/ssl, autenticación con jsonwebtoken y cookies, además de dos ambientes de usuario (administrador y simple) con su respectivo dominio/multi-tenancy. El proyecto se inició desde una linea de partida limpia tomando elementos e ideas sueltas y su primera versión alfa se puso a disposición del solicitante en 4 días. Por lo mismo se espera tener errores de ejecución imprevistos.

El enfasis de diseño está puesto en el performance y minimalismo del backend. El front-end está obviado a su mínimo viable.

Ambiente: Ubuntu Linux 20.04

Dependencias para el runtime:
    Docker version 18.09.9, build 1752eb3
    docker-compose version 1.23.2, build unknown
    GNU Make 4.2.1 Built for x86_64-pc-linux-gnu
    Node JS v15.0.0

Dependencia para la documentación:
    Swagger 0.7.5

Para construir por primera vez:
    make configure
    make all                        #(introducir frase para los certificados, ex: "simplephrase")

Para ejecutar:
	make run                        #(una vez instalado y corriendo, se puede entrar a la aplicación en la dirección local http://127.0.0.1:3000)    
                                    #(el proyecto se inicia con un usuario administrador de clave y contraseña muy simples a modo de prueba)
                                    #(usuario: "superuser", password: "cat")

Para debug:
    make debug

Para detener la ejecución
    make stop

Para desinstalar:
    make clean
    make undocker

Para levantar la documentación de API REST:
    make docs

