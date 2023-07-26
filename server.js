const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();
const inquirer = require('inquirer');
const { Table } = require('console-table-printer');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`Connected to the employee_db database.`)
);


function all_deps() {
    db.query('SELECT * FROM department', function (err, results) {
        const p = new Table({
            columns: [
                {name: "id"},
                {name: "dep_name",
                title: "department name"}
            ]
        });
        p.addRows(results);
        const newTable = p.render();
        console.log(`${newTable}`);
    });
};

function all_role() {
    db.query('SELECT e_role.id, e_role.title, e_role.salary, department.dep_name '
            + 'FROM e_role INNER JOIN department '
            + 'ON e_role.department_id=department.id', function (err, results) {
        const p = new Table({
            columns: [
                {name: "id"},
                {name: "title"},
                {name: "dep_name",
                title: "department"},
                {name: "salary"}
            ]
        });
        p.addRows(results);
        const newTable = p.render();
        console.log(`${newTable}`);
    });
};

function all_employee() {
    db.query('SELECT a.id, a.first_name, a.last_name, e_role.title, '
            + 'department.dep_name, e_role.salary, '
            + 'CONCAT(b.first_name, " ", b.last_name) AS manager '
            + 'FROM employee a '
            + 'INNER JOIN e_role ON a.role_id=e_role.id '
            + 'INNER JOIN department ON e_role.department_id=department.id '
            + 'LEFT JOIN employee b ON b.id = a.manager_id'
            , function (err, results) {
                const p = new Table({
                    columns: [
                        {name: "id"},
                        {name: "first_name",
                        title: "first name"},
                        {name: "last_name",
                        title: "last name"},
                        {name: "title"},
                        {name: "dep_name",
                        title: "department"},
                        {name: "salary"},
                        {name: "manager"}
                    ]
                });
                p.addRows(results);
                const newTable = p.render();
                console.log(`${newTable}`);
    });
};

function addDepartment(answer) {
    db.execute('INSERT INTO department (dep_name) VALUES (?)',
            [answer]
        , function (err, results) {
            console.log(answer + "has been added to departments")
        }
    );
};

function addRole(answer) {
    db.execute('INSERT INTO e_role (title, salary, department_id) VALUES (?,?, (SELECT id FROM department WHERE dep_name = ?))',
            [answer.rolename, answer.rolesalary, answer.roledepartment]
        , function (err, results) {
            console.log(answer.rolename + "has been added to roles")
        }
    );
};

function addEmployee(answer) {
    db.execute("INSERT INTO employee (first_name, last_name, role_id, manager_id) "
                + "VALUES (?,?,(SELECT id FROM e_role WHERE title = ?), "
                + "(SELECT p.id FROM (SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?) AS p))",
            [answer.employeefname, answer.employeelname, answer.employeerole, answer.employeemanager],
        function (err, results) {
            console.log(answer.employeefname +' ' + answer.employeelname + ' has been added to employees')
        }
    )
}

function updateRole(answer) {
    db.execute("UPDATE employee SET role_id = (SELECT id from e_role WHERE title = ?) "
            + "WHERE CONCAT(first_name, ' ', last_name) = ?",
            [answer.updaterole, answer.updateemployee],
        function (err, results) {
            console.log('Updated ' +answer.updateemployee+`'s role`)
        }
    )
}

app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

console.log("\r\n                                                 *                                          \r\n                     (                         (  `                                         \r\n (       )           )\\      (       (    (    )\\))(      )            )  (  (     (   (    \r\n )\\     (     `  )  ((_) (   )\\ )   ))\\  ))\\  ((_)()\\  ( \/(   (     ( \/(  )\\))(   ))\\  )(   \r\n((_)    )\\  \' \/(\/(   _   )\\ (()\/(  \/((_)\/((_) (_()((_) )(_))  )\\ )  )(_))((_))\\  \/((_)(()\\  \r\n| __| _((_)) ((_)_\\ | | ((_) )(_))(_)) (_))   |  \\\/  |((_)_  _(_\/( ((_)_  (()(_)(_))   ((_) \r\n| _| | \'  \\()| \'_ \\)| |\/ _ \\| || |\/ -_)\/ -_)  | |\\\/| |\/ _` || \' \\))\/ _` |\/ _` | \/ -_) | \'_| \r\n|___||_|_|_| | .__\/ |_|\\___\/ \\_, |\\___|\\___|  |_|  |_|\\__,_||_||_| \\__,_|\\__, | \\___| |_|   \r\n             |_|             |__\/                                        |___\/              \r\n");

