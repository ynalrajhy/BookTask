import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  books: mongoose.Types.ObjectId[];
}

const CategorySchema: Schema = new Schema({
  name: {
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

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

