import React from 'react';
import { CATEGORIES, STATUSES, CURRENCIES } from '../../constants/constants';
import { DateUtils } from '../../utils/DateUtils';

function ExpenseTable({
                          expenses,
                          loading,
                          editingExpenseId,
                          editForm,
                          setEditForm,
                          setEditingExpenseId,
                          onUpdateExpense,
                          onDeleteExpense
                      }) {
    const resetEditForm = () => {
        setEditingExpenseId(null);
        setEditForm({
            amount: '',
            currency: '',
            status: '',
            description: '',
            category: '',
            date: ''
        });
    };

    const startEditing = (expense) => {
        setEditingExpenseId(expense.expenseId);
        setEditForm({
            amount: expense.amount || '',
            currency: expense.currency || '',
            status: expense.status || '',
            description: expense.description || '',
            category: expense.category || '',
            date: DateUtils.formatDate(expense.date, true) || '',
        });
    };

    const renderEditField = (type, name, options = null) => {
        if (type === 'select' && options) {
            return (
                <select
                    value={editForm[name]}
                    onChange={(e) => setEditForm({ ...editForm, [name]: e.target.value })}
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option || 'Select'}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                type={type}
                value={editForm[name]}
                onChange={(e) => setEditForm({ ...editForm, [name]: e.target.value })}
            />
        );
    };

    return (
        <div className="expense-table-container">
            {loading ? (
                <p className="loading-message">Loading expenses...</p>
            ) : expenses.length === 0 ? (
                <p className="no-data">No expenses found for this period.</p>
            ) : (
                <table className="expense-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.expenseId}>
                            {editingExpenseId === expense.expenseId ? (
                                <>
                                    <td>{renderEditField('date', 'date')}</td>
                                    <td>{renderEditField('number', 'amount')}</td>
                                    <td>{renderEditField('select', 'currency', CURRENCIES)}</td>
                                    <td>{renderEditField('text', 'description')}</td>
                                    <td>{renderEditField('select', 'category', CATEGORIES)}</td>
                                    <td>{renderEditField('select', 'status', STATUSES)}</td>
                                    <td>
                                        <button
                                            className="update-btn"
                                            onClick={() => onUpdateExpense(expense.expenseId)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={resetEditForm}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{expense.date}</td>
                                    <td className={expense.status === 'OUTGOING' ? 'outgoing' : 'incoming'}>
                                        {expense.amount}
                                    </td>
                                    <td>{expense.currency}</td>
                                    <td>{expense.description || '-'}</td>
                                    <td>{expense.category}</td>
                                    <td>{expense.status}</td>
                                    <td>
                                        <button
                                            className="update-btn"
                                            onClick={() => startEditing(expense)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDeleteExpense(expense.expenseId)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ExpenseTable;