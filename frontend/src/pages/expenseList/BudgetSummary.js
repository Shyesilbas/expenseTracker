import React from 'react';

function BudgetSummary({ monthlyBudget, totalIncome, totalSpent }) {
    return (
        <>
            <div className="budget-status">
                <span className="budget-label">Monthly Budget Status: </span>
                <span className={monthlyBudget < 0 ? 'negative' : 'positive'}>
                    {monthlyBudget !== null ? `${monthlyBudget} USD` : 'Loading...'}
                </span>
            </div>

            <div className="budget-summary">
                <div className="budget-item">
                    <span className="budget-label">Total Income: </span>
                    <span className="positive">
                        {totalIncome !== null ? `${totalIncome} USD` : 'Loading...'}
                    </span>
                </div>
                <div className="budget-item">
                    <span className="budget-label">Total Spent: </span>
                    <span className={totalSpent < 0 ? 'negative' : 'positive'}>
                        {totalSpent !== null ? `${totalSpent} USD` : 'Loading...'}
                    </span>
                </div>
            </div>
        </>
    );
}

export default BudgetSummary;