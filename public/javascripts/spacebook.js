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
            utils.deleteChildren("book-page-main");
        }

        function handleErrorScroll() {
            selectors.scrollButton.classList.add("d-none");
            selectors.endOfScroll.classList.remove("d-none");
        }

        return {
            checkResponse: checkResponse,
            getJson: getJson,
            handleErrorLoad: handleErrorLoad,
            handleErrorScroll : handleErrorScroll,
        };
    })();

    const date = (function () {

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

        function checkPatternDates(startDate, endDate){

            const datePattern = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;;

            function isValid(dateString){
                return datePattern.test(dateString);
            }

            if(!isValid(startDate) || !isValid(endDate)){
                fetchHandlers.handleErrorLoad("date pattern is not valid, <br> enter new date type 'YYYY-MM-DD'");
            }
        }

        return {
            today: getTodayDate,
            prev: calcPrevDate,
            check: checkPatternDates,
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

        function loadData(endDate, scrollMode = false) {
            const startDate = date.prev(endDate, maxImagesForPage-1);

            fetch(`https://api.nasa.gov/planetary/apod?api_key=${APIKEY}&start_date=${startDate}&end_date=${endDate}`)
                .then(fetchHandlers.checkResponse)
                .then(fetchHandlers.getJson)
                .then((data) => {presentData(data, startDate);})
                .catch(function (error) {
                    if (!scrollMode)
                        fetchHandlers.handleErrorLoad(error);
                    else
                        fetchHandlers.handleErrorScroll(error);
                });
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

                if(imgData.media_type == "image")
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

    const utils = (function () {

        function clearOldElementCards(parentId) {
            document.getElementById(parentId).innerHTML = "";
        }

        return {
            deleteChildren: clearOldElementCards,
        };
    })();

    const feedCreate = (function () {
        function createInnerGrid(){
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

        function commentTextBox(date){
            const cmdButton = document.createElement("button");
            cmdButton.className = "btn btn-outline-dark mr-2 cmdBtn";
            cmdButton.setAttribute("id", date);
            cmdButton.setAttribute("data-bs-toggle", "modal");
            cmdButton.setAttribute("data-bs-target", "#myModal");
            cmdButton.textContent = "comments";
            cmdButton.addEventListener("click", function () { comments.initModal(date);});
            return cmdButton;
        }

        function createCopyRight(copyright){
            const copyRight = document.createElement("div");
            copyRight.classList.add("text-center", "text-muted");
            copyRight.innerHTML = copyright ? `Copyright &copy; ${copyright}` : '<br>';
            return copyRight;
        }

        function createImage(url,date){
            const img = document.createElement("img");
            img.className = "img-fluid col-img";
            img.src = url;
            img.alt = `The img of the day: date ${date}`;
            img.id = date;
            img.style.width = "600px";
            img.style.height = "550px";
            return img;
        }

        function createVideo(url){
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

        function createDataGrid(col){
            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header", "card-img-header");
            col.appendChild(cardHeader);
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body", "card-img-body");
            col.appendChild(cardBody);
            const cardFooter = document.createElement("div");
            cardFooter.classList.add("card-footer", "card-img-footer");

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
            commentTextBox : commentTextBox,
            createCopyRight:createCopyRight,
            createImage : createImage,
            createVideo : createVideo,
            createCardTitle : createCardTitle,
            createCardText : createCardText,
            createCardDate : createCardDate,
            createDataGrid : createDataGrid,
            createInnerGrid : createInnerGrid,
            createOutlineGrid : createOutlineGrid,

        };
    })();

    const comments = (function () {
        let currImgDate = null;

        const maxChars = 128;
        const sendComment = 13;

        function closeModal(){
            if (selectors.comments.getAttribute("aria-hidden") === "false") {
                selectors.comments.setAttribute("aria-hidden", "true");
            }
        }

        function initClick(imgElement) {
            currImgDate = imgElement;
            selectors.addANote.value = selectors.commentsErrorMsg.innerText = "";
            selectors.commentModalTitle.innerText =  getTitle();
      //      getComments();
        }

        function getTitle(){
            return "All comments for: " + currImgDate.split("-").reverse().join("-");
        }


        return {
            closeCommentsModal : closeModal,
            initModal: initClick,

        };
    })();

    const selectors = {
        dateErrorMsg:   document.getElementById("error-message-date"),
        scrollButton:   document.getElementById("more"),
        endOfScroll:    document.getElementById("scrollEnd"),
        selectDate:     document.getElementById("chooseDate"),
        mainContainer:  document.getElementById("book-page-main"),
        addANote:       document.getElementById("addANote"),
        comments:       document.getElementById("comments"),
        commentsErrorMsg: document.getElementById("commentErr"),
        commentModalTitle:document.getElementById("comment-title"),
    }

    document.addEventListener("DOMContentLoaded", () => {

        bookPage.init();

        document.getElementById("dateFormSubmit").addEventListener("click", bookPage.changeDate);

        document.getElementById("more").addEventListener("click", bookPage.handleScroll);
    });
})();