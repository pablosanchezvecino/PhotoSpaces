#!/bin/bash

cd ../../../cliente-estandar
npm run start &

cd ../cliente-admin
npm run start &

cd ../microservicio-administracion
npm run start &

cd ../microservicio-gestion-peticiones
npm run start &

cd ../servidor-renderizado
npm run start &