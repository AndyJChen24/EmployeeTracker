drop database if exists employeetrack_db;
create database exployeetrack_db;
create table employee(
id int not null,
first_name varchar(30) not null,
last_name varchar(30) not null,
role_id int not null,
manager_id int,
primary key (id)
);
create table role(
id int not null,
title varchar(30) not null,
salary int,
department_id int,
primary key (id)
);
create table department(
id int not null,
name varchar(30),
primary key (id)
)
