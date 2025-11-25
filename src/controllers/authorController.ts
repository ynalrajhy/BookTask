import { Request, Response, NextFunction } from "express";
import Author from "../models/Author";

export const getAllAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authors = await Author.find().populate("books");
    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const author = await Author.findById(req.params.id).populate("books");

    if (!author) {
      res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (author) {
      res.status(200).json({
        success: true,
        data: author,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      res.status(400).json({
        success: false,
        message: "Name and country are required",
      });
    }

    const author = await Author.create({ name, country });
    res.status(201).json({
      success: true,
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!author) {
      res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (author) {
      res.status(200).json({
        success: true,
        data: author,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);

    if (!author) {
      res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }

    if (author) {
      res.status(200).json({
        success: true,
        message: "Author deleted successfully",
        data: author,
      });
    }
  } catch (error) {
    next(error);
  }
};
