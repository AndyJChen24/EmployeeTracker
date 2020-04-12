const mysql = require("mysql")
const inquirer = require("inquirer")
require('console.table')
let allRoles= [];
let allEmployees =[];
let allDepartments =[];
const connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetrack_db"
});
//start connection to database
connection.connect(err=>{
    if (err) throw err;
    runStart();
})
// get data from data 
function getAll(){
    allRoles= [];
    allEmployees =[];
    allDepartments =[];
    return new Promise((resolve,reject)=>{
            // get and store role data and id
            connection.query('select title, id from role;', (err, res)=>{
                res.forEach(element => {
                    allRoles.push({name: element.title, id: element.id})
                })
                //get and store employee name and id
                connection.query('select first_name, last_name, id from employee;', (err, res)=>{
                    res.forEach(element => {
                        allEmployees.push({name:element.first_name+" "+element.last_name,id: element.id });
                    });
                    // get and store department and id
                    connection.query('select * from department;', (err, res)=>{
                        //console.log(res)
                        res.forEach(element => {
                            allDepartments.push({name:element.name, id: element.id})
                        })
                        resolve(allRoles,allEmployees,allDepartments)
                    })
                });
            
                //connection.end(); 
            })
        
    })
}


async function runStart(){
    // wait until get data is done
    const result = await getAll();
    // prompt user 
    inquirer.prompt({
        name:"start",
        type: "list",
        message: "What would you like to do?",
        choices: 
        [
            "View all employees",
            "View by manager",
            "View all departments",
            "View all roles",
            "Add employee",
            "Add department",
            "Add role",
            "Update an employee's role",
            "Update an employee's manager",
            "Delete an employee",
            "Delete a role",
            "Delete a department",
            "Exit"
        ]
    }).then(data=>{
        switch(data.start){
            case "View all employees":
                viewAllEmployee();
                break;
            case "View by manager":
                viewByManager();
                break;
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "Add employee":
                addEmployee();
                break;
            case "Add department":
                addDepartment();
                break;
            case "Add role":
                addRole();
                break;
            case "Update an employee's role":
                updateEmployeeRole();
                break;
            case "Update an employee's manager":
                updateEmployeeManager();
                break;
            case "Delete an employee":
                deleteEmployee();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Exit":
                connection.end();
            default:
                break;
        }
    })  
}

// Prompt user for new employee info
function addEmployee(){
    let roleID;
    let managerID;
    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "What is the first name?"
        },
        {
            name: "lastName",
            type: "input",
            message: "What is the last name?"
        },
        {
            name: "role",
            type: "list",
            message: "What is the role?",
            choices: allRoles
        },
        {
            name: "manager",
            type: "list",
            message: "Who is the manager?",
            choices: allEmployees
        }]).then(data=>{
            // compare answer from user to the array of all roles in the data base to see if it match
            allRoles.forEach((element)=>{
                //if match then get the id from the array
                if (data.role===element.name){
                    roleID = element.id;
                }
            })
            //compare answer from user to the array of all employee in the data base to see if it match
            allEmployees.forEach((element)=>{
                // if match then get the id from the array
                if (data.manager === element.name){
                    managerID = element.id;
            }
            
        })
        // insert the name of the new employee and the role id and manager id into the employee table
        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.firstName}", "${data.lastName}",${roleID},${managerID});`, (err,res)=>{
                if(err) throw err;
                console.log("New employee has been added.")
                // run again
                runStart();
            })
    })
        
}

// prompt user for new department name
function addDepartment(){
    inquirer.prompt({
        name:"department",
        type:"input",
        message:"Please enter the department name."
    }).then(data=>{
        // insert new department into table
        connection.query(`INSERT INTO department (name) VALUES ("${data.department}");`, (err,res)=>{
            if(err) throw err;
            console.log(`${data.department} has been added.`);
            // run again
            runStart();
        })
    })
}

// prompt user for roles and salary and department id
function addRole(){
    inquirer.prompt([
        {
            name:"role",
            type:"input",
            message:"Please enter the role name."
        },
        {
            name:"salary",
            type:"int",
            message:"Please enter salary."
        },
        {
            name:"department",
            type:"list",
            message:"Which department to add to?",
            choices: allDepartments
        }
    ]).then(data=>{
        // query database for department id with the department name
        connection.query(`select id from department where name = "${data.department}";`,(err,res)=>{
            if(err) throw err;
            // returns an object so we have to set it using the 0th element
            let departmentID = res[0].id;
            // insert new role into database
            connection.query(`INSERT INTO role (title, salary, department_id) VALUES ("${data.role}","${data.salary}","${departmentID}");`, (err,res)=>{
                if(err) throw err;
                console.log(`${data.role} has been added.`)
                // run again
                runStart();
            })
        })
    })
}

// view all department
function viewDepartments(){
    connection.query("select * from department;", (err,res)=>{
        if(err) throw err;
        console.table(res);
        // run again
        runStart();
    })
}

