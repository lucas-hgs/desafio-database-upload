import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const enoughBalance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > enoughBalance.total) {
      throw new AppError('Your balance is not enough', 400);
    }

    let checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      checkCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(checkCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: checkCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
