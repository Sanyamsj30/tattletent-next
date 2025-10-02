class ApiError extends Error{
    constructor(
        statusCode,
        message  ="Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors
        if(stack){
            this.stack =stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
            //this is called to generate stack trace automatically
        }
    }
}

export { ApiError };