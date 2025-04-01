export const DateUtils = {
    formatDate: (date, format = 'dd-MM-yyyy') => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return format
            .replace('dd', day)
            .replace('MM', month)
            .replace('yyyy', year);
    },

    parseDate: (dateString, format = 'dd-MM-yyyy') => {
        if (!dateString) return undefined;
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`);
    },

    getCurrentMonthYear: (year, month) => {
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
};