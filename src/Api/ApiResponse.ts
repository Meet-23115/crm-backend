class ApiResponse {
    statusCode: number; // Explicitly declare statusCode as a number
    data: any;          // Explicitly declare data as any (or a more specific type if applicable)
    message: string;    // Explicitly declare message as a string
    success: boolean;   // Explicitly declare success as a boolean
  
    constructor(statusCode: number, data: any, message: string = "Success") {
      this.statusCode = statusCode;  // Assign statusCode
      this.data = data;              // Assign data
      this.message = message;        // Assign message
      this.success = statusCode < 400; // Assign success based on the statusCode
    }
  }
  
  export { ApiResponse };
  