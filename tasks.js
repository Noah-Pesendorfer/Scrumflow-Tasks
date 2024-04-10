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
let currentProject;
let currentProjectObj;
let tasks = [];
let comments = [];
let currentTask;

const commentsDiv = document.getElementById('comments-of-task');
let projCompleted = document.querySelector('.proj-completed');

const todoList = document.querySelector('.To-Do-List');
const inprogressList = document.querySelector('.In-Progress-List');
const doneList = document.querySelector('.Done-List');

const projectTitle = document.querySelector('.project-title');
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in with ID: ", user.uid);
        getProjektID();
        loadUserData();
    } else {
        console.log("No user is signed in.");
    }
});

function getProjektID() {
    var urlParams = new URLSearchParams(window.location.search);
    currentProject = urlParams.get('projektid');
    console.log("ProjektID: ", currentProject);
}

function loadUserData() {
    const projRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject)
    getDoc(projRef)
        .then(async docSnapshot => {
            if (docSnapshot.exists()) {
                const ProjectData = docSnapshot.data();

                currentProjectObj = ProjectData;

                if(ProjectData.status == "Completed"){
                    console.log("Completed")
                    projCompleted.classList.remove('bg-green-500');
                    projCompleted.classList.add('bg-red-500');
                    projCompleted.innerHTML = "Completed"
                }

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
    todoList.innerHTML="";
    inprogressList.innerHTML="";
    doneList.innerHTML="";
    tasks = [];
    comments = [];

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
    newTask.id = task.id;
    newTask.innerHTML = '<a draggable="true" class="block p-5 rounded-lg shadow bg-white drag-item" href="#">\n' +
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

    newTask.addEventListener('click', () => onTaskClick(task));

    $(document).on('dragstart', '.drag-item', function(event) {
        let itemId = $(this.parentNode).attr('id');
        event.originalEvent.dataTransfer.setData("text/plain", itemId);
    });
}

function loadProgressTask(task) {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.id = task.id;
    newTask.innerHTML = '<a class="block p-5 rounded-lg shadow bg-white drag-item" href="#" draggable="true">\n' +
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

    newTask.addEventListener('click', () => onTaskClick(task));

    $(document).on('dragstart', '.drag-item', function(event) {
        let itemId = $(this.parentNode).attr('id');
        event.originalEvent.dataTransfer.setData("text/plain", itemId);
    });
}

function loadDoneTask(task) {
    let newTask = document.createElement('li');
    newTask.classList.add('mt-3');
    newTask.id = task.id;
    newTask.innerHTML = '<a class="block p-5 rounded-lg shadow bg-white drag-item" href="#" draggable="true">\n' +
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

    newTask.addEventListener('click', () => onTaskClick(task));

    $(document).on('dragstart', '.drag-item', function(event) {
        let itemId = $(this.parentNode).attr('id');
        event.originalEvent.dataTransfer.setData("text/plain", itemId);
    });
}

// MODAL ZUM HINZUFÜGEN VON TASKS

$('.modal-opener').click(function(){
    $('#default-modal').toggleClass('hidden');
    $('#default-modal').toggleClass('backdrop-blur-sm')
});

$('.modal-submit').click(function(){
    $('#default-modal').toggleClass('hidden');
    $('#default-modal').toggleClass('backdrop-blur-sm')

    var newTask = {
        title: document.getElementById('name-of-task').value,
        status: "To-Do",
        userID: auth.currentUser.uid
    }

    document.getElementById('name-of-task').value = "";

    addProjectToFirestore(newTask);
    loadTasksOfProject();
});

$('.modal-closer').click(function(){
    $('#default-modal').toggleClass('hidden');
    $('#default-modal').toggleClass('backdrop-blur-sm')
});

function addProjectToFirestore(newTask) {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to add events.");
        return;
    }

    const tasksRef = collection(db, "users", user.uid, "projects", currentProject, "tasks");
    addDoc(tasksRef, newTask).then(docRef => {
        newTask.id = docRef.id;
        tasks.push(newTask);
    }).catch(error => {
        console.error("Error adding event: ", error);
    });
}

// ---

// MODAL ZUM BEARBEITEN VON TASKS

function onTaskClick(task) {
    currentTask = task;
    comments = [];

    commentsDiv.innerHTML = "";

    console.log("Comments after reset onTaskClick: ", comments);

    $('#edit-task-modal').toggleClass('hidden');
    $('#edit-task-modal').toggleClass('backdrop-blur-sm')

    document.getElementById('title-of-task').value = task.title;
    document.getElementById('description-of-task').value = task.description;

    const commentsRef = collection(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", task.id, "comments")
    getDocs(commentsRef)
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const commentData = doc.data();

                const comment = {id: doc.id, ...commentData};

                comments.push(comment);
            });
            loadCommentsIntoHTML();
        })
        .catch(error => {
            console.error("Error loading Comments: ", error);
        });
}

function loadCommentsIntoHTML() {
    comments.forEach(comment => {
        let commentDiv = document.createElement('div');
        commentDiv.classList.add("bg-gray-50", "border", "border-gray-300", "text-gray-900", "text-sm", "rounded-lg", "focus:ring-blue-500", "focus:border-blue-500", "block", "w-full", "p-2.5");
        commentDiv.innerHTML = comment.title;
        commentsDiv.appendChild(commentDiv);
    })
}

