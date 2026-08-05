import type { Href } from 'expo-router';

type Id = string | number;

function path(route: string, params: Record<string, Id>): Href {
  return {
    pathname: route,
    params,
  } as Href;
}

export const pfRoutes = {
  dashboard: (): Href => '/personal-finance/dashboard',

  accountList: (): Href => '/personal-finance/account',
  accountDetail: (id: Id): Href =>
    path('/personal-finance/account/[id]', { id }),
  accountHistory: (id: Id): Href =>
    path('/personal-finance/account/[id]/history', { id }),

  contactList: (): Href => '/personal-finance/contact',
  contactCreate: (): Href => '/personal-finance/contact/create',
  contactDetail: (id: Id): Href =>
    path('/personal-finance/contact/[id]', { id }),
  contactEdit: (id: Id): Href =>
    path('/personal-finance/contact/[id]/edit', { id }),

  cashInList: (): Href => '/personal-finance/cash-in',
  cashInCreate: (): Href => '/personal-finance/cash-in/create',
  cashInDetail: (id: Id): Href =>
    path('/personal-finance/cash-in/[id]', { id }),
  cashInEdit: (id: Id): Href =>
    path('/personal-finance/cash-in/[id]/edit', { id }),

  cashOutList: (): Href => '/personal-finance/cash-out',
  cashOutCreate: (): Href => '/personal-finance/cash-out/create',
  cashOutDetail: (id: Id): Href =>
    path('/personal-finance/cash-out/[id]', { id }),
  cashOutEdit: (id: Id): Href =>
    path('/personal-finance/cash-out/[id]/edit', { id }),

  budgetList: (): Href => '/personal-finance/budget',
  budgetCreate: (): Href => '/personal-finance/budget/create',
  budgetDetail: (id: Id): Href =>
    path('/personal-finance/budget/[id]', { id }),
  budgetEdit: (id: Id): Href =>
    path('/personal-finance/budget/[id]/edit', { id }),

  fixedAssetList: (): Href => '/personal-finance/fixed-asset',
  fixedAssetDetail: (id: Id): Href =>
    path('/personal-finance/fixed-asset/[id]', { id }),

  investmentList: (): Href => '/personal-finance/investment',
  investmentCreate: (): Href => '/personal-finance/investment/create',
  investmentDetail: (id: Id): Href =>
    path('/personal-finance/investment/[id]', { id }),
  investmentEdit: (id: Id): Href =>
    path('/personal-finance/investment/[id]/edit', { id }),
  investmentBuy: (id: Id): Href =>
    path('/personal-finance/investment/[id]/buy', { id }),
  investmentSell: (id: Id): Href =>
    path('/personal-finance/investment/[id]/sell', { id }),
  investmentRevalue: (id: Id): Href =>
    path('/personal-finance/investment/[id]/revalue', { id }),

  payableList: (): Href => '/personal-finance/debt/payable',
  payableCreate: (): Href => '/personal-finance/debt/payable/create',
  payableDetail: (id: Id): Href =>
    path('/personal-finance/debt/payable/[id]', { id }),
  payableEdit: (id: Id): Href =>
    path('/personal-finance/debt/payable/[id]/edit', { id }),

  receivableList: (): Href => '/personal-finance/debt/receivable',
  receivableCreate: (): Href => '/personal-finance/debt/receivable/create',
  receivableDetail: (id: Id): Href =>
    path('/personal-finance/debt/receivable/[id]', { id }),
  receivableEdit: (id: Id): Href =>
    path('/personal-finance/debt/receivable/[id]/edit', { id }),

  payableEntryList: (): Href => '/personal-finance/debt/payable-entry',
  payableEntryCreate: (): Href =>
    '/personal-finance/debt/payable-entry/create',
  payableEntryDetail: (id: Id, debtId?: Id): Href =>
    path('/personal-finance/debt/payable-entry/[id]', {
      id,
      ...(debtId !== undefined ? { debtId } : {}),
    }),
  payableEntryEdit: (id: Id, debtId?: Id): Href =>
    path('/personal-finance/debt/payable-entry/[id]/edit', {
      id,
      ...(debtId !== undefined ? { debtId } : {}),
    }),

  receivableEntryList: (): Href => '/personal-finance/debt/receivable-entry',
  receivableEntryCreate: (): Href =>
    '/personal-finance/debt/receivable-entry/create',
  receivableEntryDetail: (id: Id, debtId?: Id): Href =>
    path('/personal-finance/debt/receivable-entry/[id]', {
      id,
      ...(debtId !== undefined ? { debtId } : {}),
    }),
  receivableEntryEdit: (id: Id, debtId?: Id): Href =>
    path('/personal-finance/debt/receivable-entry/[id]/edit', {
      id,
      ...(debtId !== undefined ? { debtId } : {}),
    }),

  payableEntryCreateWithDebt: (debtId: Id, amount?: number): Href =>
    path('/personal-finance/debt/payable-entry/create', {
      debtId,
      ...(amount !== undefined ? { amount } : {}),
    }),
  receivableEntryCreateWithDebt: (debtId: Id, amount?: number): Href =>
    path('/personal-finance/debt/receivable-entry/create', {
      debtId,
      ...(amount !== undefined ? { amount } : {}),
    }),
};
