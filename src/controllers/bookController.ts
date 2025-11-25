import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import Book from "../models/Book";
import Author from "../models/Author";
import Category from "../models/Category";

export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await Book.find().populate("author").populate("categories");
    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .populate("categories");

    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: book,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, author, categories } = req.body;

    if (!title || !author) {
      res.status(400).json({
        success: false,
        message: "Title and author are required",
      });
    } else {
      const authorExists = await Author.findById(author);
      if (!authorExists) {
        res.status(404).json({
          success: false,
          message: "Author not found",
        });
      } else {
        if (categories && categories.length > 0) {
          const categoriesExist = await Category.find({
            _id: { $in: categories },
          });
          if (categoriesExist.length !== categories.length) {
            res.status(404).json({
              success: false,
              message: "One or more categories not found",
            });
          } else {
            const bookData: any = {
              title,
              author,
              categories: categories || [],
            };
            if (req.file) {
              bookData.filename = req.file.filename;
            }
            const book = (await Book.create(bookData)) as any;

            await Author.findByIdAndUpdate(author, {
              $addToSet: { books: book._id },
            });

            if (categories && categories.length > 0) {
              await Category.updateMany(
                { _id: { $in: categories } },
                { $addToSet: { books: book._id } }
              );
            }

            const populatedBook = await Book.findById(book._id)
              .populate("author")
              .populate("categories");

            res.status(201).json({
              success: true,
              data: populatedBook,
            });
          }
        } else {
          const bookData: any = { title, author, categories: categories || [] };
          if (req.file) {
            bookData.filename = req.file.filename;
          }
          const book = (await Book.create(bookData)) as any;

          await Author.findByIdAndUpdate(author, {
            $addToSet: { books: book._id },
          });

          const populatedBook = await Book.findById(book._id)
            .populate("author")
            .populate("categories");

          res.status(201).json({
            success: true,
            data: populatedBook,
          });
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, author, categories } = req.body;
    const bookId = req.params.id;

    const currentBook = await Book.findById(bookId);
    if (!currentBook) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    } else {
      let authorValid = true;
      if (author) {
        const authorExists = await Author.findById(author);
        if (!authorExists) {
          res.status(404).json({
            success: false,
            message: "Author not found",
          });
          authorValid = false;
        } else {
          if (currentBook.author.toString() !== author) {
            await Author.findByIdAndUpdate(currentBook.author, {
              $pull: { books: bookId },
            });
            await Author.findByIdAndUpdate(author, {
              $addToSet: { books: bookId },
            });
          }
        }
      }

      let categoriesValid = true;
      if (categories && categories.length > 0) {
        const categoriesExist = await Category.find({
          _id: { $in: categories },
        });
        if (categoriesExist.length !== categories.length) {
          res.status(404).json({
            success: false,
            message: "One or more categories not found",
          });
          categoriesValid = false;
        }
      }

      if (authorValid && categoriesValid) {
        const updateData: any = {};
        if (title) updateData.title = title;
        if (author) updateData.author = author;
        if (categories !== undefined) updateData.categories = categories;

        if (req.file) {
          if (currentBook.filename) {
            const oldFilePath = path.join("uploads", currentBook.filename);
            try {
              if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
              }
            } catch (err) {
              console.error("Error deleting old file:", err);
            }
          }

          updateData.filename = req.file.filename;
        }

        const book = await Book.findByIdAndUpdate(bookId, updateData, {
          new: true,
          runValidators: true,
        });

        if (categories !== undefined) {
          const oldCategories = currentBook.categories.map((cat) =>
            cat.toString()
          );
          const newCategories = categories.map((cat: string) => cat.toString());

          const categoriesToRemove = oldCategories.filter(
            (cat) => !newCategories.includes(cat)
          );
          const categoriesToAdd = newCategories.filter(
            (cat) => !oldCategories.includes(cat)
          );

          if (categoriesToRemove.length > 0) {
            await Category.updateMany(
              { _id: { $in: categoriesToRemove } },
              { $pull: { books: bookId } }
            );
          }

          if (categoriesToAdd.length > 0) {
            await Category.updateMany(
              { _id: { $in: categoriesToAdd } },
              { $addToSet: { books: bookId } }
            );
          }
        }

        const populatedBook = await Book.findById(bookId)
          .populate("author")
          .populate("categories");

        res.status(200).json({
          success: true,
          data: populatedBook,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    } else {
      await Author.findByIdAndUpdate(book.author, {
        $pull: { books: book._id },
      });

      if (book.categories && book.categories.length > 0) {
        await Category.updateMany(
          { _id: { $in: book.categories } },
          { $pull: { books: book._id } }
        );
      }

      if (book.filename) {
        const filePath = path.join("uploads", book.filename);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }

      await Book.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: book,
      });
    }
  } catch (error) {
    next(error);
  }
};
