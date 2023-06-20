# PhotoSpaces

<p align="center">
<img src="./img/logo.png""/>
</p>

![Imagen de la interfaz de PhotoSpaces](./img/user-interface.webp)

## Descripción
// TODO: Breve descripción del proyecto y su contexto.

La aplicación cuenta con 5 componentes diferenciados:
- [Cliente estándar](./cliente-estandar)
- [Cliente de administración](./cliente-admin)
- [Microservicio de administración](./microservicio-administracion)
- [Microservicio de gestión de peticiones](./microservicio-gestion-peticiones)
- [Servidor de renderizado](./servidor-renderizado)

## Contribuidores
- Rafael Marcos Luque Baena (tutorización del trabajo realizado)
- Jose Mª Sánchez Fernández (desarrollo de la primera versión de la aplicación)
- Pablo Sánchez Vecino (desarrollo de la extensión de la aplicación)

## Instalación
Pasos a seguir:
1. Descargar e instalar [Node.js](https://nodejs.org/en/download) en todos los entornos en los que se vaya a desplegar algún componente. Se recomienda una versión LTS.
2. Descargar e instalar [Blender](https://www.blender.org/download/) en todos los entornos en los que se vaya a desplegar alguna instancia de servidor de renderizado. 
3. Comprobar que las rutas donde se encuentran los ejecutables están incluidas en la variable PATH decada entorno y añadirlas en el caso de que no lo estén.
3. Instalación de dependencias npm. Por cada uno de los 5 directorios correspondientes a los componentes mencionados anteriormente, abrir una consola en esta y ejecutar el siguiente comando:

    ```bash
    npm install
    ```


## Despliegue
Para desplegar nuestro propio sistema al completo, será necesario desplegar al menos una instancia de cada uno de los 5 componentes.

La configuración previa al despliegue de la aplicación se realiza mediante la asigación de valores a variables de entorno, antes de desplegar, comprobar que se han asignado valores a cada una de estas en todos los componentes. En el archivo `docker-compose.yaml` del directorio raíz del repositorio se pueden comprobar todas las variables que es necesario definir.

### Despliegue directamente sobre el sistema operativo del host: 
Por cada componente en el que queramos usar esta opción, será necesario configurar las variables de entorno en un archivo `.env`.

Una vez configuradas las variables de entorno, existen dos opciones:

- Navegar a cada directorio y ejecutar el siguiente comando:

    ```bash
    npm run start
    ```
- Utilizar los scripts incluidos en los siguientes directorios dependiendo del sistema operativo:
    - [Windows](./scripts/windows/host) 
    - [Linux](./scripts/linux/host)

### Despliegue sobre contenedores Docker individuales
**IMPORTANTE:** No se recomienda desplegar el servidor de renderizado mediante contenedores, ya que estos por defecto no tienen acceso a la GPU del sistema, esto solo es posible en equipos Linux y con GPUS NVIDIA con el uso de algunas herramientas.
Si optamos por desplegar cada componente por separado, la configuración de las variables se realizará en los archivos `Dockerfile` correspondientes a cada componente.

De nuevo, tenemos dos opciones a la hora de desplegar tras configurarlas:

- Navegar al directorio de cada componente y ejecutar los siguiente comandos:

    1. Generar la imagen que utilizará el contenedor (solo es necesario la primera vez): 

        ```bash
        docker build -t <nombre para la imagen>:latest .
        ```

    2. Arrancar e contenedor a partir de la imagen generada:

        ```bash
        docker run -t --name <nombre del contenedor> --rm <nombre de la imagen generada>:latest
        ```
- Utilizar los scripts incluidos en los siguientes directorios dependiendo del sistema operativo:
    - [Windows](./scripts/windows/docker) 
    - [Linux](./scripts/linux/docker)

### Despliegue sobre contenedores Docker utilizando docker-compose
Para desplegar todos los componentes (a excepción del servidor de renderizado) sobre contenedores con un solo comando, primero deberemos configurar las variables de entorno o bien en cada uno de los archivos `Dockerfile`, o  directamente todas en el archivo `docker-compose.yaml`. Para evitar posibles conflictos, se recomineda intentar evitar utilizar las dos alternativas al mismo tiempo.

Una vez configuradas las variables de entorno, de nuevo se presentan dos opciones:

- Introducir en el directorio raíz del repositorio el siguiente comando:

    ```bash
    docker-compose up
    ```


- Utiizar el único script situado en uno de los siguientes directorios dependiendo del sistema operativo: 
    - [Windows](./scripts/windows/docker/docker-compose) 
    - [Linux](./scripts/linux/docker/docker-compose)
