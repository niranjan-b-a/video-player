const uploadedFiles = document.querySelector("#formFile");
const uploadForm = document.querySelector("#filesForm");
const anchor = document.querySelector(".anchor");
const folderName = document.querySelector(".folderName");
const dropDown = document.querySelector(".side-menu");
const videoTitle = document.querySelector(".videoTitle");
const uploader = document.getElementById("uploader");
const video = document.querySelector("#video");
const videoSrc = document.querySelector(".videoSrc");
const navbarName = document.querySelector("#navbarName");
const addNewCourse = document.querySelector("#addNewCourse");
const recentlyOpened = document.querySelector("#recentlyOpened");
const commentArea = document.querySelector("#floatingTextarea2");
let recentCourseList;
let courseName;
let key;
let localArr;
let courses;
let videoList = []; //Stores all the files
let folderList = {}; //to get the number of folders
let arr = []; //stores all the folders

// format of storing video paths
/**
 * [
 *    {
 *          folder: [
 *         { path:
 *           name: 'name',
 *           completed: boolean
 *           comment: "Your comments go here"}
 *      ],
 *       id: ,
 *       name: section name
 *    }
 * ]
 */

// saving to local storage
const saveToLocal = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Update recent course list in dropdown
const updateRecents = (courses) => {
    const recentList = courses
        .map((course) => {
            return `<li class="recentCourseList"><a class="dropdown-item" href="#" data-coursename="${course}">${course}</a></li>`;
        })
        .join("");
    recentlyOpened.innerHTML = recentList;
    recentCourseList = document.querySelectorAll(".recentCourseList");
};

// upload a course
const uploadCourse = (e) => {
    e.preventDefault();

    uploader.style.display = "none";
    anchor.style.display = "flex";
    i = 0;
    for (let iter of uploadedFiles.files) {
        let path = iter.webkitRelativePath.split("/")[1];
        if (!(path in folderList)) {
            folderList[path] = i;
            i++;
            arr.push({
                folder: [],
                name: path,
                id: i,
            });
        }
    }
    //to reverse the folders order in folderList obj
    for (let key in folderList) {
        folderList[key] = Object.keys(folderList).length - 1 - folderList[key];
    }
    // to reverse the complete arr
    arr.reverse();
    for (let iter of uploadedFiles.files) {
        if (iter.type === "video/mp4") {
            let fol = getFolder(iter);
            arr[fol].folder.push({
                path: iter.webkitRelativePath,
                name: iter.name,
                completed: false,
            });
        }
    }

    arr.map((ele) => {
        ele.folder.sort(function (a, b) {
            return (
                parseInt(a.name.split(".")[0].trim()) -
                parseInt(b.name.split(".")[0].trim())
            );
        });
    });
    courseName = arr[0].folder[0].path.split("/")[0];
    setWatching(courseName);
    if (!localStorage.getItem(courseName)) {
        saveToLocal(courseName, arr);
        if (!localStorage.getItem("courses")) {
            courses = [courseName];
            saveToLocal("courses", courses);
        } else {
            courses = JSON.parse(localStorage.getItem("courses"));
            courses.push(courseName);
            saveToLocal("courses", courses);
        }
        location.reload();
    }
};

const setWatching = (courseName) => {
    localStorage.removeItem("currentVideo");
    saveToLocal("watching", courseName);
};

const setHtml = () => {
    let incToggle = -1;
    key = JSON.parse(localStorage.getItem("watching"));
    localArr = JSON.parse(localStorage[key]);
    let htmlString = localArr
        .map((ele) => {
            incToggle++;
            return `
        <div class="sub-menus">
            <div class="outside" data-toggle="${incToggle}">
                ${ele.name}
                <i class="fas fa-caret-down"></i>
            </div>
            ${ele.folder
                .map((ele1) => {
                    return `<div class="inside click hide" data-name="${
                        ele1.name
                    }" data-toggle="${incToggle}" data-filename="${ele1.path}">
                        ${
                            ele1.completed
                                ? `<input type="checkbox" checked>`
                                : `<input type="checkbox">`
                        }
                        ${ele1.name}
                    </div> `;
                })
                .join("")}
        </div>
        `;
        })
        .join("");
    dropDown.innerHTML = htmlString;
    sideMenu();
    fun();
    navbarName.innerText = localArr[0].folder[0].path
        .split("/")[0]
        .toUpperCase();
};

// get folder index
const getFolder = (item) => {
    let path = item.webkitRelativePath.split("/")[1];
    return folderList[path];
};

// clicking on a video to play it
function fun() {
    const click = document.querySelectorAll(".click");
    click.forEach((ele) => {
        ele.addEventListener("click", (e) => {
            addVideo(e.target.dataset.filename);
        });
    });
}

// Playing video
function addVideo(e) {
    let element = document.querySelector(`[data-filename="${e}"]`);
    videoSrc.dataset.currentvideo = element.dataset.name;
    videoTitle.innerText = element.dataset.name.split(".")[1];
    saveToLocal("currentVideo", element.dataset.filename);
    if (localStorage.getItem("currentVideo")) {
        videoSrc.src = JSON.parse(localStorage.getItem("currentVideo"));
    } else {
        videoSrc.src = element.dataset.filename;
    }
    getComment(element);
}