// view all roles
function viewRoles(){
    connection.query("select * from role;", (err,res)=>{
        if(err) throw err;
        console.table(res);
        // run again
        runStart();
    })
}

// view all (need all three tables employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, manager.name
function viewAllEmployee(){
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
    FROM employee
    LEFT JOIN role on employee.role_id = role.id
    LEFT JOIN department on role.department_id = department.id 
    LEFT JOIN employee manager on manager.id = employee.manager_id`,(err,res)=>{
        if(err) throw err;
        console.table(res);
        // run again
        runStart();
    })
}

// update an employee's role
function updateEmployeeRole(){
    let updatePersonID;
    let updateRoleID;
    inquirer.prompt([
        {
            name: "update",
            type: "list",
            message: "Which employee's role do you wish to update?",
            choices: allEmployees
        },
        {
            name: "newRole",
            type: "list",
            message: "Please choose the new role for this employee.",
            choices: allRoles
        }
    ]).then(data=>{
        // check which employee it is by comparing array object
        allEmployees.forEach(element=>{
            if(element.name === data.update){
                updatePersonID = element.id
                
            }
        })
        // check which role by comparing to array object
        allRoles.forEach(element=>{
            if(element.name === data.newRole){
                updateRoleID = element.id
            }
        })
        // update info
        connection.query(`Update employee set role_id =${updateRoleID} where id = ${updatePersonID}`, (err,res)=>{
            if(err) throw err;
            console.log("Employee Updated")
            // run again
            runStart();
        })
    })
}

// update an employee's manager
function updateEmployeeManager(){
    let updatePersonID;
    let updateManagerID;
    inquirer.prompt([
        {
            name: "update",
            type: "list",
            message: "Which employee's manager do you wish to update?",
            choices: allEmployees
        },
        {
            name: "newManager",
            type: "list",
            message: "Please choose the new manager for this employee.",
            choices: allEmployees
        }
    ]).then(data=>{
        // check which employee it is and get the id from array object 
        allEmployees.forEach(element=>{
            if(element.name === data.update){
                updatePersonID = element.id  
            }
        })
        // check which employee it is and get the id from array object 
        allEmployees.forEach(element=>{
            if(element.name === data.newManager){
                updateManagerID = element.id
            }
        })
        // update new manager id to employee
        connection.query(`Update employee set manager_id =${updateManagerID} where id = ${updatePersonID}`, (err,res)=>{
            if(err) throw err;
            console.log("Employee Updated")
            // run again
            runStart();
        })
    })
}

// view an employee by manager
function viewByManager(){
    let personID;
    
    inquirer.prompt([
        {
            name: "manager",
            type: "list",
            message: "Select a employee to see all the employee manage.",
            choices: allEmployees
        }
    ]).then(data=>{
        // check which employee it is and get the id from array object 
        allEmployees.forEach(element=>{
            if(element.name === data.manager){
                personID = element.id  
            }
        })
        // get the employee using manager id
        connection.query(`SELECT * FROM employee where manager_id =${personID}`, (err,res)=>{
            if(err) throw err;
            console.table(res)
            // run again
            runStart();
        })
    })
}

//delete an employee from
function deleteEmployee(){
    let personID;
    inquirer.prompt(
        {
            name: "delete",
            type: "list",
            message: "Select an employee to delete from database.",
            choices: allEmployees
        }
    ).then(data=>{
        //check which employee it is and get the id from array object 
        allEmployees.forEach(element=>{
            if(element.name === data.delete){
                personID = element.id  
            }
        })
        // delete the person
        connection.query(`Delete from employee where id = ${personID}`,(err,res)=>{
            if (err) throw err;
            runStart();
        })
    })
}

function deleteDepartment(){
    let departmentID;
    inquirer.prompt(
        {
            name: "delete",
            type: "list",
            message: "Select an department to delete from database.",
            choices: allDepartments
        }
    ).then(data=>{
        //check which department it is and get the id from array object 
        allDepartments.forEach(element=>{
            if(element.name === data.delete){
                departmentID = element.id  
            }
        })
        // delete the department
        connection.query(`Delete from department where id = ${departmentID}`,(err,res)=>{
            if (err) throw err;
            runStart();
        })
    })
}

// delete a role from employee
function deleteRole(){
    let roleID;
    inquirer.prompt(
        {
            name: "delete",
            type: "list",
            message: "Select an role to delete from database.",
            choices: allRoles
        }
    ).then(data=>{
        //check which role it is and get the id from array object 
        allRoles.forEach(element=>{
            if(element.name === data.delete){
                roleID = element.id  
            }
        })
        //delete role but if err code is 1451 then prompt user to do something
        connection.query(`Delete from role where id = ${roleID}`,(err,res)=>{
            if (err.errno == 1451) {
                console.log("Fail to delete. Please delete or update all employee with this role first.")
            };
            runStart();
        })
    })
}