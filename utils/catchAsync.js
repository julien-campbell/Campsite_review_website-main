module.exports = func => {                  //finds errors for async function using try and catch
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}