drop database if exists employeetrack_db;
create database employeetrack_db;
use employeetrack_db;

create table department(
id int not null auto_increment,
name varchar(30),
primary key (id)
);

create table role(
id int not null auto_increment,
title varchar(30) not null,
salary int,
department_id int,
primary key (id)
);

create table employee(
id int not null auto_increment,
first_name varchar(30) not null,
last_name varchar(30) not null,
role_id int not null,
manager_id int,
primary key(id),
foreign key (role_id) references role(id),
foreign key (manager_id) references employee(id)
);


