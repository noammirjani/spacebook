(function () {
    const APIKEY = "cosjA0DN7IKcSttpfkp0CmPqIUX8M3eOt88kQPBJ";

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

    });
})();