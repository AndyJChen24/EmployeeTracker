const mysql = require("mysql")
const inquirer = require("inquirer")
let allRoles= [];
let allEmployees =[];
let allDepartments =[];
const connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user: "root",
    password: "Jc242242+",
    database: "employeetrack_db"
});

connection.connect(err=>{
    if (err) throw err;
    runStart();
})

function getAll(){
    return new Promise((resolve,reject)=>{
            connection.query('select title, id from role;', (err, res)=>{
                res.forEach(element => {
                    allRoles.push({name: element.title, id: element.id})
                })
                
                connection.query('select first_name, last_name, id from employee;', (err, res)=>{
                    res.forEach(element => {
                        allEmployees.push({name:element.first_name+" "+element.last_name,id: element.id });
                    });

                    connection.query('select * from department;', (err, res)=>{
                        //console.log(res)
                        res.forEach(element => {
                            allDepartments.push(element.name)
                        })
                        resolve(allRoles,allEmployees,allDepartments)
                    })
                });
            
                //connection.end(); 
            })
        
    })
}


async function runStart(){
    const result = await getAll();
    //console.log(allEmployees);
    //console.log(allRoles)
    //console.log(allDepartments)
    
    inquirer.prompt({
        name:"start",
        type: "list",
        message: "What would you like to do?",
        choices: 
        [
            "View all employees",
            "View all departments",
            "View all roles",
            "Add employee",
            "Add department",
            "Add role",
            "Update an employee's role",
            "Update an employee's manager",
            "Exit"
        ]
    }).then(data=>{
        switch(data.start){
            case "View all employees":
                viewAllEmployee();
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
            case "Exit":
                connection.end();
            default:
                break;
        }
    })  
}

// Prompt user for new employee info
// Working done
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
// Working done
function addDepartment(){
    inquirer.prompt({
        name:"department",
        type:"input",
        message:"Please enter the department name."
    }).then(data=>{
        connection.query(`INSERT INTO department (name) VALUES ("${data.department}");`, (err,res)=>{
            if(err) throw err;
            console.log(`${data.department} has been added.`);
            // run again
            runStart();
        })
    })
}

// prompt user for roles and salary and department id
// Done complete
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
// done complete
function viewDepartments(){
    connection.query("select * from department;", (err,res)=>{
        if(err) throw err;
        console.table(res);
        // run again
        runStart();
    })
}
// view all roles
// Done complete
function viewRoles(){
    connection.query("select * from role;", (err,res)=>{
        if(err) throw err;
        console.table(res);
        // run again
        runStart();
    })
}
// view all (need all three tables employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, manager.name
// Done Complete
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
        allEmployees.forEach(element=>{
            if(element.name === data.update){
                updatePersonID = element.id
                
            }
        })
        allRoles.forEach(element=>{
            if(element.name === data.newRole){
                updateRoleID = element.id
            }
        })
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
        allEmployees.forEach(element=>{
            if(element.name === data.update){
                updatePersonID = element.id  
            }
        })
        allEmployees.forEach(element=>{
            if(element.name === data.newManager){
                updateManagerID = element.id
            }
        })
        connection.query(`Update employee set manager_id =${updateManagerID} where id = ${updatePersonID}`, (err,res)=>{
            if(err) throw err;
            console.log("Employee Updated")
            // run again
            runStart();
        })
    })
}

