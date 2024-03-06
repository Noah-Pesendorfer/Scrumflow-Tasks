import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import {getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDZJTH0Znyi13etPM6Ag5M-lQ_WeqXOIsU",
    authDomain: "scrumflow-6e479.firebaseapp.com",
    projectId: "scrumflow-6e479",
    storageBucket: "scrumflow-6e479.appspot.com",
    messagingSenderId: "828323679259",
    appId: "1:828323679259:web:6db3cfbf89942cc3d4fcbe",
    measurementId: "G-2427QNHC73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const currentProject = "NX1cH7RBU17dK2GZJs0G";
let tasks = [];
let taskId;

const todoList = document.querySelector('.To-Do-List');
const inprogressList = document.querySelector('.In-Progress-List');
const doneList = document.querySelector('.Done-List');

const projectTitle = document.querySelector('.project-title');

// Füge Event-Listener für das Drag-and-Drop-Ereignis hinzu
todoList.addEventListener('dragover', handleDragOver);
todoList.addEventListener('drop', event=> handleDrop('In Progress', event));

inprogressList.addEventListener('dragover', handleDragOver);
inprogressList.addEventListener('drop', event=> handleDrop('In Progress', event));


doneList.addEventListener('dragover', handleDragOver);
doneList.addEventListener('drop', event=> handleDrop('In Progress', event));


function handleDragOver(event) {
    event.preventDefault();
    taskId = event.target.id;
}

// Funktion, die aufgerufen wird, wenn ein Element in eine Liste gezogen wird
function handleDrop(status, event) {
    event.preventDefault();
    console.log("Task ID: ", taskId);
    const taskElement = document.getElementById(taskId);

    console.log("Task Element: ", taskElement);

    // Aktualisiere den Status des Tasks entsprechend der Ziel-Liste
    //updateTaskStatus(taskId, status);
    console.log(taskId, status);

    // Verschiebe das Task-Element in die Ziel-Liste
    doneList.appendChild(taskElement);
}

// Funktion, um den Status eines Tasks in der Datenbank zu aktualisieren
async function updateTaskStatus(taskId, status) {
    const taskRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", taskId);
    await updateDoc(taskRef, { status: status });
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in with ID: ", user.uid);
        loadUserData();
    } else {
        console.log("No user is signed in.");
    }
});

document.querySelector('.add-task').addEventListener('click', () => addNewTask());

function loadUserData() {
    const userRef = doc(db, "users", auth.currentUser.uid)
    getDoc(userRef)
        .then(async docSnapshot => {
            if (docSnapshot.exists()) {
                const UserData = docSnapshot.data();

                document.querySelector('.username').innerHTML = UserData.name;

            } else {
                console.log("Token-Dokument existiert nicht");
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden des Token-Dokuments oder beim Aufrufen von GPT3: ", error);
        });
    const projRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject)
    getDoc(projRef)
        .then(async docSnapshot => {
            if (docSnapshot.exists()) {
                const ProjectData = docSnapshot.data();

                projectTitle.innerHTML = ProjectData.title;
                loadTasksOfProject();
            } else {
                console.log("Token-Dokument existiert nicht");
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden des Token-Dokuments oder beim Aufrufen von GPT3: ", error);
        });
}

function loadTasksOfProject() {
    const tasksRef = collection(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks")
    getDocs(tasksRef)
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const taskData = doc.data();

                const task = {id: doc.id, ...taskData};

                tasks.push(task);
            });
            loadTasksIntoHTML();
        })
        .catch(error => {
            console.error("Error loading projects: ", error);
        });
}

function loadTasksIntoHTML() {
    tasks.forEach(task => {

        if(!task.description){
            task.description = "";
        }

        if(!task.status || task.status === "To-Do"){
            loadToDoTask(task);
        }
        else if(task.status === "In Progress"){
            loadProgressTask(task);
        }
        else if (task.status === "Done"){
            loadDoneTask(task);
        }
    })
}

function loadToDoTask(task) {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.innerHTML = '<a id="' + task.id + '" class="block p-5 rounded-lg shadow bg-white" href="#" draggable="true" >\n' +
        '                                <div class="flex justify-between">\n' +
        '                                    <p class="text-sm w-48 font-medium leading-snug text-gray-900">' + task.title + '</p>\n' +
        '                                    <span>\n' +
        '                                           <div class="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">\n' +
        '                                                <span class="font-medium text-gray-600 dark:text-gray-300">NP</span>\n' +
        '                                            </div>' +
        '                                            </span>\n' +
        '                                </div>\n' +
        '                                <div class="flex justify-between items-baseline">\n' +
        '                                    <time class="text-sm" datetime="2019-09-14">' + task.description + '</time>\n' +
        '                                    <div class="mt-2">\n' +
        '                                                <span class="px-2 py-1 leading-tight inline-flex items-center bg-blue-100 rounded">\n' +
        '                                                    <svg class="h-2 w-2 text-blue-500" viewbox="0 0 8 8" fill="#000000">\n' +
        '                                                        <circle cx=\'4\' cy=\'4\' r=\'3\'/>\n' +
        '                                                    </svg>\n' +
        '                                                    <span class="ml-2 text-blue-900 font-medium text-sm ">To-Do</span>\n' +
        '                                                </span>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </a>';
    todoList.appendChild(newTask);
}

