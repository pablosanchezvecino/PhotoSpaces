@echo off

start "cliente-estandar" cmd /k "cd ../../../cliente-estandar && npm run start && title a"
start "cliente-admin" cmd /k "title b && cd ../../../cliente-admin && npm run start"
start "microservicio-administracion" cmd /k "title c && cd ../../../microservicio-administracion && npm run start"
start "microservicio-gestion-peticiones" cmd /k "title d && cd ../../../microservicio-gestion-peticiones && npm run start"

