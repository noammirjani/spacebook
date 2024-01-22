(function () {
    const APIKEY = ""; // add you api key from https://api.nasa.gov

    /**
     *A module for handling fetch functionality.
     * @module fetchHandlers
     * @type {checkResponse: (function*=):{promise}, {getJson}: (function*=){json}, handleError:(function*=){error}}
     */
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

        /**
         * Parses the response's json
         * @function
         * @param {Response} response - The fetch API response object
         * @returns {Promise} - Resolves with the json parsed response
         */
        function getJson(response) {
            return response.json();
        }

        /**
         * Handles the error when loading the feed
         * @function
         * @param {Error} error - The error object
         */
        function handleErrorLoad(error) {
            selectors.dateErrorMsg.innerHTML  = `Looks like there was a problem.<br><br> Status Code: ${error.message}
                                                <br><br> you can try load again the feed`;
            selectors.dateErrorMsg.classList.remove("d-none");
            document.getElementById("book-page-main").innerHTML = ""
            selectors.scrollButton.classList.add("d-none");
        }

        /**
         * Handles the error when scrolling the feed
         * @function
         */
        function handleErrorScroll() {
            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.remove("d-none");
        }

        /**
         * Handles the error when loading the comments
         * @function
         * @param {Error} error - The error object
         */
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

        /**
         * Handles the start of the spiner
         * @function
         */
        function startSpiner() {
            selectors.scrollButton.classList.add("d-none");
            selectors.loadingSpiner.classList.remove("d-none");
        }

        /**
         * Handles the stop of the spiner
         * @function
         */
        function stopSpiner() {
            selectors.scrollButton.classList.remove("d-none");
            selectors.loadingSpiner.classList.add("d-none");
        }

        /**
         * Initializes the fetch for comments
         * @function
         * @param {string} dateStr - The date string to be used for fetching comments
         */
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

    /**
     * date: Object
     * @property today: () => String
     * @property prev: (String[, Number]) => String
     */
    const date = (function () {
        const datePattern = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

        /**
         * Returns the current date in the format of "YYYY-MM-DD"
         * @function getTodayDate
         * @returns {string} - Current date in format of "YYYY-MM-DD"
         */
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

        /**
         * Returns the date from a given start date and number of days before
         * @function calcPrevDate
         * @param {string} startDate - The starting date in format of "YYYY-MM-DD"
         * @param {number} [valDays=1] - Number of days before the start date
         * @returns {string} - The calculated previous date in format of "YYYY-MM-DD"
         */
        function calcPrevDate(startDate, valDays = 1) {
            const currDateObject = new Date(startDate);
            currDateObject.setDate(currDateObject.getDate() - valDays);

            const year = currDateObject.getFullYear().toString().padStart(4, "0");
            const month = (currDateObject.getMonth() + 1).toString().padStart(2, "0");
            const day = currDateObject.getDate().toString().padStart(2, "0");

            return [year, month, day].join("-");
        }

        /**
         * Check if a given start and end date match the required format of "YYYY-MM-DD"
         * @function checkPatternDates
         * @param {string} startDate - The starting date
         * @param {string} endDate - The ending date
         * @returns {boolean} - true if the dates match the required format, false otherwise
         */
        function checkPatternDates(startDate, endDate) {
            if (!isValid(startDate) || !isValid(endDate)) {
                fetchHandlers.handleErrorLoad("date pattern is not valid, <br> enter new date type 'YYYY-MM-DD'");
                return false;
            }
            return true;
        }

        /**
         * Check if a given date matches the required format of "YYYY-MM-DD"
         * @function isValid
         * @param {string} date - The date to check
         * @returns {boolean} - true if the date matches the required format, false otherwise
         */
        function isValid(date) {
            return datePattern.test(date);
        }

        /**
         * Returns the current time in the format of "UTC"
         * @function currTime
         * @returns {string} - Current time in format of "UTC"
         */
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

    /**
     * A module for handling book page functionality.
     * @module bookPage
     * @type {initPage: (function (): void), loadData: (function (string[, boolean]): void),
     * presentData: (function (Array, string): void),
     * createCardGrid: (function (Array): void), more: (function (): void), changeDate: (function (): void),
     * handleScroll: (function (): void), loadDataAjax: (function (string[, boolean]): void)
     */
    const bookPage = (function () {
        let currEndDate = "";
        const maxImagesForPage = 3;

        /**
         * Initializes the page with today's date and loads the data for that date
         */
        function initPage() {
            let todayDate = date.today();
            selectors.selectDate.value = todayDate;
            loadData(todayDate);
        }

        /**
         * Handles a successful fetch of data by presenting the data on the page and stopping the loading spinner
         * @param {Object} data - The data returned from the fetch request
         * @param {String} startDate - The start date of the data
         */
        function successLoad(data, startDate){
            presentData(data, startDate);
            fetchHandlers.stopSpiner();
        }

        /**
         * Handles a failed fetch by stopping the loading spinner and displaying an error message
         * @param {Object} error - The error returned from the fetch request
         * @param {Boolean} scrollMode - Indicates if the failed fetch was for scrolling or changing the date
         */
        function failedLoad(error, scrollMode) {
            fetchHandlers.stopSpiner();

            if (!scrollMode)
                fetchHandlers.handleErrorLoad(error);
            else
                fetchHandlers.handleErrorScroll(error);
        }

        /**
         * Fetches data from the NASA API for the given date range
         * @param {String} endDate - The end date of the date range
         * @param {Boolean} [scrollMode=false] - Indicates if the fetch is for scrolling or changing the date
         */
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

        /**
         * Presents the data on the page by creating cards for each item and updating the current end date
         * @param {Object} responseData - The data returned from the fetch request
         * @param {String} startDate - The start date of the data
         */
        function presentData(responseData, startDate) {
            feedCreate.createCardGrid(responseData);
            currEndDate = date.prev(startDate);
            selectors.scrollButton.classList.remove("d-none");
        }

        /**
         * Handles a change in the date selection by loading new data for the selected date and updating the page
         * @param {Event} event - The change event for the date selection element
         */
        function changeDate(event) {
            event.preventDefault();

            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.add("d-none");
            selectors.mainContainer.innerHTML = "";
            selectors.dateErrorMsg.classList.add("d-none");

            let newEndDate = selectors.selectDate.value;
            loadData(newEndDate);
        }

        /**
         * Function that handles the scroll event.
         * It checks if the end of scroll message is not displayed, and if true, it loads more data by calling loadData function
         * and passing the currEndDate and true as arguments.
         */
        function scroll() {
            if (selectors.endOfScroll.classList.contains("d-none")) {
                loadData(currEndDate, true);
            }
        }

        /**
         * Function that handles the change event of the background switch.
         * It checks the status of the switch and sets the background image accordingly.
         * @param {Event} event - The change event of the switch.
         */
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

    /**
     * A module for creating the feed dynamically
     * @module feedCreate
     */
    const feedCreate = (function () {
        /**
         * createCardGrid is a function to create a grid of cards from provided data.
         * @param {object} data - The data object containing information to create the cards.
         */
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
        /**
         * createInnerGrid is a function to create the inner structure of the card.
         * This includes the columns, rows, and overall layout of the card.
         * @returns {object} - An object containing the outer and inner elements of the card.
         */
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
        /**
         * commentTextBox - function to create a button element with certain properties and event listeners
         *
         * @param {string} date - The date that is passed as an argument
         */
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
        /**
         * Create a div element with a copyright text
         * @param {string} copyright - The text for the copyright. If not passed it will be an empty string.
         * @returns {HTMLElement} copyRight - The div element with the copyright text.
         */
        function createCopyRight(copyright) {
            const copyRight = document.createElement("div");
            copyRight.classList.add("text-center", "text-muted", "text-small");
            copyRight.innerHTML = copyright ? `Copyright &copy; ${copyright}` : '<br>';
            return copyRight;
        }
        /**
         * Create an image element with the image url and date
         * @param {string} url - The url of the image.
         * @param {string} date - The date of the image.
         * @returns {HTMLImageElement} img - The img element with the url and date as src and alt respectively.
         */
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
        /**
         * Create an iframe element with the given url
         * @param {string} url - The url of the video.
         * @returns {HTMLIFrameElement} ratio - The div element that contains the iframe element.
         */
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
        /**
         * Create a h6 element with the given title
         * @param {string} title - The title of the card.
         * @returns {HTMLHeadingElement} cardTitle - The h6 element with the title.
         */
        function createCardTitle(title) {
            const cardTitle = document.createElement("h6");
            cardTitle.className = "card-title display-6";
            cardTitle.innerHTML = `${title}`;
            return cardTitle;
        }
        /**
         * Create a p element with the given explanation
         * @param {string} explanation - The explanation of the card.
         * @returns {HTMLParagraphElement} cardText - The p element with the explanation.
         */
        function createCardText(explanation) {
            const cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.innerHTML = explanation;
            return cardText;
        }
        /**
         * Function to create a date element for a card
         * @param {string} date - The date to be displayed on the card
         * @returns {HTMLElement} cardDate - The small element containing the date
         */
        function createCardDate(date) {
            const cardDate = document.createElement("small");
            cardDate.className = "text-center text-muted";
            cardDate.innerHTML = `${date}`;
            return cardDate;
        }
        /**
         * Function to create a data grid for a card
         * @param {HTMLElement} col - The parent element to which the card grid will be added
         * @returns {Object} - An object containing the cardHeader, cardBody, and cardFooter elements
         */
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
        /**
         * Function to create an outline grid for a card
         * @returns {Object} - An object containing the fragment and rowOutCard elements
         */
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

    /**
     * A module for creating the comments modal dynamically
     * @module commentsCreate
     */
    const commentsCreate = (function () {
        /**
         * createDeleteIcon
         *
         * @param {string} id - The unique id of the comment
         * @param {string} text - The text content of the comment
         * @param {function} deleteFunc - The function to be called when the delete icon is clicked
         * @returns {HTMLElement} deleteImage - The delete image element
         *
         * This function creates an image element with a delete icon and adds a click event listener to it.
         * When the delete icon is clicked, the deleteFunc function is called and passed the id and text of the comment as arguments.
         */
        function createDeleteIcon(id, text, deleteFunc) {
            const deleteImage = document.createElement("img");
            deleteImage.src = "./images/delete.png";
            deleteImage.alt = "delete image";
            deleteImage.classList.add("image-fluid", "deleteComment");
            deleteImage.addEventListener("click", () => deleteFunc(id, text));
            return deleteImage;
        }

        /**
         * createGrid
         *
         * @returns {Object} - An object containing the container and row elements
         *
         * This function creates a container element and a row element, and appends the row element to the container element.
         */
        function createGrid() {
            const container = document.createElement("div");
            container.classList.add("container");

            const row = document.createElement("div");
            row.classList.add("row");

            container.appendChild(row);
            return {container, row};
        }

        /**
         * createCols
         *
         * @param {HTMLElement} row - The row element to which the cols will be appended
         * @returns {Object} - An object containing the col1 and col2 elements
         *
         * This function creates col1 and col2 elements and appends them to the provided row element.
         */
        function createCols(row) {
            const col1 = document.createElement("div");
            col1.classList.add("col-11");
            row.appendChild(col1);
            const col2 = document.createElement("div");
            col2.classList.add("col-1", "d-flex", "align-items-center", "justify-content-center", "my-auto");
            row.appendChild(col2);
            return {col1, col2};
        }

        /**
         * createCommentCard
         *
         * @param {string} name - The name of the user
         * @param {string} txt - The text of the comment
         * @returns {HTMLElement} card - The comment card element
         *
         * This function creates a div element with the class "card" and "mb-1" and adds innerHTML with the name and text of the comment.
         */
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

    /**
     * A module for handling comments functionality.
     * @module comments
     * @type {initClick: function(Element): void, getTitle: function(): string, getComments: function(): Array,
     * deleteComment: function(number): void, postComment: function(string): void, commentsFetch: function(string, Object): Array,
     * getCommentDeleteData: function(number): Object, printComments: function(Array): void}
     */
    const comments = (function () {
        let lastPollTimestamp = date.currTime();
        let currImgDate = null;
        const maxChars = 128;
        const sendComment = 13;

        /**
         * Initialize the modal with the current image element and set the title,
         * clear the comment text box and get the comments for the current image.
         * @param {HTMLElement} imgElement - The current image element.
         */
        function initModal(imgElement) {
            currImgDate = imgElement;
            selectors.commentTextBox.value = "";
            selectors.commentsErrorMsg.classList.add("d-none");
            selectors.commentModalTitle.innerText = getTitle();
            getDateComments();
        }

        /**
         * Get the title for the current image comments.
         * @returns {string} The title for the comments modal
         */
        function getTitle() {
            return "All comments for: " + currImgDate.split("-").reverse().join("-");
        }

        /**
         * Handle the typing event for the comment text box
         * @param {Event} event - The event object for the text box
         */
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

        /**
         * Send a post request to add a comment.
         * @param {string} commentTxt - The text of the comment
         */
        function postComment(commentTxt){
            commentsUpdate("/home/comments", "POST", {date: currImgDate, text: commentTxt, user_id:selectors.userId});
        }

        /**
         * Print the comments in the modal
         * @param {Array} listComments - List of comments to display
         */
        function printComments(listComments) {
            selectors.comments.innerHTML = "";
            let {container, row} = commentsCreate.grid();

            listComments.forEach((comment) => {
                const {col1, col2} = commentsCreate.cols(row);

                col1.appendChild(commentsCreate.card(`${comment.User.firstName} ${comment.User.lastName}`, comment.text));

                if (comment.user_id === selectors.userId) {
                    col2.appendChild(commentsCreate.deleteIcon(comment.id, comment.text, deleteComment));
                }
            });
            selectors.comments.appendChild(container);
        }

        /**
         * Delete a comment
         * @param {string} id - The id of the comment to delete
         * @param {string} text - The text of the comment to delete
         */
        function deleteComment(commentId, text) {
            commentsUpdate("/home/comments", "DELETE", {date: currImgDate, commentId, text, user_id:selectors.userId});
        }

        /**
         * This function updates the comments on a specific date
         */
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

        /**
         * This function fetches and prints the comments for a specific date
         */
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

        /**
         * This function polls the server for new comments
         */
        function pollComments() {
            fetchHandlers.initCommentFetch(currImgDate);

            fetch(`/home/poll-comments/?date=${currImgDate}&lastPollTimestamp=${lastPollTimestamp}&user_id=${selectors.userId}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then((data) => pollHandler(data))
                .catch((error) => fetchHandlers.handleErrorComments(error));
        }

        /**
         * This function handles the data returned from a successful comment poll
         * @param {object} data - The data returned from the server
         */
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

        /**
         * This function stops the comment polling interval
         */
        function stopPolling() {
            clearInterval(intervalId);
        }

        /**
         * This function starts the comment polling interval
         */
        function startPolling() {
            intervalId = setInterval(pollComments, 12000);
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