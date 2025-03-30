export const DateUtils = {
    formatDate: (dateStr, reverse = false) => {
        if (!dateStr) return '';
        if (reverse) {
            return dateStr.split('.').reverse().join('-');
        }
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    },

    getCurrentMonthYear: (year, month) => {
        return new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
    }
};