"use server";

import { createStreamableValue } from "ai/rsc";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { env } from "process";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function generateCsvMapping(
  fieldColumns: string[],
  firstRows: Record<string, string>[],
) {
  const stream = createStreamableValue();

  const MappingSchema = z.object({
    type: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    tax_number: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    currency: z.string().optional(),
    zipCode: z.string().optional(),
    paymentMethod: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountType: z.string().optional(),
    accountHolderName: z.string().optional(),
    walletAddress: z.string().optional(),
    network: z.string().optional(),
    ewalletProvider: z.string().optional(),
    mobileNumber: z.string().optional(),
    transferMethod: z.string().optional(),
  });

  await new Promise<void>(async (resolve) => {
    const chatStream = openai.beta.chat.completions
      .stream({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content:
              `The following columns are the headings from a CSV import file for importing client information. ` +
              `Map these column names to the correct fields in our database (type, name, email, tax_number, etc.) by providing the matching column name for each field. ` +
              `You may also consult the first few rows of data to help you make the mapping, but you are mapping the columns, not the values. ` +
              `If you are not sure or there is no matching column, omit the value.\n\n` +
              `Columns:\n${fieldColumns.join(",")}\n\n` +
              `First few rows of data:\n` +
              firstRows.map((row) => JSON.stringify(row)).join("\n"),
          },
        ],
        response_format: zodResponseFormat(MappingSchema, "mapping"),
      })
      .on("content.delta", ({ parsed }) => {
        if (parsed) {
          console.log(parsed);
          stream.update(parsed);
        }
      });

    await chatStream.done();
    stream.done();
    resolve();
  });

  return { object: stream.value };
}
