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

function print_table(results) {
    const p = new Table();
    p.addRows(results);
    const newTable = p.render();
    console.log(`\n${newTable}\n\n`+("\n"*results.length));
}

function all_deps() {
    db.query('SELECT * FROM department', function (err, results) {
        print_table(results);
    });
};

function all_role() {
    db.query('SELECT * FROM e_role', function (err, results) {
        print_table(results);
    });
};

function all_employee() {
    db.query('SELECT * FROM employee', function (err, results) {
        print_table(results);
    });
};


app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

console.log("\r\n                                                 *                                          \r\n                     (                         (  `                                         \r\n (       )           )\\      (       (    (    )\\))(      )            )  (  (     (   (    \r\n )\\     (     `  )  ((_) (   )\\ )   ))\\  ))\\  ((_)()\\  ( \/(   (     ( \/(  )\\))(   ))\\  )(   \r\n((_)    )\\  \' \/(\/(   _   )\\ (()\/(  \/((_)\/((_) (_()((_) )(_))  )\\ )  )(_))((_))\\  \/((_)(()\\  \r\n| __| _((_)) ((_)_\\ | | ((_) )(_))(_)) (_))   |  \\\/  |((_)_  _(_\/( ((_)_  (()(_)(_))   ((_) \r\n| _| | \'  \\()| \'_ \\)| |\/ _ \\| || |\/ -_)\/ -_)  | |\\\/| |\/ _` || \' \\))\/ _` |\/ _` | \/ -_) | \'_| \r\n|___||_|_|_| | .__\/ |_|\\___\/ \\_, |\\___|\\___|  |_|  |_|\\__,_||_||_| \\__,_|\\__, | \\___| |_|   \r\n             |_|             |__\/                                        |___\/              \r\n");

const prompt1 = () => {
    const startQ = [
        {
            type: 'list',
            name: 'start',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles',
                'View all employees', 'Add a department',
                'Add a role', 'Add an employee',
                'Update an employee role'],
        }
    ];
    return inquirer.prompt(startQ);
}

const main = async () => {
    for (let x=0; x < 10; x++) {
        await prompt1() 
        .then((answer) => {
            console.log(answer.start+'\n');
            if (answer.start == "View all departments") {
                all_deps();
            } else if (answer.start == "View all roles") {
                all_role();
            }  else if (answer.start == "View all employees") {
                all_employee();
            } 
        })
    }
}

main();