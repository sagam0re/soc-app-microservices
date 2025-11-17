import { Schema, model, InferSchemaType } from "mongoose";

const searchPostSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

searchPostSchema.index({ content: "text" });
searchPostSchema.index({ createdAt: -1 });

export type SearchDocument = InferSchemaType<typeof searchPostSchema>;

const Search = model<SearchDocument>("Search", searchPostSchema);

export default Search;