// Credit:
// https://stackoverflow.com/questions/63161758/text-in-bash-terminal-getting-overwritten-using-js-node-js-npms-are-inquirer
function restart() {
    var uScore = "_";
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(uScore.repeat(50));
        }, 1000);
    });
}


const prompt1 = async () => {
    await restart()
    .then((lineBreak) => {
        console.log(`${lineBreak}\n`);
    });
    const startQ = [
        {
            type: 'list',
            name: 'start',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles',
                'View all employees', 'Add a department',
                'Add a role', 'Add an employee',
                'Update an employee role'],
        },
        {
            when: (response) => response.start === 'Add a department',
            type: 'input',
            name: "department",
            message: 'Enter the name of the department you wish to add: '
        },
        {
            when: (response) => response.start === 'Add a role',
            type: 'input',
            name: "rolename",
            message: 'Enter the name of the role you wish to add: '
        },
        {
            when: (response) => response.rolename,
            type: 'input',
            name: "rolesalary",
            message: 'Enter the salary of the role you wish to add: '
        },
        {
            when: (response) => response.rolesalary,
            type: 'list',
            name: "roledepartment",
            message: 'Enter the department of the role you wish to add: ',
            choices: ['Sales','Engineering','Finance','Legal']
        },
        {
            when: (response) => response.start === 'Add an employee',
            type: 'input',
            name: "employeefname",
            message: 'Enter the first name of the employee you wish to add: '
        },
        {
            when: (response) => response.employeefname,
            type: 'input',
            name: "employeelname",
            message: 'Enter the last name of the employee you wish to add: '
        },
        {
            when: (response) => response.employeelname,
            type: 'list',
            name: "employeerole",
            message: 'Enter the role of the employee you wish to add: ',
            choices: ['Sales Lead', 'Salesperson', 'Lead Engineer', 'Software Engineer',
                    'Account Manager', 'Accounant', 'Legal Team Lead', 'Lawyer']
        },
        {
            when: (response) => response.employeerole,
            type: 'list',
            name: "employeemanager",
            message: 'Enter the manager of the employee you wish to add: ',
            choices: ['None', 'John Doe', 'Mike Chan', 'Ashley Rodriguez',
                    'Kevin Tupik', 'Kunal Singh', 'Malia Brown', 'Sara Lourd', 'Tom Allen']
        },
        {
            when: (response) => response.start === "Update an employee role",
            type: 'list',
            name: "updateemployee",
            message: 'Enter the employee whose role you wish to update ',
            choices: ['John Doe', 'Mike Chan', 'Ashley Rodriguez',
                    'Kevin Tupik', 'Kunal Singh', 'Malia Brown', 'Sara Lourd', 'Tom Allen']
        },
        {
            when: (response) => response.updateemployee,
            type: 'list',
            name: "updaterole",
            message: 'Enter the new role of the employee you wish to update ',
            choices: ['Sales Lead', 'Salesperson', 'Lead Engineer', 'Software Engineer',
            'Account Manager', 'Accounant', 'Legal Team Lead', 'Lawyer']
        },
    ];
    return inquirer.prompt(startQ);
}

// Credit:
// https://stackoverflow.com/questions/61417816/how-do-i-invoke-inquirer-js-menu-in-a-loop-using-promises
const main = async () => {
    for (let x=0; x < 10; x++) {
        await prompt1() 
        .then((answer) => {
            if (answer.start == "View all departments") {
                all_deps();
            } else if (answer.start == "View all roles") {
                all_role();
            }  else if (answer.start == "View all employees") {
                all_employee();
            } else if (answer.start == "Add a department") {
                addDepartment(answer.department);
            } else if (answer.start == "Add a role") {
                addRole(answer);
            } else if (answer.start == "Add an employee") {
                addEmployee(answer);
            } else if (answer.start == "Update an employee role") {
                updateRole(answer);
            }
        })
    }
}


main();