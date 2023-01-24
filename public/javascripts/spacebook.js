(function () {
    const APIKEY = "cosjA0DN7IKcSttpfkp0CmPqIUX8M3eOt88kQPBJ";

    const fetchHandlers = (function () {
        function checkResponse(response) {

            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response);
            } else {
                return response.json().then((data) => {
                    return Promise.reject(new Error(`${data.code}${data.msg || data.message}`));
                });
            }
        }

        function getJson(response) {
            return response.json();
        }

        function handleErrorLoad(error) {
            comments.closeCommentsModal();
            selectors.dateErrorMsg.innerHTML = `Looks like there was a problem. <br> Status Code: ${error}`;
            selectors.dateErrorMsg.classList.remove("d-none");
            document.getElementById("book-page-main").innerHTML = ""
            selectors.scrollButton.classList.add("d-none");
        }

        function handleErrorScroll() {
            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.remove("d-none");
        }

        function startSpiner() {
            selectors.scrollButton.classList.add("d-none");
            selectors.loadingSpiner.classList.remove("d-none");
        }

        function stopSpiner() {
            selectors.scrollButton.classList.remove("d-none");
            selectors.loadingSpiner.classList.add("d-none");
        }

        function initCommentFetch(dateStr) {

            if (!date.valid(dateStr))
                fetchHandlers.handleErrorLoad("date pattern is not valid")

        //    selectors.modalSpiner.classList.remove("d-none");
        }

        return {
            checkResponse: checkResponse,
            getJson: getJson,
            handleErrorLoad: handleErrorLoad,
            handleErrorScroll: handleErrorScroll,
            startSpiner: startSpiner,
            stopSpiner: stopSpiner,
            initCommentFetch: initCommentFetch,
        };
    })();

    const date = (function () {
        const datePattern = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

        function getTodayDate() {
            // Get the  current date, year, month, and day as separate values
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1; // January is 0, so add 1
            const day = now.getDate();

            // Pad the month and day with leading zeros if necessary
            const paddedMonth = month.toString().padStart(2, "0");
            const paddedDay = day.toString().padStart(2, "0");

            // Concatenate the year, month, and day with dashes to get the desired format
            return `${year}-${paddedMonth}-${paddedDay}`;
        }

        function calcPrevDate(startDate, valDays = 1) {
            const currDateObject = new Date(startDate);
            currDateObject.setDate(currDateObject.getDate() - valDays);

            const year = currDateObject.getFullYear().toString().padStart(4, "0");
            const month = (currDateObject.getMonth() + 1).toString().padStart(2, "0");
            const day = currDateObject.getDate().toString().padStart(2, "0");

            return [year, month, day].join("-");
        }

        function checkPatternDates(startDate, endDate) {

            if (!isValid(startDate) || !isValid(endDate)) {
                fetchHandlers.handleErrorLoad("date pattern is not valid, <br> enter new date type 'YYYY-MM-DD'");
            }
        }

        function isValid(date) {
            return datePattern.test(date);
        }

        return {
            today: getTodayDate,
            prev: calcPrevDate,
            check: checkPatternDates,
            valid: isValid,
        };
    })();

    const bookPage = (function () {
        let currEndDate = "";
        const maxImagesForPage = 3;

        function initPage() {
            let todayDate = date.today();
            selectors.selectDate.value = todayDate;
            loadData(todayDate);
        }

        function successLoad(data, startDate){
            presentData(data, startDate);
            fetchHandlers.stopSpiner();
        }

        function failedLoad(error, scrollMode) {
            fetchHandlers.stopSpiner();

            if (!scrollMode)
                fetchHandlers.handleErrorLoad(error);
            else
                fetchHandlers.handleErrorScroll(error);
        }

        function loadData(endDate, scrollMode = false) {
            const startDate = date.prev(endDate, maxImagesForPage - 1);

            fetchHandlers.startSpiner();

            fetch(`https://api.nasa.gov/planetary/apod?api_key=${APIKEY}&start_date=${startDate}&end_date=${endDate}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then(successLoad)
                .catch(failedLoad);

        }

        function presentData(responseData, startDate) {
            createCardGrid(responseData);
            currEndDate = date.prev(startDate);
            selectors.scrollButton.classList.remove("d-none");
        }

        function createCardGrid(data) {
            const {fragment, rowOutCard} = feedCreate.createOutlineGrid();

            // Iterate over the data in reverse order
            for (const imgData of Object.values(data).reverse()) {
                const {colOutCard, col1, col2} = feedCreate.createInnerGrid();

                if (imgData.media_type == "image")
                    col1.appendChild(feedCreate.createImage(imgData.url, imgData.date));
                else col1.appendChild(feedCreate.createVideo(imgData.url));

                // Create the card header, body, and footer elements
                const {cardHeader, cardBody, cardFooter} = feedCreate.createDataGrid(col2);

                // Create the card data
                cardHeader.appendChild(feedCreate.createCardTitle(imgData.title));
                cardBody.appendChild(feedCreate.createCardText(imgData.explanation));
                cardFooter.appendChild(feedCreate.createCardDate(imgData.date));
                cardFooter.appendChild(feedCreate.createCopyRight(imgData.copyright));
                cardFooter.appendChild(feedCreate.commentTextBox(imgData.date));

                rowOutCard.appendChild(colOutCard);
            }
            selectors.mainContainer.appendChild(fragment);
        }

        function changeDate(event) {
            event.preventDefault();

            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.add("d-none");
            selectors.mainContainer.innerHTML = "";
            selectors.dateErrorMsg.classList.add("d-none");

            let newEndDate = selectors.selectDate.value;
            loadData(newEndDate);
        }

        function scroll() {
            if (selectors.endOfScroll.classList.contains("d-none")) {
                loadData(currEndDate, true);
            }
        }

        return {
            init: initPage,
            changeDate: changeDate,
            handleScroll: scroll,
        };

    })();

    const feedCreate = (function () {
        function createInnerGrid() {
            const colOutCard = document.createElement("div");
            colOutCard.className = "col";
            const card = document.createElement("div");
            card.classList.add("card", "card-grid", "border-light", "h-100", "w-100");
            const rowInCard = document.createElement("div");
            rowInCard.className = "rowInCard g-0";
            const col1 = document.createElement("div");
            col1.classList.add("col-md-3", "w-100", "col-img");
            const col2 = document.createElement("div");
            col2.className = "col";

            rowInCard.appendChild(col1);
            rowInCard.appendChild(col2);
            card.appendChild(rowInCard);
            colOutCard.appendChild(card);

            return {colOutCard, card, rowInCard, col1, col2};
        }

        function commentTextBox(date) {
            const cmdButton = document.createElement("button");
            cmdButton.className = "btn btn-outline-dark mr-2 cmdBtn";
            cmdButton.setAttribute("id", date);
            cmdButton.setAttribute("data-bs-toggle", "modal");
            cmdButton.setAttribute("data-bs-target", "#myModal");
            cmdButton.textContent = "comments";
            cmdButton.addEventListener("click", function () {
                comments.initModal(date);
            });
            return cmdButton;
        }

        function createCopyRight(copyright) {
            const copyRight = document.createElement("div");
            copyRight.classList.add("text-center", "text-muted", "text-small");
            copyRight.innerHTML = copyright ? `Copyright &copy; ${copyright}` : '<br>';
            return copyRight;
        }

        function createImage(url, date) {
            const img = document.createElement("img");
            img.className = "img-fluid col-img";
            img.src = url;
            img.alt = `The img of the day: date ${date}`;
            img.id = date;
            img.style.width = "600px";
            img.style.height = "550px";
            return img;
        }

        function createVideo(url) {
            const ratio = document.createElement("div");
            ratio.setAttribute("class", "ratio ratio-1x1 col-img");

            // Create an iframe element
            let iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowfullscreen = true;

            ratio.style.height = "550px";
            ratio.appendChild(iframe);
            return ratio;
        }

        function createCardTitle(title) {
            const cardTitle = document.createElement("h6");
            cardTitle.className = "card-title display-6";
            cardTitle.innerHTML = `${title}`;
            return cardTitle;
        }

        function createCardText(explanation) {
            const cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.innerHTML = explanation;
            return cardText;
        }

        function createCardDate(date) {
            const cardDate = document.createElement("small");
            cardDate.className = "text-center text-muted";
            cardDate.innerHTML = `${date}`;
            return cardDate;
        }

        function createDataGrid(col) {
            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header", "card-img-header");
            col.appendChild(cardHeader);
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body", "card-img-body");
            col.appendChild(cardBody);
            const cardFooter = document.createElement("div");
            cardFooter.classList.add("card-footer", "card-img-footer", "text-wrap", "container");
            col.appendChild(cardFooter);
            return {cardHeader, cardBody, cardFooter};
        }

        function createOutlineGrid() {
            const fragment = document.createDocumentFragment();
            const rowOutCard = document.createElement("div");
            rowOutCard.className = "row row-cols-1 row-cols-md-3 g-4 mt-4 mb-4";
            fragment.appendChild(rowOutCard);
            return {fragment, rowOutCard};
        }

        return {
            commentTextBox: commentTextBox,
            createCopyRight: createCopyRight,
            createImage: createImage,
            createVideo: createVideo,
            createCardTitle: createCardTitle,
            createCardText: createCardText,
            createCardDate: createCardDate,
            createDataGrid: createDataGrid,
            createInnerGrid: createInnerGrid,
            createOutlineGrid: createOutlineGrid,

        };
    })();

    const commentsCreate = (function () {
        function createDeleteIcon(id, text, deleteFunc) {
            const deleteImage = document.createElement("img");
            deleteImage.src = "./images/delete.png";
            deleteImage.alt = "delete image";
            deleteImage.classList.add("image-fluid", "deleteComment");
            deleteImage.addEventListener("click", () => deleteFunc(id, text));
            return deleteImage;
        }

        function createGrid() {
            const container = document.createElement("div");
            container.classList.add("container");

            const row = document.createElement("div");
            row.classList.add("row");

            container.appendChild(row);
            return {container, row};
        }

        function createCols(row) {
            const col1 = document.createElement("div");
            col1.classList.add("col-11");
            row.appendChild(col1);

            const col2 = document.createElement("div");
            col2.classList.add("col-1", "d-flex", "align-items-center", "justify-content-center", "my-auto");
            row.appendChild(col2);

            return {col1, col2};
        }

        function createUserIcon() {
            const avatar = document.createElement("img");
            avatar.src = "images/user.jpg";
            avatar.alt = "avatar";
            avatar.style.width = "25px";
            avatar.style.height = "25px";
            return avatar;
        }

        function createUserNameText(name) {
            const username = document.createElement("p");
            username.className = "small mb-0 ms-2 h6 text-primary";
            username.textContent = name;
            return username;
        }

        function createUserCommentText(txt) {
            const commentText = document.createElement("p");
            commentText.className = "text-break px-2";
            commentText.textContent = txt;
            return commentText;
        }

        function createFlexCard() {
            const card = document.createElement("div");
            card.classList.add("card", "mb-1");
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            const justifyContentBetween = document.createElement("div");
            justifyContentBetween.className = "justify-content-between";
            const flexRow = document.createElement("div");
            flexRow.className = "row align-items-center justify-content-center my-auto";

            justifyContentBetween.appendChild(flexRow);
            cardBody.appendChild(justifyContentBetween);
            card.appendChild(cardBody);
            return {flexRow, card};
        }

        function create3cols(flexRow) {
            const col1 = document.createElement("div");
            col1.classList.add("col-1");
            flexRow.appendChild(col1);

            const col2 = document.createElement("div");
            col2.classList.add("col-3");
            flexRow.appendChild(col2);

            const col3 = document.createElement("div");
            col3.classList.add("col");
            flexRow.appendChild(col3);
            return {col1, col2, col3};
        }

        function commentCard(txt, name) {
            const {flexRow, card} = createFlexCard();
            const {col1, col2, col3} = create3cols(flexRow);

            col1.appendChild(createUserIcon());
            col2.appendChild(createUserNameText(name));
            col3.appendChild(createUserCommentText(txt));

            return card;
        }

        return {
            deleteIcon: createDeleteIcon,
            grid: createGrid,
            card: commentCard,
            cols: createCols,
        };
    })();

    const comments = (function () {
        let currImgDate = null;
        const maxChars = 128;
        const sendComment = 13;

        function closeModal() {
            selectors.modalSpiner.classList.add("d-none");
            selectors.commentsErrorMsg.innerHTML = "Looks like there was a problem..."
        }

        function initClick(imgElement) {
            currImgDate = imgElement;
            selectors.commentTextBox.value = selectors.commentsErrorMsg.innerText = "";
            selectors.commentModalTitle.innerText = getTitle();
            getDateComments();
        }

        function getTitle() {
            return "All comments for: " + currImgDate.split("-").reverse().join("-");
        }

        function commentTyping(event) {
            let comment = event.target.value;

            if (event.keyCode === sendComment) {

                if (comment.trim() === "") {
                    selectors.commentsErrorMsg.innerText = "comment cant be empty!"
                } else if (comment.length >= maxChars) {
                    selectors.commentsErrorMsg.innerText = "text can not be longer than 128 chars"
                } else {
                    selectors.commentsErrorMsg.innerText = ""
                    selectors.commentTextBox.value = "";
                    commentsUpdate("/comments/", "POST", {date: currImgDate, text: comment});
                }
            }
        }

        function printComments(listComments) {
            document.getElementById("comments").innerHTML = "";

            let {container, row} = commentsCreate.grid();

            listComments.forEach((comment) => {
                const {col1, col2} = commentsCreate.cols(row);

                col1.appendChild(commentsCreate.card(comment.text, "add user name"));

                if (comment.email === selectors.userEmail) {
                    col2.appendChild(commentsCreate.deleteIcon(comment.id, comment.text, deleteComment));
                }
            });
            selectors.comments.appendChild(container);
        }

        function deleteComment(id, text) {
            commentsUpdate("/comments/", "DELETE", {date: currImgDate, id, text});
        }

        function commentsUpdate(url, method, bodyData) {
            fetchHandlers.initCommentFetch(currImgDate);

            fetch(url, {
                method: method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(bodyData),
            })
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then(getDateComments)
                .then(() => selectors.modalSpiner.classList.add("d-none"))
                .catch(fetchHandlers.handleErrorLoad);
        }

        function getDateComments() {
            fetchHandlers.initCommentFetch(currImgDate);

            fetch(`/comments/${currImgDate}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then(printComments)
                .then(() => selectors.modalSpiner.classList.add("d-none"))
                .catch(fetchHandlers.handleErrorLoad);
        }

        return {
            closeCommentsModal: closeModal,
            initModal: initClick,
            type: commentTyping,
        };
    })();

    const selectors = {
        dateErrorMsg: document.getElementById("error-message-date"),
        loadingSpiner: document.getElementById("loading"),
        scrollButton: document.getElementById("more"),
        endOfScroll: document.getElementById("scrollEnd"),
        selectDate: document.getElementById("chooseDate"),
        mainContainer: document.getElementById("book-page-main"),
        commentTextBox: document.getElementById("addANote"),
        comments: document.getElementById("comments"),
        commentsErrorMsg: document.getElementById("commentErr"),
        commentModalTitle: document.getElementById("comment-title"),
        modalSpiner: document.getElementById("modalLoading"),
        modalComments: document.getElementById("myModal"),
        userName: document.getElementById("userName").textContent.trim(),
        userEmail: document.getElementById("userEmail").textContent.trim(),
    }

    document.addEventListener("DOMContentLoaded", () => {

        bookPage.init();

        document.getElementById("dateFormSubmit").addEventListener("click", bookPage.changeDate);

        document.getElementById("more").addEventListener("click", bookPage.handleScroll);

        document.getElementById("addANote").addEventListener("keydown", comments.type);
     })
})();


// function pollComments() {
//     fetchHandlers.initCommentFetch(currImgDate);
//
//     fetch(`/comments/?date=${currImgDate}&lastPollTimestamp=${lastPollTimestamp}`)
//         //.then(fetchHandlers.checkResponse)
//         .then(fetchHandlers.getJson)
//         .then((data) => {
//             if (!data.msg) {
//                 console.log("hereeeeee")
//                 //      printComments(data);
//             }
//             else{
//                 console.log("nothing to update")
//             }
//         })
//         //     .then(() => selectors.modalSpiner.classList.add("d-none"))
//         .then(() =>lastPollTimestamp = new Date())
//         .catch((error) => fetchHandlers.handleErrorLoad(error));
// }
//
// function stopPolling() {
//     clearInterval(intervalId);
// }
//
// function startPolling() {
//     intervalId = setInterval(pollComments, 1500);
// }
//
// document.getElementById("myModal").addEventListener("hide.bs.modal", comments.stopPolling);
//
// document.getElementById("myModal").addEventListener("show.bs.modal", comments.startPolling);
//                .then(() => lastPollTimestamp = new Date().getTime())