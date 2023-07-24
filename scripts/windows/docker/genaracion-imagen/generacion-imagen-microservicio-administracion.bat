@echo off
cd ../../../../microservicio-administracion

docker build ^
--build-arg MONGODB_CONNECTION_STRING=<nuestra cadena de conexión para el microservicio de administración> ^
-t microservicio-administracion:latest .