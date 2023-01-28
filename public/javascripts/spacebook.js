(function () {
    const APIKEY = "cosjA0DN7IKcSttpfkp0CmPqIUX8M3eOt88kQPBJ";

    const fetchHandlers = (function () {
        function checkResponse(response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response);
            } else {
                return response.json().then((data) => {
                    console.log(data.code)
                    const error = new Error(`${data.code}<br><br>${data.msg || data.message}`);
                    return Promise.reject(error);
                });
            }
        }

        function getJson(response) {
            return response.json();
        }

        function handleErrorLoad(error) {
            selectors.dateErrorMsg.innerHTML  = `Looks like there was a problem.<br><br> Status Code: ${error.message}
                                                <br><br> you can try load again the feed`;
            selectors.dateErrorMsg.classList.remove("d-none");
            document.getElementById("book-page-main").innerHTML = ""
            selectors.scrollButton.classList.add("d-none");
        }

        function handleErrorScroll() {
            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.remove("d-none");
        }

        function handleErrorComments(error){
            selectors.comments.innerHTML = "";
            if(error.message.includes('Unexpected token')) {
                selectors.modalSpiner.classList.remove('d-none');
                selectors.commentsErrorMsg.innerHTML = 'Your session has expired. \n Please log in again to continue ' +
                                                        'using the app \n\n We had a lot of fun and hope to see you soon!';
                setTimeout(() => { location.href = '/'}, 4000)
            }
            else {
                selectors.commentsErrorMsg.innerHTML = `Looks like there was a problem... <br><br> 
                                                        ${error.message} <br><br>  Please try again later`;
                selectors.modalSpiner.classList.add("d-none");
            }
            selectors.commentsErrorMsg.classList.remove("d-none");
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
        }

        return {
            checkResponse: checkResponse,
            getJson: getJson,
            handleErrorLoad: handleErrorLoad,
            handleErrorScroll: handleErrorScroll,
            startSpiner: startSpiner,
            stopSpiner: stopSpiner,
            initCommentFetch: initCommentFetch,
            handleErrorComments:handleErrorComments,
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
                return false;
            }
            return true;
        }

        function isValid(date) {
            return datePattern.test(date);
        }

        function currTime(){
            return new Date().toUTCString().replace(/\([^()]*\)/g, "");
        }

        return {
            today: getTodayDate,
            prev: calcPrevDate,
            check: checkPatternDates,
            valid: isValid,
            currTime: currTime,
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

            if(!date.check(startDate,endDate)) return;

            fetchHandlers.startSpiner();

            fetch(`https://api.nasa.gov/planetary/apod?api_key=${APIKEY}&start_date=${startDate}&end_date=${endDate}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then((data) => successLoad(data, startDate))
                .catch((error) => failedLoad(error, scrollMode));
        }

        function presentData(responseData, startDate) {
            feedCreate.createCardGrid(responseData);
            currEndDate = date.prev(startDate);
            selectors.scrollButton.classList.remove("d-none");
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

        function changeBg(event){
            if (event.target.checked) {
                document.body.style.backgroundImage = `url(../images/dark-mode.jpg)`;
            } else {
                document.body.style.backgroundImage = `url(../images/light-mode.jpeg)`;
            }
        }

        return {
            init: initPage,
            changeDate: changeDate,
            handleScroll: scroll,
            changeBg:changeBg,
        };
    })();

    const feedCreate = (function () {
        function createCardGrid(data) {
            const {fragment, rowOutCard} = feedCreate.createOutlineGrid();
            // Iterate over the data in reverse order
            for (const imgData of Object.values(data).reverse()) {
                const {colOutCard, col1, col2} = feedCreate.createInnerGrid();

                if (imgData.media_type == "image")
                    col1.appendChild(feedCreate.createImage(imgData.url, imgData.date));
                else col1.appendChild(feedCreate.createVideo(imgData.url));

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
            img.style.width = "700px";
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
            createCardGrid:createCardGrid
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

        function createCommentCard(name, txt) {
            const card = document.createElement("div");
            card.classList.add("card", "mb-1");
            card.innerHTML = `
                             <div class="card-body d-flex justify-content-between align-items-center">
                                 <div class="d-flex align-items-center">
                                       <img src="images/user.jpg" alt="avatar" style="width: 25px; height: 25px;">
                                        <p class="small mb-0 ms-2 h6 text-primary">${name}</p>
                                 </div>
                                  <div class="text-break px-2">${txt}</div>
                             </div> `;
            return card;
        }
        return {
            deleteIcon: createDeleteIcon,
            grid: createGrid,
            card: createCommentCard,
            cols: createCols,
        };
    })();

    const comments = (function () {
        let currImgDate = null;
        const maxChars = 128;
        const sendComment = 13;

        function initModal(imgElement) {
            currImgDate = imgElement;
            selectors.commentTextBox.value = "";
            selectors.commentsErrorMsg.classList.add("d-none");
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
                    postComment(comment)
                }
            }
        }

        function postComment(commentTxt){
            commentsUpdate("/home/comments", "POST", {date: currImgDate, text: commentTxt, user_id:selectors.userId});
        }

        function printComments(listComments) {
            selectors.comments.innerHTML = "";
            let {container, row} = commentsCreate.grid();

            listComments.forEach((comment) => {
                const {col1, col2} = commentsCreate.cols(row);

                col1.appendChild(commentsCreate.card(`${comment.User.firstName} ${comment.User.lastName}`, comment.text, comment.id));

                if (comment.user_id === selectors.userId) {
                    col2.appendChild(commentsCreate.deleteIcon(comment.id, comment.text, deleteComment));
                }
            });
            selectors.comments.appendChild(container);
        }

        function deleteComment(commentId, text) {
            commentsUpdate("/home/comments", "DELETE", {date: currImgDate, commentId, text, user_id:selectors.userId});
        }

        function getDateComments() {
            fetchHandlers.initCommentFetch(currImgDate);
            selectors.modalSpiner.classList.remove("d-none");

            fetch(`/home/comments?date=${currImgDate}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then((data) => printComments(data))
                .then(() => selectors.modalSpiner.classList.add("d-none"))
                .then(lastPollTimestamp = date.currTime())
                .catch((error) => fetchHandlers.handleErrorComments(error));
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
                .then(() => lastPollTimestamp = date.currTime())
                .catch((error) => fetchHandlers.handleErrorComments(error));
        }

        function pollComments() {
            fetchHandlers.initCommentFetch(currImgDate);

            fetch(`/home/poll-comments/?date=${currImgDate}&lastPollTimestamp=${lastPollTimestamp}&user_id=${selectors.userId}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then((data) => pollHandler(data))
                .catch((error) => fetchHandlers.handleErrorComments(error));
        }

        function pollHandler(data){
            if (data.isUpdate) {
                selectors.modalSpiner.classList.remove("d-none");
                setTimeout(() => {
                    selectors.modalSpiner.classList.add("d-none")
                    printComments(data.comments);
                    }, 3000);
                lastPollTimestamp = data.updateTime;
            }
        }

        function stopPolling() {
            clearInterval(intervalId);
        }

        function startPolling() {
            intervalId = setInterval(pollComments, 15000);
        }

        return {
            initModal: initModal,
            type: commentTyping,
            startPolling:startPolling,
            stopPolling:stopPolling,
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
        userId: parseInt(document.getElementById("user_id").textContent),
        userName: document.getElementById("userName").textContent.trim(),
        userEmail: document.getElementById("userEmail").textContent.trim(),
    }

    document.addEventListener("DOMContentLoaded", () => {
        bookPage.init();

        document.getElementById("dateFormSubmit").addEventListener("click", bookPage.changeDate);

        document.getElementById("more").addEventListener("click", bookPage.handleScroll);

        document.getElementById("addANote").addEventListener("keydown", comments.type);

        document.getElementById("myModal").addEventListener("hide.bs.modal", comments.stopPolling);

        document.getElementById("myModal").addEventListener("show.bs.modal", comments.startPolling);

        document.getElementById('switchMode').addEventListener('change', bookPage.changeBg);
     })
})();