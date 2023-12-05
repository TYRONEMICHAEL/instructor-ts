# instructor-ts

Structured extraction in TS, powered by OpenAI's function calling api. TS port of [Instructor](https://github.com/jxnl/instructor/) written in Python.

## Features

- [ ] Add proper README.md
- [ ] Add spec and sequence diagram
- [ ] Add CLI with examples
- [ ] Add validation
  - [] Add custom LLM validator
  - [] Validate after receiving a response
  - [] Return back response
- [ ] Add retries
- [ ] Add streaming response
- [ ] Completions with response
- [ ] Validation with original response

## Installation

```bash
npm install typescript-validation-schema-generator


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Diagram

sequenceDiagram
    participant Client
    participant Instructor
    participant CompletionsAPI
    participant LLMValidator

    alt Happy Path
        Client->>Instructor: Send Request
        activate Instructor
        Instructor->>CompletionsAPI: Forward Request
        activate CompletionsAPI
        CompletionsAPI-->>Instructor: Response
        deactivate CompletionsAPI
        Instructor->>LLMValidator: Validate Response
        activate LLMValidator
        LLMValidator-->>Instructor: Validation Success
        deactivate LLMValidator
        Instructor-->>Client: Return Validated Response
    else Validation Failure and Retry
        Client->>Instructor: Send Request
        activate Instructor
        Instructor->>CompletionsAPI: Forward Request
        activate CompletionsAPI
        CompletionsAPI-->>Instructor: Response
        deactivate CompletionsAPI
        Instructor->>LLMValidator: Validate Response
        activate LLMValidator
        LLMValidator-->>Instructor: Validation Failure
        deactivate LLMValidator
        loop Retry Until Success or Max Retries
            Instructor->>CompletionsAPI: Retry with Modified Request
            activate CompletionsAPI
            CompletionsAPI-->>Instructor: New Response
            deactivate CompletionsAPI
            Instructor->>LLMValidator: Revalidate Response
            activate LLMValidator
            LLMValidator-->>Instructor: Validation Success/Failure
            deactivate LLMValidator
        end
        alt Validation Success
            Instructor-->>Client: Return Validated Response
            deactivate Instructor
        else Max Retries Reached
            Instructor-->>Client: Return Error
            deactivate Instructor
        end
    end


# User Request Submission
- The user submits a request to OpenAI, specifying the desired model and the number of retries in case the initial attempt with the Language Model (LLM) needs to be repeated.

# Request Decoration by Instructor Library
- The Instructor Library processes the user's request.
- It augments the request by attaching a schema that defines how the data should be structured.
- The Instructor Library modifies the request to remove any properties not recognized by the OpenAI API (such as the response model and the number of retries) to avoid a 400 HTTP error (Bad Request).

# Sending Request to OpenAI
- The Instructor sends the decorated request to OpenAI and awaits a response.

# Response Handling and Serialization
- Upon receiving the response from OpenAI, the Instructor attempts to serialize it into a predefined model.

# Error Handling on Serialization Failure
- If serialization fails, an error is returned to the user, indicating the failure in processing the response.

# Model Validation
- If serialization is successful, the model undergoes validation to ensure it meets all defined criteria and constraints.

# Successful Validation Outcome
- If validation is successful, the validated model is returned to the user.
- This response includes the message history, usage statistics, and the number of retry attempts made.

# Handling Validation Failures and Retries
- If validation fails, the Instructor adds the validation error messages to the message history.
- The Instructor then retries the request to OpenAI, respecting the user-defined limit on the number of retries.

**Note**: This updated specification provides a clearer structure for each step in the process, setting a solid foundation for designing the types and creating a pipeline to the final output.


Absolutely, in TypeScript and JavaScript, a Promise can either resolve successfully or reject (throw an error) if something goes wrong. This means we can simplify the function signatures by returning a single type on success, relying on the promise's rejection to handle errors. Here's the revised set of asynchronous function signatures with this consideration:

### Revised Asynchronous Function Signatures

1. **User Request Submission:**
   - Returns a decorated request on success.

   ```typescript
   async function submitRequest(userInput: UserRequest): Promise<DecoratedRequest>;
   ```

2. **Request Decoration:**
   - Returns a further decorated request, prepared for sending to OpenAI.

   ```typescript
   async function decorateRequest(request: UserRequest): Promise<DecoratedRequest>;
   ```

3. **Sending Request to OpenAI:**
   - Returns the response from OpenAI.

   ```typescript
   async function sendToOpenAI(request: DecoratedRequest): Promise<OpenAIResponse>;
   ```

4. **Response Handling and Serialization:**
   - Returns the serialized response.

   ```typescript
   async function handleResponse(response: OpenAIResponse): Promise<SerializedResponse>;
   ```

5. **Model Validation:**
   - Returns the validated model.

   ```typescript
   async function validateModel(serializedResponse: SerializedResponse): Promise<ValidatedModel>;
   ```

6. **Retry Logic:**
   - A higher-order function to handle retries for async functions.

   ```typescript
   async function withRetries<T>(func: (...args: any[]) => Promise<T>, context: RetryContext): Promise<T>;
   ```

7. **Pipeline Composition:**
   - Composes all steps into a single pipeline, returning the final validated model.

   ```typescript
   async function processUserRequest(userInput: UserRequest): Promise<ValidatedModel> {
       // Implementation of the pipeline goes here
   }
   ```

### Error Handling with Promises

- In this revised approach, if an error occurs at any stage in the pipeline, the function will reject its promise, effectively "throwing" an error.
- The `processUserRequest` function, or any caller of these functions, should include `try/catch` blocks to handle these errors.
- This model simplifies understanding the flow of data and errors, making it clear that a successful resolution of the promise indicates a successful operation, while a rejection indicates a failure.

This design ensures that each function fulfills its single responsibility within the domain, adhering to the principles of Domain-Driven Design and functional programming. The use of async/await and Promises provides a clear and effective way to handle both successful operations and errors in a modern JavaScript environment.

async function processUserRequest(originalUserInput: UserRequest): Promise<ValidatedModel> {
    const context: RetryContext = {
        currentAttempt: 0,
        maxAttempts: originalUserInput.retries,
        validationErrors: [],
        userRequest: originalUserInput
    };

    while (context.currentAttempt < context.maxAttempts) {
        try {
            // Decorate the request
            const decoratedRequest = await decorateRequest(context.userRequest);

            // Sending request to OpenAI
            const openAIResponse = await sendToOpenAI(decoratedRequest);

            // Handling the response and serializing it
            const serializedResponse = await handleResponse(openAIResponse);

            // Validating the serialized response
            try {
                const validatedModel = await validateModel(serializedResponse);
                return validatedModel; // Validation successful, return the model
            } catch (validationError) {
                // Add validation error to the context
                context.validationErrors.push(validationError);
                context.currentAttempt++;
                console.error(`Validation failed on attempt ${context.currentAttempt}: ${validationError.message}`);

                // Update the request in the context with validation errors
                context.userRequest = updateRequestWithValidationErrors(context.userRequest, validationError);
                continue; // Retry with updated request
            }
        } catch (error) {
            // Handle non-validation errors
            throw new Error(`Error processing user request: ${error.message}`);
        }
    }

    // If all retries are exhausted, throw an error with validation errors
    throw new Error(`Validation failed after ${context.maxAttempts} attempts with errors: ${context.validationErrors.map(e => e.message).join(', ')}`);
}

function updateRequestWithValidationErrors(userRequest: UserRequest, validationError: ValidationError): UserRequest {
    // Update the userRequest based on the validationError
    // This could involve appending error messages or modifying the request
    return userRequest; // Return the updated request
}


function processUserRequest(originalUserInput: UserRequest): Promise<ValidatedModel> {
    const context: RetryContext = {
        currentAttempt: 0,
        maxAttempts: originalUserInput.retries,
        validationErrors: [],
        userRequest: originalUserInput
    };

    const processRequest = (context: RetryContext): Promise<ValidatedModel> => {
        return submitRequest(context.userRequest)
            .then(decorateRequest)
            .then(sendToOpenAI)
            .then(handleResponse)
            .then(serializedResponse => validateModel(serializedResponse, context))
            .catch(error => {
                if (error instanceof ValidationError) {
                    // If it's a validation error, we handle it differently
                    context.validationErrors.push(error);
                    if (context.currentAttempt < context.maxAttempts) {
                        context.currentAttempt++;
                        context.userRequest = updateRequestWithValidationErrors(context.userRequest, error);
                        return processRequest(context); // Retry with updated context
                    }
                }
                // For other types of errors, we don't retry and throw the error
                throw error;
            });
    };

    return processRequest(context);
}

function updateRequestWithValidationErrors(userRequest: UserRequest, validationError: ValidationError): UserRequest {
    // Logic to update userRequest based on validationError
    // This could include appending error messages or modifying the request
    return userRequest; // Return the updated request
}

function validateModel(serializedResponse: SerializedResponse, context: RetryContext): Promise<ValidatedModel> {
    // Validation logic here
    // If validation fails, throw a ValidationError
}
