// using promise
const asyncHandler = (fun) => {
    (req, res, next) => {
        Promise.resolve(fun(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };

// using try catch
// const asyncHandler1 = (fun) => async (req, res, next) => {
//     try {
//         await fun(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             message: error.message,
//             success: false,
//         });
//     }
// };
