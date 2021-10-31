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
 *        name: 'name'
 *      }
 * ]
 */

let videoList = []; //Stores all the files
let folderList = {}; //to get the number of folders
let arr = []; //stores all the folders
uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    uploader.style.display = "none";
    anchor.style.display = "flex";
    console.log(uploadedFiles.files);
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
                <i class="fas fa-caret-up"></i>
            </div>
            ${ele.folder
                .map((ele1) => {
                    return `<div class="inside click hide" data-name="${ele1.name}" data-toggle="${incToggle}" data-filename="${ele1.path}">${ele1.name} </div> `;
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
    console.log(e);
    console.log(e.target ? "target" : e.dataset);
    videoSrc.dataset.currentvideo = `${
        e.target ? e.target.dataset.name : e.dataset.name
    }`;
    videoTitle.innerText = e.target
        ? e.target.dataset.name.split(".")[1]
        : e.dataset.name.split(".")[1];
    videoSrc.src = e.target ? e.target.dataset.filename : e.dataset.filename;
}
function sideMenu() {
    const outside = document.querySelectorAll(".outside");
    outside.forEach((item) => {
        item.addEventListener("click", toggleMenu);
    });
    function toggleMenu(e) {
        const data = e.target.dataset.toggle;
        console.log(data);
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
    console.log(crt);
    let crtTag = document.querySelector(`[data-name="${crt}"]`);
    console.log(crtTag);
    if (crtTag.nextElementSibling === null) {
        console.log("entered");
        // videoSrc.src =
        //     crtTag.parentNode.nextElementSibling.firstElementChild.nextElementSibling.dataset.filename;
        // videoTitle.innerText =
        //     crtTag.parentNode.nextElementSibling.firstElementChild.nextElementSibling.dataset.name.split(
        //         "."
        //     )[1];
        addVideo(
            crtTag.parentNode.nextElementSibling.firstElementChild
                .nextElementSibling
        );
    } else {
        // videoSrc.src = crtTag.nextElementSibling.dataset.filename;
        // videoTitle.innerText =
        //     crtTag.nextElementSibling.dataset.name.split(".")[1];
        addVideo(crtTag.nextElementSibling);
    }
};

if (localStorage.getItem("video")) {
    console.log("first time");
    uploader.style.display = "none";
    anchor.style.display = "flex";
    setHtml();
    document.getElementById("video").addEventListener("ended", function (e) {
        // Your code goes here
        console.log(e.target);
        let crtEle = document.querySelector(
            `[data-name="${e.target.dataset.currentvideo}"]`
        );
        nextVideo(e);
    });
}
