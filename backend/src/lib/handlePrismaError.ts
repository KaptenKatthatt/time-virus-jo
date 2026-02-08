/**
 * This file contains a helper function to handle Prisma errors and convert them into JSend responses.
 *
 * It checks for specific Prisma error codes and returns appropriate HTTP status codes and messages.
 * If the error is not recognized, it logs the error and returns a generic 500 Internal Server Error response.
 * The function is designed to be used in API route handlers to ensure consistent error handling across the application.
 */
import { Prisma } from "./../../generated/prisma/client.ts";

type JSendError = {
	status: "error";
	message: string;
}

type JSendFail = {
	status: "fail";
	data: {
		message: string;
	}
}

type PrismaErrorResponse = {
	status_code: number;
	body: JSendError | JSendFail;
}

/**
 * Handle Prisma Errors
 */
export const handlePrismaError = (err: unknown): PrismaErrorResponse => {
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// Was the value out of range?
		if (err.code === "P2020") {
			return { status_code: 400, body: { status: "error", message: "Value out of range" } };
		}

		// Was it not found?
		if (err.code === "P2025") {
			return { status_code: 404, body: { status: "error", message: "Resource not found" } };
		}
	}

	// Prisma validation error
	if (err instanceof Prisma.PrismaClientValidationError) {
		return { status_code: 400, body: { status: "error", message: "Invalid request data" } };
	}

	// Fallback
	console.error(err);
	return { status_code: 500, body: { status: "error", message: "Something went wrong when querying the database" } };
}
