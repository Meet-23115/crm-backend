class ApiError extends Error {
    statusCode: number; // Define the statusCode property with type number
    data: any;          // Define data as any (or a more specific type if known)
    success: boolean;   // Define success as a boolean
    errors: any[];      // Define errors as an array of any (or a more specific type)

    constructor(
        statusCode: number, // Enforce type for parameters
        message: string,
        errors: any[] = [], // Default empty array
        stack: string = "" // Default empty string
    ) {
        super(message); // Call parent constructor
        this.statusCode = statusCode;
        this.data = null; // Initialize data as null
        this.success = false; // Initialize success as false
        this.errors = errors; // Assign errors
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            data: this.data,
            message: this.message,
            success: this.success,
            errors: this.errors,
        };
    }
}

export { ApiError };
