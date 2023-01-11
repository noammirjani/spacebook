(function () {

    const fetchHandlers = (function () {
        function checkResponse(response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response);
            } else {
                return response.json().then((data) => {
                    return Promise.reject(new Error(`${data.code}${data.msg}`));
                });
            }
        }

        function getJson(response) {
            return response.json();
        }

        function handleError(error) {
        }

        return {
            checkResponse: checkResponse,
            getJson: getJson,
            handleError: handleError,
        };
    })();

    document.addEventListener("DOMContentLoaded", () => {
        //2. check if the email already found in system -> no importance to capital letters
    });
})();