(function () {
	const APIKEY = "cosjA0DN7IKcSttpfkp0CmPqIUX8M3eOt88kQPBJ";

	/**
	 * utils: Object
	 * @property screenTransition: (String, String) => void
  	 * @property deleteChildren: (String) => void
	 */
	const utils = (function () {
		/**
		 * Hides the current screen element and displays the next screen element.
		* It also changes the background image of the body element.
		* @param {string} currScreen - The id of the current screen element.
		* @param {string} nextScreen - The id of the next screen element.
		*/
		function screenTransition(currScreen, nextScreen) {
			if (currScreen === "" || nextScreen === "") return;

			document.getElementById(currScreen).classList.add("d-none");
			document.getElementById(nextScreen).classList.remove("d-none");
			document.body.style.background = `url(../images/${nextScreen}-bg.jpg) repeat right`;
		}

		/**
		 * Removes all the children of the element with the specified parent id.
		 * @param {string} parentId - The id of the parent element whose children will be removed.
		 */
		function clearOldElementCards(parentId) {
			document.getElementById(parentId).innerHTML = "";
		}

		return {
			screenTransition: screenTransition,
			deleteChildren: clearOldElementCards,
		};
	})();

	/**
	* date: Object
	* @property today: () => String
	* @property prev: (String[, Number]) => String
	 */
	const date = (function () {
		/**
		 * Returns a string in the format "YYYY-MM-DD" that represents the current date.
		 * @returns {string} - The current date in the format "YYYY-MM-DD".
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
		 * Returns a string in the format "YYYY-MM-DD" that represents the resulting date.
		 * @param {string} startDate - A string in the format "YYYY-MM-DD" that represents the starting date.
		 * @param {number} [valDays=1] - (Optional) The number of days to subtract from the starting date. Defaults to 1.
		 * @returns {string} - The resulting date in the format "YYYY-MM-DD".
		 */
		function calcPrevDate(startDate, valDays = 1) {
			const currDateObject = new Date(startDate);
			currDateObject.setDate(currDateObject.getDate() - valDays);

			const year = currDateObject.getFullYear().toString().padStart(4, "0");
			const month = (currDateObject.getMonth() + 1).toString().padStart(2, "0");
			const day = currDateObject.getDate().toString().padStart(2, "0");

			return [year, month, day].join("-");
		}

		return {
			today: getTodayDate,
			prev: calcPrevDate,
		};
	})();

	/**
	 * A module for handling login functionality.
	 * @module loginPage
	 * @type try @param {Event} event - The event object for the submit event @return {boolean} True if the login is valid, false otherwise.
	 * @type get - get the current user name. @return {string} The current user name.
	 */
	const loginPage = (function () {
		let userName = document.getElementById("username");
		let errorLoginMsg = document.getElementById("error-message-login");

		/**
		 Check if the product name is a string of exactly 24 letters and digits.
		 @param {string} name - The name to be validated.
		 @return {boolean} True if the name is valid, false otherwise.
		 */
		function isValidName(name) {
			return /^[A-Za-z0-9]{1,24}$/.test(name.trim());
		}

		/**
		 Show the error message and mark the input as invalid.
		 */
		function addErr() {
			errorLoginMsg.classList.remove("d-none");
			userName.classList.add("is-invalid");
		}

		/**
		 Hide the error message and mark the input as valid.
		 */
		function removeErr() {
			errorLoginMsg.classList.add("d-none");
			userName.classList.remove("is-invalid");
		}

		/**
		 Check if the name is valid. If it is not, display an error message.
		 If it is, delete the error and move to the book screen.
		 @param {Event} event - The event object for the submit event.
		 @return {boolean} True if the login is valid, false otherwise.
		 */
		function tryLogin(event) {
			event.preventDefault();

			const isValidLogin = isValidName(userName.value);

			if (isValidLogin) removeErr();
			else addErr();

			return isValidLogin;
		}

		return {
			try: tryLogin,
			getName: () => {return userName.value},
		};
	})();

	/**
	*A module for handling fetch functionality.
	* @module fetchHandlers
	* @type {checkResponse: (function*=):{promise}, {getJson}: (function*=){json}, handleError:(function*=){error}}
	 */
	const fetchHandlers = (function () {
		/**Check the status of a fetch response.
		 *@param {Response} response - The fetch response object.
		 *@return {Promise} A promise that resolves if the response status is in the 2xx range,
		 *                  or rejects with an error if the status is outside of the 2xx range.
		 */
		function checkResponse(response) {
			if (response.status >= 200 && response.status < 300) {
				return Promise.resolve(response);
			} else {
				return response.json().then((data) => {
					return Promise.reject(new Error(`${data.code}\n\n${data.msg}`));
				});
			}
		}

		/** Get the JSON body of a fetch response.
		* @param {Response} response - The fetch response object.
		* @return {Promise} A promise that resolves with the JSON data from the response.
		 */
		function getJson(response) {
			return response.json();
		}

		/** Handle an error that occurs during a fetch request. -> for regular load / comments
		*@param {Error} error - The error that occurred.
		 */
		function handleErrorLoad(error) {
			const dateErrorMsg = document.getElementById("error-message-date");
			dateErrorMsg.innerHTML = `Looks like there was a problem. Status Code: ${error}`;
			dateErrorMsg.classList.remove("d-none");

			utils.deleteChildren("book-page-main");
		}

		/**Handle an error that occurs during a fetch request. -> for scroll
		*@param {Error} error - The error that occurred.
		 */
		function handleErrorScroll() {
			document.getElementById("more").classList.add("d-none");
			document.getElementById("scrollEnd").classList.remove("d-none");
		}

		return {
			checkResponse: checkResponse,
			getJson: getJson,
			handleErrorLoad: handleErrorLoad,
			handleErrorScroll : handleErrorScroll,
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
		const dateErrorMsg = document.getElementById("error-message-date");

		/** initPage: () => void
		* @returns: void
		* This function initializes the page by setting the default date to today's date and loading the data for that date.
		 */
		function initPage() {
			let todayDate = date.today();
			document.getElementById("chooseDate").value = todayDate;
			loadData(todayDate);
		}

		/** loadData: (String[, Boolean]) => void
		* @param endDate: a string in the format "YYYY-MM-DD" that represents the end date for the images to be retrieved
		* @param scrollMode: (optional) a boolean that indicates whether the data is being loaded in response to a scroll event; defaults to false
		* @returns: void
		* This function retrieves image data from the NASA APOD API for the specified date range and presents the data on the page.
		*/
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

		/** presentData: (Array, String) => void
		* @param responseData: an array of objects representing the image data retrieved from the NASA APOD API
		* @param startDate: a string in the format "YYYY-MM-DD" that represents the start date for the images
		* @returns: void
		* This function presents the image data on the page by creating a grid of cards and updating the currEndDate variable.
		 */
		function presentData(responseData, startDate) {
			createCardGrid(responseData);
			currEndDate = date.prev(startDate);
			document.getElementById("more").classList.remove("d-none");
		}

		/** createCardGrid: (Array) => void
		* @param data: an array of objects representing the image data
		* @returns: void
		* This function creates a grid of cards to present the image data on the page.
		*/
		function createCardGrid(data) {
			const fragment = document.createDocumentFragment();
			const rowOutCard = document.createElement("div");
			rowOutCard.className = "row row-cols-1 row-cols-md-3 g-4 mt-4 mb-4";

			// Iterate over the data in reverse order
			for (const imgData of Object.values(data).reverse()) {
				// Create the outer column element for the card
				const colOutCard = document.createElement("div");
				colOutCard.className = "col";

				// Create the card element
				const card = document.createElement("div");
				card.classList.add("card", "card-grid", "border-light", "h-100", "w-100");

				// Create the inner row & col element for the card
				const rowInCard = document.createElement("div");
				rowInCard.className = "rowInCard g-0";
				const col1 = document.createElement("div");
				col1.classList.add("col-md-3", "w-100", "col-img");

				if(imgData.media_type == "image") {
					// Create an image element
					const img = document.createElement("img");
					img.className = "img-fluid col-img";
					img.src = imgData.url;
					img.alt = `The img of the day: date ${imgData.date}`;
					img.id = imgData.date;
					img.style.width = "600px";
					img.style.height = "550px";
					col1.appendChild(img);
				}
				else{
					const ratio = document.createElement("div");
					ratio.setAttribute("class", "ratio ratio-1x1 col-img");
					// Create an iframe element
					let iframe = document.createElement("iframe");
					iframe.src = imgData.url;
					iframe.allow =
						"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
					iframe.allowfullscreen = true;
					ratio.style.height = "550px";
					ratio.appendChild(iframe);
					col1.appendChild(ratio);
				}

				// Create the second column element for the card
				const col2 = document.createElement("div");
				col2.className = "col";

				// Create the card header, body, and footer elements
				const cardHeader = document.createElement("div");
				cardHeader.classList.add("card-header", "card-img-header");
				col2.appendChild(cardHeader);
				const cardBody = document.createElement("div");
				cardBody.classList.add("card-body", "card-img-body");
				col2.appendChild(cardBody);
				const cardFooter = document.createElement("div");
				cardFooter.classList.add("card-footer", "card-img-footer");
				col2.appendChild(cardFooter);

				// Create the card title element
				const cardTitle = document.createElement("h6");
				cardTitle.className = "card-title display-6";
				cardTitle.innerHTML = `${imgData.title}`;
				cardHeader.appendChild(cardTitle);

				// Create the card text element
				const cardText = document.createElement("p");
				cardText.className = "card-text";
				cardText.innerHTML = `${imgData.explanation}`;
				cardBody.appendChild(cardText);

				// Create the card date element
				const cardDate = document.createElement("small");
				cardDate.className = "text-center text-muted";
				cardDate.innerHTML = `${imgData.date}`;
				cardFooter.appendChild(cardDate);

				// Create the copyright element
				const copyRight = document.createElement("div");
				copyRight.classList.add("text-center", "text-muted");
				if (imgData.copyright) {copyRight.innerHTML = `Copyright &copy; ${imgData.copyright}`;}
				cardFooter.appendChild(copyRight);

				// Create the comments button element
				const cmdButton = document.createElement("button");
				cmdButton.className = "btn btn-outline-dark mr-2 cmdBtn";
				cmdButton.setAttribute("id", imgData.date);
				cmdButton.setAttribute("data-bs-toggle", "modal");
				cmdButton.setAttribute("data-bs-target", "#myModal");
				cmdButton.textContent = "comments";
				cmdButton.addEventListener("click", function () { comments.initClick(imgData.date);});

				cardFooter.appendChild(cmdButton);
				rowInCard.appendChild(col1);
				rowInCard.appendChild(col2);
				card.appendChild(rowInCard);
				colOutCard.appendChild(card);
				rowOutCard.appendChild(colOutCard);
			}

			fragment.appendChild(rowOutCard);
			document.getElementById("book-page-main").appendChild(fragment);
		}

		/** changeDate: () => void
		* @returns: void
		* This function changes the date range for the images displayed on the page.
		 */
		function changeDate() {
			document.getElementById("more").classList.add("d-none");
			document.getElementById("scrollEnd").classList.add("d-none");
			document.getElementById("book-page-main").innerHTML = "";
			dateErrorMsg.classList.add("d-none");

			let newEndDate = document.getElementById("chooseDate").value;
			loadData(newEndDate);
		}

		/** scrollPage: (Event) => void
		* @param event: the event object for the scroll event
		* @returns: void
		* This function loads additional image data when the user scrolls to the bottom of the page.
		 */
		function scroll() {
			if (document.getElementById("scrollEnd").classList.contains("d-none")) {
				loadData(currEndDate, true);
			}
		}

		return {
			init: initPage,
			changeDate: changeDate,
			handleScroll: scroll,
		};
	})();

	/**
	 * A module for handling comments functionality.
	 * @module comments
	 * @type {initClick: (function(Element):void), getTitle: (function():string), getComments: (function():void),
	 * deleteComment: (function(Object):void), postComment: (function(Object):void), commentsFetch: (function(string, string, Object):void),
	 * getCommentDeleteData: (function(number, string):Object), printComments: (function(Array):void)}
	 */
	const comments = (function () {
		let intervalId = null;
		let currImg = null;

		const maxChars = 128;
		const sendComment = 13;

		const errMsg = document.getElementById("commentErr");
		const commentModal = document.getElementById("comments");
		const commentTextBox =  document.getElementById("addANote");

		/**
		 * Initializes click event on the specified image element.
		 * @param {Element} imgElement - The image element to initialize the click event on.
		 */
		function initClick(imgElement) {
			commentTextBox.value = "";
			errMsg.innerText = ""
			currImg = imgElement;
			document.getElementById("comment-title").innerText = getTitle();
			getComments();
		}

		/**
		 * Returns the title of the current image.
		 * @returns {string} The title of the current image.
		 */
		function getTitle(){
			return currImg.split("-").reverse().join("-");
		}

		/**
		 * Gets comments for the current image.
		 */
		function getComments() {
			fetch(`/comments/?imageId=${currImg}`)
				.then(fetchHandlers.checkResponse)
				.then(fetchHandlers.getJson)
				.then((data) => printComments(data))
				.catch(function (error) {
					fetchHandlers.handleErrorLoad(error);
				});
		}

		/**
		 * Deletes a comment using the specified delete data.
		 * @param {Object} deleteData - The data to use to delete the comment.
		 */
		function deleteComment(deleteData) {
			commentsFetch("/comments/", "DELETE", deleteData);
		}

		/**
		 * Posts a comment using the specified post data.
		 * @param {Object} postData - The data to use to post the comment.
		 */
		function postComment(postData) {
			document.getElementById("addANote").value = "";
			commentsFetch("/comments/", "POST", postData);
		}

		/**
		 * Sends a fetch request to the specified url using the specified method and body data.
		 * @param {string} url - The url to send the request to.
		 * @param {string} method - The HTTP method to use (e.g. "GET", "POST", "PUT", etc.)
		 * @param {Object} bodyData - The data to include in the body of the request.
		 */
		function commentsFetch(url, method, bodyData) {
			fetch(url, {
				method: method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyData),
			})
				.then(fetchHandlers.checkResponse)
				.then(fetchHandlers.getJson)
				.then((data) => printComments(data))
				.catch(function (error) {
					fetchHandlers.handleErrorLoad(error);
				});
		}

		/**
		 * Returns delete data for the specified index of comment and image.
		 * @param {number} indexOfComment - The index of the comment.
		 * @param {string} img - The id of the image.
		 * @returns {Object} Delete data for the specified index of comment and image.
		 */
		function getCommentDeleteData(indexOfComment, img) {
			return {
				imageId: img,
				indexOfComment: indexOfComment,
			};
		}

		/**
		 * Returns post data for the specified comment and image.
		 * @param {string} comment - The comment.
		 * @param {string} img - The id of the image.
		 * @returns {Object} Post data for the specified comment and image.
		 */
		function getCommentPostData(comment, img) {
			return  {
				imageId: img,
				userName: loginPage.getName(),
				commentTxt: comment,
			};
		}

		/**
		 * Handles typing of comments.
		 * @param {Event} event - The keydown event.
		 */
		function commentTyping(event) {
			let comment = event.target.value;

			if (event.keyCode === sendComment) {

				if(comment.trim() === "") {
					errMsg.innerText = "comment cant be empty!"
				}

				else if (comment.length >= maxChars) {
					errMsg.innerText = "text can not be longer than 128 chars"
				}

				else {
					errMsg.innerText = ""
					commentTextBox.value = "";
					postComment(getCommentPostData(comment, currImg));
				}
			}
		}


		/**
		 * Returns a comment card element with the specified text and name.
		 * @param {string} txt - The text of the comment.
		 * @param {string} name - The name of the user who made the comment.
		 * @returns {Element} A comment card element with the specified text and name.
		 */
		function getCommentCard(txt, name) {
			// Create card div element
			const card = document.createElement("div");
			card.className = "card";

			// Create card-body div element
			const cardBody = document.createElement("div");
			cardBody.className = "card-body";

			// Create d-flex justify-content-between div element
			const justifyContentBetween = document.createElement("div");
			justifyContentBetween.className = "d-flex justify-content-between";

			// Create d-flex flex-row align-items-center div element
			const flexRow = document.createElement("div");
			flexRow.className = "d-flex flex-row align-items-center";

			// Create img element for avatar
			const avatar = document.createElement("img");
			avatar.src = "images/user.jpg";
			avatar.alt = "avatar";
			avatar.style.width = "25px";
			avatar.style.height = "25px";

			// Create p element for name
			const username = document.createElement("p");
			username.className = "small mb-0 ms-2 h6 text-primary";
			username.textContent = `${name}`;

			// Create p element for text
			const commentText = document.createElement("p");
			commentText.className = "text-break px-2";
			commentText.textContent = `${txt}`;

			// Append img, name, and text elements to flex-row div element
			flexRow.appendChild(avatar);
			flexRow.appendChild(username);
			flexRow.appendChild(commentText);
			justifyContentBetween.appendChild(flexRow);
			cardBody.appendChild(justifyContentBetween);
			card.appendChild(cardBody);

			return card;
		}

		/**
		 * Prints the specified list of comments.
		 * @param {Object[]} listComments - The list of comments to print.
		 */
		function printComments(listComments) {
			//initialize
			utils.deleteChildren("comments");

			// Create a container element
			const container = document.createElement("div");
			container.classList.add("container");

			// Create a row element
			const row = document.createElement("div");
			row.classList.add("row");

			// Create the two column elements
			const col1 = document.createElement("div");
			col1.classList.add("col-11");
			const col2 = document.createElement("div");
			col2.classList.add("col-1", "d-flex", "align-items-center", "justify-content-center", "my-auto");

			// Process each comment
			listComments.forEach((comment, index) => {
				const clonedCol1 = col1.cloneNode(true);
				clonedCol1.appendChild(getCommentCard(comment.commentTxt, comment.userName));
				row.appendChild(clonedCol1);

				if (comment.userName === loginPage.getName()) {
					const clonedCol2 = col2.cloneNode(true);
					clonedCol2.appendChild(getDeleteIcon(index));
					row.appendChild(clonedCol2);
				}
			});

			container.appendChild(row);
			commentModal.appendChild(container);
		}

		/**
   		 * Returns a delete icon element for the specified index of comment.
		 * @param {number} index - The index of the comment.
 		* @returns {Element} A delete icon element for the specified inde
		 */
		function getDeleteIcon(index) {
			const deleteImage = document.createElement("img");
			deleteImage.src = "./images/delete.png";
			deleteImage.alt = "delete image";
			deleteImage.classList.add("image-fluid", "deleteComment");
			deleteImage.addEventListener("click", function () {deleteComment(getCommentDeleteData(index, currImg));});
			return deleteImage;
		}

		/**
		 * Stops the polling for comments.
		 */
		function stopPolling() {
			clearInterval(intervalId);
		}

		/**
		 * starts the polling for comments.
		 */
		function startPolling() {
			intervalId = setInterval(getComments, 15000);
		}

		return {
			initClick: initClick,
			type: commentTyping,
			stopPolling: stopPolling,
			startPolling: startPolling,
		};
	})();

	document.addEventListener("DOMContentLoaded", () => {
		document.getElementById("loginFormSubmit").addEventListener("click", (event) => {
			if (loginPage.try(event)) {
				utils.screenTransition("login-page", "book-page");
				bookPage.init();
			}
		});

		document.getElementById("dateFormSubmit").addEventListener("click", (event) => {
				event.preventDefault();
				bookPage.changeDate(event);
		});

		document.getElementById("more").addEventListener("click", (event) => {
			bookPage.handleScroll(event);
		});

		document.getElementById("addANote").addEventListener("keydown", (event) => {
			comments.type(event);
		});

		document.getElementById("myModal").addEventListener("hide.bs.modal", function () {
				comments.stopPolling();
		});

		document.getElementById("myModal").addEventListener("show.bs.modal", function () {
				comments.startPolling();
		});
	});
})();