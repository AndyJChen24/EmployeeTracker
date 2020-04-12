INSERT INTO department (name) VALUES ('Sales'),('Engineering');
INSERT INTO role (title, salary, department_id) VALUES ('Sales Lead', 100000, 1),('Salesperson', 80000, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES('John', 'Doe', 1, NULL);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES('Mike', 'Chan', 2, 1);