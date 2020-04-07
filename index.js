const mysql = require("mysql")
const inquirer = require("inquirer")

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

function runStart(){
    inquirer.prompt({
        name:"start",
        type: "list",
        message: "What would you like to do?",
        choices: ["Add", "View", "Update"]
    }).then(data=>{
        switch(data.start){
            case "Add":
                add();
                break;
            case "View":
                view();
                break;
            case "Update":
                update();
                break;
            default:
                break;
        }
    })  
}
// Prompt user if they want to add new Employee, Department or Roles
function add(){
    inquirer.prompt({
        name: "add",
        type: "list",
        message: "What do you want to add?",
        choices: ["Department", "Roles", "Employee"]
    }).then(data=>{
        switch(data.add){
            case "Department":
                addDepartment();
                break;
            case "Roles":
                addRoles();
                break;
            case "Employee":
                addEmployee();
                break;
            default:
                break;
        }
    })
}
// Prompt user for new employee info
function addEmployee(){
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
            name: "roleId",
            type: "int",
            message: "What is the role id?"
        },
        {
            name: "managerId",
            type: "int",
            message: "What is the manager's id?"
        }]).then(data=>{
        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${data.firstName}", "${data.lastName}",${data.roleId},${data.managerId});`, (err,res)=>{
            if(err) throw err;
            console.log(res);
            connection.end();
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
        connection.query(`INSERT INTO department (name) VALUES ("${data.department}");`, (err,res)=>{
            if(err) throw err;
            console.log(res);
            connection.end();
        })
    })
}
// prompt user for roles and salary and department id
function addRoles(){
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
            type:"int",
            message:"Please enter the department id."
        }
    ]).then(data=>{
        connection.query(`INSERT INTO role (title, salary, department_id) VALUES ("${data.role}","${data.salary}","${data.department}");`, (err,res)=>{
            if(err) throw err;
            console.log(res);
            connection.end();
        })
    })
}
// prompt user if they want to view department, manager or all
function view(){
    inquirer.prompt({
        name: "add",
        type: "list",
        message: "What do you want to view by?",
        choices: ["Department", "Manager", "All"]
    }).then(data=>{
        switch(data.add){
            case "Department":
                viewByDepartment();
                break;
            case "Manager":
                viewByManager();
                break;
            case "All":
                viewAll();
                break;
            default:
                
                break;
        }
    })
}
// view all department
function viewByDepartment(){
    connection.query("select * from department", (err,res)=>{
        if(err) throw err;
        console.log(res);
        connection.end();
    })
}
function viewByManager(){
    connection.query("select * from role where title = 'Manager'", (err,res)=>{
        if(err) throw err;
        console.log(res);
        connection.end();
    })
}