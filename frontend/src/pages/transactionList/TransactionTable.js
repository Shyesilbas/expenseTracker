import React from 'react';
import { CATEGORIES, STATUSES, CURRENCIES } from '../../constants/constants';
import { DateUtils } from '../../utils/DateUtils';

function TransactionTable({
                              transactions,
                              loading,
                              editingTransactionId,
                              editForm,
                              setEditForm,
                              setEditingTransactionId,
                              onUpdateTransaction,
                              onDeleteTransaction,
                              showUpdateButton = () => true
                          }) {
    const resetEditForm = () => {
        setEditingTransactionId(null);
        setEditForm({
            amount: '',
            currency: '',
            status: '',
            description: '',
            category: '',
            date: ''
        });
    };

    const startEditing = (transaction) => {
        setEditingTransactionId(transaction.transactionId);
        setEditForm({
            amount: transaction.amount || '',
            currency: transaction.currency || '',
            status: transaction.status || '',
            description: transaction.description || '',
            category: transaction.category || '',
            date: DateUtils.formatDate(transaction.date, true) || '',
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
        <div className="transaction-table-container">
            {loading ? (
                <p className="loading-message">Loading transactions...</p>
            ) : transactions.length === 0 ? (
                <p className="no-data">No transactions found for this period.</p>
            ) : (
                <table className="transaction-table">
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
                    {transactions.map((transaction) => (
                        <tr key={transaction.transactionId}>
                            {editingTransactionId === transaction.transactionId ? (
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
                                            onClick={() => onUpdateTransaction(transaction.transactionId)}
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
                                    <td>{transaction.date}</td>
                                    <td className={transaction.status === 'OUTGOING' ? 'outgoing' : 'incoming'}>
                                        {transaction.amount}
                                    </td>
                                    <td>{transaction.currency}</td>
                                    <td>{transaction.description || '-'}</td>
                                    <td>{transaction.category}</td>
                                    <td>{transaction.status}</td>
                                    <td>
                                        {showUpdateButton(transaction) && (
                                            <button
                                                className="update-btn"
                                                onClick={() => startEditing(transaction)}
                                            >
                                                Update
                                            </button>
                                        )}
                                        <button
                                            className="delete-btn"
                                            onClick={() => onDeleteTransaction(transaction.transactionId)}
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

export default TransactionTable;