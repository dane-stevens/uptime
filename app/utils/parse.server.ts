import QueryString from "qs";
import { data, } from "react-router";
import { z, type SafeParseReturnType, type ZodSchema } from "zod";

export async function parseFormData<TSchema extends ZodSchema>(
	request: Request,
	schema: TSchema,
): Promise<SafeParseReturnType<TSchema["_input"], TSchema["_output"]>> {
	const clonedRequest = request.clone();
	const formData = QueryString.parse(await clonedRequest.text());

	const result = schema.safeParse(formData);

	return result

}

export function validationError(result) {
	return data({
		error: z.treeifyError(result.error)
	}, { status: 400 })
}