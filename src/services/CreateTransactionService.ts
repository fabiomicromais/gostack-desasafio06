import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(' you do not have enough balance');
    }

    // busca no bd um registro que  o title = o que veio
    // let é uma variavel global, acessivel nesse escopo
    // se a categoria nao existe o let
    // se não encontrou entra no if como true
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    // existe buscar no bd e usar o idr que foi retornado
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    // verificar categoria existe

    // nao existe cria ela
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
