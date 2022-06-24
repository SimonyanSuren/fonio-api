let errorResponse = (res, error: string|object, status: number) => {
    res.setHeader('x-message-code-error', error);
    res.setHeader('x-message', 'Bad Request');
    res.setHeader('x-httpStatus-error', status);
    res.status(status).json({error: error});
};

export {errorResponse};