// adding comment inside comment box
const getComment = (element) => {
    let data = JSON.parse(
        localStorage.getItem(localStorage.getItem("watching"))
    );
    let folderNumber = element.dataset.toggle;
    data[folderNumber].folder.map((video) => {
        if (video.path == element.dataset.filename) {
            commentArea.value = video.comment ? video.comment : "";
        }
    });
};

// side menu functions
function sideMenu() {
    const outside = document.querySelectorAll(".outside");
    outside.forEach((item) => {
        item.addEventListener("click", toggleMenu);
    });
    function toggleMenu(e) {
        const data = e.target.dataset.toggle;
        const toggleEle = document.querySelectorAll(`[data-toggle="${data}"]`);
        const icon = e.target.children;
        icon[0].classList.toggle("rotate");

        for (let i = 1; i < toggleEle.length; i++) {
            toggleEle[i].classList.toggle("hide");
        }
    }
}

// playing next video if a video is completed
const nextVideo = (e) => {
    let crt = e.target.dataset.currentvideo;
    let crtTag = document.querySelector(`[data-name="${crt}"]`);
    if (crtTag.nextElementSibling === null) {
        addVideo(
            crtTag.parentNode.nextElementSibling.firstElementChild
                .nextElementSibling.dataset.filename
        );
    } else {
        addVideo(crtTag.nextElementSibling.dataset.filename);
    }
};

// checking the checkbox if a video is completed and update it in local storage
const completeVideo = (crtEle) => {
    let data = JSON.parse(localStorage.getItem(key));
    crtEle.querySelector("input").checked = true;
    let currentVideoPath = crtEle.dataset.filename;
    let folderNumber = crtEle.dataset.toggle;
    data[folderNumber].folder.map((videoChecker) => {
        if (videoChecker.path == currentVideoPath) {
            videoChecker.completed = true;
        }
    });
    saveToLocal(`${localArr[0].folder[0].path.split("/")[0]}`, data);
};

//if a course is saved in local storage
if (localStorage.getItem("watching")) {
    uploader.style.display = "none";
    anchor.style.display = "flex";
    setHtml();
    document.getElementById("video").addEventListener("ended", function (e) {
        // Your code goes here
        let crtEle = document.querySelector(
            `[data-name="${e.target.dataset.currentvideo}"]`
        );
        completeVideo(crtEle);
        nextVideo(e);
    });
    updateRecents(JSON.parse(localStorage.getItem("courses")));
}

// Keyboard shortcuts
const shortcut = (e) => {
    if (e.code == "ArrowLeft" || e.code == "KeyJ") {
        videoSrc.currentTime = videoSrc.currentTime - 5;
    }

    if (e.code == "ArrowRight" || e.code == "KeyL") {
        videoSrc.currentTime = videoSrc.currentTime + 5;
    }

    if (e.code == "Space" || e.code == "KeyK") {
        if (videoSrc.paused == false) {
            videoSrc.pause();
        } else {
            videoSrc.play();
        }
    }

    if (e.code == "KeyF") {
        videoSrc.requestFullscreen();
    }
};

// adding a new course
const addNew = (e) => {
    anchor.style.display = "none";
    uploader.style.display = "flex";
    videoSrc.pause();
};

// change course
const changeCourse = (e) => {
    setWatching(e.target.dataset.coursename);
    location.reload();
};

// Saving a comment
const saveComment = (e) => {
    let comment = document.querySelector("#floatingTextarea2").value;
    let data = JSON.parse(
        localStorage.getItem(localStorage.getItem("watching"))
    );
    let currentVideoPath = JSON.parse(localStorage.getItem("currentVideo"));
    let folderNumber = document.querySelector(
        `[data-filename="${currentVideoPath}"]`
    ).dataset.toggle;
    data[folderNumber].folder.map((videoChecker) => {
        if (videoChecker.path == currentVideoPath) {
            videoChecker["comment"] = comment;
        }
    });
    saveToLocal(localStorage.getItem("watching"), data);
};

// checking if a video has to be continued
if (localStorage.getItem("currentVideo")) {
    addVideo(JSON.parse(localStorage.getItem("currentVideo")));
}

// Event listeners

// Uploading a course
uploadForm.addEventListener("submit", uploadCourse);

//adding a new course
addNewCourse.addEventListener("click", addNew);

// Saving a comment
document.querySelector("#saveComment").addEventListener("click", saveComment);

// enabling key board shorcuts after entering a comment
commentArea.addEventListener("blur", (e) => {
    document.addEventListener("keydown", shortcut);
});

//Changing a course
recentCourseList.forEach((course) => {
    course.addEventListener("click", changeCourse);
});

//disabling keyboard shortcuts while commenting
commentArea.addEventListener("focus", (e) => {
    document.removeEventListener("keydown", shortcut);
});

//Keyboard shortcuts
document.addEventListener("keydown", shortcut);
