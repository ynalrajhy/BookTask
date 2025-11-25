import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  country: string;
  books: mongoose.Types.ObjectId[];
}

const AuthorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

const Author: Model<IAuthor> = mongoose.model<IAuthor>('Author', AuthorSchema);

export default Author;