function loadProgressTask(task) {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.innerHTML = '<a id="' + task.id + '" class="block p-5 rounded-lg shadow bg-white" href="#" draggable="true" >\n' +
        '                                <div class="flex justify-between">\n' +
        '                                    <p class="text-sm w-48 font-medium leading-snug text-gray-900">' + task.title + '</p>\n' +
        '                                    <span>\n' +
        '                                           <div class="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">\n' +
        '                                                <span class="font-medium text-gray-600 dark:text-gray-300">NP</span>\n' +
        '                                            </div>' +
        '                                            </span>\n' +
        '                                </div>\n' +
        '                                <div class="flex justify-between items-baseline">\n' +
        '                                    <time class="text-sm" datetime="2019-09-14">' + task.description + '</time>\n' +
        '                                    <div class="mt-2">\n' +
        '                                                <span class="px-2 py-1 leading-tight inline-flex items-center bg-yellow-100 rounded">\n' +
        '                                                    <svg class="h-2 w-2 text-yellow-500" viewbox="0 0 8 8" fill="#000000">\n' +
        '                                                        <circle cx=\'4\' cy=\'4\' r=\'3\'/>\n' +
        '                                                    </svg>\n' +
        '                                                    <span class="ml-2 text-yellow-900 font-medium text-sm ">In Progress</span>\n' +
        '                                                </span>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </a>';
    inprogressList.appendChild(newTask);
}

function loadDoneTask(task) {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.innerHTML = '<a id="' + task.id + '" class="block p-5 rounded-lg shadow bg-white" href="#" draggable="true" >\n' +
        '                                <div class="flex justify-between">\n' +
        '                                    <p class="text-sm w-48 font-medium leading-snug text-gray-900">' + task.title + '</p>\n' +
        '                                    <span>\n' +
        '                                           <div class="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">\n' +
        '                                                <span class="font-medium text-gray-600 dark:text-gray-300">NP</span>\n' +
        '                                            </div>' +
        '                                            </span>\n' +
        '                                </div>\n' +
        '                                <div class="flex justify-between items-baseline">\n' +
        '                                    <time class="text-sm" datetime="2019-09-14">' + task.description + '</time>\n' +
        '                                    <div class="mt-2">\n' +
        '                                                <span class="px-2 py-1 leading-tight inline-flex items-center bg-teal-100 rounded">\n' +
        '                                                    <svg class="h-2 w-2 text-teal-500" viewbox="0 0 8 8" fill="#000000">\n' +
        '                                                        <circle cx=\'4\' cy=\'4\' r=\'3\'/>\n' +
        '                                                    </svg>\n' +
        '                                                    <span class="ml-2 text-teal-900 font-medium text-sm ">Done</span>\n' +
        '                                                </span>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </a>';
    doneList.appendChild(newTask);
}


function addNewTask() {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.innerHTML = '<a id="' + task.id + '" class="block p-5 rounded-lg shadow bg-white" href="#" draggable="true" >\n' +
        '                                <div class="flex justify-between">\n' +
        '                                    <p class="text-sm w-48 font-medium leading-snug text-gray-900">Add discount code to\n' +
        '                                        checkout page</p>\n' +
        '                                    <span>\n' +
        '                                                    <img class="h-6 w-6 ml-4 rounded-full "\n' +
        '                                                         src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=144&h=144&q=60">\n' +
        '                                            </span>\n' +
        '                                </div>\n' +
        '                                <div class="flex justify-between items-baseline">\n' +
        '                                    <time class="text-sm" datetime="2019-09-14">Sep 14</time>\n' +
        '                                    <div class="mt-2">\n' +
        '                                                <span class="px-2 py-1 leading-tight inline-flex items-center bg-teal-100 rounded">\n' +
        '                                                    <svg class="h-2 w-2 text-teal-500" viewbox="0 0 8 8" fill="#000000">\n' +
        '                                                        <circle cx=\'4\' cy=\'4\' r=\'3\'/>\n' +
        '                                                    </svg>\n' +
        '                                                    <span class="ml-2 text-teal-900 font-medium text-sm ">Done</span>\n' +
        '                                                </span>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                            </a>';
    todoList.appendChild(newTask);
}

// SIDE MENU

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');



