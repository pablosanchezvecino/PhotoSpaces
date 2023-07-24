@echo off
cd ../../../../microservicio-gestion-peticiones

docker build --build-arg MONGODB_CONNECTION_STRING=<nuestra cadena de conexión> ^
--build-arg EMAIL_USER=<dirección del correo electrónico> ^
--build-arg EMAIL_PASSWORD=<contraseña de aplicación del correo electrónico> ^
-t microservicio-gestion-peticiones:latest .

