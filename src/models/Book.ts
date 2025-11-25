import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  filename?: string;
}

const BookSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  filename: {
    type: String,
    required: false,
  },
});

const Book: Model<IBook> = mongoose.model<IBook>("Book", BookSchema);

export default Book;
