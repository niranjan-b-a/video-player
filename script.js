const uploadedFiles = document.querySelector("#formFile");
const pdfs = document.querySelector("#pdfs");
const uploadForm = document.querySelector("#filesForm");
const anchor = document.querySelector(".anchor");
const folderName = document.querySelector(".folderName");
const dropDown = document.querySelector(".side-menu");
const videoTitle = document.querySelector(".videoTitle");
const uploader = document.getElementById("uploader");
const video = document.querySelector("#video");
const videoSrc = document.querySelector(".videoSrc");

/**
 * [
 *      {
 *          folder1 : [
 *          'file1','file2'
 *          ],
 *        name: 'name',
 *        completed: boolean
 *      }
 * ]
 */

let videoList = []; //Stores all the files
let folderList = {}; //to get the number of folders
let arr = []; //stores all the folders

if (localStorage.getItem('currentVideo')) {
    videoSrc.src = JSON.parse(localStorage.getItem('currentVideo'));
}

uploadForm.addEventListener("submit", (e) => {
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
                completed: false
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
    localStorage.setItem("video", JSON.stringify(arr));
    location.reload();
});

const setHtml = () => {
    let incToggle = -1;
    let localArr = JSON.parse(localStorage.getItem("video"));
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
                    return `<div class="inside click hide" data-name="${ele1.name}" data-toggle="${incToggle}" data-filename="${ele1.path}">
                        ${ele1.completed ? `<input type="checkbox" checked>` : `<input type="checkbox">`}
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
};

const getFolder = (item) => {
    let path = item.webkitRelativePath.split("/")[1];
    return folderList[path];
};

function fun() {
    const click = document.querySelectorAll(".click");
    click.forEach((ele) => {
        ele.addEventListener("click", addVideo);
    });
}
function addVideo(e) {
    videoSrc.dataset.currentvideo = `${
        e.target ? e.target.dataset.name : e.dataset.name
    }`;
    videoTitle.innerText = e.target
        ? e.target.dataset.name.split(".")[1]
        : e.dataset.name.split(".")[1];
    localStorage.setItem("currentVideo", JSON.stringify(e.target ? e.target.dataset.filename : e.dataset.filename))
    if (localStorage.getItem('currentVideo')) {
        videoSrc.src = JSON.parse(localStorage.getItem('currentVideo'));
    } else {
        videoSrc.src = e.target ? e.target.dataset.filename : e.dataset.filename;
    }
}
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
const nextVideo = (e) => {
    let crt = e.target.dataset.currentvideo;
    let crtTag = document.querySelector(`[data-name="${crt}"]`);
    if (crtTag.nextElementSibling === null) {
        addVideo(
            crtTag.parentNode.nextElementSibling.firstElementChild
                .nextElementSibling
        );
    } else {
        addVideo(crtTag.nextElementSibling);
    }
};

const completeVideo = (crtEle) => {
    let data = JSON.parse(localStorage.getItem("video"));
    crtEle.querySelector("input").checked = true;
    let currentVideoPath = crtEle.dataset.filename;
    let folderNumber = crtEle.dataset.toggle;
    console.log(currentVideoPath, folderNumber);
    console.log(data);
    data[folderNumber].folder.map(videoChecker => {
        if (videoChecker.path == currentVideoPath) {
            videoChecker.completed = true;
        }
    })
    localStorage.setItem('video', JSON.stringify(data));
}

if (localStorage.getItem("video")) {
    uploader.style.display = "none";
    anchor.style.display = "flex";
    setHtml();
    document.getElementById("video").addEventListener("ended", function (e) {
        // Your code goes here
        let crtEle = document.querySelector(
            `[data-name="${e.target.dataset.currentvideo}"]`
        );
        // console.log(crtEle);
        completeVideo(crtEle);
        nextVideo(e);
    });
}

document.addEventListener('keydown', (e) => {
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
})