$('.edit-modal-submit').click(function(){
    $('#edit-task-modal').toggleClass('hidden');
    $('#edit-task-modal').toggleClass('backdrop-blur-sm')

    if(currentTask) {
        const taskRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", currentTask.id);
        updateDoc(taskRef, {
            title: document.getElementById('title-of-task').value,
            description: document.getElementById('description-of-task').value
        })
    }
    else {
        console.error("There was an error by updating Task: TaskID not found");
    }

    document.getElementById('name-of-task').value = "";
    currentTask = "";

    loadTasksOfProject();
});

$('.edit-modal-closer').click(function(){
    $('#edit-task-modal').toggleClass('hidden');
    $('#edit-task-modal').toggleClass('backdrop-blur-sm');

    document.getElementById('name-of-task').value = "";
    currentTask = "";
    comments = [];

    console.log("Comments after reset on closer: ", comments);


});

$('#add-comment').click(function (){
    $('#add-comment-modal').toggleClass('hidden');
    $('#add-comment-modal').toggleClass('backdrop-blur-sm');

    document.getElementById('title-of-comment').value = "";

});

$('.comment-modal-submit').click(function(){
    $('#add-comment-modal').toggleClass('hidden');
    $('#add-comment-modal').toggleClass('backdrop-blur-sm')

    var newComment = {
        title: document.getElementById('title-of-comment').value,
    }

    if(currentTask) {
        const commentsRef = collection(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", currentTask.id, "comments");
        addDoc(commentsRef, newComment).then(docRef => {
            newComment.id = docRef.id;
            comments.push(newComment);
            loadCommentsIntoHTML();
        }).catch(error => {
            console.error("Error adding event: ", error);
        });
    }
    else {
        console.error("There was an error by updating Task: TaskID not found");
    }

    document.getElementById('name-of-task').value = "";
    currentTask = "";

    loadTasksOfProject();
});

$('.comment-modal-closer').click(function() {
    $('#edit-task-modal').toggleClass('hidden');
    $('#edit-task-modal').toggleClass('backdrop-blur-sm');

    document.getElementById('title-of-comment').value = "";
});

$('.delete-Task').click(function() {


    const commentRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", currentTask.id);
    deleteDoc(commentRef).then(docRef => {
        $('#add-comment-modal').toggleClass('hidden');
        $('#add-comment-modal').toggleClass('backdrop-blur-sm');

        loadTasksOfProject();
    }).catch(error => {
        console.error("Error adding event: ", error);
    });
})

// ---

$('.proj-completed').click(function (){
    const projRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject)
    if(projCompleted.classList.contains("bg-green-500")) {
        console.log("Green")
        updateDoc(projRef, {status: "Completed"})
        projCompleted.classList.remove('bg-green-500');
        projCompleted.classList.add('bg-red-500');
        projCompleted.innerHTML = "Completed"
    }
    else if(projCompleted.classList.contains("bg-red-500")){
        console.log("Red")
        updateDoc(projRef, {status: "Not Completed"})
        projCompleted.classList.add('bg-green-500');
        projCompleted.classList.remove('bg-red-500');
        projCompleted.innerHTML = "Not Completed"
    }
})

$('.drop-todo').on('drop', function(event) {
    event.preventDefault();
    let draggedItemId = event.originalEvent.dataTransfer.getData("text/plain");
    let task = tasks.find(task => task.id === draggedItemId);
    updateTaskStatus(task, "To-Do");
    loadTasksOfProject();
});

$('.drop-progress').on('drop', function(event) {
    event.preventDefault();
    let draggedItemId = event.originalEvent.dataTransfer.getData("text/plain");
    let task = tasks.find(task => task.id === draggedItemId);
    console.log("Dropped in In Progress");
    updateTaskStatus(task, "In Progress");
    loadTasksOfProject();
});

$('.drop-done').on('drop', function(event) {
    event.preventDefault();
    let draggedItemId = event.originalEvent.dataTransfer.getData("text/plain");
    let task = tasks.find(task => task.id === draggedItemId);
    console.log("Dropped in Done");
    updateTaskStatus(task, "Done");
    loadTasksOfProject();
});

function updateTaskStatus(task, status){
    const tasksRef = doc(db, "users", auth.currentUser.uid, "projects", currentProject, "tasks", task.id);
    updateDoc(tasksRef, {status: status})
        .then(() =>{
            console.log("Updated task: ", task);
        })
        .catch(() => {
            console.error("Error updating task");
        })
}


$('.drop-todo').on('dragover', function(event) {
    event.preventDefault();
});

$('.drop-progress').on('dragover', function(event) {
    event.preventDefault();
});

$('.drop-done').on('dragover', function(event) {
    event.preventDefault();
});

//Navbar

const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text");


toggle.addEventListener("click" , () =>{
    sidebar.classList.toggle("close");
})

modeSwitch.addEventListener("click" , () =>{
    body.classList.toggle("dark");

    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
    }else{
        modeText.innerText = "Dark mode";

    }
});
