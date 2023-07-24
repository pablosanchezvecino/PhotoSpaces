#!/bin/bash
cd ../../../../microservicio-gestion-peticiones

docker build --build-arg MONGODB_CONNECTION_STRING=<nuestra cadena de conexión para el microservicio de gestión de peticiones> \
--build-arg EMAIL_USER=<dirección del correo electrónico> \
--build-arg EMAIL_PASSWORD=<contraseña del correo electrónico> \
-t microservicio-gestion-peticiones:latest .