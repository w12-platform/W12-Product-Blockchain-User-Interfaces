export function promisify (funct) {
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = function (error, result) {
                if (error != null) {
                    reject(error);
                } else {
                    accept(result);
                }
            };

            return funct(...args, callback);
        });
    };
}
